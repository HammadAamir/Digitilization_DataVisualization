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
  const allCountriesRef = useRef([]);

  // Load and parse Excel file on mount
  useEffect(() => {
    const loadData = async () => {
      // Load file from public folder or replace with your path
      const response = await fetch(process.env.PUBLIC_URL + "/assets/tin00110.xlsx");
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

      // Update allCountriesRef after data is loaded
      allCountriesRef.current = Array.from(new Set(processedData.map(d => d.country))).sort();

      // After allCountriesRef.current is set:
      const countryCount = allCountriesRef.current.length;
      let colorArray = [];
      if (countryCount <= 24) {
        colorArray = [...d3.schemeSet3, ...d3.schemePaired].slice(0, countryCount);
      } else {
        // Generate N unique colors using d3.interpolateRainbow
        colorArray = allCountriesRef.current.map((_, i) => d3.interpolateRainbow(i / countryCount));
      }
      const colorScale = d3.scaleOrdinal().domain(allCountriesRef.current).range(colorArray);
      // Use colorScale everywhere for bar/line/dot colors.
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
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(allCountriesRef.current);

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
        .attr("fill", "#e5e7eb")
        .style("font-size", "12px");

      // RIGHT SIDE - LINE CHART
      const lineChartWidth = chartSize;
      const lineChartHeight = chartSize;

      const lineChart = svg
      .append("g")
        .attr("class", "line-chart")
        .attr("transform", `translate(${leftOffset + leftWidth + margin.left - 30},${margin.top})`);

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
            // X-axis label for line chart
            lineChart.append("text")
              .attr("x", lineChartWidth / 2)
              .attr("y", lineChartHeight + 28)
              .attr("text-anchor", "middle")
              .style("font-size", "15px")
              .style("fill", "#fff")
              .style("font-weight", "600")
              .text("Year");

            // Y axis for line chart (only draw once)
            lineChart.append("g").call(d3.axisLeft(lineYScale).tickFormat(d => d + "%"));
            // Y-axis label for line chart
            lineChart.append("text")
              .attr("x", -lineChartHeight / 2)
              .attr("y", -48)
              .attr("transform", "rotate(-90)")
              .attr("text-anchor", "middle")
              .style("font-size", "15px")
              .style("fill", "#fff")
              .style("font-weight", "600")
              .text("E-commerce Revenue Share (%)");
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
        .style("fill", "#e5e7eb")
        .text("All Countries - " + selectedYear);

      svg
        .append("text")
        .attr("x", leftOffset + leftWidth + rightWidth / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("fill", "#e5e7eb")
        .text(`${selectedCountries.length} Countries Selected - Over Time`);

      // Add axis labels to main SVG for bar chart
      svg.append("text")
        .attr("x", leftOffset + margin.left + barChartWidth / 2)
        .attr("y", margin.top + barChartHeight + 38)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("fill", "#fff")
        .style("font-weight", "600")
        .text("E-commerce Revenue Share (%)");
      svg.append("text")
        .attr("x", leftOffset - 10)
        .attr("y", margin.top + barChartHeight / 2)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90,${leftOffset - 10},${margin.top + barChartHeight / 2})`)
        .style("font-size", "15px")
        .style("fill", "#fff")
        .style("font-weight", "600")
        .text("Country");

      // Add axis labels to main SVG for line chart
      svg.append("text")
        .attr("x", leftOffset + leftWidth + margin.left + lineChartWidth / 2 - 30)
        .attr("y", margin.top + lineChartHeight + 38)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("fill", "#fff")
        .style("font-weight", "600")
        .text("Year");
      svg.append("text")
        .attr("x", leftOffset + leftWidth + margin.left - 2)
        .attr("y", margin.top + lineChartHeight / 2)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90,${leftOffset + leftWidth + margin.left - 2},${margin.top + lineChartHeight / 2})`)
        .style("font-size", "15px")
        .style("fill", "#fff")
        .style("font-weight", "600")
        .text("E-commerce Revenue Share (%)");

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
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(allCountriesRef.current);

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
      .enter()
      .append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.value) + 5)
        .attr("y", d => yScale(d.country) + yScale.bandwidth() / 2 + 5)
        .text(d => d.value.toFixed(2) + "%")
        .attr("fill", "#e5e7eb")
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

      // Add axis labels to main SVG for full bar chart
      svg.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", margin.top + height + 38)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("fill", "#fff")
        .style("font-weight", "600")
        .text("E-commerce Revenue Share (%)");
      svg.append("text")
        .attr("x", margin.left - 60)
        .attr("y", margin.top + height / 2)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90,${margin.left - 60},${margin.top + height / 2})`)
        .style("font-size", "15px")
        .style("fill", "#fff")
        .style("font-weight", "600")
        .text("Country");


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
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "700px", paddingTop: "20px", marginBottom: "4rem" }}>
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
        <div className="slider-wrapper" style={{ 
          marginBottom: "15px", 
          textAlign: "center",
          padding: "10px"
        }}>
          {/* Hint for interactive bar click */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 8,
            fontSize: 15,
            color: '#4a90e2',
            fontWeight: 600,
            letterSpacing: 0.2,
            textShadow: '0 2px 8px #000a',
            userSelect: 'none'
          }}>
            <span style={{fontSize: 20, marginRight: 4}}>🖱️</span>
            Tip: <span style={{color: '#e5e7eb', fontWeight: 700, marginLeft: 4}}>Click a bar to view its trend over time!</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "10px"
          }}>
            <label htmlFor="yearRange" style={{ 
              fontWeight: "700", 
              color: "#f0f0f0",
              fontSize: "18px",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
            }}>
              Year: {selectedYear}
            </label>
            {showLineChart && (
              <button
                onClick={handleBackToBarChart}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "rgba(74, 144, 226, 0.9)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(74, 144, 226, 1)";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(74, 144, 226, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(74, 144, 226, 0.9)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(74, 144, 226, 0.3)";
                }}
              >
                ← Back to Bar Chart
              </button>
            )}
          </div>
          {/* Stepped slider */}
          <div style={{ width: "520px", margin: "0 auto", position: "relative", height: 90 }}>
            <style>{`
              .stepped-slider { width: 100%; height: 48px; margin: 0; background: none; position: absolute; top: 0; left: 0; z-index: 2; }
              .stepped-slider:focus { outline: none; }
              .stepped-slider::-webkit-slider-thumb {
                opacity: 0;
                pointer-events: none;
              }
              .stepped-slider::-moz-range-thumb {
                opacity: 0;
                pointer-events: none;
              }
              .stepped-slider::-ms-thumb {
                opacity: 0;
                pointer-events: none;
              }
              .stepped-slider::-webkit-slider-runnable-track {
                height: 12px;
                background: transparent;
                border-radius: 6px;
              }
              .stepped-slider::-ms-fill-lower,
              .stepped-slider::-ms-fill-upper {
                background: transparent;
              }
              .stepped-slider::-moz-range-track {
                height: 12px;
                background: transparent;
                border-radius: 6px;
              }
              .stepped-slider::-ms-tooltip { display: none; }
              .stepped-slider:disabled { opacity: 0.5; }
            `}</style>
            {/* Custom SVG for track, steps, and thumb */}
            <svg width="520" height="48" style={{ position: "absolute", top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              {/* Track background */}
              <rect x="24" y="18" width={472} height={12} rx={6} fill="#e0e0e0" />
              {/* Track filled */}
              <rect x="24" y="18" width={472 * ((selectedYear - Math.min(...years)) / (Math.max(...years) - Math.min(...years)))} height={12} rx={6} fill="url(#sliderFill)" />
              <defs>
                <linearGradient id="sliderFill" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1ea0f7" />
                  <stop offset="100%" stopColor="#2196f3" />
                </linearGradient>
              </defs>
              {/* Steps */}
              {years.map((year, idx) => {
                const x = 24 + (472) * (idx / (years.length - 1));
                const isActive = idx <= years.indexOf(selectedYear);
                return (
                  <g key={year}>
                    <circle
                      cx={x}
                      cy={24}
                      r={isActive ? 14 : 12}
                      fill={isActive ? 'url(#sliderFill)' : '#e0e0e0'}
                      stroke="#fff"
                      strokeWidth={isActive ? 4 : 3}
                      style={{ filter: isActive ? 'drop-shadow(0 2px 6px #2196f3aa)' : 'drop-shadow(0 1px 2px #bbb)' }}
                    />
                  </g>
                );
              })}
              {/* Custom thumb (active step) */}
              {(() => {
                const idx = years.indexOf(selectedYear);
                const x = 24 + (472) * (idx / (years.length - 1));
                return (
                  <circle
                    cx={x}
                    cy={24}
                    r={14}
                    fill="url(#sliderFill)"
                    stroke="#fff"
                    strokeWidth={4}
                    style={{ filter: 'drop-shadow(0 2px 6px #2196f3aa)' }}
                  />
                );
              })()}
              {/* Highlight on top of thumb */}
              {(() => {
                const idx = years.indexOf(selectedYear);
                const x = 24 + (472) * (idx / (years.length - 1));
                return (
                  <circle
                    cx={x}
                    cy={24}
                    r={17}
                    fill="none"
                    stroke="#2196f3"
                    strokeWidth={6}
                    style={{ filter: 'drop-shadow(0 0 16px #2196f3cc)' }}
                  />
                );
              })()}
            </svg>
            {/* Range input overlays the SVG */}
            <input
              id="yearRange"
              className="stepped-slider"
              type="range"
              min={Math.min(...years)}
              max={Math.max(...years)}
              step="1"
              value={selectedYear}
              onChange={onYearChange}
              style={{
                width: "100%",
                margin: 0,
                background: "none",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 2
              }}
            />
            {/* Labels below each step */}
            <div style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 54,
              height: 32,
              display: "flex",
              justifyContent: "space-between",
              pointerEvents: "none",
              zIndex: 3
            }}>
              {years.map((year, idx) => (
                <div key={year} style={{
                  width: 1,
                  minWidth: 1,
                  textAlign: "center",
                  color: idx <= years.indexOf(selectedYear) ? '#2196f3' : '#888',
                  fontWeight: idx === years.indexOf(selectedYear) ? 700 : 500,
                  fontSize: idx === years.indexOf(selectedYear) ? 15 : 13,
                  marginLeft: idx === 0 ? 0 : -1
                }}>{year}</div>
              ))}
            </div>
          </div>
        </div>
      )}
      <svg ref={svgRef} />
    </div>
  );
};

export { EnterpriseRevenue };
