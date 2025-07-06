import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

const SankeyDiagram = () => {
  const svgRef = useRef();

  const sankeyData = {
    nodes: [
      { name: "16–24" }, { name: "25–34" }, { name: "35–44" },
      { name: "45–54" }, { name: "55–64" }, { name: "65–74" },
      { name: "Emails" }, { name: "Social Media" }, { name: "Online Courses" }
    ],
    links: [
      { source: "16–24", target: "Emails", value: 88 },
      { source: "16–24", target: "Social Media", value: 91 },
      { source: "16–24", target: "Online Courses", value: 35 },
      { source: "25–34", target: "Emails", value: 90 },
      { source: "25–34", target: "Social Media", value: 85 },
      { source: "25–34", target: "Online Courses", value: 30 },
      { source: "35–44", target: "Emails", value: 85 },
      { source: "35–44", target: "Social Media", value: 72 },
      { source: "35–44", target: "Online Courses", value: 22 },
      { source: "45–54", target: "Emails", value: 80 },
      { source: "45–54", target: "Social Media", value: 60 },
      { source: "45–54", target: "Online Courses", value: 18 },
      { source: "55–64", target: "Emails", value: 70 },
      { source: "55–64", target: "Social Media", value: 45 },
      { source: "55–64", target: "Online Courses", value: 12 },
      { source: "65–74", target: "Emails", value: 55 },
      { source: "65–74", target: "Social Media", value: 25 },
      { source: "65–74", target: "Online Courses", value: 6 }
    ]
  };

  useEffect(() => {
    const { nodes, links } = sankeyData;
    const width = 800;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f9f9f9")
      .style("border", "1px solid #ccc")
      .style("border-radius", "8px");

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
      .nodeWidth(15)
      .nodePadding(20)
      .extent([[1, 1], [width - 1, height - 6]]);

    const sankeyGraph = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: processedLinks
    });

    // Draw links
    svg.append("g")
      .selectAll("path")
      .data(sankeyGraph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("opacity", 0.6)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1).attr("stroke", "#007acc");
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.6).attr("stroke", "#69b3a2");
      })
      .append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value}%`);

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
      .attr("fill", "#007acc")
      .attr("rx", 4)
      .append("title")
      .text(d => `${d.name}\nTotal flow: ${d.value || 0}`);

    node.append("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
      .style("font-size", "14px")
      .style("fill", "#333");
  }, []);

  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h2 style={{ 
        fontSize: "1.5rem", 
        marginBottom: "1rem",
        color: "#e5e7eb"
      }}>
        Digital Activity by Age Group (Sankey Diagram)
      </h2>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
      }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default SankeyDiagram; 