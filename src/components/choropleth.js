import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as XLSX from "xlsx";
import "./choropleth.css";

function ChoroplethMap() {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.8,
    height: window.innerHeight * 0.8,
  });

  const [dataMap, setDataMap] = useState({});
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2024");

  const countryNameCorrections = {
    "Czech Republic": "Czechia",
    Turkey: "Türkiye",
    "The former Yugoslav Republic of Macedonia": "North Macedonia",
  };

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.5,
      });
    };

    window.addEventListener("resize", handleResize);

    loadData().then(({ data, availableYears }) => {
      setDataMap(data);
      setYears(availableYears);
      if (!availableYears.includes(selectedYear)) {
        setSelectedYear(availableYears[availableYears.length - 1]);
      }
    });

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (Object.keys(dataMap).length > 0) {
      createChoroplethMap();
    }
  }, [dataMap, dimensions, selectedYear]);

  const loadData = async () => {
    const response = await fetch("/assets/tin00134_page_spreadsheet.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
    const header = jsonData[0];
  
    // Extract only valid years (filter out empty or non-numeric headers)
    const yearIndices = [];
    const availableYears = [];
  
    for (let i = 1; i < header.length; i++) {
      const cell = header[i];
      const year = parseInt(cell);
      if (!isNaN(year)) {
        yearIndices.push(i); // keep index to use for row access
        availableYears.push(year.toString());
      }
    }
  
    const data = {};
  
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rawName = row[0]?.toString().trim();
      const correctedName = countryNameCorrections[rawName] || rawName;
  
      if (!data[correctedName]) data[correctedName] = {};
  
      for (let j = 0; j < yearIndices.length; j++) {
        const colIndex = yearIndices[j];
        const year = availableYears[j];
        const value = parseFloat(row[colIndex]);
  
        if (!isNaN(value)) {
          data[correctedName][year] = value;
        }
      }
    }
  
    return { data, availableYears };
  };

  const createChoroplethMap = () => {
    const container = chartRef.current;
    d3.select(container).selectAll("*").remove();

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .style("margin-top", "20px");

    d3.json("/assets/europe.geojson").then((geoData) => {
      const projection = d3.geoMercator();
      const path = d3.geoPath().projection(projection);

      const bounds = d3.geoBounds(geoData);
      const center = d3.geoCentroid(geoData);
      const [[minLon, minLat], [maxLon, maxLat]] = bounds;

      const mapWidth = maxLon - minLon;
      const mapHeight = maxLat - minLat;
      const scale =
        Math.min(dimensions.width / mapWidth, dimensions.height / mapHeight) * 30;

      projection
        .scale(scale)
        .center(center)
        .translate([dimensions.width / 2 - 30, dimensions.height / 2 + 30]); // Top padding

      const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([50, 100]);

      const tooltip = d3
        .select(container)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("padding", "0.75rem")
        .style("border", "2px solid #4a90e2")
        .style("border-radius", "0.5rem")
        .style("box-shadow", "0 4px 8px rgba(0, 0, 0, 0.3)")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("min-width", "120px")
        .style("text-align", "center");

      geoData.features.forEach((feature) => {
        const rawName = feature.properties.NAME;
        const corrected = countryNameCorrections[rawName] || rawName;
        const yearData = dataMap[corrected];
        console.log(selectedYear)

        feature.properties.percentage = yearData ? yearData[selectedYear] : NaN;
      });

      svg
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", (d) =>
          isNaN(d.properties.percentage)
            ? "#ccc"
            : colorScale(d.properties.percentage)
        )
        .attr("stroke", "#ffffff")
        .on("mouseover", (event, d) => {
          d3.select(event.target).attr("stroke-width", 3).attr("stroke", "#4a90e2");
          const rect = container.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          tooltip
            .style("opacity", 1)
            .html(
              `<div style="margin-bottom: 5px;">${d.properties.NAME}</div>` +
              `<div style="font-size: 12px; opacity: 0.8;">Year: ${selectedYear}</div>` +
                (isNaN(d.properties.percentage)
                ? `<div style="color: #ff6b6b;">No Data Available</div>`
                : `<div style="color: #4a90e2;">Access: ${d.properties.percentage.toFixed(1)}%</div>`)
            )
            .style("left", Math.min(x + 15, rect.width - 180) + "px")
            .style("top", Math.min(y - 30, rect.height - 120) + "px");
        })
        .on("mousemove", (event) => {
          const rect = container.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          tooltip
            .style("left", Math.min(x + 15, rect.width - 180) + "px")
            .style("top", Math.min(y - 30, rect.height - 120) + "px");
        })
        .on("mouseout", (event) => {
          d3.select(event.target).attr("stroke-width", 1).attr("stroke", "#ffffff");
          tooltip.style("opacity", 0);
        });

      // Legend
      const legendWidth = 20;
      const legendHeight = dimensions.height * 0.3;
      const legendPadding = 20;
      const legendX = dimensions.width > 600 ? dimensions.width - 100 : legendPadding;
      const legendY = 200;

      const legendScale = d3.scaleLinear().domain([50, 100]).range([legendHeight, 0]);
      const legendAxis = d3.axisRight(legendScale).ticks(5);

      const legend = svg.append("g").attr("transform", `translate(${legendX}, ${legendY})`);

      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "color-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

      gradient
        .selectAll("stop")
        .data(d3.range(0, 1.01, 0.1))
        .enter()
        .append("stop")
        .attr("offset", (d) => `${d * 100}%`)
        .attr("stop-color", (d) => colorScale(50 + d * 50));

      legend
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#color-gradient)");

      legend
        .append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis);
    });
  };

  return (
    <div>
      <div className="dropdown-container" style={{ marginBottom: "1rem", textAlign: "center" }}>
        <label htmlFor="yearSelect">Select Year: </label>
        <select
          id="yearSelect"
          value={selectedYear}
          style={{ color: "white"}}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div ref={chartRef} className="relative w-full h-full bg-[#211e1e] rounded-lg shadow-lg overflow-hidden" 
      
  style={{ width: dimensions.width, height: dimensions.height }} />
    </div>
  );
}

export { ChoroplethMap };
