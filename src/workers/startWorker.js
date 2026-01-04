require('dotenv').config();
require('./emailWorker');

console.log('========================================');
console.log('Email Worker Started');
console.log('========================================');
console.log('Listening for email jobs in queue...');
console.log('Press Ctrl+C to stop');
console.log('========================================\n');

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('\nWorker shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nWorker shutting down gracefully...');
  process.exit(0);
});
