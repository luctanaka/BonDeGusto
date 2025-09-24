const http = require('http');

async function testWeeklyAPI() {
  try {
    console.log('🔍 Testing weekly API endpoint...');
    
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5000/api/menu/weekly?weekOffset=0', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      req.on('error', reject);
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Response type:', typeof response.data);
    console.log('📊 Response keys:', Object.keys(response.data || {}));
    console.log('📊 Response structure:');
    
    if (response.data && typeof response.data === 'object') {
      for (const [day, items] of Object.entries(response.data)) {
        console.log(`  ${day}: ${Array.isArray(items) ? items.length : 'not array'} items`);
        if (Array.isArray(items) && items.length > 0) {
          console.log(`    First item: ${items[0].nome || 'no name'}`);
        }
      }
    }
    
    console.log('\n📋 Full response (first 500 chars):');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testWeeklyAPI();