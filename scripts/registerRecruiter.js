require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Recruiter',
        lastName: 'One',
        email: 'recruiter1@test.com',
        password: 'Password@123',
        role: 'recruiter',
        companyId: 'f9268e43-2cd6-4780-a121-faa64345478d'
      })
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
    process.exit(0);
  } catch (err) {
    console.error('Register recruiter error:', err);
    process.exit(1);
  }
})();
