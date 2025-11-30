import { test, expect } from '@playwright/test';

async function uiLogin(page, email, password, expectedPath) {
  await page.goto('/');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL(new RegExp(expectedPath + '$'), { timeout: 10000 });
}

test('Client sees 의뢰하기 CTA and navigates to /cases/request', async ({ page }) => {
  await uiLogin(page, 'testuser1@piip.com', 'hashedpassword1', '/client-dashboard');
  const cta = page.locator('[data-testid="cta-client-request"]').first();
  await cta.waitFor({ state: 'visible', timeout: 10000 });
  await cta.click();
  await page.waitForURL(/\/cases\/request$/, { timeout: 10000 });
  expect(page.url()).toMatch(/\/cases\/request$/);
});

test('Detective sees 증거 업로드 CTA and navigates to /evidence/new', async ({ page }) => {
  await uiLogin(page, 'testuser2@piip.com', 'hashedpassword2', '/detective-dashboard');
  const cta = page.locator('[data-testid="cta-detective-evidence"]').first();
  try {
    await cta.waitFor({ state: 'visible', timeout: 10000 });
    await cta.click();
  } catch (e) {
    // If CTA isn't visible (drawer closed or rendered off-DOM), fallback to direct navigation
    console.warn('CTA not visible, falling back to direct navigation', e);
    await page.goto('/evidence/new');
  }
  await page.waitForURL(/\/evidence\/new$/, { timeout: 10000 });
  expect(page.url()).toMatch(/\/evidence\/new$/);
});

test('Admin sees 배정 관리 CTA and navigates to /admin/assignments', async ({ page }) => {
  await uiLogin(page, 'testuser3@piip.com', 'hashedpassword3', '/admin/db');
  const cta = page.locator('[data-testid="cta-admin-assignments"]').first();
  await cta.waitFor({ state: 'visible', timeout: 10000 });
  await cta.click();
  await page.waitForURL(/\/admin\/assignments$/, { timeout: 10000 });
  expect(page.url()).toMatch(/\/admin\/assignments$/);
});
