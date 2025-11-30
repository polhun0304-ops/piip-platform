import { test, expect } from '@playwright/test';

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
  const loginRes = await page.request.post(`${API_BASE}/api/auth/login`, {
    data: { email: 'testuser1@piip.com', password: 'hashedpassword1' },
  });
  let firstCaseId = null;
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
    // Ensure there's at least one case for the user to click on. If none, create one.
    try {
      const authHeaders = { Authorization: `Bearer ${body.token}` };
      const casesRes = await page.request.get(`${API_BASE}/api/cases`, { headers: authHeaders });
      if (casesRes.ok()) {
        const cases = await casesRes.json();
        if (!Array.isArray(cases) || cases.length === 0) {
          console.log('No cases found for user; creating a test case.');
          const createRes = await page.request.post(`${API_BASE}/api/cases`, {
            headers: authHeaders,
            data: {
              title: 'E2E Test Case - SecureChat',
              description: 'Automatically created by Playwright for E2E flows',
            },
          });
          if (!createRes.ok()) {
            console.log('Failed to create test case', createRes.status(), await createRes.text());
          } else {
            const created = await createRes.json();
            firstCaseId = created.id || (created._id ? created._id : null);
          }
        } else {
          firstCaseId = cases[0]?.id || cases[0]?._id || null;
        }
      } else {
        console.log('Failed to fetch cases for user', casesRes.status(), await casesRes.text());
      }
    } catch (e) {
      console.log('Error while ensuring test case exists', e);
    }
  } else {
    console.log('Login API failed', loginRes.status(), await loginRes.text());
  }

  // Navigate directly to a case detail if we know the id, otherwise open dashboard and try to click
  if (firstCaseId) {
    await page.goto(`${APP_BASE}/cases/${firstCaseId}`, { waitUntil: 'networkidle' });
  } else {
    await page.goto(`${APP_BASE}/client-dashboard`, { waitUntil: 'networkidle' });
    // Prefer aria-label on case items: `사건 ${title} 보기` (provided by CaseItem component)
    await page.waitForSelector('[aria-label^="사건"]', { timeout: 8000 }).catch(() => {});

    // Try role=button with name (accessible name) first, then aria-label prefix, then generic list item
    let clicked = false;
    const byRoleName = page.locator('role=button[name^="사건"]').first();
    if ((await byRoleName.count()) > 0) {
      await byRoleName.click();
      clicked = true;
      console.log('Clicked case item by role+name');
    }

    if (!clicked) {
      const byAria = page.locator('[aria-label^="사건"]').first();
      if ((await byAria.count()) > 0) {
        await byAria.click();
        clicked = true;
        console.log('Clicked case item by aria-label prefix');
      }
    }

    if (!clicked) {
      // fallback to any clickable list item
      const generic = page.locator('li[role="button"]').first();
      if ((await generic.count()) === 0) {
        console.log('No clickable case items found on page');
        return;
      }
      await generic.click();
      console.log('Clicked case item by generic selector');
    }
  }

  // Wait for CaseDetail tabs to render
  await page.waitForSelector('[role="tablist"]', { timeout: 8000 }).catch(() => {});

  // Click '보안 채팅' tab by index (third tab) as a fallback when text selectors fail
  const tabs = page.locator('role=tab');
  if ((await tabs.count()) >= 3) {
    await tabs.nth(2).click();
    console.log('Clicked 보안 채팅 tab (by index)');
  } else {
    const tabChat = page.locator('role=tab[name="보안 채팅"]');
    if ((await tabChat.count()) > 0) {
      await tabChat.click();
      console.log('Clicked 보안 채팅 tab');
    }
  }

  // Wait a bit for SecureChat to initialize
  await page.waitForTimeout(2000);

  // Click 'AI 분석' tab
  // Click 'AI 분석' tab (fourth tab)
  if ((await tabs.count()) >= 4) {
    await tabs.nth(3).click();
    console.log('Clicked AI 분석 tab (by index)');
  } else {
    const tabAI = page.locator('role=tab[name="AI 분석"]');
    if ((await tabAI.count()) > 0) {
      await tabAI.click();
      console.log('Clicked AI 분석 tab');
    }
  }

  // Wait to capture any console errors
  await page.waitForTimeout(2000);
});
