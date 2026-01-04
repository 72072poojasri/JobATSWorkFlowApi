const http = require('http');

function makeRequest(method, path, token, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function setupAndTest() {
  // Create company first
  const company = await makeRequest('POST', '/companies', null, { name: 'TestCorp RBAC' });
  const companyId = company.data.id;
  console.log(`\nSetup: Company created with ID ${companyId}`);

  // Register users with the same company
  console.log('\n=== STEP 1: REGISTERING TEST USERS ===\n');
  
  // Register candidate
  const candReg = await makeRequest('POST', '/auth/register', null, {
    name: 'Test Candidate',
    email: `candidate-rbac-${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'CANDIDATE',
    companyId: companyId
  });
  const candToken = (candReg && candReg.data && (candReg.data.data ? candReg.data.data.token : candReg.data.token)) || candReg.token;
  console.log(`✓ Candidate registered`);
  if (!candToken) console.log('ERROR: No token in response:', candReg.data);

  // Register recruiter
  const recReg = await makeRequest('POST', '/auth/register', null, {
    name: 'Test Recruiter',
    email: `recruiter-rbac-${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'RECRUITER',
    companyId: companyId
  });
  const recToken = (recReg && recReg.data && (recReg.data.data ? recReg.data.data.token : recReg.data.token)) || recReg.token;
  console.log(`✓ Recruiter registered`);
  if (!recToken) console.log('ERROR: No token in response:', recReg.data);

  // Register manager
  const mgrReg = await makeRequest('POST', '/auth/register', null, {
    name: 'Test Manager',
    email: `manager-rbac-${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'HIRING_MANAGER',
    companyId: companyId
  });
  const mgrToken = (mgrReg && mgrReg.data && (mgrReg.data.data ? mgrReg.data.data.token : mgrReg.data.token)) || mgrReg.token;
  console.log(`✓ Manager registered\n`);
  if (!mgrToken) console.log('ERROR: No token in response:', mgrReg.data);

  // Now run RBAC tests
  console.log('=== STEP 2: RBAC ENFORCEMENT TESTS ===\n');

  // Test 2.1: Candidate Create Job (expect 403)
  console.log('TEST 2.1: Candidate Create Job (expect 403)');
  const test21 = await makeRequest('POST', '/jobs', candToken, {
    title: 'Backend Developer',
    description: 'Node.js expertise',
    companyId: companyId
  });
  if (test21.statusCode === 403) {
    console.log('✅ PASSED - Got 403 Forbidden\n');
  } else {
    console.log(`❌ FAILED - Got ${test21.statusCode}`);
    console.log(`Response: ${JSON.stringify(test21.data)}\n`);
  }

  // Test 2.2: Recruiter Create Job (expect 201)
  console.log('TEST 2.2: Recruiter Create Job (expect 201)');
  const test22 = await makeRequest('POST', '/jobs', recToken, {
    title: 'Backend Developer',
    description: 'Node.js + PostgreSQL',
    companyId: companyId
  });
  
  if (test22.statusCode === 201) {
    console.log('✅ PASSED - Job created');
    console.log(`Job ID: ${test22.data.id}\n`);
    var jobId = test22.data.id;
  } else {
    console.log(`❌ FAILED - Got ${test22.statusCode}`);
    console.log(`Response: ${JSON.stringify(test22.data)}\n`);
  }

  // Test 2.3: Manager Delete Job (expect 403)
  if (jobId) {
    console.log('TEST 2.3: Hiring Manager Delete Job (expect 403)');
    const test23 = await makeRequest('DELETE', `/jobs/${jobId}`, mgrToken);
    if (test23.statusCode === 403) {
      console.log('✅ PASSED - Got 403 Forbidden\n');
    } else {
      console.log(`❌ FAILED - Got ${test23.statusCode}`);
      console.log(`Response: ${JSON.stringify(test23.data)}\n`);
    }
  }

  console.log('=== RBAC TESTING COMPLETE ===\n');
  process.exit(0);
}

setupAndTest().catch(err => {
  console.error('Test error:', err.message);
  process.exit(1);
});
