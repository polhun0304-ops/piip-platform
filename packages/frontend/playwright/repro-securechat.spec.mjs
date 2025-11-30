import { test } from '@playwright/test';

// Allow more time for this repro test (network + UI setup can be slow)
test.setTimeout(120000);

test('reproduce secure chat render', async ({ page, request }) => {
  // capture console/page errors
  page.on('console', (m) => console.log('BROWSER:', m.type(), m.text()));
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

  const CASE_ID = 'test-case-123';
  const APP_BASE = process.env.APP_BASE || 'http://localhost:5181';

  // Mock APIs used by SecureChat and CaseDetail
  await page.route('**/api/chat/*', async (route) => {
    const body = JSON.stringify([
      {
        id: 'm1',
        caseId: CASE_ID,
        senderId: 'u1',
        senderRole: 'client',
        message: '안녕하세요 테스트 메시지',
        timestamp: new Date().toISOString(),
        encrypted: false,
      },
    ]);
    try {
      await route.fulfill({ status: 200, contentType: 'application/json', body });
    } catch (e) {
      console.log('route.fulfill(chat) async fail:', e?.message || e);
    }
  });

  await page.route('**/api/e2ee/keys*', async (route) => {
    try {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ keys: [] }),
      });
    } catch (e) {
      console.log('route.fulfill(e2ee) async fail:', e?.message || e);
    }
  });

  await page.route('**/api/cases/*', async (route) => {
    const body = JSON.stringify({ id: CASE_ID, title: 'Test Case', description: 'repro' });
    try {
      await route.fulfill({ status: 200, contentType: 'application/json', body });
    } catch (e) {
      console.log('route.fulfill(cases) async fail:', e?.message || e);
    }
  });

  // Perform real login and inject token/user into localStorage before app loads
  const loginRes = await request.post(`${APP_BASE}/api/auth/login`, {
    data: { email: 'testuser2@piip.com', password: 'hashedpassword2' },
  });
  let loginJson = {};
  try {
    loginJson = await loginRes.json();
  } catch (e) {
    console.log('login json parse failed', e?.message || e);
  }
  const token = loginJson.token || loginJson?.data?.token || '';
  const user = loginJson.user ||
    loginJson?.data?.user || { id: 'u1', role: 'client', name: 'Test User' };

  await page.addInitScript(
    (t, u) => {
      try {
        localStorage.setItem('piip_token', t);
        localStorage.setItem('piip_user', JSON.stringify(u));
        localStorage.setItem('piip_role', u?.role || 'client');
      } catch (e) {
        // ignore
      }
    },
    token,
    user
  );

  console.log('Navigating to case detail', `${APP_BASE}/cases/${CASE_ID}`);
  await page.goto(`${APP_BASE}/cases/${CASE_ID}`, { waitUntil: 'networkidle', timeout: 10000 });

  // Wait for tabs and click '보안 채팅'
  await page.waitForSelector('[role="tablist"]', { timeout: 8000 });
  const tabs = page.locator('role=tab');
  if ((await tabs.count()) >= 3) {
    await tabs.nth(2).click();
    console.log('Clicked tab by index');
  } else {
    const t = page.locator('role=tab[name="보안 채팅"]');
    if ((await t.count()) > 0) {
      await t.click();
      console.log('Clicked tab by name');
    }
  }

  // wait to capture errors and for SecureChat to initialize
  await page.waitForTimeout(3000);

  // stop intercepting to avoid async fulfill attempts during teardown
  page.unroute('**/api/e2ee/keys*');
  page.unroute('**/api/chat/*');
  page.unroute('**/api/cases/*');

  // give a short moment for any in-flight fulfill handlers to settle
  await page.waitForTimeout(200);
});
