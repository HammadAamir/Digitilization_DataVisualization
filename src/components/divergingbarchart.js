import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";
import "./choropleth.css";

const DivergingBarChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load the dataset
        const response = await fetch(process.env.PUBLIC_URL + "/assets/tin00093_page_spreadsheet.xlsx");
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        
        // Extract available years
        const years = extractAvailableYears(workbook.Sheets[workbook.SheetNames[0]]);
        setYears(years);

        // Extract data for the selected year
        const rawData = extractDataForYear(workbook.Sheets[workbook.SheetNames[0]], selectedYear);
        
        // Calculate EU average and create diverging data
        const euAverage = calculateEUAverage(rawData);
        const divergingData = createDivergingData(rawData, euAverage);
        
        console.log(`Data for year ${selectedYear}:`, divergingData);
        console.log(`EU Average: ${euAverage}%`);
        
        setData(divergingData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  const extractAvailableYears = (worksheet) => {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonData[0];
    
    const availableYears = [];
    for (let i = 1; i < headers.length; i++) {
      if (headers[i] && !isNaN(headers[i]) && headers[i] >= 2020 && headers[i] <= 2024) {
        availableYears.push(headers[i]);
      }
    }
    
    return availableYears.sort((a, b) => a - b);
  };

  const extractDataForYear = (worksheet, year) => {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonData[0];
    
    console.log(`Looking for year ${year} in headers:`, headers);
    
    // Find the column index for the specified year
    let yearIndex = -1;
    for (let i = 1; i < headers.length; i++) {
      if (headers[i] === year || headers[i] === year.toString()) {
        yearIndex = i;
        break;
      }
    }
    
    if (yearIndex === -1) {
      console.log(`Year ${year} not found in dataset. Available years:`, headers.filter(h => h && !isNaN(h) && h >= 2020 && h <= 2024));
      return {};
    }

    console.log(`Found year ${year} at index ${yearIndex}`);

    const data = {};
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row[0]) {
        const country = row[0];
        
        // Filter out "European Union - 27 countries (from 2020)" and related entries
        if (country === "European Union - 27 countries (from 2020)" || 
            country === "European Union" || 
            country === "GEO" || 
            country === "GEO (Labels)") {
          continue;
        }
        
        const value = row[yearIndex];
        if (value !== undefined && value !== null && value !== '' && !isNaN(value)) {
          data[country] = parseFloat(value);
        }
      }
    }
    
    console.log(`Extracted data for year ${year}:`, data);
    return data;
  };

  const calculateEUAverage = (data) => {
    const values = Object.values(data);
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const createDivergingData = (rawData, euAverage) => {
    return Object.entries(rawData)
      .map(([country, value]) => ({
        country,
        value,
        divergence: value - euAverage, // Positive means above average (worse)
        isAboveAverage: value > euAverage
      }))
      .sort((a, b) => a.country.localeCompare(b.country)); // Sort alphabetically
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 600;
    const margin = { top: 60, right: 200, bottom: 120, left: 180 };

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", containerWidth)
      .attr("height", containerHeight);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate EU average for reference line
    const euAverage = data[0] ? data[0].value - data[0].divergence : 0;

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, d => d.divergence) * 1.1,
        d3.max(data, d => d.divergence) * 1.1
      ])
      .range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain(data.map(d => d.country))
      .range([0, height])
      .padding(0.3);

    // Create tooltip
    let tooltip = d3.select("body").select(".diverging-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("class", "diverging-tooltip")
        .style("position", "absolute")
        .style("background", "#23272e")
        .style("color", "#e5e7eb")
        .style("padding", "12px 16px")
        .style("border-radius", "10px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("z-index", 1000)
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.5)")
        .style("border", "1.5px solid #4a90e2")
        .style("font-family", "Inter, Arial, sans-serif")
        .style("min-width", "200px")
        .style("opacity", 0);
    }

    // Reference line at EU average (divergence = 0)
    const zeroLine = xScale(0);
    chart
      .append("line")
      .attr("x1", zeroLine)
      .attr("x2", zeroLine)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Add reference line label
    chart
      .append("text")
      .attr("x", zeroLine)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("EU Average")
      .style("font-size", "12px")
      .style("fill", "#fff")
      .style("font-weight", "600");

    // Bars
    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => d.divergence < 0 ? xScale(d.divergence) : xScale(0))
      .attr("y", d => yScale(d.country))
      .attr("width", d => Math.abs(xScale(d.divergence) - xScale(0)))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => d.isAboveAverage ? "#d32f2f" : "#1976d2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("stroke", "#333");

        tooltip
          .style("opacity", 1)
          .html(`
            <div style='font-weight:700; font-size:15px; margin-bottom:6px; color:#4a90e2;'>${d.country}</div>
            <div style='font-size:13px; margin-bottom:4px;'>Year: <span style='color:#e5e7eb;'>${selectedYear}</span></div>
            <div style='font-size:13px; margin-bottom:4px;'>Never Used Internet: <span style='color:#ffb347; font-weight:600;'>${d.value.toFixed(1)}%</span></div>
            <div style='font-size:13px; margin-bottom:4px;'>EU Average: <span style='color:#43bccd; font-weight:600;'>${euAverage.toFixed(1)}%</span></div>
            <div style='font-size:13px; font-weight:600; color:${d.isAboveAverage ? '#e4572e' : '#43bccd'};'>Divergence: ${d.divergence > 0 ? '+' : ''}${d.divergence.toFixed(1)}%</div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke-width", 1)
          .attr("stroke", "#fff");

        tooltip.style("opacity", 0);
      });

    // Y-axis (country names)
    chart
      .append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#fff");

    // X-axis (divergence values)
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d > 0 ? '+' : ''}${d}%`);

    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#fff");

    // X-axis label
    chart.append("text")
      .attr("x", width / 2)
      .attr("y", height + 48)
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .style("fill", "#e5e7eb")
      .style("font-weight", "600")
      .text("Divergence from EU Average (%)");

    // Y-axis label
    chart.append("text")
      .attr("x", -height / 2)
      .attr("y", -70)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .style("fill", "#e5e7eb")
      .style("font-weight", "600")
      .text("Country");

    // Title
    svg
      .append("text")
      .attr("x", containerWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "600")
      .style("fill", "#fff")
      .text("Digital Exclusion: Never Used Internet (Divergence from EU Average)");

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 40}, ${margin.top})`);

    // Above average legend
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#d32f2f");

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text("Above EU Average")
      .style("font-size", "12px")
      .style("fill", "#fff");

    // Below average legend
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#1976d2");

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 37)
      .text("Below EU Average")
      .style("font-size", "12px")
      .style("fill", "#fff");

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, selectedYear]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading diverging bar chart...</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ textAlign: "center", padding: "20px" }}>No data available for the selected year</div>;
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "700px", paddingTop: "20px" }}>
      {years.length > 0 && (
        <div className="slider-wrapper" style={{ marginBottom: "15px", textAlign: "center" }}>
          <label htmlFor="yearSelect" style={{ 
            fontWeight: "600", 
            marginRight: "15px",
            color: "#e5e7eb"
          }}>
            Select Year: {selectedYear}
          </label>
          <select
            id="yearSelect"
            value={selectedYear}
            onChange={(e) => setSelectedYear(+e.target.value)}
            style={{
              padding: "8px 12px 8px 12px",
              paddingRight: "30px",
              borderRadius: "4px",
              border: "1px solid #4b5563",
              backgroundColor: "#1f2937",
              color: "#e5e7eb",
              cursor: "pointer",
              fontWeight: "600",
              transition: "opacity 0.2s ease-in-out",
              appearance: "none",
              backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23e5e7eb%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              backgroundSize: "12px auto"
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = "1";
            }}
          >
            {years.map((year) => (
              <option key={year} value={year} style={{
                backgroundColor: "#1f2937",
                color: "#e5e7eb"
              }}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}
      <svg ref={svgRef} />
    </div>
  );
};

export { DivergingBarChart }; 