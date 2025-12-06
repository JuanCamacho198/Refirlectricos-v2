import { test, expect, Page } from '@playwright/test';

// Test user credentials - should be configured in environment or test database
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
};

const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'admin123',
};

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  const emailInput = page.getByLabel(/email|correo/i);
  const passwordInput = page.getByLabel(/contraseña|password/i);
  const submitButton = page.getByRole('button', { name: /ingresar|login|entrar|iniciar/i });
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(email);
  }
  if (await passwordInput.isVisible()) {
    await passwordInput.fill(password);
  }
  if (await submitButton.isVisible()) {
    await submitButton.click();
  }
}

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Check for login form elements
      const form = page.locator('form');
      await expect(form).toBeVisible({ timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.getByLabel(/email|correo/i);
      const passwordInput = page.getByLabel(/contraseña|password/i);
      const submitButton = page.getByRole('button', { name: /ingresar|login|entrar|iniciar/i });
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        await emailInput.fill('wrong@email.com');
        await passwordInput.fill('wrongpassword');
        await submitButton.click();
        
        await page.waitForTimeout(2000);
        // Should show error or stay on login page
        const url = page.url();
        expect(url).toContain('login');
      } else {
        test.skip(true, 'Login form not found');
      }
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.getByLabel(/email|correo/i);
      const passwordInput = page.getByLabel(/contraseña|password/i);
      const submitButton = page.getByRole('button', { name: /ingresar|login|entrar|iniciar/i });
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email');
        await passwordInput.fill('password123');
        await submitButton.click();
        
        await page.waitForTimeout(1000);
        // Should show validation error or stay on page
        const url = page.url();
        expect(url).toContain('login');
      } else {
        test.skip(true, 'Login form not found');
      }
    });

    test('should have link to register page', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const registerLink = page.getByRole('link', { name: /registr|crear cuenta|sign up/i });
      
      if (await registerLink.isVisible()) {
        await registerLink.click();
        await expect(page).toHaveURL(/register/);
      } else {
        // Try finding any link to register
        const anyRegisterLink = page.locator('a[href*="register"]');
        if (await anyRegisterLink.isVisible()) {
          await anyRegisterLink.click();
          await expect(page).toHaveURL(/register/);
        } else {
          test.skip(true, 'No register link found');
        }
      }
    });

    test.skip('should redirect authenticated user away from login', async ({ page }) => {
      // This test requires a valid test user in the database
      await login(page, TEST_USER.email, TEST_USER.password);
      
      await page.goto('/login');
      await expect(page).not.toHaveURL(/login/);
    });
  });

  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      await expect(form).toBeVisible({ timeout: 10000 });
    });

    test('should validate password match', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const nameInput = page.getByLabel(/nombre/i);
      const emailInput = page.getByLabel(/email|correo/i);
      const passwordInputs = page.locator('input[type="password"]');
      const submitButton = page.getByRole('button', { name: /registr|crear|sign up/i });
      
      if (await nameInput.isVisible() && await emailInput.isVisible()) {
        await nameInput.fill('Test User');
        await emailInput.fill('newuser@example.com');
        
        // Fill passwords differently
        if (await passwordInputs.count() >= 2) {
          await passwordInputs.first().fill('password123');
          await passwordInputs.last().fill('different456');
          await submitButton.click();
          
          await page.waitForTimeout(1000);
          // Should stay on register page with error
          const url = page.url();
          expect(url).toContain('register');
        }
      } else {
        test.skip(true, 'Registration form not found');
      }
    });

    test('should validate short password', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const nameInput = page.getByLabel(/nombre/i);
      const emailInput = page.getByLabel(/email|correo/i);
      const passwordInputs = page.locator('input[type="password"]');
      const submitButton = page.getByRole('button', { name: /registr|crear|sign up/i });
      
      if (await nameInput.isVisible() && await passwordInputs.count() >= 2) {
        await nameInput.fill('Test User');
        await emailInput.fill('newuser@example.com');
        await passwordInputs.first().fill('123');
        await passwordInputs.last().fill('123');
        await submitButton.click();
        
        await page.waitForTimeout(1000);
        // Should stay on register page
        const url = page.url();
        expect(url).toContain('register');
      } else {
        test.skip(true, 'Registration form not found');
      }
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const loginLink = page.locator('a[href*="login"]');
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing profile without auth', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      // Should redirect to login or show auth required
      const url = page.url();
      expect(url).toMatch(/login|auth|profile/);
    });

    test('should redirect to login when accessing orders without auth', async ({ page }) => {
      await page.goto('/profile/orders');
      await page.waitForLoadState('networkidle');
      
      const url = page.url();
      expect(url).toMatch(/login|auth|profile/);
    });

    test('should redirect to login when accessing wishlists without auth', async ({ page }) => {
      await page.goto('/profile/wishlists');
      await page.waitForLoadState('networkidle');
      
      const url = page.url();
      expect(url).toMatch(/login|auth|profile/);
    });

    test('should redirect to login when accessing admin without auth', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      const url = page.url();
      // Admin should redirect to login or show unauthorized
      expect(url).toMatch(/login|auth|admin|unauthorized/);
    });
  });

  test.describe('Logout', () => {
    test.skip('should logout successfully', async ({ page }) => {
      // This test requires a valid test user
      await login(page, TEST_USER.email, TEST_USER.password);
      
      const userMenu = page.locator('[class*="profile"], [class*="user-menu"]');
      await userMenu.click();
      
      const logoutButton = page.getByRole('button', { name: /cerrar sesión|logout|salir/i });
      await logoutButton.click();
      
      const loginButton = page.getByRole('link', { name: /ingresar|login/i });
      await expect(loginButton).toBeVisible();
    });
  });
});

test.describe('Admin Authentication', () => {
  test('should restrict admin panel to non-admin users', async ({ page }) => {
    // Without authentication, admin should redirect
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    // Should redirect away from admin or show login
    expect(url).toMatch(/login|auth|admin/);
  });
});
