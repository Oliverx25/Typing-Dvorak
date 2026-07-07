import { test, expect } from '@playwright/test';

test('home page loads with lessons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(/Lessons|Lecciones/)).toBeVisible();
});

test('can open home row lesson', async ({ page }) => {
  await page.goto('/lesson/base_vowels');
  await expect(page.getByRole('textbox')).toBeVisible();
});
