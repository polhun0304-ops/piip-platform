const { test, expect } = require('@playwright/test');

test('debug secure chat and AI analysis tabs', async ({ page }) => {
  const API_BASE = process.env.API_BASE || 'http://localhost:5001';
  const APP_BASE = process.env.APP_BASE || 'http://localhost:5173';

  // capture console messages
  page.on('console', (msg) => {
    console.log(`[browser console] ${msg.type()} ${msg.text()}`);
  });

  // capture failed requests
  page.on('requestfailed', (req) => {
    console.log(`[request failed] ${req.method()} ${req.url()} -> ${req.failure()?.errorText}`);
  });

  // login via API to get token and set localStorage
  // Use a client test user so we land on client dashboard with cases
  const loginRes = await page.request.post(`${API_BASE}/api/auth/login`, {
    data: { email: 'testuser1@piip.com', password: 'hashedpassword1' },
  });
  if (loginRes.ok()) {
    const body = await loginRes.json();
    await page.addInitScript(
      (token, user) => {
        localStorage.setItem('piip_token', token);
        localStorage.setItem('piip_user', JSON.stringify(user));
        localStorage.setItem('piip_role', user.role);
      },
      body.token,
      body.user
    );
  } else {
    console.log('Login API failed', loginRes.status(), await loginRes.text());
  }

  // go to app
  await page.goto(APP_BASE, { waitUntil: 'networkidle' });

  // navigate to first case in list (click first CaseItem)
  const caseItem = page.locator('li[role="button"]').first();
  if ((await caseItem.count()) === 0) {
    console.log('No clickable case items found on page');
    return;
  }
  await caseItem.click();

  // Wait for CaseDetail page
  await page.waitForSelector('text=보안 채팅', { timeout: 5000 });

  // Click '보안 채팅' tab
  const tabChat = page.locator('role=tab[name="보안 채팅"]');
  if ((await tabChat.count()) > 0) {
    await tabChat.click();
    console.log('Clicked 보안 채팅 tab');
  } else {
    await page.click('text=보안 채팅').catch(() => {});
  }

  // Wait a bit for SecureChat to initialize
  await page.waitForTimeout(2000);

  // Click 'AI 분석' tab
  const tabAI = page.locator('role=tab[name="AI 분석"]');
  if ((await tabAI.count()) > 0) {
    await tabAI.click();
    console.log('Clicked AI 분석 tab');
  } else {
    await page.click('text=AI 분석').catch(() => {});
  }

  // Wait to capture any console errors
  await page.waitForTimeout(2000);
});
