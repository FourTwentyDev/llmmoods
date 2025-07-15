// Load environment variables before starting Next.js
require('dotenv').config({ path: '.env' });

// Start Next.js production server
const { exec } = require('child_process');

const child = exec('npm start', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});

// Forward output to console
child.stdout.on('data', (data) => {
  console.log(data);
});

child.stderr.on('data', (data) => {
  console.error(data);
});