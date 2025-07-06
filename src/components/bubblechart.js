import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";
import "./choropleth.css";

const BubbleChart = () => {
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
        
        // Load all three datasets
        const [buyersResponse, enterprisesResponse, turnoverResponse] = await Promise.all([
          fetch("/assets/tin00096.xlsx"),
          fetch("/assets/tin00111.xlsx"),
          fetch("/assets/tin00110.xlsx")
        ]);

        const [buyersBuffer, enterprisesBuffer, turnoverBuffer] = await Promise.all([
          buyersResponse.arrayBuffer(),
          enterprisesResponse.arrayBuffer(),
          turnoverResponse.arrayBuffer()
        ]);

        // Parse the Excel files
        const buyersWorkbook = XLSX.read(buyersBuffer, { type: "array" });
        const enterprisesWorkbook = XLSX.read(enterprisesBuffer, { type: "array" });
        const turnoverWorkbook = XLSX.read(turnoverBuffer, { type: "array" });

        // Extract available years from all datasets
        const buyersYears = extractAvailableYears(buyersWorkbook.Sheets[buyersWorkbook.SheetNames[0]]);
        const enterprisesYears = extractAvailableYears(enterprisesWorkbook.Sheets[enterprisesWorkbook.SheetNames[0]]);
        const turnoverYears = extractAvailableYears(turnoverWorkbook.Sheets[turnoverWorkbook.SheetNames[0]]);

        // Combine years and filter to 2020-2024
        const allYears = [...new Set([...buyersYears, ...enterprisesYears, ...turnoverYears])]
          .filter(year => year >= 2020 && year <= 2024)
          .sort((a, b) => a - b);

        setYears(allYears);

        // Extract data for the selected year
        const buyersData = extractDataForYear(buyersWorkbook.Sheets[buyersWorkbook.SheetNames[0]], selectedYear);
        const enterprisesData = extractDataForYear(enterprisesWorkbook.Sheets[enterprisesWorkbook.SheetNames[0]], selectedYear);
        const turnoverData = extractDataForYear(turnoverWorkbook.Sheets[turnoverWorkbook.SheetNames[0]], selectedYear);

        // Combine the data
        const combinedData = combineData(buyersData, enterprisesData, turnoverData);
        console.log(`Combined data for year ${selectedYear}:`, combinedData);
        console.log(`Buyers data:`, buyersData);
        console.log(`Enterprises data:`, enterprisesData);
        console.log(`Turnover data:`, turnoverData);
        setData(combinedData);
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
    
    return availableYears;
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
        const value = row[yearIndex];
        if (value !== undefined && value !== null && value !== '' && !isNaN(value)) {
          data[country] = parseFloat(value);
        }
      }
    }
    
    console.log(`Extracted data for year ${year}:`, data);
    return data;
  };

  const combineData = (buyersData, enterprisesData, turnoverData) => {
    const combined = [];
    const allCountries = new Set([
      ...Object.keys(buyersData),
      ...Object.keys(enterprisesData),
      ...Object.keys(turnoverData)
    ]);

    allCountries.forEach(country => {
      const buyersValue = buyersData[country];
      const enterprisesValue = enterprisesData[country];
      const turnoverValue = turnoverData[country];

      // Only include countries that have data for at least 2 metrics
      const validValues = [buyersValue, enterprisesValue, turnoverValue].filter(v => v !== undefined);
      if (validValues.length >= 2) {
        combined.push({
          country: country,
          buyers: buyersValue || 0,
          enterprises: enterprisesValue || 0,
          turnover: turnoverValue || 0
        });
      }
    });

    return combined;
  };

  useEffect(() => {
    if (!data || data.length === 0 || !selectedYear) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 600;
    const margin = { top: 60, right: 200, bottom: 80, left: 80 };

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

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.buyers) * 1.1])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.enterprises) * 1.1])
      .range([height, 0]);

    const sizeScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.turnover)])
      .range([5, 30]);

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.turnover)]);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d + "%");
    const yAxis = d3.axisLeft(yScale).tickFormat(d => d + "%");

    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    chart.append("g").call(yAxis);

    // Axis labels
    chart
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Individuals using internet for buying goods or services (%)");

    chart
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Enterprises having received orders online (%)");

    // Tooltip
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("display", "none")
      .style("background", "rgba(0, 0, 0, 0.95)")
      .style("color", "white")
      .style("border", "3px solid #4a90e2")
      .style("padding", "15px 20px")
      .style("border-radius", "10px")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("box-shadow", "0 8px 25px rgba(0, 0, 0, 0.6)")
      .style("min-width", "180px")
      .style("z-index", "9999")
      .style("font-family", "Arial, sans-serif");

    // Bubbles
    chart
      .selectAll(".bubble")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", d => xScale(d.buyers))
      .attr("cy", d => yScale(d.enterprises))
      .attr("r", d => sizeScale(d.turnover))
      .attr("fill", d => colorScale(d.turnover))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        console.log("Hovering over bubble:", d);
        
        d3.select(this)
          .attr("stroke-width", 3)
          .attr("stroke", "#4a90e2");

        tooltip
          .style("opacity", 1)
          .style("display", "block")
          .html(`
            <div style="margin-bottom: 5px;"><strong>${d.country}</strong></div>
            <div style="font-size: 12px; opacity: 0.8;">Year: ${selectedYear}</div>
            <div style="font-size: 12px; opacity: 0.8;">Online Buyers: ${d.buyers.toFixed(1)}%</div>
            <div style="font-size: 12px; opacity: 0.8;">Enterprises with Online Orders: ${d.enterprises.toFixed(1)}%</div>
            <div style="color: #4a90e2;">E-commerce Turnover: ${d.turnover.toFixed(1)}%</div>
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
        console.log("Mouse out from bubble");
        
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("stroke", "#fff");

        tooltip.style("opacity", 0).style("display", "none");
      });

    // Title
    svg
      .append("text")
      .attr("x", containerWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "600")
      .text("E-commerce Adoption Correlation");

    // Legend for bubble size
    const legendSize = svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 40}, ${margin.top})`);

    const sizeLegendData = [10, 20, 30, 40];
    const legendSizeScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.turnover)])
      .range([5, 30]);

    legendSize
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .text("Bubble Size = Turnover %")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333");

    legendSize
      .selectAll(".legend-size")
      .data(sizeLegendData)
      .enter()
      .append("circle")
      .attr("class", "legend-size")
      .attr("cx", 0)
      .attr("cy", (d, i) => i * 35 + 10)
      .attr("r", d => legendSizeScale(d))
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);

    legendSize
      .selectAll(".legend-size-text")
      .data(sizeLegendData)
      .enter()
      .append("text")
      .attr("class", "legend-size-text")
      .attr("x", 45)
      .attr("y", (d, i) => i * 35 + 15)
      .text(d => `${d}%`)
      .style("font-size", "12px")
      .style("fill", "#333");

    // Color legend
    const legendColor = svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 40}, ${margin.top + 200})`);

    const colorLegendData = [0, 25, 50, 75, 100];
    const legendColorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, d => d.turnover)]);

    legendColor
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .text("Color = Turnover %")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333");

    legendColor
      .selectAll(".legend-color")
      .data(colorLegendData)
      .enter()
      .append("rect")
      .attr("class", "legend-color")
      .attr("x", 0)
      .attr("y", (d, i) => i * 25 + 10)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => legendColorScale(d))
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5);

    legendColor
      .selectAll(".legend-color-text")
      .data(colorLegendData)
      .enter()
      .append("text")
      .attr("class", "legend-color-text")
      .attr("x", 30)
      .attr("y", (d, i) => i * 25 + 25)
      .text(d => `${d}%`)
      .style("font-size", "12px")
      .style("fill", "#333");

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, selectedYear]);

  // Handle year change
  const onYearChange = e => {
    setSelectedYear(+e.target.value);
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading bubble chart...</div>;
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
            onChange={onYearChange}
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

export { BubbleChart }; 