const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('./public/assets/internet_population.xlsx');
  
  console.log('=== Debugging Country Extraction ===\n');
  console.log('Sheet names:', workbook.SheetNames);
  
  // Check the actual data sheets (Sheet 1 onwards)
  for (let i = 2; i < Math.min(5, workbook.SheetNames.length); i++) {
    const sheetName = workbook.SheetNames[i];
    console.log(`\n--- Checking ${sheetName} ---`);
    
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`Total rows in ${sheetName}: ${jsonData.length}`);
    console.log('\nFirst 15 rows:');
    jsonData.slice(0, 15).forEach((row, idx) => {
      console.log(`Row ${idx}:`, row);
    });
    
    console.log('\n=== Looking for countries in this sheet ===');
    const countries = new Set();
    
    // Find all rows that contain country names (skip header rows)
    for (let i = 10; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row[0] && typeof row[0] === 'string' && row[0].trim() !== '') {
        countries.add(row[0].trim());
        console.log(`Found country: "${row[0].trim()}"`);
      }
    }
    
    const countryList = Array.from(countries).sort();
    console.log(`\nCountries found in ${sheetName}:`, countryList.length);
    countryList.forEach((country, i) => {
      console.log(`${i + 1}. ${country}`);
    });
  }
  
} catch (error) {
  console.error('Error reading file:', error);
} 