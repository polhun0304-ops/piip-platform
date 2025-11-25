// Playwright ESM config (package.json uses "type": "module")
/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: './playwright',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:5174',
    actionTimeout: 10000,
  },
};
