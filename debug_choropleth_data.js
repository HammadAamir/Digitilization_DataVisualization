const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('./public/assets/tin00134_page_spreadsheet.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('=== CHOROPLETH MAP DATA ANALYSIS ===\n');

// Extract headers and years
const header = data[0];
const yearIndices = [];
const availableYears = [];

for (let i = 1; i < header.length; i++) {
  const cell = header[i];
  const year = parseInt(cell);
  if (!isNaN(year)) {
    yearIndices.push(i);
    availableYears.push(year.toString());
  }
}

console.log('Available Years:', availableYears);
console.log('Number of years:', availableYears.length);

// Analyze data by country
const countryData = {};
const allValues = [];

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const countryName = row[0]?.toString().trim();
  
  if (!countryData[countryName]) {
    countryData[countryName] = {};
  }
  
  for (let j = 0; j < yearIndices.length; j++) {
    const colIndex = yearIndices[j];
    const year = availableYears[j];
    const value = parseFloat(row[colIndex]);
    
    if (!isNaN(value)) {
      countryData[countryName][year] = value;
      allValues.push(value);
    }
  }
}

console.log('\n=== DATA INSIGHTS ===');

// Calculate statistics
const sortedValues = allValues.sort((a, b) => a - b);
const minValue = Math.min(...allValues);
const maxValue = Math.max(...allValues);
const avgValue = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;

console.log(`Data Range: ${minValue.toFixed(1)}% - ${maxValue.toFixed(1)}%`);
console.log(`Average Value: ${avgValue.toFixed(1)}%`);
console.log(`Total Countries: ${Object.keys(countryData).length}`);

// Find top and bottom performers
const latestYear = availableYears[availableYears.length - 1];
const countryPerformance = [];

Object.keys(countryData).forEach(country => {
  const value = countryData[country][latestYear];
  if (!isNaN(value)) {
    countryPerformance.push({ country, value });
  }
});

countryPerformance.sort((a, b) => b.value - a.value);

console.log(`\n=== ${latestYear} PERFORMANCE ===`);
console.log('Top 5 Countries:');
countryPerformance.slice(0, 5).forEach((item, index) => {
  console.log(`${index + 1}. ${item.country}: ${item.value.toFixed(1)}%`);
});

console.log('\nBottom 5 Countries:');
countryPerformance.slice(-5).reverse().forEach((item, index) => {
  console.log(`${index + 1}. ${item.country}: ${item.value.toFixed(1)}%`);
});

// Analyze trends over time
console.log('\n=== TREND ANALYSIS ===');
const firstYear = availableYears[0];
const lastYear = availableYears[availableYears.length - 1];

const countriesWithTrends = [];
Object.keys(countryData).forEach(country => {
  const firstValue = countryData[country][firstYear];
  const lastValue = countryData[country][lastYear];
  
  if (!isNaN(firstValue) && !isNaN(lastValue)) {
    const change = lastValue - firstValue;
    countriesWithTrends.push({ country, change, firstValue, lastValue });
  }
});

countriesWithTrends.sort((a, b) => b.change - a.change);

console.log(`\nBiggest Improvements (${firstYear} to ${lastYear}):`);
countriesWithTrends.slice(0, 5).forEach((item, index) => {
  console.log(`${index + 1}. ${item.country}: +${item.change.toFixed(1)}% (${item.firstValue.toFixed(1)}% → ${item.lastValue.toFixed(1)}%)`);
});

console.log('\nBiggest Declines:');
countriesWithTrends.slice(-5).reverse().forEach((item, index) => {
  console.log(`${index + 1}. ${item.country}: ${item.change.toFixed(1)}% (${item.firstValue.toFixed(1)}% → ${item.lastValue.toFixed(1)}%)`);
});

// Geographic patterns
console.log('\n=== GEOGRAPHIC PATTERNS ===');
const regions = {
  'Northern Europe': ['Denmark', 'Finland', 'Iceland', 'Norway', 'Sweden'],
  'Western Europe': ['Austria', 'Belgium', 'France', 'Germany', 'Luxembourg', 'Netherlands', 'Switzerland'],
  'Southern Europe': ['Cyprus', 'Greece', 'Italy', 'Malta', 'Portugal', 'Spain'],
  'Eastern Europe': ['Bulgaria', 'Croatia', 'Czech Republic', 'Estonia', 'Hungary', 'Latvia', 'Lithuania', 'Poland', 'Romania', 'Slovakia', 'Slovenia']
};

Object.keys(regions).forEach(region => {
  const regionCountries = regions[region];
  const regionValues = [];
  
  regionCountries.forEach(country => {
    if (countryData[country] && countryData[country][lastYear]) {
      regionValues.push(countryData[country][lastYear]);
    }
  });
  
  if (regionValues.length > 0) {
    const avgRegionValue = regionValues.reduce((sum, val) => sum + val, 0) / regionValues.length;
    console.log(`${region}: ${avgRegionValue.toFixed(1)}% (${regionValues.length} countries)`);
  }
});

console.log('\n=== CHART FEATURES ===');
console.log('• Interactive choropleth map of European countries');
console.log('• Color-coded by internet access percentage (50-100% range)');
console.log('• Blue color scale: darker = higher access rates');
console.log('• Hover tooltips show country name, year, and exact percentage');
console.log('• Year selector dropdown for temporal analysis');
console.log('• Responsive design with dynamic sizing');
console.log('• Legend shows color scale with percentage values');
console.log('• Country name corrections for map compatibility');

console.log('\n=== DATA SOURCE ===');
console.log('• Eurostat dataset: tin00134_page_spreadsheet.xlsx');
console.log('• Metric: Internet access percentage by country and year');
console.log('• Coverage: European Union countries');
console.log('• Time period: Multiple years (dynamic based on data)'); 