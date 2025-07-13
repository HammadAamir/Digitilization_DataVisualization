const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('./public/assets/sankey_activities.xlsx');

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('=== SANKEY DATA ANALYSIS ===\n');

// Extract activities from row 2 (skip empty columns)
const activitiesRow = data[1];
const activities = [];
for (let i = 2; i < activitiesRow.length; i += 2) {
  if (activitiesRow[i]) {
    activities.push(activitiesRow[i]);
  }
}

console.log('Activities found:');
activities.forEach((activity, index) => {
  console.log(`${index + 1}. ${activity}`);
});

console.log('\n=== AGE GROUP DATA ===');

// Extract age groups and their data
const ageGroups = [];
const ageData = [];

// Start from row 4 (after headers)
for (let rowIndex = 3; rowIndex < data.length; rowIndex++) {
  const row = data[rowIndex];
  if (row[1] && row[1].includes('Individuals')) {
    const ageGroup = row[1];
    ageGroups.push(ageGroup);
    
    const values = [];
    // Extract values from non-empty columns (every 2nd column starting from index 2)
    for (let colIndex = 2; colIndex < row.length; colIndex += 2) {
      values.push(row[colIndex] || 0);
    }
    ageData.push(values);
    
    console.log(`\n${ageGroup}:`);
    activities.forEach((activity, index) => {
      console.log(`  ${activity}: ${values[index]}%`);
    });
  }
}

console.log('\n=== SANKEY DATA STRUCTURE ===');
console.log('const sankeyData = {');
console.log('  nodes: [');
ageGroups.forEach(group => {
  console.log(`    { name: "${group}" },`);
});
activities.forEach(activity => {
  console.log(`    { name: "${activity}" },`);
});
console.log('  ],');
console.log('  links: [');

// Generate links
ageGroups.forEach((ageGroup, ageIndex) => {
  activities.forEach((activity, activityIndex) => {
    const value = ageData[ageIndex][activityIndex];
    console.log(`    { source: "${ageGroup}", target: "${activity}", value: ${value} },`);
  });
});

console.log('  ]');
console.log('};'); 