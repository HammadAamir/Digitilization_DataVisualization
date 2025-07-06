import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";
import "./choropleth.css";

const PopulationPyramid = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("European Union - 27 countries (from 2020)");
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load the dataset
        const response = await fetch("/assets/internet_population.xlsx");
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        
        // Extract available countries first
        const availableCountries = extractAvailableCountries(workbook);
        setCountries(availableCountries);
        
        // Extract data from all sheets (Sheet 1 onwards)
        const pyramidData = extractPyramidData(workbook, selectedCountry);
        
        console.log("Population pyramid data:", pyramidData);
        console.log("Data length:", pyramidData.length);
        console.log("Sample data:", pyramidData.slice(0, 3));
        
        if (pyramidData.length === 0) {
          console.error("No data extracted from workbook");
        }
        
        setData(pyramidData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCountry]);

  const extractAvailableCountries = (workbook) => {
    const countries = new Set();
    // Use the first actual data sheet (Sheet 1, index 2)
    if (workbook.SheetNames.length > 2) {
      const sheet = workbook.Sheets[workbook.SheetNames[2]]; // Sheet 1
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      // Find all rows that contain country names (skip header rows)
      for (let i = 10; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (
          row &&
          row[0] &&
          typeof row[0] === 'string' &&
          row[0].trim() !== '' &&
          ![":", "GEO (Labels)", "Special value", "Observation flags:", "b", "bu", "e", "u"].includes(row[0].trim()) &&
          !row[0].trim().toLowerCase().startsWith('european union') &&
          !row[0].trim().toLowerCase().startsWith('euro area')
        ) {
          countries.add(row[0].trim());
        }
      }
    }
    return Array.from(countries).sort();
  };

  const extractPyramidData = (workbook, targetRegion) => {
    const pyramidData = [];
    const targetYear = 2024;
    
    console.log("Extracting pyramid data from workbook with sheets:", workbook.SheetNames);
    console.log("Target region:", targetRegion);
    
    // Process each sheet starting from Sheet 1
    for (let i = 1; i < workbook.SheetNames.length; i++) {
      const sheetName = workbook.SheetNames[i];
      console.log(`Processing sheet: ${sheetName}`);
      
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Extract metadata from first 9 rows
      const metadata = extractMetadata(jsonData.slice(0, 9));
      console.log(`Metadata for ${sheetName}:`, metadata);
      
      // Extract 2024 data for selected country
      const yearData = extractYearData(jsonData, targetYear, targetRegion);
      console.log(`Year data for ${sheetName}:`, yearData);
      
      if (yearData !== null && metadata) {
        pyramidData.push({
          ...metadata,
          value: yearData
        });
        console.log(`✅ Added data for ${sheetName}:`, { ...metadata, value: yearData });
      } else {
        console.log(`❌ Skipped ${sheetName} - metadata:`, metadata, "yearData:", yearData);
      }
    }
    
    console.log("Final pyramid data:", pyramidData);
    return pyramidData;
  };

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

  const extractYearData = (jsonData, targetYear, targetRegion) => {
    console.log(`Looking for region: "${targetRegion}" and year: ${targetYear}`);
    
    // Find the row with the target region
    const regionRow = jsonData.find(row => 
      row[0] && row[0].toString().includes(targetRegion)
    );
    
    console.log("Region row found:", regionRow);
    
    if (!regionRow) {
      console.log(`Region "${targetRegion}" not found`);
      return null;
    }
    
    // Find the column index for the target year
    const headerRow = jsonData.find(row => 
      row.some(cell => cell && cell.toString().includes('TIME'))
    );
    
    console.log("Header row found:", headerRow);
    
    if (!headerRow) {
      console.log("No header row found");
      return null;
    }
    
    const yearIndex = headerRow.findIndex(cell => 
      cell && cell.toString() === targetYear.toString()
    );
    
    console.log(`Year ${targetYear} found at index: ${yearIndex}`);
    
    if (yearIndex === -1) {
      console.log(`Year ${targetYear} not found in header`);
      return null;
    }
    
    // Get the value for the target year
    const value = regionRow[yearIndex];
    
    console.log(`Value for ${targetYear}: ${value} (type: ${typeof value})`);
    
    if (value === undefined || value === null || value === '' || isNaN(value)) {
      console.log(`Invalid value: ${value}`);
      return null;
    }
    
    const result = parseFloat(value);
    console.log(`✅ Valid data: ${result}%`);
    return result;
  };

  useEffect(() => {
    if (!data || data.length === 0) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = 600;
    const margin = { top: 60, right: 120, bottom: 80, left: 120 };

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
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, d => Math.max(d.male, d.female))])
      .range([0, width / 2]);

    const yScale = d3
      .scaleBand()
      .domain(ageGroups)
      .range([0, height])
      .padding(0.3);

    // Create tooltip
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
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("box-shadow", "0 4px 20px rgba(0, 0, 0, 0.15)")
      .style("border", "1px solid #e0e0e0")
      .style("font-family", "Arial, sans-serif")
      .style("min-width", "200px");

    // Male bars (left side)
    chart
      .selectAll(".male-bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "male-bar")
      .attr("x", d => width / 2 - xScale(d.male))
      .attr("y", d => yScale(d.ageGroup))
      .attr("width", d => xScale(d.male))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#3498db")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("stroke", "#333");

        tooltip
          .style("opacity", 1)
          .style("display", "block")
          .html(`
            <div style="margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #2c3e50;">Age Group: ${d.ageGroup}</div>
            <div style="margin-bottom: 6px; font-size: 12px; color: #7f8c8d;">Gender: Male</div>
            <div style="margin-bottom: 6px; font-size: 12px; color: #34495e;">Daily Internet Usage: <strong>${d.male.toFixed(1)}%</strong></div>
            <div style="font-size: 13px; font-weight: 600; color: #3498db;">Male</div>
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

        tooltip.style("opacity", 0).style("display", "none");
      });

    // Female bars (right side)
    chart
      .selectAll(".female-bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "female-bar")
      .attr("x", width / 2)
      .attr("y", d => yScale(d.ageGroup))
      .attr("width", d => xScale(d.female))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#e74c3c")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("stroke", "#333");

        tooltip
          .style("opacity", 1)
          .style("display", "block")
          .html(`
            <div style="margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #2c3e50;">Age Group: ${d.ageGroup}</div>
            <div style="margin-bottom: 6px; font-size: 12px; color: #7f8c8d;">Gender: Female</div>
            <div style="margin-bottom: 6px; font-size: 12px; color: #34495e;">Daily Internet Usage: <strong>${d.female.toFixed(1)}%</strong></div>
            <div style="font-size: 13px; font-weight: 600; color: #e74c3c;">Female</div>
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

        tooltip.style("opacity", 0).style("display", "none");
      });

    // Y-axis (age groups)
    chart
      .append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#fff");

    // X-axis for males (left side)
    const xAxisMale = d3.axisBottom(xScale)
      .tickFormat(d => `${d}%`)
      .tickValues(xScale.domain().filter((d, i) => i % 2 === 0));

    chart
      .append("g")
      .attr("transform", `translate(${width / 2},${height})`)
      .call(xAxisMale)
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#fff");

    // X-axis for females (right side)
    const xAxisFemale = d3.axisBottom(xScale)
      .tickFormat(d => `${d}%`)
      .tickValues(xScale.domain().filter((d, i) => i % 2 === 0));

    chart
      .append("g")
      .attr("transform", `translate(${width / 2},${height})`)
      .call(xAxisFemale)
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#fff");

    // Center line
    chart
      .append("line")
      .attr("x1", width / 2)
      .attr("x2", width / 2)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Title
    svg
      .append("text")
      .attr("x", containerWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "600")
      .style("fill", "#fff")
      .text('Daily Internet Usage by Gender and Age Group (European Countries, 2024)');

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 40}, ${margin.top})`);

    // Male legend
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

    // Female legend
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
      tooltip.remove();
    };
  }, [data]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px" }}>Loading population pyramid...</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ textAlign: "center", padding: "20px" }}>No data available</div>;
  }

  return (
    <div className="chart-container" ref={containerRef} style={{ width: "100%", height: "700px", paddingTop: "20px" }}>
      {countries.length > 0 && (
        <div className="country-selector" style={{ marginBottom: "15px", textAlign: "center" }}>
          <label htmlFor="countrySelect" style={{ 
            fontWeight: "600", 
            marginRight: "15px",
            color: "#e5e7eb"
          }}>
            Select Country:
          </label>
          <select
            id="countrySelect"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
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
            {countries.map((country) => (
              <option key={country} value={country} style={{
                backgroundColor: "#1f2937",
                color: "#e5e7eb"
              }}>
                {country}
              </option>
            ))}
          </select>
        </div>
      )}
      <svg ref={svgRef} />
    </div>
  );
};

export { PopulationPyramid }; 