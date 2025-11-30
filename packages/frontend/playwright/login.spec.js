import { test, expect } from '@playwright/test';

// Helper to perform UI login and assert redirect and localStorage
async function uiLoginAndCheck(page, email, password, expectedPath) {
  await page.goto('/');
  // Fill by label text (Korean labels)
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();

  // Wait for navigation to expected path
  await page.waitForURL(new RegExp(expectedPath + '$'), { timeout: 10000 });

  // Check localStorage token and role
  const token = await page.evaluate(() => localStorage.getItem('piip_token'));
  const role = await page.evaluate(() => localStorage.getItem('piip_role'));
  expect(token).toBeTruthy();
  expect(role).toBeTruthy();
}

test('testuser1 (client) logs in and is redirected to /client-dashboard', async ({ page }) => {
  await uiLoginAndCheck(page, 'testuser1@piip.com', 'hashedpassword1', '/client-dashboard');
});

test('testuser2 (detective) logs in and is redirected to /detective-dashboard', async ({
  page,
}) => {
  await uiLoginAndCheck(page, 'testuser2@piip.com', 'hashedpassword2', '/detective-dashboard');
});

test('testuser3 (admin) logs in and is redirected to /admin/db', async ({ page }) => {
  await uiLoginAndCheck(page, 'testuser3@piip.com', 'hashedpassword3', '/admin/db');
});
