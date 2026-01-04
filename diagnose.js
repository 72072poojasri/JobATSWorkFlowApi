const http = require('http');

console.log('Testing server connection...\n');

let attempts = 0;
const maxAttempts = 10;

function testConnection() {
  attempts++;
  console.log(`Attempt ${attempts}/${maxAttempts}...`);
  
  const req = http.get('http://localhost:3000/health', (res) => {
    console.log(`✓ Connected! Status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Response:', data);
      process.exit(0);
    });
  }).on('error', (err) => {
    if (attempts < maxAttempts) {
      setTimeout(testConnection, 1000);
    } else {
      console.error('✗ Cannot connect to server after', maxAttempts, 'attempts');
      process.exit(1);
    }
  });
}

testConnection();
