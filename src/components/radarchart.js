import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";

const COLORS = [
  "#4F8EF7", "#F7B32B", "#E4572E", "#76B041", "#A259F7", "#F76E9A", "#43BCCD", "#FF8C42"
];

const activityDisplayNameMap = {
  "Internet banking": "Internet Banking",
  "Doing an online course": "Online Learning",
  "Sending/receiving emails": "using e-mail",
  "Participating in social networks (creating user profile, posting messages or other contributions to Facebook, Twitter, etc.)": "social media"
};

const SingleRadarChart = ({ activities, ageGroup, values, color }) => {
  const svgRef = React.useRef();
  useEffect(() => {
    if (!activities.length || !values.length) return;
    const width = 320, height = 320, margin = 56;
    const radius = Math.min(width, height) / 2 - margin;
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "none");
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
    const angleSlice = (2 * Math.PI) / activities.length;
    const maxValue = d3.max(values);
    const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

    // Draw grid
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      g.append("polygon")
        .attr("points", activities.map((a, i) => {
          const r = (radius / levels) * level;
          const angle = i * angleSlice - Math.PI / 2;
          return [r * Math.cos(angle), r * Math.sin(angle)].join(",");
        }).join(" "))
        .attr("fill", "#23272e")
        .attr("stroke", "#4a90e2")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.3);
    }

    // Draw axes
    activities.forEach((activity, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radius * Math.cos(angle))
        .attr("y2", radius * Math.sin(angle))
        .attr("stroke", "#4a90e2")
        .attr("stroke-width", 1.2)
        .attr("opacity", 0.7);
      // Determine if label is on left or right
      const x = (radius + 16) * Math.cos(angle);
      const y = (radius + 16) * Math.sin(angle);
      let rotation = 0;
      if (Math.abs(Math.cos(angle)) > 0.95) {
        // Right side
        rotation = 90;
      } else if (Math.abs(Math.cos(angle)) > 0.85 && Math.cos(angle) < 0) {
        // Left side
        rotation = -90;
      }
      g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#e5e7eb")
        .attr("font-size", 11)
        .attr("font-weight", 600)
        .attr("transform", `translate(${x},${y}) rotate(${rotation}) translate(${-x},${-y})`)
        .text(activityDisplayNameMap[activity] || activity);
    });

    // Draw radar line
    const points = values.map((val, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      return [rScale(val) * Math.cos(angle), rScale(val) * Math.sin(angle)];
    });
    g.append("polygon")
      .attr("points", points.map(p => p.join(",")).join(" "))
      .attr("fill", color + "22")
      .attr("stroke", color)
      .attr("stroke-width", 3.5);
    // Draw points
    points.forEach(([x, y], i) => {
      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .attr("fill", color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .on("mouseover", function (event) {
          d3.select("body").selectAll(".radar-tooltip").remove();
          d3.select("body").append("div")
            .attr("class", "radar-tooltip")
            .style("position", "absolute")
            .style("background", "#23272e")
            .style("color", "#e5e7eb")
            .style("padding", "8px 12px")
            .style("border-radius", "8px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", 1000)
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.5)")
            .style("border", "1px solid #4a90e2")
            .html(`<div style='font-weight:600;'>${ageGroup}</div><div>${activities[i]}: <span style='color:${color};'>${values[i]}%</span></div>`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function () {
          d3.select("body").selectAll(".radar-tooltip").remove();
        });
    });
  }, [activities, values, ageGroup, color]);

  return (
    <div style={{ width: 270, margin: "0 auto", background: "none", padding: 0 }}>
      <h3 style={{ color: color, textAlign: "center", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{ageGroup}</h3>
      <svg ref={svgRef} />
    </div>
  );
};

const RadarChart = () => {
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/assets/internet_activities_2024.xlsx")
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const raw = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const activityRow = raw[1];
        let activities = [];
        for (let i = 2; i < activityRow.length; i += 2) {
          if (activityRow[i]) activities.push(activityRow[i]);
        }
        // Map activity headings to new names
        const activityNameMap = {
          // Add the original activity names as keys and new names as values
          "Internet use: Internet banking": "Internet Banking",
          "Internet use: doing an online course (of any subject)": "Online Learning",
          "Internet use: sending/receiving e-mails":  "e-mail",
          "Internet use: participating in social networks (creating user profile, posting messages or other contributions to facebook, twitter, etc.)": "social media"
        };
        activities = activities.map(a => activityNameMap[a] || a);
        // Use each Belgium row as its own age group
        let belgiumRows = raw.filter(row => row[0] && row[0].toString().toLowerCase().includes("belgium"));
        let radarData = [];
        belgiumRows.forEach(row => {
          const groupLabel = row[1];
          let values = [];
          for (let j = 2; j < activities.length * 2 + 2; j += 2) {
            const v = row[j] !== undefined && row[j] !== null && row[j] !== '' && !isNaN(row[j]) ? +row[j] : 0;
            values.push(v);
          }
          radarData.push({ ageGroup: groupLabel, values });
        });
        setActivities(activities);
        setData(radarData);
      });
  }, []);

  return (
    <div style={{ width: 600, background: "none", padding: 0 }}>
      {/* <h2 style={{ color: "#e5e7eb", textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
        Internet Activities by Age Group (Belgium, 2024)
      </h2> */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24, justifyItems: "start", marginLeft: 40 }}>
        {(() => {
          if (!data || activities.length === 0) return null;
          const items = [];
          const perRow = 4;
          const fullRows = Math.floor(data.length / perRow);
          const lastRowCount = data.length % perRow;
          let idx = 0;
          // Render all full rows
          for (let row = 0; row < fullRows; row++) {
            for (let col = 0; col < perRow; col++, idx++) {
              items.push(
                <div key={data[idx].ageGroup} style={{
                  borderLeft: col !== 0 ? '2px solid #444' : 'none',
                  paddingLeft: col !== 0 ? 16 : 0,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <SingleRadarChart
                    activities={activities}
                    ageGroup={data[idx].ageGroup}
                    values={data[idx].values}
                    color={COLORS[idx % COLORS.length]}
                  />
                </div>
              );
            }
          }
          // Center last row if it has fewer than 4 items
          if (lastRowCount > 0) {
            const emptyCells = Math.floor((perRow - lastRowCount) / 2);
            const lastRow = [];
            // Add empty cells at the start of the last row
            for (let i = 0; i < emptyCells; i++) {
              lastRow.push(<div key={`empty-start-${i}`} />);
            }
            for (let col = 0; col < lastRowCount; col++, idx++) {
              lastRow.push(
                <div key={data[idx].ageGroup} style={{
                  borderLeft: col !== 0 ? '2px solid #444' : 'none',
                  paddingLeft: col !== 0 ? 16 : 0,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <SingleRadarChart
                    activities={activities}
                    ageGroup={data[idx].ageGroup}
                    values={data[idx].values}
                    color={COLORS[idx % COLORS.length]}
                  />
                </div>
              );
            }
            // Fill remaining cells to keep grid shape (at the end)
            for (let i = 0; i < perRow - lastRowCount - emptyCells; i++) {
              lastRow.push(<div key={`empty-end-${i}`} />);
            }
            items.push(...lastRow);
          }
          return items;
        })()}
      </div>
    </div>
  );
};

export { RadarChart }; 