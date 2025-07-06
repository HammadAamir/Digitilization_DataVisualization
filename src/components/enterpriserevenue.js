import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";
import "./choropleth.css";

// Add custom styles for the range input
const customSliderStyles = `
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-track {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    height: 8px;
    border-radius: 4px;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a90e2, #357abd);
    border: 2px solid #fff;
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(74, 144, 226, 0.6);
  }

  input[type="range"]::-moz-range-track {
    background: transparent;
    height: 8px;
    border-radius: 4px;
  }

  input[type="range"]::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a90e2, #357abd);
    border: 2px solid #fff;
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input[type="range"]::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(74, 144, 226, 0.6);
  }
`;

const EnterpriseRevenue = () => {
  const [data, setData] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [showLineChart, setShowLineChart] = useState(false);
  const svgRef = useRef();
  const containerRef = useRef();

  // Load and parse Excel file on mount
  useEffect(() => {
    const loadData = async () => {
      // Load file from public folder or replace with your path
      const response = await fetch("/assets/tin00110.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Assuming first sheet has the data
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // rawJson is array of arrays; first row contains headers (TIME, years + blank cols)
      // Data starts from 2nd row (index 1)

      // Extract years (skip blanks after each year)
      const headerRow = rawJson[0];
      // Years are at positions: 1,3,5,... because of blank columns
      let extractedYears = [];
      for (let i = 1; i < headerRow.length; i += 2) {
        const val = headerRow[i];
        if (val && !isNaN(val)) extractedYears.push(val);
      }

      // Extract data rows (skip first column which is label)
      // For each row: first col = country, then years spaced by one blank column
      let processedData = [];
      for (let i = 1; i < rawJson.length; i++) {
        const row = rawJson[i];
        if (!row || row.length < 2) continue;
        const country = row[0];
        if (!country) continue;

        // Filter out "European Union", "GEO", and related labels
        if (country === "European Union" || 
            country === "GEO" || 
            country === "European Union - 27 countries (from 2020)" ||
            country === "GEO (Labels)") continue;

        let yearVals = {};
        for (let j = 1, yIndex = 0; j < row.length; j += 2, yIndex++) {
          let val = row[j];
          // Convert to number or NaN if missing/unavailable
          val = val === ":" || val === "u" || val === "b" || val === undefined ? NaN : +val;
          yearVals[extractedYears[yIndex]] = val;
        }
        processedData.push({ country, values: yearVals });
      }

      setYears(extractedYears);
      setSelectedYear(extractedYears[extractedYears.length - 1]);
      setData(processedData);
    };

    loadData();
  }, []);

  // Draw chart whenever data, selectedYear, or showLineChart changes
  useEffect(() => {
    if (!data || !selectedYear) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight || 600;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear previous drawings

    svg
      .attr("width", containerWidth)
      .attr("height", containerHeight);

    if (showLineChart && selectedCountries.length > 0) {
      // SPLIT VIEW MODE - Bar chart on left, Line chart on right
      const margin = { top: 40, right: 30, bottom: 50, left: 160 };
      
      // Calculate square dimensions for both charts
      const availableWidth = containerWidth - margin.left - margin.right;
      const availableHeight = containerHeight - margin.top - margin.bottom;
      const chartSize = Math.min(availableWidth / 2, availableHeight);
      
      const leftWidth = chartSize + margin.left + margin.right;
      const rightWidth = chartSize + margin.left + margin.right;
      
      // Center the charts horizontally
      const leftOffset = (containerWidth - leftWidth - rightWidth) / 2;

      // LEFT SIDE - BAR CHART
      const barChartWidth = chartSize;
      const barChartHeight = chartSize;

      const barChart = svg
        .append("g")
        .attr("class", "bar-chart")
        .attr("transform", `translate(${leftOffset + margin.left},${margin.top})`);

      // Filter data for selected year and sort descending
      const yearData = data
        .map(d => ({ country: d.country, value: d.values[selectedYear] }))
        .filter(d => !isNaN(d.value))
        .sort((a, b) => b.value - a.value);

      const yScale = d3
        .scaleBand()
        .domain(yearData.map(d => d.country))
        .range([0, barChartHeight])
        .padding(0.1);

      const xMax = d3.max(yearData, d => d.value) || 10;
      const xScale = d3
        .scaleLinear()
        .domain([0, xMax * 1.1])
        .range([0, barChartWidth]);

      // X axis for bar chart
      barChart
        .append("g")
        .attr("transform", `translate(0,${barChartHeight})`)
        .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => d + "%"));

      // Y axis for bar chart
      barChart.append("g").call(d3.axisLeft(yScale));

      // Create color scale for all countries
      const allCountries = yearData.map(d => d.country);
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(allCountries);

      // Bars with click handlers and tooltips
      barChart
        .selectAll(".bar")
        .data(yearData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.country))
        .attr("width", d => xScale(d.value))
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.country))
        .style("cursor", "pointer")
        .on("click", function(event, d) {
          if (selectedCountries.includes(d.country)) {
            // Remove country if already selected
            setSelectedCountries(prev => prev.filter(c => c !== d.country));
          } else {
            // Add country if not selected
            setSelectedCountries(prev => [...prev, d.country]);
          }
        })
        .on("mouseover", function(event, d) {
          // Highlight the bar
          d3.select(this)
            .attr("opacity", 0.7)
            .attr("stroke", "#333")
            .attr("stroke-width", 2);
          
          // Show tooltip
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "8px 12px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000");
          
          tooltip.html(`
            <strong>${d.country}</strong><br/>
            Year: ${selectedYear}<br/>
            Value: ${d.value.toFixed(2)}%
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function(event, d) {
          // Remove highlight
          d3.select(this)
            .attr("opacity", 1)
            .attr("stroke", "none");
          
          // Remove tooltip
          d3.select("body").selectAll(".tooltip").remove();
        });

      // Labels on bars
      barChart
        .selectAll(".label")
        .data(yearData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.value) + 5)
        .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 5)
        .text(d => d.value.toFixed(2) + "%")
        .attr("fill", "#333")
        .style("font-size", "12px");

      // RIGHT SIDE - LINE CHART
      const lineChartWidth = chartSize;
      const lineChartHeight = chartSize;

      const lineChart = svg
      .append("g")
        .attr("class", "line-chart")
        .attr("transform", `translate(${leftOffset + leftWidth + margin.left - 30},${margin.top})`);

      // Use the same color scale for consistency

      // Draw line charts for all selected countries
      selectedCountries.forEach((country, index) => {
        const countryData = data.find(d => d.country === country);
        if (countryData) {
          // Convert country data to line chart format
          const lineData = years.map(year => ({
            year: year,
            value: countryData.values[year]
          })).filter(d => !isNaN(d.value));

          // Scales for line chart
          const lineXScale = d3
            .scaleLinear()
            .domain([d3.min(years), d3.max(years)])
            .range([0, lineChartWidth]);

          const yMax = d3.max(lineData, d => d.value) || 50;
          const lineYScale = d3
            .scaleLinear()
            .domain([0, yMax * 1.1])
            .range([lineChartHeight, 0]);

          // X axis for line chart (only draw once)
          if (index === 0) {
            lineChart
              .append("g")
              .attr("transform", `translate(0,${lineChartHeight})`)
              .call(d3.axisBottom(lineXScale).ticks(years.length).tickFormat(d3.format("d")));

            // Y axis for line chart (only draw once)
            lineChart.append("g").call(d3.axisLeft(lineYScale).tickFormat(d => d + "%"));
          }

    // Line generator
    const line = d3
      .line()
            .defined(d => !isNaN(d.value))
            .x(d => lineXScale(d.year))
            .y(d => lineYScale(d.value));

          // Draw line
          lineChart
      .append("path")
            .datum(lineData)
      .attr("fill", "none")
            .attr("stroke", colorScale(country))
            .attr("stroke-width", 3)
            .attr("d", line)
            .on("mouseover", function(event, d) {
              // Highlight the line
              d3.select(this)
                .attr("stroke-width", 5)
                .attr("opacity", 0.8);
              
              // Show tooltip
              const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "rgba(0, 0, 0, 0.8)")
                .style("color", "white")
                .style("padding", "8px 12px")
                .style("border-radius", "4px")
                .style("font-size", "12px")
                .style("pointer-events", "none")
                .style("z-index", "1000");
              
              tooltip.html(`
                <strong>${country}</strong><br/>
                Line Chart<br/>
                Hover over points for details
              `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(event, d) {
              // Remove highlight
              d3.select(this)
                .attr("stroke-width", 3)
                .attr("opacity", 1);
              
              // Remove tooltip
              d3.select("body").selectAll(".tooltip").remove();
            });

          // Add dots for data points
          lineChart
            .selectAll(`.dot-${country}`)
            .data(lineData)
            .enter()
            .append("circle")
            .attr("class", `dot-${country}`)
            .attr("cx", d => lineXScale(d.year))
            .attr("cy", d => lineYScale(d.value))
            .attr("r", 5)
            .attr("fill", colorScale(country))
            .on("mouseover", function(event, d) {
              // Highlight the dot
              d3.select(this)
                .attr("r", 8)
                .attr("stroke", "#333")
                .attr("stroke-width", 2);
              
              // Show tooltip
              const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "rgba(0, 0, 0, 0.8)")
                .style("color", "white")
                .style("padding", "8px 12px")
                .style("border-radius", "4px")
                .style("font-size", "12px")
                .style("pointer-events", "none")
                .style("z-index", "1000");
              
              tooltip.html(`
                <strong>${country}</strong><br/>
                Year: ${d.year}<br/>
                Value: ${d.value.toFixed(2)}%
              `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(event, d) {
              // Remove highlight
              d3.select(this)
                .attr("r", 5)
                .attr("stroke", "none");
              
              // Remove tooltip
              d3.select("body").selectAll(".tooltip").remove();
            });
        }
      });

      // Titles
      svg
        .append("text")
        .attr("x", leftOffset + leftWidth / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("fill", "white")
        .text("All Countries - " + selectedYear);

      svg
        .append("text")
        .attr("x", leftOffset + leftWidth + rightWidth / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("fill", "white")
        .text(`${selectedCountries.length} Countries Selected - Over Time`);

    } else {
      // FULL BAR CHART MODE
      const margin = { top: 40, right: 30, bottom: 50, left: 160 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      const chart = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Filter data for selected year and sort descending
      const yearData = data
        .map(d => ({ country: d.country, value: d.values[selectedYear] }))
        .filter(d => !isNaN(d.value))
        .sort((a, b) => b.value - a.value);

      const yScale = d3
        .scaleBand()
        .domain(yearData.map(d => d.country))
        .range([0, height])
        .padding(0.1);

      const xMax = d3.max(yearData, d => d.value) || 10;
      const xScale = d3
        .scaleLinear()
        .domain([0, xMax * 1.1])
        .range([0, width]);

      // X axis
      chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => d + "%"));

      // Y axis
      chart.append("g").call(d3.axisLeft(yScale));

      // Create color scale for all countries
      const allCountries = yearData.map(d => d.country);
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(allCountries);

      // Bars with click handlers and tooltips
      chart
        .selectAll(".bar")
        .data(yearData)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.country))
        .attr("width", d => xScale(d.value))
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.country))
      .style("cursor", "pointer")
        .on("click", function(event, d) {
          setSelectedCountries([d.country]);
          setShowLineChart(true);
        })
        .on("mouseover", function(event, d) {
          // Highlight the bar
          d3.select(this)
            .attr("opacity", 0.7)
            .attr("stroke", "#333")
            .attr("stroke-width", 2);
          
          // Show tooltip
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "8px 12px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000");
          
          tooltip.html(`
            <strong>${d.country}</strong><br/>
            Year: ${selectedYear}<br/>
            Value: ${d.value.toFixed(2)}%
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function(event, d) {
          // Remove highlight
          d3.select(this)
            .attr("opacity", 1)
            .attr("stroke", "none");
          
          // Remove tooltip
          d3.select("body").selectAll(".tooltip").remove();
        });

      // Labels on bars
      chart
        .selectAll(".label")
        .data(yearData)
      .enter()
      .append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.value) + 5)
        .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 5)
        .text(d => d.value.toFixed(2) + "%")
        .attr("fill", "#333")
        .style("font-size", "12px");

      // Title for full bar chart
      svg
        .append("text")
        .attr("x", containerWidth / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "600")
        .style("fill", "white")
        .text("Share of enterprises' turnover on e-commerce (%)");
    }

  }, [data, selectedYear, showLineChart, selectedCountries]);

  // Handle slider change
  const onYearChange = e => {
    setSelectedYear(+e.target.value);
  };

  // Handle back to full bar chart
  const handleBackToBarChart = () => {
    setShowLineChart(false);
    setSelectedCountries([]);
  };

  // Custom styled slider + label (you can improve with CSS)
  return (
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "700px", paddingTop: "20px" }}>
      <style>
        {`
          input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
          }

          input[type="range"]::-webkit-slider-track {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            height: 8px;
            border-radius: 4px;
          }

          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #4a90e2;
            border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          }

          input[type="range"]::-moz-range-track {
            background: transparent;
            height: 8px;
            border-radius: 4px;
          }

          input[type="range"]::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #4a90e2;
            border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          }
        `}
      </style>
      {years.length > 0 && (
        <div className="slider-wrapper" style={{ marginBottom: "20px", textAlign: "center" }}>
          <label htmlFor="yearRange" style={{ 
            fontWeight: "600", 
            color: "white",
            fontSize: "16px",
            marginRight: "15px"
          }}>
            Year: {selectedYear}
          </label>
          <div style={{ 
            display: "inline-block", 
            position: "relative", 
            width: "400px", 
            height: "50px"
          }}>
            {/* Simple line with dots */}
            <svg width="400" height="50" style={{ position: "absolute", top: "0", left: "0" }}>
              {/* Simple line */}
              <line
                x1="20"
                y1="25"
                x2="380"
                y2="25"
                stroke="#4a90e2"
                strokeWidth="2"
              />
              {/* Dots for each year */}
              {years.map((year, index) => {
                const x = 20 + (index / (years.length - 1)) * 360;
                return (
                  <circle
                    key={year}
                    cx={x}
                    cy="25"
                    r="4"
                    fill={year === selectedYear ? "#4a90e2" : "#666"}
                    stroke={year === selectedYear ? "#fff" : "none"}
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
            <input
              id="yearRange"
              type="range"
              min={Math.min(...years)}
              max={Math.max(...years)}
              step="1"
              value={selectedYear}
              onChange={onYearChange}
              style={{ 
                width: "400px", 
                cursor: "pointer",
                position: "absolute",
                top: "0",
                left: "0",
                opacity: "0.8",
                height: "50px"
              }}
            />
          </div>
          {showLineChart && (
            <button
              onClick={handleBackToBarChart}
              style={{
                marginLeft: "20px",
                padding: "8px 16px",
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              ← Back to Bar Chart
            </button>
          )}
        </div>
      )}
      <svg ref={svgRef} />
    </div>
  );
};

export { EnterpriseRevenue };
