// QA/scripts/gui-tests/tests/navigation.spec.js
// Navigation and routing tests for Credit Gyems Academy

const { test, expect } = require('@playwright/test');

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Main Navigation', () => {
    test('should display main navigation menu', async ({ page }) => {
      // Check if main navigation is visible
      const mainNav = page.locator('nav[role="navigation"], .main-nav, header nav');
      await expect(mainNav).toBeVisible();

      // Check for key navigation items
      const navItems = [
        'Home',
        'Services', 
        'Products',
        'About',
        'Contact',
        'Community'
      ];

      for (const item of navItems) {
        const navLink = page.locator(`nav >> text="${item}"`);
        await expect(navLink).toBeVisible();
      }
    });

    test('should navigate to Services page', async ({ page }) => {
      await page.click('nav >> text="Services"');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/services/);
      await expect(page.locator('h1')).toContainText(/Services|Credit Repair|Consultation/i);
      
      // Check for service offerings
      const serviceCards = page.locator('.service-card, .consultation-option');
      await expect(serviceCards).toHaveCount({ min: 1 });
    });

    test('should navigate to Products page', async ({ page }) => {
      await page.click('nav >> text="Products"');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/products/);
      await expect(page.locator('h1')).toContainText(/Products|E-books|Courses/i);
      
      // Check for product filters
      const filters = page.locator('.filter-container, .product-filters');
      if (await filters.isVisible()) {
        await expect(filters).toBeVisible();
      }
    });

    test('should navigate to About page', async ({ page }) => {
      await page.click('nav >> text="About"');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/about/);
      await expect(page.locator('h1')).toContainText(/About|Coach|Tae/i);
    });

    test('should navigate to Contact page', async ({ page }) => {
      await page.click('nav >> text="Contact"');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/contact/);
      await expect(page.locator('h1')).toContainText(/Contact|Get in Touch/i);
      
      // Check for contact form
      const contactForm = page.locator('form');
      await expect(contactForm).toBeVisible();
    });

    test('should navigate to Community page', async ({ page }) => {
      await page.click('nav >> text="Community"');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/community/);
      await expect(page.locator('h1')).toContainText(/Community|Discussions|Forum/i);
    });
  });

  test.describe('User Authentication Navigation', () => {
    test('should show login/register when not authenticated', async ({ page }) => {
      // Clear any existing auth
      await page.context().clearCookies();
      await page.reload();
      
      const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign In")');
      const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign Up")');
      
      await expect(loginLink).toBeVisible();
      await expect(registerLink).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      await page.context().clearCookies();
      await page.reload();
      
      await page.click('a:has-text("Login"), a:has-text("Sign In")');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/login|\/signin/);
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.context().clearCookies();
      await page.reload();
      
      await page.click('a:has-text("Register"), a:has-text("Sign Up")');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/register|\/signup/);
      await expect(page.locator('form')).toBeVisible();
      
      // Check for registration form fields
      await expect(page.locator('input[name="firstName"], input[name="first_name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });
  });

  test.describe('Authenticated User Navigation', () => {
    test('should show user menu when authenticated', async ({ page }) => {
      // This test assumes auth state is loaded from setup
      const userMenu = page.locator('.user-menu, .profile-dropdown, [data-testid="user-menu"]');
      const dashboardLink = page.locator('a:has-text("Dashboard"), a:has-text("My Account")');
      
      // Check if user menu or dashboard link is visible
      const hasUserNav = await userMenu.isVisible() || await dashboardLink.isVisible();
      expect(hasUserNav).toBeTruthy();
    });

    test('should navigate to user dashboard', async ({ page }) => {
      // Look for dashboard/profile link
      const dashboardLink = page.locator('a:has-text("Dashboard"), a:has-text("My Account"), a:has-text("Profile")');
      
      if (await dashboardLink.isVisible()) {
        await dashboardLink.click();
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/\/dashboard|\/profile|\/account/);
      }
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should show breadcrumbs on product detail page', async ({ page }) => {
      // Navigate to products first
      await page.click('nav >> text="Products"');
      await page.waitForLoadState('networkidle');
      
      // Click on first product if available
      const firstProduct = page.locator('.product-card, .product-item').first();
      if (await firstProduct.isVisible()) {
        await firstProduct.click();
        await page.waitForLoadState('networkidle');
        
        // Check for breadcrumbs
        const breadcrumbs = page.locator('.breadcrumb, .breadcrumbs, nav[aria-label="breadcrumb"]');
        if (await breadcrumbs.isVisible()) {
          await expect(breadcrumbs).toContainText(/Home|Products/);
        }
      }
    });
  });

  test.describe('Footer Navigation', () => {
    test('should display footer with proper links', async ({ page }) => {
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
      
      // Check for common footer links
      const footerLinks = [
        'Privacy Policy',
        'Terms of Service',
        'Contact'
      ];
      
      for (const linkText of footerLinks) {
        const link = footer.locator(`a:has-text("${linkText}")`);
        if (await link.isVisible()) {
          await expect(link).toHaveAttribute('href');
        }
      }
    });

    test('should navigate to Privacy Policy', async ({ page }) => {
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      
      const privacyLink = footer.locator('a:has-text("Privacy Policy"), a:has-text("Privacy")');
      if (await privacyLink.isVisible()) {
        await privacyLink.click();
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/\/privacy/);
        await expect(page.locator('h1')).toContainText(/Privacy/i);
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should show mobile menu toggle on mobile', async ({ page, isMobile }) => {
      if (isMobile) {
        const mobileMenuToggle = page.locator('.menu-toggle, .hamburger, [aria-label="Menu"]');
        await expect(mobileMenuToggle).toBeVisible();
        
        // Test mobile menu functionality
        await mobileMenuToggle.click();
        
        const mobileMenu = page.locator('.mobile-menu, .mobile-nav, nav.mobile');
        await expect(mobileMenu).toBeVisible();
        
        // Check for navigation items in mobile menu
        const mobileNavItems = mobileMenu.locator('a');
        await expect(mobileNavItems).toHaveCount({ min: 3 });
      }
    });
  });

  test.describe('404 Page Handling', () => {
    test('should display 404 page for non-existent routes', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      // Check for 404 indicators
      const pageNotFound = page.locator('text=404, text="Page Not Found", text="Not Found"');
      await expect(pageNotFound).toBeVisible();
      
      // Check for back to home link
      const homeLink = page.locator('a:has-text("Go Home"), a:has-text("Back to Home"), a[href="/"]');
      await expect(homeLink).toBeVisible();
    });

    test('should navigate back to home from 404 page', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      const homeLink = page.locator('a:has-text("Go Home"), a:has-text("Back to Home"), a[href="/"]');
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('Search Navigation', () => {
    test('should navigate to search results', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]');
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('credit repair');
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Check if navigated to search results page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/search|query/);
        
        // Check for search results or no results message
        const results = page.locator('.search-results, .search-result');
        const noResults = page.locator('text="No results", text="Nothing found"');
        
        const hasResults = await results.isVisible();
        const hasNoResults = await noResults.isVisible();
        
        expect(hasResults || hasNoResults).toBeTruthy();
      }
    });
  });

  test.describe('Page Load Performance', () => {
    test('should load pages within performance budget', async ({ page }) => {
      const pages = [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        { name: 'Services', url: '/services' },
        { name: 'About', url: '/about' }
      ];

      for (const pageInfo of pages) {
        const startTime = Date.now();
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        // Performance assertion - pages should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
        
        console.log(`${pageInfo.name} page loaded in ${loadTime}ms`);
      }
    });
  });

  test.describe('Navigation State Persistence', () => {
    test('should maintain cart state during navigation', async ({ page }) => {
      // Navigate to products and add item to cart (if possible)
      await page.click('nav >> text="Products"');
      await page.waitForLoadState('networkidle');
      
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        
        // Wait for cart update
        await page.waitForTimeout(1000);
        
        // Navigate to another page
        await page.click('nav >> text="About"');
        await page.waitForLoadState('networkidle');
        
        // Check if cart state is maintained
        const cartIndicator = page.locator('.cart-count, [data-testid="cart-count"]');
        if (await cartIndicator.isVisible()) {
          const cartText = await cartIndicator.textContent();
          expect(parseInt(cartText) || 0).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('URL Structure and SEO', () => {
    test('should have SEO-friendly URLs', async ({ page }) => {
      const pages = [
        '/products',
        '/services', 
        '/about',
        '/contact'
      ];

      for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        // Check for proper meta tags
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        
        // Check for meta description
        const metaDescription = page.locator('meta[name="description"]');
        if (await metaDescription.count() > 0) {
          const content = await metaDescription.getAttribute('content');
          expect(content).toBeTruthy();
        }
      }
    });
  });
});