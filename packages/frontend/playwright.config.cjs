// CommonJS Playwright config (used because package.json sets "type": "module")
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './playwright',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:5174',
    actionTimeout: 10000,
  },
};
