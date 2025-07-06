const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel files
const files = ['tin00096.xlsx', 'tin00111.xlsx', 'tin00110.xlsx'];

files.forEach(filename => {
  console.log(`\n=== ${filename} ===`);
  
  try {
    const workbook = XLSX.readFile(`./public/assets/${filename}`);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Headers:', jsonData[0]);
    console.log('First few rows:');
    jsonData.slice(1, 4).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });
    
    // Find years in headers
    const headers = jsonData[0];
    const years = headers.filter(h => h && !isNaN(h) && h >= 2020 && h <= 2024);
    console.log('Available years (2020-2024):', years);
    
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
  }
}); 