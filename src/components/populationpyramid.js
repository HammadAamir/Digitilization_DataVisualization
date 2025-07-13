import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";
import "./choropleth.css";

const PopulationPyramid = () => {
  const [allData, setAllData] = useState({});
  const [availableYears, setAvailableYears] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("European Union - 27 countries (from 2020)");
  const [selectedYear, setSelectedYear] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef(null);
  const svgRef = useRef();
  const containerRef = useRef();
  const [yearsWithData, setYearsWithData] = useState([]);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      const response = await fetch(process.env.PUBLIC_URL + "/assets/internet_population.xlsx");
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      // Extract all years and all countries
      let yearsSet = new Set();
      let countriesSet = new Set();
      let allDataObj = {};
      // Use all sheets (from 1 onwards)
      for (let i = 1; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Extract metadata from first 9 rows
        const metadata = extractMetadata(jsonData.slice(0, 9));
        // Find the header row with 'TIME'
        const headerRow = jsonData.find(row => row.some(cell => cell && cell.toString().includes('TIME')));
        if (!headerRow || !metadata) continue;
        // Years are the columns after 'TIME'
        const yearIndices = headerRow.map((cell, idx) => (cell && !isNaN(cell)) ? idx : null).filter(idx => idx !== null);
        const years = yearIndices.map(idx => parseInt(headerRow[idx]));
        years.forEach(y => yearsSet.add(y));
        // For each country row, extract values for all years
        for (let rowIdx = 10; rowIdx < jsonData.length; rowIdx++) {
          const row = jsonData[rowIdx];
          if (!row || !row[0] || typeof row[0] !== 'string') continue;
          const country = row[0].trim();
          if ([":", "GEO (Labels)", "Special value", "Observation flags:", "b", "bu", "e", "u"].includes(country) || country.toLowerCase().startsWith('european union') || country.toLowerCase().startsWith('euro area')) continue;
          countriesSet.add(country);
          yearIndices.forEach((colIdx, i) => {
            const year = years[i];
            const value = row[colIdx];
            if (!allDataObj[country]) allDataObj[country] = {};
            if (!allDataObj[country][year]) allDataObj[country][year] = [];
            // Find gender for this sheet
            const gender = metadata.gender;
            const ageGroup = metadata.ageGroup;
            if (value !== undefined && value !== null && value !== '' && !isNaN(value)) {
              allDataObj[country][year].push({
                gender,
                ageGroup,
                ageStart: metadata.ageStart,
                ageEnd: metadata.ageEnd,
                value: parseFloat(value)
              });
            }
          });
        }
      }
      // Also add the EU aggregate (from the original logic)
      // For each sheet, extract EU data for all years
      for (let i = 1; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const metadata = extractMetadata(jsonData.slice(0, 9));
        const headerRow = jsonData.find(row => row.some(cell => cell && cell.toString().includes('TIME')));
        if (!headerRow || !metadata) continue;
        const yearIndices = headerRow.map((cell, idx) => (cell && !isNaN(cell)) ? idx : null).filter(idx => idx !== null);
        const years = yearIndices.map(idx => parseInt(headerRow[idx]));
        // Find the EU row
        const euRow = jsonData.find(row => row[0] && row[0].toString().includes("European Union - 27 countries (from 2020)"));
        if (euRow) {
          yearIndices.forEach((colIdx, i) => {
            const year = years[i];
            const value = euRow[colIdx];
            if (!allDataObj["European Union - 27 countries (from 2020)"]) allDataObj["European Union - 27 countries (from 2020)"] = {};
            if (!allDataObj["European Union - 27 countries (from 2020)"][year]) allDataObj["European Union - 27 countries (from 2020)"][year] = [];
            if (value !== undefined && value !== null && value !== '' && !isNaN(value)) {
              allDataObj["European Union - 27 countries (from 2020)"][year].push({
                gender: metadata.gender,
                ageGroup: metadata.ageGroup,
                ageStart: metadata.ageStart,
                ageEnd: metadata.ageEnd,
                value: parseFloat(value)
              });
            }
          });
        }
      }
      setAllData(allDataObj);
      setAvailableYears(Array.from(yearsSet).sort((a, b) => a - b));
      console.log("All Data", allDataObj);
      const sortedCountries = Array.from(countriesSet).sort();
      setCountries(sortedCountries);
      // Set default selected country and year if not valid
      if (!selectedCountry || !allDataObj[selectedCountry]) {
        setSelectedCountry(sortedCountries[0]);
      }
      const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);
      if (!selectedYear || !sortedYears.includes(selectedYear)) {
        setSelectedYear(sortedYears[0]);
      }
      setLoading(false);
    };
    loadAllData();
  // eslint-disable-next-line
  }, []);

  // When country or year changes, update data from allData
  useEffect(() => {
    if (allData && selectedCountry && selectedYear) {
      setData((allData[selectedCountry] && allData[selectedCountry][selectedYear]) ? allData[selectedCountry][selectedYear] : []);
    }
  }, [allData, selectedCountry, selectedYear]);

  // When selectedCountry or allData changes, update yearsWithData
  useEffect(() => {
    if (allData && selectedCountry && allData[selectedCountry]) {
      const filtered = availableYears.filter(y => allData[selectedCountry][y] && allData[selectedCountry][y].length > 0);
      setYearsWithData(filtered);
      // If the current selectedYear is not in filtered, set to first available
      if (!filtered.includes(selectedYear)) {
        setSelectedYear(filtered[0] || null);
      }
    } else {
      setYearsWithData([]);
    }
  // eslint-disable-next-line
  }, [allData, selectedCountry, availableYears]);

  const extractMetadata = (headerRows) => {
    console.log("Extracting metadata from header rows:", headerRows);
    
    // Find the individual type row (usually row 7)
    const individualTypeRow = headerRows.find(row => 
      row.some(cell => cell && cell.toString().includes('Individual type'))
    );
    
    console.log("Individual type row found:", individualTypeRow);
    
    if (!individualTypeRow) {
      console.log("No individual type row found");
      return null;
    }
    
    // Extract the individual type description
    const individualType = individualTypeRow.find(cell => 
      cell && (cell.toString().includes('Males') || cell.toString().includes('Females'))
    );
    
    console.log("Individual type found:", individualType);
    
    if (!individualType) {
      console.log("No gender info found in individual type row");
      return null;
    }
    
    // Parse gender and age group
    const typeStr = individualType.toString();
    const gender = typeStr.includes('Males') ? 'Male' : 'Female';
    
    // Extract age group
    const ageMatch = typeStr.match(/(\d+)\s+to\s+(\d+)/);
    if (!ageMatch) {
      console.log("Could not parse age group from:", typeStr);
      return null;
    }
    
    const ageStart = parseInt(ageMatch[1]);
    const ageEnd = parseInt(ageMatch[2]);
    const ageGroup = `${ageStart}-${ageEnd}`;
    
    const result = {
      gender,
      ageGroup,
      ageStart,
      ageEnd
    };
    
    console.log("Parsed metadata:", result);
    return result;
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 600;
    const margin = { top: 60, right: 120, bottom: 80, left: 120 };

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Group data by age groups and calculate male/female values
    const ageGroups = [...new Set(data.map(d => d.ageGroup))].sort((a, b) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return aStart - bStart;
    });

    const processedData = ageGroups.map(ageGroup => {
      const maleData = data.find(d => d.ageGroup === ageGroup && d.gender === 'Male');
      const femaleData = data.find(d => d.ageGroup === ageGroup && d.gender === 'Female');
      return {
        ageGroup,
        male: maleData ? maleData.value : 0,
        female: femaleData ? femaleData.value : 0
      };
    });

    // Scales
    const maxValue = d3.max(processedData, d => Math.max(d.male, d.female));
    const xScale = d3
      .scaleLinear()
      .domain([-maxValue, maxValue])
      .range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain([...ageGroups].reverse())
      .range([0, height])
      .padding(0.3);

    // Select or create SVG
    let svg = d3.select(svgRef.current);
    svg.attr("width", containerWidth).attr("height", containerHeight);

    // Select or create chart group
    let chart = svg.select("g.chart-group");
    if (chart.empty()) {
      chart = svg.append("g").attr("class", "chart-group").attr("transform", `translate(${margin.left},${margin.top})`);
    }

    // Y-axis (age groups)
    let yAxisGroup = chart.select("g.y-axis");
    if (yAxisGroup.empty()) {
      yAxisGroup = chart.append("g").attr("class", "y-axis");
    }
    yAxisGroup.transition().duration(500).call(d3.axisLeft(yScale)).selectAll("text").style("font-size", "11px").style("fill", "#fff");

    // Y-axis label
    let yAxisLabel = chart.select("text.y-axis-label");
    if (yAxisLabel.empty()) {
      yAxisLabel = chart.append("text").attr("class", "y-axis-label");
    }
    yAxisLabel
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#fff")
      .text("Age Groups");

    // X-axis (centered, symmetric)
    const xAxisTicks = [-100, -80, -50, -20, 0, 20, 50, 80, 100].filter(tick => tick >= -maxValue && tick <= maxValue);
    let xAxisGroup = chart.select("g.x-axis");
    if (xAxisGroup.empty()) {
      xAxisGroup = chart.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    }
    xAxisGroup.transition().duration(500).call(d3.axisBottom(xScale).tickValues(xAxisTicks).tickFormat(d => `${Math.abs(d)}%`)).selectAll("text").style("font-size", "11px").style("fill", "#fff");

    // X-axis label
    let xAxisLabel = chart.select("text.x-axis-label");
    if (xAxisLabel.empty()) {
      xAxisLabel = chart.append("text").attr("class", "x-axis-label");
    }
    xAxisLabel
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#fff")
      .text("Daily Internet Usage (%)");

    // Center line
    let centerLine = chart.select("line.center-line");
    if (centerLine.empty()) {
      centerLine = chart.append("line").attr("class", "center-line");
    }
    centerLine
      .attr("x1", xScale(0))
      .attr("x2", xScale(0))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Male bars (left side)
    let maleBars = chart.selectAll(".male-bar").data(processedData, d => d.ageGroup);
    maleBars.enter()
      .append("rect")
      .attr("class", "male-bar")
      .attr("x", d => xScale(0))
      .attr("y", d => yScale(d.ageGroup))
      .attr("width", 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", "#3498db")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .merge(maleBars)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("stroke", "#333");
        d3.select("body").selectAll(".tooltip").remove();
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(255, 255, 255, 0.95)")
          .style("color", "#333")
          .style("padding", "12px 15px")
          .style("border-radius", "8px")
          .style("font-size", "13px")
          .style("pointer-events", "none")
          .style("opacity", 1)
          .style("z-index", 1000)
          .style("box-shadow", "0 4px 20px rgba(0, 0, 0, 0.15)")
          .style("border", "1px solid #e0e0e0")
          .style("font-family", "Arial, sans-serif")
          .style("min-width", "200px");
        tooltip.html(`
          <div style="margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #2c3e50;">Age Group: ${d.ageGroup}</div>
          <div style="margin-bottom: 6px; font-size: 12px; color: #7f8c8d;">Gender: Male</div>
          <div style="margin-bottom: 6px; font-size: 12px; color: #34495e;">Daily Internet Usage: <strong>${d.male.toFixed(1)}%</strong></div>
          <div style="font-size: 13px; font-weight: 600; color: #3498db;">Male</div>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function(event) {
        d3.select("body").selectAll(".tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke-width", 1)
          .attr("stroke", "#fff");
        d3.select("body").selectAll(".tooltip").remove();
      })
      .transition()
      .duration(500)
      .attr("x", d => xScale(-d.male))
      .attr("y", d => yScale(d.ageGroup))
      .attr("width", d => xScale(0) - xScale(-d.male))
      .attr("height", yScale.bandwidth());
    maleBars.exit().remove();

    // Female bars (right side)
    let femaleBars = chart.selectAll(".female-bar").data(processedData, d => d.ageGroup);
    femaleBars.enter()
      .append("rect")
      .attr("class", "female-bar")
      .attr("x", xScale(0))
      .attr("y", d => yScale(d.ageGroup))
      .attr("width", 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", "#e74c3c")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .merge(femaleBars)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("stroke", "#333");
        d3.select("body").selectAll(".tooltip").remove();
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(255, 255, 255, 0.95)")
          .style("color", "#333")
          .style("padding", "12px 15px")
          .style("border-radius", "8px")
          .style("font-size", "13px")
          .style("pointer-events", "none")
          .style("opacity", 1)
          .style("z-index", 1000)
          .style("box-shadow", "0 4px 20px rgba(0, 0, 0, 0.15)")
          .style("border", "1px solid #e0e0e0")
          .style("font-family", "Arial, sans-serif")
          .style("min-width", "200px");
        tooltip.html(`
          <div style="margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #2c3e50;">Age Group: ${d.ageGroup}</div>
          <div style="margin-bottom: 6px; font-size: 12px; color: #7f8c8d;">Gender: Female</div>
          <div style="margin-bottom: 6px; font-size: 12px; color: #34495e;">Daily Internet Usage: <strong>${d.female.toFixed(1)}%</strong></div>
          <div style="font-size: 13px; font-weight: 600; color: #e74c3c;">Female</div>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", function(event) {
        d3.select("body").selectAll(".tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke-width", 1)
          .attr("stroke", "#fff");
        d3.select("body").selectAll(".tooltip").remove();
      })
      .transition()
      .duration(500)
      .attr("x", xScale(0))
      .attr("y", d => yScale(d.ageGroup))
      .attr("width", d => xScale(d.female) - xScale(0))
      .attr("height", yScale.bandwidth());
    femaleBars.exit().remove();

    // Title
    let title = svg.select("text.pyramid-title");
    if (title.empty()) {
      title = svg.append("text").attr("class", "pyramid-title");
    }
    title
      .attr("x", containerWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "600")
      .style("fill", "#fff")
      .text('Daily Internet Usage by Gender and Age Group (European Countries, ' + selectedYear + ')');

    // Legend
    let legend = svg.select("g.pyramid-legend");
    if (legend.empty()) {
      legend = svg.append("g").attr("class", "pyramid-legend").attr("transform", `translate(${width + margin.left + 40}, ${margin.top})`);
    }
    legend.selectAll("*").remove();
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#3498db");
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text("Male")
      .style("font-size", "12px")
      .style("fill", "#fff");
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#e74c3c");
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 37)
      .text("Female")
      .style("font-size", "12px")
      .style("fill", "#fff");

    // Cleanup tooltip on unmount
    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };
  }, [data, selectedYear]);

  // Animation effect
  useEffect(() => {
    if (isPlaying && yearsWithData.length > 0 && selectedYear !== null) {
      animationRef.current = setInterval(() => {
        setSelectedYear(prevYear => {
          const idx = yearsWithData.indexOf(prevYear);
          if (idx < yearsWithData.length - 1) {
            return yearsWithData[idx + 1];
          } else {
            setIsPlaying(false);
            return prevYear;
          }
        });
      }, 1000);
    } else {
      clearInterval(animationRef.current);
    }
    return () => clearInterval(animationRef.current);
  }, [isPlaying, yearsWithData, selectedYear]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading population pyramid...</div>;
  }

  if (!data || data.length === 0 || yearsWithData.length === 0) {
    return <div style={{ textAlign: "center", padding: "20px" }}>No data available</div>;
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "700px", paddingTop: "20px" }}>
      {(countries.length > 0) && (
        <div className="selectors" style={{ marginBottom: "15px", textAlign: "center", display: "flex", justifyContent: "center", gap: "24px" }}>
          {/* Country Dropdown */}
          {countries.length > 0 && (
            <div className="country-selector">
              <label htmlFor="countrySelect" style={{ fontWeight: "600", marginRight: "10px", color: "#e5e7eb" }}>Country:</label>
              <select
                id="countrySelect"
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
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
                onMouseEnter={e => { e.target.style.opacity = "0.8"; }}
                onMouseLeave={e => { e.target.style.opacity = "1"; }}
              >
                {countries.map(country => (
                  <option key={country} value={country} style={{ backgroundColor: "#1f2937", color: "#e5e7eb" }}>{country}</option>
                ))}
              </select>
            </div>
          )}
          {/* Play/Pause Button and Year Display */}
          {yearsWithData.length > 0 && (
            <div className="year-animator" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => {
                  if (!isPlaying && yearsWithData.length > 0) {
                    setSelectedYear(yearsWithData[0]);
                    setIsPlaying(true);
                  } else {
                    setIsPlaying(false);
                  }
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: isPlaying ? "#e74c3c" : "#4a90e2",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer",
                  marginRight: "8px"
                }}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <div className="year-selector">
                <label htmlFor="yearSelect" style={{ fontWeight: "600", marginRight: "10px", color: "#e5e7eb" }}>Year:</label>
                <select
                  id="yearSelect"
                  value={selectedYear}
                  onChange={e => setSelectedYear(parseInt(e.target.value))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "1px solid #4b5563",
                    backgroundColor: "#1f2937",
                    color: "#e5e7eb",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                    minWidth: "80px"
                  }}
                >
                  {yearsWithData.map(year => (
                    <option key={year} value={year} style={{ backgroundColor: "#1f2937", color: "#e5e7eb" }}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
      <svg ref={svgRef} />
    </div>
  );
};

export { PopulationPyramid }; 