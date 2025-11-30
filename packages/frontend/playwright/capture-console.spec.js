import { test } from '@playwright/test';

test('capture browser console and page errors', async ({ page }) => {
  page.on('console', (msg) => {
    // Print browser console messages with type
    console.log(`BROWSER-CONSOLE [${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    console.log(`PAGE-ERROR ${err.message}`);
  });

  // Navigate to local dev server
  const url = process.env.URL || 'http://localhost:5181';
  console.log('Navigating to', url);
  await page
    .goto(url, { waitUntil: 'load', timeout: 10000 })
    .catch((e) => console.log('GOTO-ERR', e.message));

  // Wait a bit to capture async logs
  await page.waitForTimeout(3000);
});
