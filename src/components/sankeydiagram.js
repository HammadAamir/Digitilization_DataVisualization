import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import * as XLSX from "xlsx";

const ACTIVITY_COLORS = [
  "#4F8EF7", // blue
  "#F7B32B", // yellow
  "#E4572E", // orange
  "#76B041", // green
  "#A259F7", // purple
  "#F76E9A", // pink
  "#43BCCD", // teal
  "#FF8C42", // orange2
];
const AGE_COLOR = "#e5e7eb";

const SankeyDiagram = () => {
  const svgRef = useRef();
  const [sankeyData, setSankeyData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  useEffect(() => {
    // Fetch and parse the Excel file
    fetch(process.env.PUBLIC_URL + "/assets/sankey_activities.xlsx")
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extract activities from row 2 (skip empty columns)
        const activitiesRow = data[1];
        const activities = [];
        for (let i = 2; i < activitiesRow.length; i += 2) {
          if (activitiesRow[i]) {
            activities.push(activitiesRow[i]);
          }
        }

        // Extract age groups and their data
        const ageGroups = [];
        const ageData = [];
        for (let rowIndex = 3; rowIndex < data.length; rowIndex++) {
          const row = data[rowIndex];
          if (row[1] && row[1].includes("Individuals")) {
            const ageGroup = row[1];
            ageGroups.push(ageGroup);
            const values = [];
            for (let colIndex = 2; colIndex < row.length; colIndex += 2) {
              values.push(row[colIndex] || 0);
            }
            ageData.push(values);
          }
        }

        // Build sankeyData
        const nodes = [
          ...ageGroups.map((g) => ({ name: g })),
          ...activities.map((a) => ({ name: a })),
        ];
        const links = [];
        ageGroups.forEach((ageGroup, ageIndex) => {
          activities.forEach((activity, activityIndex) => {
            const value = ageData[ageIndex][activityIndex];
            links.push({ source: ageGroup, target: activity, value });
          });
        });
        setSankeyData({ nodes, links });
        setActivities(activities);
        setAgeGroups(ageGroups);
      });
  }, []);

  useEffect(() => {
    if (!sankeyData) return;
    const { nodes, links } = sankeyData;
    const container = svgRef.current.parentNode;
    const width = Math.min(900, container.offsetWidth - 32);
    const height = 520;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "none")
      .style("border", "none")
      .style("border-radius", "0");

    svg.selectAll("*").remove();

    // Create a map of node names to indices
    const nodeNameToIndex = new Map();
    nodes.forEach((node, index) => {
      nodeNameToIndex.set(node.name, index);
    });

    // Convert links to use node indices instead of names
    const processedLinks = links.map(link => ({
      source: nodeNameToIndex.get(link.source),
      target: nodeNameToIndex.get(link.target),
      value: link.value
    }));

    const sankeyGenerator = sankey()
      .nodeWidth(22)
      .nodePadding(32)
      .extent([[1, 1], [width - 1, height - 6]]);

    const sankeyGraph = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: processedLinks
    });

    // Color scale for activities
    const activityColor = d3.scaleOrdinal()
      .domain(activities)
      .range(ACTIVITY_COLORS);

    // Tooltip
    let tooltip = d3.select("body").select(".sankey-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("class", "sankey-tooltip")
        .style("position", "absolute")
        .style("z-index", 1000)
        .style("background", "#2a2a2a")
        .style("color", "#f0f0f0")
        .style("padding", "12px 16px")
        .style("border", "1px solid #4a90e2")
        .style("border-radius", "8px")
        .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.5)")
        .style("font-family", "Inter, Arial, sans-serif")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("pointer-events", "none")
        .style("min-width", "140px")
        .style("text-align", "left")
        .style("opacity", 0)
        .style("backdrop-filter", "blur(8px)");
    }

    // Add the same mapping as in radarchart.js
    const activityNameMap = {
      "Internet use: Internet banking": "Internet Banking",
      "Internet use: doing an online course (of any subject)": "Online Learning",
      "Internet use: sending/receiving e-mails":  "e-mail",
      "Internet use: participating in social networks (creating user profile, posting messages or other contributions to facebook, twitter, etc.)": "social media"
    };

    // Helper to clean age group names
    function cleanAgeGroup(name) {
      return typeof name === 'string' && name.startsWith('Individuals, ')
        ? name.replace(/^Individuals, /, '')
        : name;
    }

    // Draw links with simple muted color
    svg.append("g")
      .selectAll("path")
      .data(sankeyGraph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", "#7a8ca3")
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("opacity", 0.5)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8).attr("stroke-width", Math.max(2, d.width + 2));
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(
          `<div style="margin-bottom: 5px; color: #4a90e2;">${cleanAgeGroup(d.source.name)}</div>` +
          `<div style="margin-bottom: 5px; color: #ff6b6b;">→ ${activityNameMap[d.target.name] || d.target.name}</div>` +
          `<div style="font-size: 12px; opacity: 0.8;">Percentage: ${d.value}%</div>`
        )
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.5).attr("stroke-width", d => Math.max(1, d.width));
        tooltip.transition().duration(300).style("opacity", 0);
      });

    // Draw nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(sankeyGraph.nodes)
      .join("g");

    node.append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => {
        const activityIdx = activities.indexOf(d.name);
        if (activityIdx !== -1) return activityColor(d.name);
        return AGE_COLOR;
      })
      .attr("rx", 8)
      .style("filter", "drop-shadow(0 2px 8px #b6c2d1aa)")
      .attr("stroke", d => {
        const activityIdx = activities.indexOf(d.name);
        if (activityIdx !== -1) return d3.color(activityColor(d.name)).darker(0.5);
        return "#cbd5e1";
      })
      .attr("stroke-width", 1.5)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 3).attr("stroke", "#4a90e2");
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(
          `<div style='font-weight:600;'>${activityNameMap[d.name] || d.name}</div>`
        )
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 1.5).attr("stroke", d => {
          const activityIdx = activities.indexOf(d.name);
          if (activityIdx !== -1) return d3.color(activityColor(d.name)).darker(0.5);
          return "#cbd5e1";
        });
        tooltip.transition().duration(300).style("opacity", 0);
      });

    // Draw node labels
    node.append("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 12 : d.x0 - 12)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .attr("fill", "#e5e7eb")
      .attr("font-size", 15)
      .attr("font-weight", 700)
      .text(d => activityNameMap[d.name] || cleanAgeGroup(d.name));
  }, [sankeyData, activities]);

  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      background: "none",
      borderRadius: 18,
      boxShadow: "0 2px 16px #0006",
      padding: 0
    }}>
      <h2 style={{ 
        fontSize: "2rem", 
        marginBottom: "1.2rem",
        color: "#f0f0f0",
        fontWeight: 800,
        letterSpacing: "-1px"
      }}>
        Digital Activity Distribution by Age Group (Sankey Diagram)
      </h2>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: 980,
        background: "#2a2a2a",
        borderRadius: 18,
        boxShadow: "0 2px 16px #0004",
        padding: 18,
        minHeight: 560
      }}>
        <svg ref={svgRef} style={{ width: "100%", height: 520, minWidth: 320 }}></svg>
      </div>
      {/* <div style={{marginTop: 24, color: '#b0b0b0', fontSize: '1rem', fontWeight: 500}}>
        Data source: <span style={{color: '#4a90e2'}}>sankey_activities.xlsx</span> (EU, 2024)
      </div> */}
    </div>
  );
};

export default SankeyDiagram; 