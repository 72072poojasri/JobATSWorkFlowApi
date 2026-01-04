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
        'Content-Length': Buffer.byteLength(data),
        'Connection': 'close'
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

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        data: { error: err.message }
      });
    });
    
    if (data) req.write(data);
    req.end();
  });
}

async function quickTest() {
  console.log('\n✓ Starting quick STEP 3-5 test\n');

  try {
    // Health check
    const health = await makeRequest('GET', '/health', null);
    console.log('Health:', health.statusCode === 200 ? '✅' : '❌');
    if (health.statusCode !== 200) {
      console.log('Server not responding. Aborting.');
      process.exit(1);
    }

    // Create company
    const comp = await makeRequest('POST', '/companies', null, { name: 'Test Co' });
    const companyId = comp.data.id;
    console.log(`Company created: ${companyId}\n`);

    // Register recruiter
    const rec = await makeRequest('POST', '/auth/register', null, {
      name: 'Recruiter',
      email: `rec-${Date.now()}@test.com`,
      password: 'Pass123',
      role: 'RECRUITER',
      companyId: companyId
    });
    const recToken = rec.data.token;
    console.log('Recruiter registered\n');

    // Register candidate
    const cand = await makeRequest('POST', '/auth/register', null, {
      name: 'Candidate',
      email: `cand-${Date.now()}@test.com`,
      password: 'Pass123',
      role: 'CANDIDATE',
      companyId: companyId
    });
    const candToken = cand.data.token;
    console.log('Candidate registered\n');

    // Create job
    const job = await makeRequest('POST', '/jobs', recToken, {
      title: 'Test Job',
      description: 'Test',
      companyId: companyId
    });
    const jobId = job.data.id;
    console.log(`✓ Job created: ${jobId} (Status: ${job.statusCode})\n`);

    // Get all jobs
    const allJobs = await makeRequest('GET', '/jobs', null);
    console.log(`✓ Get all jobs: ${allJobs.statusCode} - Found ${allJobs.data.length} jobs\n`);

    // Apply for job
    const app = await makeRequest('POST', '/applications/submit', candToken, {
      jobId: jobId,
      resume: 'http://example.com/resume.pdf',
      coverLetter: 'I am interested'
    });
    console.log(`Application submit: ${app.statusCode}`);
    if (app.statusCode !== 201 && app.statusCode !== 200) {
      console.log('Error:', app.data);
    } else {
      const appId = app.data.id || app.data.applicationId;
      console.log(`✓ Application created: ${appId}\n`);

      // Update stage
      const stage = await makeRequest('PUT', `/applications/${appId}/stage`, recToken, {
        stage: 'SCREENING'
      });
      console.log(`Update stage: ${stage.statusCode}`);
      if (stage.statusCode !== 200) {
        console.log('Error:', stage.data);
      } else {
        console.log(`✓ Stage updated to: ${stage.data.stage}\n`);
      }
    }

    console.log('✓ All tests completed\n');
    process.exit(0);

  } catch (err) {
    console.error('Test error:', err.message);
    process.exit(1);
  }
}

quickTest();
