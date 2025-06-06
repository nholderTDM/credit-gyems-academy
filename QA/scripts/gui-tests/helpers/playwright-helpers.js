// playwright-helpers.js
// Custom helpers and utilities for Playwright tests
// Location: credit-gyems-academy/gui-tests/helpers/

const { expect } = require('@playwright/test');

class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  // Authentication helpers
  async login(email = 'test@example.com', password = 'Test123!') {
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect or token storage
    await this.page.waitForURL(url => !url.includes('/login'), { timeout: 5000 });
    
    // Verify login succeeded
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('auth-token') || 
             sessionStorage.getItem('auth-token') ||
             document.cookie.includes('auth-token');
    });
    
    expect(token).toBeTruthy();
    return token;
  }

  async logout() {
    // Try multiple logout methods
    const logoutButton = this.page.locator('button:has-text("Logout"), a:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Direct logout
      await this.page.goto('/logout');
    }
    
    // Clear storage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  // Navigation helpers
  async navigateToProduct(productName) {
    await this.page.goto('/products');
    await this.page.click(`text="${productName}"`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToService(serviceName) {
    await this.page.goto('/services');
    await this.page.click(`text="${serviceName}"`);
    await this.page.waitForLoadState('networkidle');
  }

  // Form helpers
  async fillCreditCardForm(cardDetails = {}) {
    const defaults = {
      number: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User',
      zip: '12345'
    };
    
    const details = { ...defaults, ...cardDetails };
    
    // Handle different input formats
    const cardInput = this.page.locator('input[name="cardNumber"], input[name="number"], input[placeholder*="Card number"]');
    await cardInput.fill(details.number);
    
    // Expiry might be single field or split
    const expiryInput = this.page.locator('input[name="expiry"], input[placeholder*="MM/YY"]');
    if (await expiryInput.isVisible()) {
      await expiryInput.fill(details.expiry);
    } else {
      // Split fields
      await this.page.fill('input[name="expMonth"], input[placeholder*="MM"]', details.expiry.split('/')[0]);
      await this.page.fill('input[name="expYear"], input[placeholder*="YY"]', details.expiry.split('/')[1]);
    }
    
    await this.page.fill('input[name="cvc"], input[name="cvv"], input[placeholder*="CVC"]', details.cvc);
    await this.page.fill('input[name="cardName"], input[name="name"]', details.name);
    await this.page.fill('input[name="postalCode"], input[name="zip"]', details.zip);
  }

  // Cart helpers
  async addToCart(productId) {
    const addButton = this.page.locator('button:has-text("Add to Cart"), button[data-product-id="' + productId + '"]');
    await addButton.click();
    
    // Wait for cart update
    await this.waitForCartUpdate();
  }

  async waitForCartUpdate() {
    // Wait for cart count to update or notification
    await Promise.race([
      this.page.waitForSelector('.cart-count:not(:has-text("0"))', { timeout: 5000 }),
      this.page.waitForSelector('.notification:has-text("added to cart")', { timeout: 5000 }),
      this.page.waitForTimeout(1000)
    ]);
  }

  async getCartCount() {
    const cartCount = await this.page.locator('.cart-count, [data-testid="cart-count"]').textContent();
    return parseInt(cartCount) || 0;
  }

  // Booking helpers
  async selectAvailableTimeSlot(preferredTime = '14:00') {
    // First try preferred time
    let timeSlot = this.page.locator(`.time-slot:has-text("${preferredTime}"):not(.disabled):not(.unavailable)`);
    
    if (!(await timeSlot.isVisible())) {
      // Select first available slot
      timeSlot = this.page.locator('.time-slot:not(.disabled):not(.unavailable)').first();
    }
    
    await timeSlot.click();
    await expect(timeSlot).toHaveClass(/selected|active/);
    
    return await timeSlot.textContent();
  }

  async selectFutureDate(daysFromNow = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    
    const dateString = futureDate.toISOString().split('T')[0];
    
    // Try different date input methods
    const dateInput = this.page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      await dateInput.fill(dateString);
    } else {
      // Calendar picker
      await this.page.click('.date-picker-trigger, input[placeholder*="Date"]');
      await this.page.click(`[data-date="${dateString}"]`);
    }
    
    return dateString;
  }

  // Assertion helpers
  async expectNotification(message, type = 'success') {
    const notification = this.page.locator(`.notification.${type}, .toast.${type}, [role="alert"]`);
    await expect(notification).toBeVisible();
    
    if (message) {
      await expect(notification).toContainText(message);
    }
    
    // Auto-dismiss check
    await expect(notification).toBeHidden({ timeout: 10000 });
  }

  async expectPageLoad(timeout = 3000) {
    const startTime = Date.now();
    await this.page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(timeout);
    return loadTime;
  }

  async expectNoHorizontalScroll() {
    const hasScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasScroll).toBe(false);
  }

  // Accessibility helpers
  async checkA11y(context = null, options = {}) {
    // This would integrate with axe-core
    const violations = await this.page.evaluate(() => {
      // Simplified a11y check
      const issues = [];
      
      // Check images for alt text
      document.querySelectorAll('img').forEach(img => {
        if (!img.alt) {
          issues.push({ type: 'missing-alt', element: img.outerHTML.substring(0, 100) });
        }
      });
      
      // Check form labels
      document.querySelectorAll('input:not([type="hidden"])').forEach(input => {
        if (!input.labels.length && !input.getAttribute('aria-label')) {
          issues.push({ type: 'missing-label', element: input.outerHTML });
        }
      });
      
      return issues;
    });
    
    expect(violations).toHaveLength(0);
  }

  async checkKeyboardNavigation() {
    // Tab through page
    const tabbableElements = await this.page.evaluate(() => {
      const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return document.querySelectorAll(selector).length;
    });
    
    for (let i = 0; i < tabbableElements; i++) {
      await this.page.keyboard.press('Tab');
      
      // Check focus is visible
      const hasFocusIndicator = await this.page.evaluate(() => {
        const element = document.activeElement;
        const styles = window.getComputedStyle(element);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });
      
      expect(hasFocusIndicator).toBe(true);
    }
  }

  // Performance helpers
  async measurePerformance() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        jsHeapSize: performance.memory?.usedJSHeapSize || 0
      };
    });
    
    return metrics;
  }

  // Visual regression helpers
  async takeScreenshot(name, options = {}) {
    const defaults = {
      fullPage: false,
      animations: 'disabled',
      mask: []
    };
    
    const screenshotOptions = { ...defaults, ...options };
    
    // Mask dynamic content
    const dynamicSelectors = ['.timestamp', '.date', '.random-id'];
    screenshotOptions.mask = [
      ...screenshotOptions.mask,
      ...dynamicSelectors.map(s => this.page.locator(s))
    ];
    
    return await this.page.screenshot({
      path: `screenshots/${name}.png`,
      ...screenshotOptions
    });
  }

  // Mock data helpers
  generateTestUser() {
    const timestamp = Date.now();
    return {
      email: `test_${timestamp}@example.com`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
      phone: `555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`
    };
  }

  generateCreditCard(type = 'success') {
    const cards = {
      success: { number: '4242424242424242', cvc: '123' },
      decline: { number: '4000000000000002', cvc: '123' },
      insufficient: { number: '4000000000009995', cvc: '123' }
    };
    
    return {
      ...cards[type],
      expiry: '12/25',
      name: 'Test User',
      zip: '12345'
    };
  }

  // Utility methods
  async waitForNetworkIdle(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async interceptAPI(pattern, response) {
    await this.page.route(pattern, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  async slowDownNetwork(latency = 1000) {
    // Add artificial latency to all requests
    await this.page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, latency));
      await route.continue();
    });
  }

  async clearAllData() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });
  }
}

// Export factory function
module.exports = {
  TestHelpers,
  createHelpers: (page) => new TestHelpers(page)
};