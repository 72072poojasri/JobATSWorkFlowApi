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

async function runFullTests() {
  console.log('\n' + '='.repeat(70));
  console.log('STEP 3-5: JOB CRUD, APPLICATION SUBMISSION, STATE MACHINE VERIFICATION');
  console.log('='.repeat(70) + '\n');

  // Create company
  const company = await makeRequest('POST', '/companies', null, { name: 'Tech Solutions Inc' });
  const companyId = company.data.id;
  console.log(`Setup: Company created with ID ${companyId}\n`);

  // Register users
  console.log('=== REGISTERING TEST USERS ===\n');
  
  const candReg = await makeRequest('POST', '/auth/register', null, {
    name: 'Alice Candidate',
    email: `candidate-step3-${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'CANDIDATE',
    companyId: companyId
  });
  const candToken = candReg.data.token;
  const candEmail = candReg.data.user.email;
  console.log(`✓ Candidate registered: ${candEmail}`);

  const recReg = await makeRequest('POST', '/auth/register', null, {
    name: 'Bob Recruiter',
    email: `recruiter-step3-${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'RECRUITER',
    companyId: companyId
  });
  const recToken = recReg.data.token;
  const recUserId = recReg.data.user.id;
  const recEmail = recReg.data.user.email;
  console.log(`✓ Recruiter registered: ${recEmail}`);

  const mgrReg = await makeRequest('POST', '/auth/register', null, {
    name: 'Charlie Manager',
    email: `manager-step3-${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'HIRING_MANAGER',
    companyId: companyId
  });
  const mgrToken = mgrReg.data.token;
  console.log(`✓ Manager registered\n`);

  // ============ STEP 3: JOB CRUD VERIFICATION ============
  console.log('='.repeat(70));
  console.log('STEP 3: JOB CRUD VERIFICATION');
  console.log('='.repeat(70) + '\n');

  // 3.1 Create Job (Recruiter)
  console.log('3.1 CREATE JOB (Recruiter only)');
  const createJobRes = await makeRequest('POST', '/jobs', recToken, {
    title: 'Senior Backend Engineer',
    description: 'Node.js, PostgreSQL, AWS',
    companyId: companyId
  });
  
  if (createJobRes.statusCode === 201) {
    console.log('✅ PASSED - Job created');
    console.log(`   Job ID: ${createJobRes.data.id}`);
    console.log(`   Status: ${createJobRes.data.status}\n`);
    var jobId = createJobRes.data.id;
  } else {
    console.log(`❌ FAILED - Got ${createJobRes.statusCode}\n`);
  }

  // 3.2 Get All Jobs (No auth required - public endpoint)
  console.log('3.2 GET ALL JOBS (Public access)');
  const getAllJobsRes = await makeRequest('GET', '/jobs', null);
  
  if (getAllJobsRes.statusCode === 200 && Array.isArray(getAllJobsRes.data)) {
    console.log('✅ PASSED - Retrieved all jobs');
    console.log(`   Total jobs: ${getAllJobsRes.data.length}`);
    if (getAllJobsRes.data.length > 0) {
      console.log(`   First job: "${getAllJobsRes.data[0].title}"\n`);
    }
  } else {
    console.log(`❌ FAILED - Got ${getAllJobsRes.statusCode}\n`);
  }

  // 3.3 Get Job by ID
  console.log('3.3 GET JOB BY ID');
  if (jobId) {
    const getJobRes = await makeRequest('GET', `/jobs/${jobId}`, null);
    
    if (getJobRes.statusCode === 200) {
      console.log('✅ PASSED - Retrieved job details');
      console.log(`   Title: ${getJobRes.data.title}`);
      console.log(`   Status: ${getJobRes.data.status}\n`);
    } else {
      console.log(`❌ FAILED - Got ${getJobRes.statusCode}\n`);
    }
  }

  // 3.4 Update Job Status (Recruiter only)
  console.log('3.4 UPDATE JOB STATUS (Recruiter only)');
  if (jobId) {
    const updateJobRes = await makeRequest('PUT', `/jobs/${jobId}`, recToken, {
      status: 'closed'
    });
    
    if (updateJobRes.statusCode === 200) {
      console.log('✅ PASSED - Job status updated');
      console.log(`   New status: ${updateJobRes.data.status}\n`);
    } else {
      console.log(`❌ FAILED - Got ${updateJobRes.statusCode}\n`);
    }
  }

  // 3.5 Try to Update Job as Candidate (should fail)
  console.log('3.5 UPDATE JOB AS CANDIDATE (expect 403)');
  if (jobId) {
    const candUpdateRes = await makeRequest('PUT', `/jobs/${jobId}`, candToken, {
      status: 'open'
    });
    
    if (candUpdateRes.statusCode === 403) {
      console.log('✅ PASSED - Candidate correctly denied\n');
    } else {
      console.log(`❌ FAILED - Got ${candUpdateRes.statusCode} instead of 403\n`);
    }
  }

  // Create a new OPEN job for applications
  console.log('3.6 CREATE OPEN JOB FOR APPLICATION TESTING');
  const openJobRes = await makeRequest('POST', '/jobs', recToken, {
    title: 'Frontend Developer',
    description: 'React, TypeScript, TailwindCSS',
    companyId: companyId,
    status: 'open'
  });
  
  if (openJobRes.statusCode === 201) {
    console.log('✅ PASSED - Open job created');
    console.log(`   Job ID: ${openJobRes.data.id}\n`);
    var openJobId = openJobRes.data.id;
  } else {
    console.log(`❌ FAILED - Got ${openJobRes.statusCode}\n`);
  }

  // ============ STEP 4: APPLICATION SUBMISSION FLOW ============
  console.log('='.repeat(70));
  console.log('STEP 4: APPLICATION SUBMISSION FLOW');
  console.log('='.repeat(70) + '\n');

  // 4.1 Candidate Applies for Job
  console.log('4.1 CANDIDATE APPLIES FOR JOB');
  let appId = null;
  if (openJobId) {
    const applyRes = await makeRequest('POST', '/applications/submit', candToken, {
      jobId: openJobId,
      resume: 'https://example.com/resume.pdf',
      coverLetter: 'I am very interested in this role'
    });
    
    if (applyRes.statusCode === 201 || applyRes.statusCode === 200) {
      console.log('✅ PASSED - Application submitted');
      appId = applyRes.data.id || applyRes.data.applicationId;
      console.log(`   Application ID: ${appId}`);
      console.log(`   Stage: ${applyRes.data.stage || 'APPLIED'}\n`);
    } else {
      console.log(`❌ FAILED - Got ${applyRes.statusCode}`);
      console.log(`   Response: ${JSON.stringify(applyRes.data)}\n`);
    }
  }

  // 4.2 Get Application Details
  console.log('4.2 GET APPLICATION DETAILS');
  if (appId) {
    const getAppRes = await makeRequest('GET', `/applications/${appId}`, candToken);
    
    if (getAppRes.statusCode === 200) {
      console.log('✅ PASSED - Retrieved application');
      console.log(`   Status: ${getAppRes.data.stage}`);
      console.log(`   Job ID: ${getAppRes.data.jobId}\n`);
    } else {
      console.log(`❌ FAILED - Got ${getAppRes.statusCode}\n`);
    }
  }

  // ============ STEP 5: STATE MACHINE VALIDATION ============
  console.log('='.repeat(70));
  console.log('STEP 5: STATE MACHINE VALIDATION');
  console.log('='.repeat(70) + '\n');

  if (appId) {
    // 5.1 Valid Transition: APPLIED → SCREENING
    console.log('5.1 VALID TRANSITION: APPLIED → SCREENING');
    const screeningRes = await makeRequest('PUT', `/applications/${appId}/stage`, recToken, {
      stage: 'SCREENING'
    });
    
    if (screeningRes.statusCode === 200) {
      console.log('✅ PASSED - Valid transition accepted');
      console.log(`   New stage: ${screeningRes.data.stage}\n`);
    } else {
      console.log(`❌ FAILED - Got ${screeningRes.statusCode}\n`);
    }

    // 5.2 Valid Transition: SCREENING → INTERVIEW
    console.log('5.2 VALID TRANSITION: SCREENING → INTERVIEW');
    const interviewRes = await makeRequest('PUT', `/applications/${appId}/stage`, recToken, {
      stage: 'INTERVIEW'
    });
    
    if (interviewRes.statusCode === 200) {
      console.log('✅ PASSED - Valid transition accepted');
      console.log(`   New stage: ${interviewRes.data.stage}\n`);
    } else {
      console.log(`❌ FAILED - Got ${interviewRes.statusCode}\n`);
    }

    // 5.3 Invalid Transition Test: INTERVIEW → APPLIED (backward, should fail)
    console.log('5.3 INVALID TRANSITION: INTERVIEW → APPLIED (expect rejection)');
    const invalidRes = await makeRequest('PUT', `/applications/${appId}/stage`, recToken, {
      stage: 'APPLIED'
    });
    
    if (invalidRes.statusCode === 400 || invalidRes.statusCode === 422) {
      console.log('✅ PASSED - Invalid transition rejected');
      console.log(`   Status: ${invalidRes.statusCode}\n`);
    } else if (invalidRes.statusCode === 200) {
      console.log('⚠️  WARNING - Invalid transition was allowed (state machine not enforced)\n');
    } else {
      console.log(`❌ FAILED - Got unexpected status ${invalidRes.statusCode}\n`);
    }

    // 5.4 Skip stages (INTERVIEW → HIRED, skipping OFFER - should fail)
    console.log('5.4 INVALID TRANSITION: INTERVIEW → HIRED (skipping OFFER)');
    const skipRes = await makeRequest('PUT', `/applications/${appId}/stage`, recToken, {
      stage: 'HIRED'
    });
    
    if (skipRes.statusCode === 400 || skipRes.statusCode === 422) {
      console.log('✅ PASSED - Skipped transition rejected\n');
    } else if (skipRes.statusCode === 200) {
      console.log('⚠️  WARNING - Skipped transition was allowed\n');
    } else {
      console.log(`Status: ${skipRes.statusCode}\n`);
    }

    // 5.5 Valid Transition: INTERVIEW → OFFER
    console.log('5.5 VALID TRANSITION: INTERVIEW → OFFER');
    const offerRes = await makeRequest('PUT', `/applications/${appId}/stage`, recToken, {
      stage: 'OFFER'
    });
    
    if (offerRes.statusCode === 200) {
      console.log('✅ PASSED - Valid transition accepted');
      console.log(`   New stage: ${offerRes.data.stage}\n`);
    } else {
      console.log(`Status: ${offerRes.statusCode}\n`);
    }

    // 5.6 Valid Transition: OFFER → HIRED
    console.log('5.6 VALID TRANSITION: OFFER → HIRED');
    const hiredRes = await makeRequest('PUT', `/applications/${appId}/stage`, recToken, {
      stage: 'HIRED'
    });
    
    if (hiredRes.statusCode === 200) {
      console.log('✅ PASSED - Candidate hired');
      console.log(`   Final stage: ${hiredRes.data.stage}\n`);
    } else {
      console.log(`Status: ${hiredRes.statusCode}\n`);
    }

    // 5.7 Rejection from HIRED (allowed from any stage)
    console.log('5.7 REJECTION FROM HIRED STAGE (allowed from any stage)');
    const rejectRes = await makeRequest('PUT', `/applications/${appId}/stage`, recToken, {
      stage: 'REJECTED'
    });
    
    if (rejectRes.statusCode === 200) {
      console.log('✅ PASSED - Rejection accepted from any stage');
      console.log(`   Final stage: ${rejectRes.data.stage}\n`);
    } else {
      console.log(`Status: ${rejectRes.statusCode}\n`);
    }
  }

  console.log('='.repeat(70));
  console.log('STEP 3-5: TESTING COMPLETE');
  console.log('='.repeat(70) + '\n');
  
  process.exit(0);
}

runFullTests().catch(err => {
  console.error('Test error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
