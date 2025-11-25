import { test, expect } from '@playwright/test';

// Flow test template (WIP)
// These tests are intentionally skipped by default because backend
// endpoints and exact payloads may vary. Remove test.skip to enable.

async function uiLogin(page, email, password, expectedPath) {
  await page.goto('/');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL(new RegExp(expectedPath + '$'), { timeout: 10000 });
}

test('Full flow: client creates case -> admin assigns -> detective accepts', async ({
  page,
  request,
}) => {
  // 1) Client logs in via UI
  await uiLogin(page, 'testuser1@piip.com', 'hashedpassword1', '/client-dashboard');

  // 2) Create case via API (adjust payload to backend schema)
  // Playwright's request is separate from the browser context; extract token from localStorage
  const clientToken = await page.evaluate(() => localStorage.getItem('piip_token'));
  const createRes = await request.post('/api/cases', {
    headers: { Authorization: `Bearer ${clientToken}` },
    data: {
      title: 'E2E Test Case ' + Date.now(),
      description: '자동화 생성 테스트 케이스',
      priority: 'medium',
    },
  });
  if (!createRes.ok()) {
    const body = await createRes.text();
    console.error('Create case failed:', createRes.status(), body);
  }
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  console.log('Created case:', created);

  // 3) Admin logs in and assigns (this step will vary by API)
  await page.context().clearCookies();
  await uiLogin(page, 'testuser3@piip.com', 'hashedpassword3', '/admin/db');

  // Admin: simulate assign via API (attach admin token)
  const adminToken = await page.evaluate(() => localStorage.getItem('piip_token'));
  // Fetch detectives to find a real detectiveId (prefer testuser2)
  const detectivesRes = await request.get('/api/detectives', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const detectivesBody = await detectivesRes.json();
  const detectives = detectivesBody.data || detectivesBody;
  let targetDetective = detectives.find((d) => d.email === 'testuser2@piip.com');
  if (!targetDetective) targetDetective = detectives[0];
  const detectiveId = targetDetective?.id;

  const assignRes = await request.post(`/api/assignments/manual-assign`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { caseId: created.id, detectiveId },
  });
  if (!assignRes.ok()) {
    const body = await assignRes.text();
    console.error('Assign failed:', assignRes.status(), body);
  }
  // Log assign response body for debugging in CI/local runs
  try {
    const assignBody = await assignRes.json();
    console.log('Assign response:', assignRes.status(), assignBody);
  } catch (e) {
    console.log('Assign response status:', assignRes.status());
  }
  expect(assignRes.ok()).toBeTruthy();

  // Poll the case until the assignment appears on the case object (avoid UI race)
  const start = Date.now();
  let caseWithAssignment = null;
  while (Date.now() - start < 10000) {
    const caseRes = await request.get(`/api/cases/${created.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (caseRes.ok()) {
      const caseBody = await caseRes.json();
      const hasAssigned = (caseBody.assignments || []).some((a) => a.status === 'assigned');
      if (hasAssigned) {
        caseWithAssignment = caseBody;
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log('Case after assign (polled):', caseWithAssignment ? 'found' : 'not-found');
  // If the case endpoint did not show assignments, poll the assignments list directly
  let foundAssignmentGlobal = null;
  if (!caseWithAssignment) {
    const startA = Date.now();
    let foundAssignment = null;
    while (Date.now() - startA < 10000) {
      const listRes = await request.get(`/api/assignments?caseId=${created.id}&status=assigned`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (listRes.ok()) {
        const listBody = await listRes.json();
        if (Array.isArray(listBody) && listBody.length > 0) {
          foundAssignment = listBody[0];
          break;
        }
        // some endpoints return { data: [...] }
        if (listBody.data && Array.isArray(listBody.data) && listBody.data.length > 0) {
          foundAssignment = listBody.data[0];
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    foundAssignmentGlobal = foundAssignment;
    console.log('Assignment list after assign (polled):', foundAssignment ? 'found' : 'not-found');
  }

  // 4) Detective logs in and should see new assigned request, then accept via UI
  await page.context().clearCookies();
  await uiLogin(page, 'testuser2@piip.com', 'hashedpassword2', '/detective-dashboard');

  // Wait briefly for UI to render assigned requests
  // Debug: fetch detective visible cases to verify backend exposes the assignment
  const detectiveToken = await page.evaluate(() => localStorage.getItem('piip_token'));
  try {
    const myCasesRes = await request.get('/api/cases', {
      headers: { Authorization: `Bearer ${detectiveToken}` },
    });
    const myCasesBody = await myCasesRes.json();
    console.log('Detective /api/cases:', myCasesBody);
  } catch (e) {
    console.error('Failed to fetch detective cases for debug', e);
  }
  // Prefer performing accept via API for stability: use the found assignment id
  const assignmentId = foundAssignmentGlobal?.id || null;
  if (assignmentId) {
    const acceptRes = await request.post(`/api/assignments/${assignmentId}/accept`, {
      headers: { Authorization: `Bearer ${detectiveToken}` },
    });
    if (!acceptRes.ok()) {
      const body = await acceptRes.text();
      console.error('API accept failed:', acceptRes.status(), body);
    }
    expect(acceptRes.ok()).toBeTruthy();
  } else {
    // Fallback: try UI path (best-effort)
    const acceptButton = page.getByRole('button', { name: '수임 승낙' }).first();
    await acceptButton.waitFor({ state: 'visible', timeout: 15000 });
    await acceptButton.click();
    await page.getByLabel('수임 메모').fill('E2E 자동 수임 메모');
    await page.getByRole('button', { name: '수임 확정' }).click();
    const acceptResponse = await page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/cases/') && resp.url().includes('/accept') && resp.status() < 500,
      { timeout: 5000 }
    );
    expect(acceptResponse.ok()).toBeTruthy();
  }
});
