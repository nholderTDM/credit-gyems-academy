// QA/scripts/gui-tests/tests/responsive-design.spec.js
// Responsive design tests for Credit Gyems Academy

const { test, expect } = require('@playwright/test');

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop Small', width: 1366, height: 768 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
    { name: 'Ultra Wide', width: 2560, height: 1440 }
  ];

  test.describe('Header and Navigation Responsiveness', () => {
    viewports.forEach(({ name, width, height }) => {
      test(`should display proper navigation on ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;

        if (isMobile) {
          // Mobile: Should show hamburger menu
          const hamburgerMenu = page.locator('.menu-toggle, .hamburger, [aria-label="Menu"], .mobile-menu-button');
          await expect(hamburgerMenu).toBeVisible();

          // Desktop navigation should be hidden
          const desktopNav = page.locator('nav:not(.mobile), .desktop-nav');
          if (await desktopNav.count() > 0) {
            await expect(desktopNav).toBeHidden();
          }

          // Test mobile menu functionality
          await hamburgerMenu.click();
          const mobileMenu = page.locator('.mobile-menu, .mobile-nav, nav.mobile');
          await expect(mobileMenu).toBeVisible();

          // Check mobile menu items
          const mobileNavItems = mobileMenu.locator('a, button');
          await expect(mobileNavItems).toHaveCount({ min: 3 });

          // Close mobile menu
          const closeButton = page.locator('.close-menu, .menu-close, [aria-label="Close menu"]');
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            await hamburgerMenu.click(); // Toggle off
          }
          
          await expect(mobileMenu).toBeHidden();
        } else {
          // Desktop/Tablet: Should show full navigation
          const desktopNav = page.locator('nav:not(.mobile), .main-nav, header nav');
          await expect(desktopNav).toBeVisible();

          // Hamburger menu should be hidden
          const hamburgerMenu = page.locator('.menu-toggle, .hamburger');
          if (await hamburgerMenu.count() > 0) {
            await expect(hamburgerMenu).toBeHidden();
          }

          // Check navigation items are visible
          const navItems = ['Home', 'Services', 'Products', 'About', 'Contact'];
          for (const item of navItems) {
            const navLink = page.locator(`nav >> text="${item}"`);
            if (await navLink.count() > 0) {
              await expect(navLink).toBeVisible();
            }
          }
        }
      });
    });
  });

  test.describe('Layout and Grid Responsiveness', () => {
    test('should adapt product grid layout across viewports', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500); // Allow layout to adjust

        const productGrid = page.locator('.product-grid, .products-container, .grid');
        if (await productGrid.isVisible()) {
          const products = productGrid.locator('.product-card, .product-item');
          const productCount = await products.count();

          if (productCount > 0) {
            // Check grid layout based on viewport
            const firstProduct = products.first();
            const secondProduct = products.nth(1);

            if (productCount > 1) {
              const firstBox = await firstProduct.boundingBox();
              const secondBox = await secondProduct.boundingBox();

              if (viewport.width < 768) {
                // Mobile: Should stack vertically (single column)
                expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
              } else if (viewport.width < 1024) {
                // Tablet: Should show 2-3 columns
                const isSameRow = Math.abs(firstBox.y - secondBox.y) < 50;
                expect(isSameRow).toBeTruthy();
              } else {
                // Desktop: Should show 3+ columns
                const isSameRow = Math.abs(firstBox.y - secondBox.y) < 50;
                expect(isSameRow).toBeTruthy();
              }
            }
          }
        }

        console.log(`${viewport.name}: Product grid layout verified`);
      }
    });

    test('should adapt hero section layout', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);

        const heroSection = page.locator('.hero, .hero-section, section:first-child');
        if (await heroSection.isVisible()) {
          const heroBounds = await heroSection.boundingBox();
          
          // Hero should not exceed viewport width
          expect(heroBounds.width).toBeLessThanOrEqual(viewport.width + 20); // Allow for scrollbar

          // Check hero content layout
          const heroTitle = heroSection.locator('h1');
          const heroContent = heroSection.locator('p, .hero-content');
          const heroButton = heroSection.locator('button, .cta-button, .btn');

          if (await heroTitle.isVisible()) {
            const titleBounds = await heroTitle.boundingBox();
            expect(titleBounds.width).toBeLessThan(viewport.width - 40); // With padding
          }

          // Check if CTA button is properly sized for mobile
          if (viewport.width < 768 && await heroButton.isVisible()) {
            const buttonBounds = await heroButton.boundingBox();
            expect(buttonBounds.width).toBeGreaterThan(120); // Minimum touch target
            expect(buttonBounds.height).toBeGreaterThan(44); // iOS minimum touch target
          }
        }
      }
    });
  });

  test.describe('Typography and Content Responsiveness', () => {
    test('should have readable text sizes across viewports', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);

        // Check heading sizes
        const mainHeading = page.locator('h1').first();
        if (await mainHeading.isVisible()) {
          const fontSize = await mainHeading.evaluate(el => {
            return window.getComputedStyle(el).fontSize;
          });
          
          const fontSizeNum = parseInt(fontSize);
          
          if (viewport.width < 768) {
            // Mobile: Headings should be smaller but still readable
            expect(fontSizeNum).toBeGreaterThanOrEqual(24);
            expect(fontSizeNum).toBeLessThanOrEqual(36);
          } else {
            // Desktop: Headings can be larger
            expect(fontSizeNum).toBeGreaterThanOrEqual(28);
          }
        }

        // Check body text
        const bodyText = page.locator('p').first();
        if (await bodyText.isVisible()) {
          const fontSize = await bodyText.evaluate(el => {
            return window.getComputedStyle(el).fontSize;
          });
          
          const fontSizeNum = parseInt(fontSize);
          // Body text should be at least 14px for readability
          expect(fontSizeNum).toBeGreaterThanOrEqual(14);
        }
      }
    });

    test('should handle long content gracefully', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      for (const viewport of viewports.filter(v => v.width <= 768)) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);

        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasHorizontalScroll).toBeFalsy();

        // Check that text doesn't overflow containers
        const textContainers = page.locator('p, .content, .text-content');
        const containerCount = await textContainers.count();

        for (let i = 0; i < Math.min(containerCount, 5); i++) {
          const container = textContainers.nth(i);
          if (await container.isVisible()) {
            const containerBounds = await container.boundingBox();
            expect(containerBounds.width).toBeLessThanOrEqual(viewport.width + 20);
          }
        }
      }
    });
  });

  test.describe('Form Responsiveness', () => {
    test('should display forms properly on mobile devices', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Test mobile viewports
      const mobileViewports = viewports.filter(v => v.width < 768);
      
      for (const viewport of mobileViewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);

        const form = page.locator('form');
        if (await form.isVisible()) {
          // Form should not exceed viewport width
          const formBounds = await form.boundingBox();
          expect(formBounds.width).toBeLessThanOrEqual(viewport.width);

          // Input fields should be properly sized
          const inputs = form.locator('input:not([type="hidden"]), textarea, select');
          const inputCount = await inputs.count();

          for (let i = 0; i < Math.min(inputCount, 5); i++) {
            const input = inputs.nth(i);
            if (await input.isVisible()) {
              const inputBounds = await input.boundingBox();
              
              // Inputs should be wide enough for mobile interaction
              expect(inputBounds.width).toBeGreaterThan(viewport.width * 0.7);
              expect(inputBounds.height).toBeGreaterThanOrEqual(44); // iOS minimum touch target
            }
          }

          // Submit button should be prominent on mobile
          const submitButton = form.locator('button[type="submit"], input[type="submit"]');
          if (await submitButton.isVisible()) {
            const buttonBounds = await submitButton.boundingBox();
            expect(buttonBounds.width).toBeGreaterThan(120);
            expect(buttonBounds.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('should stack form fields appropriately on small screens', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      await page.waitForTimeout(500);

      const form = page.locator('form');
      if (await form.isVisible()) {
        // Check if form fields are stacked vertically
        const formGroups = form.locator('.form-group, .field, .input-group');
        const groupCount = await formGroups.count();

        if (groupCount > 1) {
          for (let i = 0; i < groupCount - 1; i++) {
            const currentGroup = formGroups.nth(i);
            const nextGroup = formGroups.nth(i + 1);

            if (await currentGroup.isVisible() && await nextGroup.isVisible()) {
              const currentBounds = await currentGroup.boundingBox();
              const nextBounds = await nextGroup.boundingBox();

              // Next group should be below current group (stacked)
              expect(nextBounds.y).toBeGreaterThan(currentBounds.y + 10);
            }
          }
        }
      }
    });
  });

  test.describe('Image and Media Responsiveness', () => {
    test('should scale images appropriately', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);

        const images = page.locator('img');
        const imageCount = await images.count();

        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const image = images.nth(i);
          if (await image.isVisible()) {
            const imageBounds = await image.boundingBox();
            
            // Images should not exceed viewport width
            expect(imageBounds.width).toBeLessThanOrEqual(viewport.width + 20);
            
            // Images should maintain aspect ratio
            const naturalWidth = await image.getAttribute('width');
            const naturalHeight = await image.getAttribute('height');
            
            if (naturalWidth && naturalHeight) {
              const expectedRatio = parseInt(naturalWidth) / parseInt(naturalHeight);
              const actualRatio = imageBounds.width / imageBounds.height;
              
              // Allow for some variance in aspect ratio
              expect(Math.abs(expectedRatio - actualRatio)).toBeLessThan(0.1);
            }
          }
        }
      }
    });
  });

  test.describe('Touch and Interaction Responsiveness', () => {
    test('should have appropriate touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check button touch targets
      const buttons = page.locator('button, .btn, a.button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const buttonBounds = await button.boundingBox();
          
          // iOS Human Interface Guidelines recommend 44x44pt minimum
          expect(buttonBounds.width).toBeGreaterThanOrEqual(44);
          expect(buttonBounds.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Check link touch targets
      const links = page.locator('a:not(.button)');
      const linkCount = await links.count();

      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = links.nth(i);
        if (await link.isVisible()) {
          const linkBounds = await link.boundingBox();
          
          // Links should have adequate touch area
          expect(linkBounds.height).toBeGreaterThanOrEqual(32);
        }
      }
    });

    test('should handle orientation changes', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(1000); // Allow time for orientation change

      // Check that layout adapts
      const body = page.locator('body');
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();

      // Navigation should still be accessible
      const nav = page.locator('nav, .navigation');
      await expect(nav).toBeVisible();
    });
  });

  test.describe('Footer Responsiveness', () => {
    test('should display footer appropriately across viewports', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);

        const footer = page.locator('footer');
        if (await footer.isVisible()) {
          await footer.scrollIntoViewIfNeeded();
          
          const footerBounds = await footer.boundingBox();
          expect(footerBounds.width).toBeLessThanOrEqual(viewport.width + 20);

          // Check footer links arrangement
          const footerLinks = footer.locator('a');
          const linkCount = await footerLinks.count();

          if (linkCount > 0 && viewport.width < 768) {
            // On mobile, footer links should stack or wrap properly
            const firstLink = footerLinks.first();
            const lastLink = footerLinks.last();

            if (await firstLink.isVisible() && await lastLink.isVisible()) {
              const firstBounds = await firstLink.boundingBox();
              const lastBounds = await lastLink.boundingBox();

              // Footer content should not extend beyond viewport
              expect(Math.max(firstBounds.x + firstBounds.width, lastBounds.x + lastBounds.width))
                .toBeLessThanOrEqual(viewport.width + 20);
            }
          }
        }
      }
    });
  });

  test.describe('Performance on Different Viewports', () => {
    test('should maintain performance across viewports', async ({ page }) => {
      for (const viewport of [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Desktop', width: 1920, height: 1080 }
      ]) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        const startTime = Date.now();
        await page.goto('/', { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;

        // Page should load reasonably fast on all viewports
        expect(loadTime).toBeLessThan(5000);
        
        console.log(`${viewport.name}: Page loaded in ${loadTime}ms`);
      }
    });
  });

  test.describe('CSS and Layout Validation', () => {
    test('should not have layout overflow issues', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      for (const viewport of viewports.filter(v => v.width <= 768)) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);

        // Check for elements that exceed viewport width
        const overflowElements = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          const overflowing = [];
          
          elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 20) { // Allow 20px tolerance
              overflowing.push({
                tagName: el.tagName,
                className: el.className,
                right: rect.right,
                viewportWidth: window.innerWidth
              });
            }
          });
          
          return overflowing.slice(0, 5); // Limit to first 5 to avoid overwhelming output
        });

        if (overflowElements.length > 0) {
          console.warn(`${viewport.name}: Found ${overflowElements.length} overflowing elements`);
          overflowElements.forEach(el => {
            console.warn(`  ${el.tagName}.${el.className}: extends to ${el.right}px (viewport: ${el.viewportWidth}px)`);
          });
        }

        // This is a warning rather than a hard failure since some overflow might be intentional
        expect(overflowElements.length).toBeLessThan(3);
      }
    });
  });
});