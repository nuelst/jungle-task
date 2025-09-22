import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(page.locator('text=Jungle Tasks')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email address')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL('/login');
  });

  test('should show validation error for short password in register mode', async ({ page }) => {
    await page.click('text=Don\'t have an account? Sign up');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Password must be at least 8 characters long')).toBeVisible();
  });

  test('should show validation error for password without uppercase in register mode', async ({ page }) => {
    await page.click('text=Don\'t have an account? Sign up');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Password must contain at least one uppercase letter, one lowercase letter, and one number')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      });
    });

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 10000 });
  });

  test('should redirect to dashboard after successful admin login', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'admin@example.com',
            username: 'admin',
            role: 'ADMIN',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        })
      });
    });

    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should redirect to tasks page for non-admin users', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '2',
            email: 'user@example.com',
            username: 'user',
            role: 'USER',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        })
      });
    });

    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/tasks');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/tasks');

    await expect(page).toHaveURL('/login');
  });
});
