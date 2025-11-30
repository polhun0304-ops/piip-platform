// Playwright ESM config (package.json uses "type": "module")
/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: './playwright',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: process.env.APP_BASE || 'http://localhost:5173',
    actionTimeout: 10000,
  },
};
