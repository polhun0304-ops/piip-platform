// simple node version check to fail fast with a clear message when running on unsupported Node
const pkg = require('../package.json');

const required = pkg.engines && pkg.engines.node;
if (!required) process.exit(0);

const current = process.version.replace(/^v/, '');
const major = parseInt(current.split('.')[0], 10);

// this repo expects Node >=20 <25
if (isNaN(major) || major < 20 || major >= 25) {
  console.error(`\nERROR: Unsupported Node.js version ${process.version}.`);
  console.error(`This package requires Node version ${required}.`);
  console.error(
    'Please switch to a compatible Node.js (for example using nvm or nvm-windows) and try again.'
  );
  process.exit(1);
}

process.exit(0);
