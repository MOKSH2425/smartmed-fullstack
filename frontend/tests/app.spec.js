import { test, expect } from '@playwright/test';

const demoUser = {
  email: 'demo@smartmed.app',
  password: 'Demo@12345',
};

const login = async (page) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(demoUser.email);
  await page.locator('input[name="password"]').fill(demoUser.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/);
};

test('login and symptom checker flow works', async ({ page }) => {
  await login(page);

  await page.goto('/symptom');
  await page.locator('input[placeholder*="fever"]').fill('fever');
  await page.getByRole('button', { name: /get advice/i }).click();

  await expect(page.getByText(/recommendation/i)).toBeVisible();
  await expect(page.getByText(/paracetamol|dolo/i)).toBeVisible();
});

test('profile change persists after refresh', async ({ page }) => {
  await login(page);

  await page.goto('/profile');
  await page.getByRole('button', { name: /edit profile/i }).click();

  const phoneValue = `999${Date.now().toString().slice(-7)}`;
  const phoneInput = page.locator('input[name="phone"]');
  await phoneInput.fill(phoneValue);

  await page.getByRole('button', { name: /save changes/i }).click();
  await expect(page.getByText(/profile updated successfully/i)).toBeVisible();

  await page.reload();
  await expect(page.locator('input[name="phone"]')).toHaveValue(phoneValue);
  await page.reload();
  await expect(page.locator('input[name="phone"]')).toHaveValue(phoneValue);
});

test('doctor booking appears in appointment history', async ({ page }) => {
  await login(page);

  await page.goto('/doctors');
  await page.getByRole('button', { name: /book visit/i }).first().click();

  const dateInput = page.locator('input[type="date"]');
  const future = new Date(Date.now() + ((Date.now() % 50) + 40) * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  await dateInput.fill(future);

  await page.locator('button').filter({ hasText: '09:00 AM' }).first().click();
  await page.getByRole('button', { name: /^confirm$/i }).click();

  await expect(page).toHaveURL(/history/);
  await expect(page.getByText(future)).toBeVisible();
});
