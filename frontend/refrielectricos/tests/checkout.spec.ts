import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  
  test('should allow a user to register, add items to cart, and checkout', async ({ page }) => {
    
    // Mock API responses
    await page.route('**/auth/register', async route => {
      await route.fulfill({ status: 201, body: JSON.stringify({ message: 'User created' }) });
    });

    // Create a dummy JWT
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: "123", email: "test@example.com", role: "USER", exp: 9999999999 }));
    const signature = "dummy_signature";
    const mockToken = `${header}.${payload}.${signature}`;

    await page.route('**/auth/login', async route => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ access_token: mockToken }) 
      });
    });

    await page.route('**/users/123', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ id: "123", name: "Test User", email: "test@example.com", role: "USER" })
      });
    });

    await page.route('**/products*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [{ 
            id: "p1", 
            name: "Compresor Test", 
            price: 100000, 
            image_url: "/images/placeholder.jpg", 
            slug: "compresor-test",
            brand: "Generic",
            category: "Refrigeración"
          }],
          meta: { total: 1, page: 1, last_page: 1 }
        })
      });
    });

    const addresses: Record<string, unknown>[] = [];
    await page.route('**/addresses', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, body: JSON.stringify(addresses) });
      } else if (route.request().method() === 'POST') {
        const data = JSON.parse(route.request().postData() || '{}');
        const newAddress = { id: "a1", ...data };
        addresses.push(newAddress);
        await route.fulfill({ 
          status: 201, 
          body: JSON.stringify(newAddress) 
        });
      }
    });

    await page.route('**/orders', async route => {
      await route.fulfill({ status: 201, body: JSON.stringify({ id: "o1" }) });
    });

    // Generate random user
    const randomId = Math.floor(Math.random() * 10000);
    const userEmail = `testuser${randomId}@example.com`;
    const userPass = 'Password123!';
    const userName = `Test User ${randomId}`;

    // 1. Register
    await test.step('Register new user', async () => {
      await page.goto('/register');
      await page.fill('input[name="name"]', userName);
      await page.fill('input[name="email"]', userEmail);
      await page.fill('input[name="password"]', userPass);
      // await page.fill('input[name="confirmPassword"]', userPass); // Removed as it doesn't exist
      await page.click('button[type="submit"]');
      
      // Expect redirection to login page with registered param
      await expect(page).toHaveURL(/\/login\?registered=true/);
      
      // Login with new credentials
      await page.fill('input[name="email"]', userEmail);
      await page.fill('input[name="password"]', userPass);
      await page.click('button[type="submit"]');

      // Expect redirection to home
      await expect(page).toHaveURL('/');
      // Check if user name appears in navbar (indicating login)
      // Use a more specific selector to avoid ambiguity
      const userMenuBtn = page.locator('nav button').filter({ hasText: userName.split(' ')[0] }).first();
      await expect(userMenuBtn).toBeVisible();
    });

    // 2. Search and Add to Cart
    await test.step('Search product and add to cart', async () => {
      // Use search bar
      const searchInput = page.getByPlaceholder('Buscar productos, marcas y más...');
      await searchInput.fill('a'); // Search for something generic to get results
      await searchInput.press('Enter');

      // Wait for results
      await page.waitForURL(/\/products/);
      
      // Wait for product to appear
      await expect(page.getByText('Compresor Test')).toBeVisible();

      // Find first product card and click "Agregar"
      // The button has text "Agregar" or "Agregado"
      const addToCartBtn = page.getByRole('button', { name: 'Agregar' }).first();
      await addToCartBtn.click();
      
      // Expect button to change to "Agregado"
      await expect(page.getByRole('button', { name: 'Agregado' }).first()).toBeVisible();
      
      // Check cart badge count
      const cartBadge = page.locator('a[href="/cart"] span');
      await expect(cartBadge).toHaveText('1');
    });

    // 3. Go to Cart
    await test.step('Go to cart', async () => {
      await page.click('a[href="/cart"]');
      await expect(page).toHaveURL('/cart');
      await expect(page.getByText('Resumen del pedido')).toBeVisible();
    });

    // 4. Proceed to Checkout
    await test.step('Proceed to checkout', async () => {
      await page.click('text=Proceder al pago');
      await expect(page).toHaveURL('/checkout');
    });

    // 5. Add Address
    await test.step('Add shipping address', async () => {
      // Click "Nueva" or "Agregar Dirección"
      // If no addresses, it shows "Agregar Dirección" button
      // If addresses exist, it shows "Nueva" button
      // We assume new user has no addresses.
      const addAddressBtn = page.getByRole('button', { name: /Agregar Dirección|Nueva/i });
      if (await addAddressBtn.isVisible()) {
        await addAddressBtn.click();
      }

      // Fill form
      await page.fill('input[autocomplete="name"]', userName);
      await page.fill('input[autocomplete="tel"]', '3001234567');
      await page.fill('input[autocomplete="street-address"]', 'Calle 123 # 45-67');
      
      // Select Department (Custom dropdown)
      await page.click('text=Seleccionar >> nth=0'); // First "Seleccionar" is Dept
      await page.click('li:has-text("Antioquia")'); // Select Antioquia
      
      // Select City
      await page.click('text=Seleccionar >> nth=0'); // Now the first visible "Seleccionar" might be City if Dept is filled? 
      // Actually, after selecting Dept, the button text changes to "Antioquia".
      // So we look for the remaining "Seleccionar" or the second button.
      // Let's use the label to be safe or just find the button following the label.
      
      // Better selector strategy for custom dropdowns:
      // The form has labels "Departamento" and "Ciudad / Municipio"
      // We can find the button inside the relative div following the label.
      
      // But simpler: just click the button that says "Seleccionar" (since Dept is now "Antioquia")
      await page.click('text=Seleccionar'); 
      await page.click('li:has-text("Medellín")');

      await page.fill('input[placeholder="Ej: El Poblado"]', 'Centro'); // Neighborhood
      await page.click('button:has-text("Casa")'); // Type

      await page.click('button:has-text("Guardar Dirección")');
      
      // Wait for address to appear in list
      await expect(page.getByText('Calle 123 # 45-67')).toBeVisible();
    });

    // 6. Confirm Order
    await test.step('Confirm order', async () => {
      // Select Payment (COD is default, so we just leave it)
      
      // Click Confirm
      await page.click('button:has-text("Confirmar Pedido")');
      
      // Expect success page
      await expect(page).toHaveURL('/checkout/success', { timeout: 10000 });
      await expect(page.getByText('¡Gracias por tu compra!')).toBeVisible();
    });

  });
});
