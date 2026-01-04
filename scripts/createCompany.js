require('dotenv').config();
const { Company } = require('../src/models');

(async () => {
  try {
    const company = await Company.create({ name: 'TechCorp Pvt Ltd' });
    console.log('Created company:', company.id, company.name);
    process.exit(0);
  } catch (err) {
    console.error('Create company error:', err);
    process.exit(1);
  }
})();
