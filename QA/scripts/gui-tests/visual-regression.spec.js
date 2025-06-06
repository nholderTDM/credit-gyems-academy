// QA/scripts/gui-tests/tests/visual-regression.spec.js
// Visual regression tests for Credit Gyems Academy

const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
  
  test.describe('Homepage Visual Consistency', () => {
    test('should match homepage layout', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for all images and animations to load
      await page.waitForTimeout(2000);
      
      // Mask dynamic content
      await page.addStyleTag({
        content: `
          .timestamp, .current-date, .live-count { visibility: hidden !important; }
          .random-testimonial { visibility: hidden !important; }
          [data-dynamic="true"] { visibility: hidden !important; }
        `
      });
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('homepage-full.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('.timestamp'),
          page.locator('.current-date'),
          page.locator('.live-count')
        ]
      });
    });

    test('should match hero section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const heroSection = page.locator('.hero, .hero-section, section:first-child');
      await expect(heroSection).toHaveScreenshot('hero-section.png', {
        animations: 'disabled'
      });
    });

    test('should match navigation header', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const header = page.locator('header, .header, .navigation');
      await expect(header).toHaveScreenshot('header-navigation.png', {
        animations: 'disabled'
      });
    });

    test('should match footer', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toHaveScreenshot('footer.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Product Pages Visual Consistency', () => {
    test('should match products page layout', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Wait for product grid to load
      await page.waitForSelector('.product-grid, .products-container', { timeout: 5000 });
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('products-page.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [
          page.locator('.product-price'), // Prices might be dynamic
          page.locator('.stock-count')   // Stock counts change
        ]
      });
    });

    test('should match product card design', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      const firstProductCard = page.locator('.product-card, .product-item').first();
      await expect(firstProductCard).toBeVisible();
      
      await expect(firstProductCard).toHaveScreenshot('product-card.png', {
        animations: 'disabled'
      });
    });

    test('should match product card hover state', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      const firstProductCard = page.locator('.product-card, .product-item').first();
      await firstProductCard.hover();
      await page.waitForTimeout(500); // Allow hover animation
      
      await expect(firstProductCard).toHaveScreenshot('product-card-hover.png');
    });

    test('should match product filters', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      const filtersSection = page.locator('.filters, .product-filters, .filter-container');
      if (await filtersSection.isVisible()) {
        await expect(filtersSection).toHaveScreenshot('product-filters.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Form Visual Consistency', () => {
    test('should match registration form layout', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      await expect(form).toHaveScreenshot('registration-form.png', {
        animations: 'disabled'
      });
    });

    test('should match form field states', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.locator('input[name="email"]');
      
      // Normal state
      await expect(emailInput).toHaveScreenshot('input-normal.png');
      
      // Focus state
      await emailInput.focus();
      await expect(emailInput).toHaveScreenshot('input-focus.png');
      
      // Filled state
      await emailInput.fill('user@example.com');
      await expect(emailInput).toHaveScreenshot('input-filled.png');
      
      // Error state (trigger validation)
      await emailInput.clear();
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      await page.waitForTimeout(500);
      
      const fieldContainer = emailInput.locator('..'); // Parent container
      await expect(fieldContainer).toHaveScreenshot('input-error-state.png');
    });

    test('should match contact form', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      const contactForm = page.locator('form');
      await expect(contactForm).toHaveScreenshot('contact-form.png', {
        animations: 'disabled'
      });
    });
  });

  test.describe('Button and Interactive Elements', () => {
    test('should match primary button states', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const primaryButton = page.locator('.btn-primary, .cta-button, button.primary').first();
      
      if (await primaryButton.isVisible()) {
        // Normal state
        await expect(primaryButton).toHaveScreenshot('button-primary-normal.png');
        
        // Hover state
        await primaryButton.hover();
        await expect(primaryButton).toHaveScreenshot('button-primary-hover.png');
        
        // Focus state
        await primaryButton.focus();
        await expect(primaryButton).toHaveScreenshot('button-primary-focus.png');
      }
    });

    test('should match secondary button states', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const secondaryButton = page.locator('.btn-secondary, button.secondary').first();
      
      if (await secondaryButton.isVisible()) {
        await expect(secondaryButton).toHaveScreenshot('button-secondary-normal.png');
        
        await secondaryButton.hover();
        await expect(secondaryButton).toHaveScreenshot('button-secondary-hover.png');
      }
    });

    test('should match navigation links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const navLink = page.locator('nav a').first();
      
      // Normal state
      await expect(navLink).toHaveScreenshot('nav-link-normal.png');
      
      // Hover state
      await navLink.hover();
      await expect(navLink).toHaveScreenshot('nav-link-hover.png');
      
      // Focus state
      await navLink.focus();
      await expect(navLink).toHaveScreenshot('nav-link-focus.png');
    });
  });

  test.describe('Responsive Visual Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should match homepage on ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        await expect(page).toHaveScreenshot(`homepage-${name}.png`, {
          fullPage: false, // Viewport only for responsive tests
          animations: 'disabled',
          mask: [
            page.locator('.timestamp'),
            page.locator('.dynamic-content')
          ]
        });
      });

      test(`should match navigation on ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        if (width < 768) {
          // Mobile: Test hamburger menu
          const mobileMenuToggle = page.locator('.menu-toggle, .hamburger');
          if (await mobileMenuToggle.isVisible()) {
            await expect(mobileMenuToggle).toHaveScreenshot(`mobile-menu-toggle-${name}.png`);
            
            await mobileMenuToggle.click();
            const mobileMenu = page.locator('.mobile-menu, .mobile-nav');
            await expect(mobileMenu).toHaveScreenshot(`mobile-menu-open-${name}.png`);
          }
        } else {
          // Desktop/Tablet: Test full navigation
          const navigation = page.locator('nav, .navigation');
          await expect(navigation).toHaveScreenshot(`navigation-${name}.png`);
        }
      });
    });
  });

  test.describe('Service Pages Visual Consistency', () => {
    test('should match services page layout', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('services-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match service card design', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      const serviceCard = page.locator('.service-card, .consultation-option').first();
      if (await serviceCard.isVisible()) {
        await expect(serviceCard).toHaveScreenshot('service-card.png', {
          animations: 'disabled'
        });
        
        // Hover state
        await serviceCard.hover();
        await expect(serviceCard).toHaveScreenshot('service-card-hover.png');
      }
    });
  });

  test.describe('Modal and Overlay Visual Tests', () => {
    test('should match modal appearance', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for modal trigger
      const modalTrigger = page.locator('button:has-text("Sign Up"), .modal-trigger').first();
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        
        const modal = page.locator('.modal, [role="dialog"]');
        await expect(modal).toBeVisible();
        
        await expect(modal).toHaveScreenshot('modal-dialog.png', {
          animations: 'disabled'
        });
        
        // Close modal
        const closeButton = page.locator('.modal-close, [aria-label="Close"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    });

    test('should match dropdown menu appearance', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const dropdown = page.locator('.dropdown, [aria-haspopup="true"]').first();
      
      if (await dropdown.isVisible()) {
        await dropdown.click();
        
        const dropdownMenu = page.locator('.dropdown-menu, [role="menu"]');
        if (await dropdownMenu.isVisible()) {
          await expect(dropdownMenu).toHaveScreenshot('dropdown-menu.png', {
            animations: 'disabled'
          });
        }
      }
    });
  });

  test.describe('Loading and Error States', () => {
    test('should match loading spinner design', async ({ page }) => {
      await page.goto('/products');
      
      // Intercept API to show loading state
      await page.route('**/api/products', async route => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await route.continue();
      });
      
      await page.reload();
      
      const loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
      if (await loadingSpinner.isVisible()) {
        await expect(loadingSpinner).toHaveScreenshot('loading-spinner.png');
      }
      
      await page.unroute('**/api/products');
    });

    test('should match error message design', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Trigger form validation errors
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      const errorMessage = page.locator('.error, .error-message').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toHaveScreenshot('error-message.png');
      }
    });

    test('should match 404 page design', async ({ page }) => {
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');
      
      // Should show 404 page
      const notFoundPage = page.locator('body');
      await expect(notFoundPage).toHaveScreenshot('404-page.png', {
        fullPage: true
      });
    });
  });

  test.describe('Dark Mode Visual Tests', () => {
    test('should match dark mode appearance', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check if dark mode toggle exists
      const darkModeToggle = page.locator('[aria-label="Toggle dark mode"], .dark-mode-toggle');
      
      if (await darkModeToggle.isVisible()) {
        await darkModeToggle.click();
        await page.waitForTimeout(500); // Allow transition
        
        await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
          fullPage: true,
          animations: 'disabled'
        });
        
        // Test navigation in dark mode
        const navigation = page.locator('nav, header');
        await expect(navigation).toHaveScreenshot('navigation-dark-mode.png');
        
        // Test buttons in dark mode
        const primaryButton = page.locator('.btn-primary, .cta-button').first();
        if (await primaryButton.isVisible()) {
          await expect(primaryButton).toHaveScreenshot('button-dark-mode.png');
        }
      }
    });
  });

  test.describe('Print Styles Visual Tests', () => {
    test('should match print layout', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      await expect(page).toHaveScreenshot('homepage-print.png', {
        fullPage: true
      });
      
      // Reset to screen media
      await page.emulateMedia({ media: 'screen' });
    });
  });

  test.describe('Custom Component Visual Tests', () => {
    test('should match testimonial component', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const testimonial = page.locator('.testimonial, .review').first();
      if (await testimonial.isVisible()) {
        await expect(testimonial).toHaveScreenshot('testimonial-component.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match pricing card component', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      const pricingCard = page.locator('.pricing-card, .price-box').first();
      if (await pricingCard.isVisible()) {
        await expect(pricingCard).toHaveScreenshot('pricing-card.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match feature list component', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');
      
      const featureList = page.locator('.features, .feature-list').first();
      if (await featureList.isVisible()) {
        await expect(featureList).toHaveScreenshot('feature-list.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Animation and Transition Tests', () => {
    test('should match hover animations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const animatedElement = page.locator('.card, .product-card').first();
      
      if (await animatedElement.isVisible()) {
        // Before hover
        await expect(animatedElement).toHaveScreenshot('element-before-hover.png');
        
        // During hover (mid-animation)
        await animatedElement.hover();
        await page.waitForTimeout(150); // Capture mid-animation
        await expect(animatedElement).toHaveScreenshot('element-during-hover.png');
        
        // After hover animation completes
        await page.waitForTimeout(350);
        await expect(animatedElement).toHaveScreenshot('element-after-hover.png');
      }
    });

    test('should match loading animations', async ({ page }) => {
      await page.goto('/products');
      
      // Intercept to create loading state
      let resolveRequest;
      await page.route('**/api/products', async route => {
        await new Promise(resolve => {
          resolveRequest = resolve;
          setTimeout(resolve, 2000);
        });
        await route.continue();
      });
      
      await page.reload();
      
      // Capture loading animation frame
      await page.waitForTimeout(500);
      const loadingContainer = page.locator('.loading-container, .products-loading');
      if (await loadingContainer.isVisible()) {
        await expect(loadingContainer).toHaveScreenshot('loading-animation.png');
      }
      
      await page.unroute('**/api/products');
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    // Note: This would require running tests on different browsers
    // The test configuration handles this through projects
    
    test('should render consistently across browsers', async ({ page, browserName }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
});