// CommonJS Playwright config (used because package.json sets "type": "module")
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './playwright',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: process.env.APP_BASE || 'http://localhost:5173',
    actionTimeout: 10000,
  },
};
