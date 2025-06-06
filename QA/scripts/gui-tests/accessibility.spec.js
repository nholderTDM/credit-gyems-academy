// QA/scripts/gui-tests/tests/accessibility.spec.js
// Accessibility tests for Credit Gyems Academy

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility Tests', () => {
  
  test.describe('WCAG 2.1 Compliance', () => {
    test('should have no accessibility violations on homepage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
      
      if (accessibilityScanResults.violations.length > 0) {
        console.log('Accessibility violations found:');
        accessibilityScanResults.violations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Nodes: ${violation.nodes.length}`);
        });
      }
    });

    test('should have no accessibility violations on products page', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no accessibility violations on contact form', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no accessibility violations on registration form', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should allow full keyboard navigation of main menu', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Start from the beginning of the page
      await page.keyboard.press('Tab');
      
      // Check for skip navigation link
      const skipLink = page.locator('a:has-text("Skip to main content"), a:has-text("Skip to content")');
      if (await skipLink.isVisible()) {
        await expect(skipLink).toBeFocused();
        await page.keyboard.press('Enter');
        
        // Should jump to main content
        const mainContent = page.locator('main, #main, .main-content');
        if (await mainContent.isVisible()) {
          const focusedElement = page.locator(':focus');
          const focusedElementPosition = await focusedElement.boundingBox();
          const mainContentPosition = await mainContent.boundingBox();
          
          // Focused element should be within or near main content area
          expect(focusedElementPosition.y).toBeGreaterThanOrEqual(mainContentPosition.y - 100);
        }
      }
      
      // Navigate through main menu items
      const navItems = ['Home', 'Services', 'Products', 'About', 'Contact'];
      
      for (const item of navItems) {
        // Tab to next navigation item
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        
        if (await focusedElement.isVisible()) {
          const focusedText = await focusedElement.textContent();
          if (focusedText && focusedText.includes(item)) {
            // Press Enter to navigate
            await page.keyboard.press('Enter');
            await page.waitForLoadState('networkidle');
            
            // Should navigate to the correct page
            const currentUrl = page.url();
            if (item !== 'Home') {
              expect(currentUrl.toLowerCase()).toContain(item.toLowerCase());
            }
            
            // Go back to homepage for next test
            await page.goto('/');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('should navigate forms using only keyboard', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Tab through form fields
      let tabCount = 0;
      const maxTabs = 20; // Prevent infinite loop
      
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;
        
        const focusedElement = page.locator(':focus');
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        
        if (['input', 'textarea', 'select', 'button'].includes(tagName)) {
          // Test different input types
          if (tagName === 'input') {
            const inputType = await focusedElement.getAttribute('type');
            const inputName = await focusedElement.getAttribute('name');
            
            if (inputType === 'text' || inputType === 'email') {
              await page.keyboard.type('Test Value');
            } else if (inputType === 'tel') {
              await page.keyboard.type('555-123-4567');
            }
            
            // Clear for next test
            if (inputName !== 'submit') {
              await page.keyboard.press('Control+a');
              await page.keyboard.press('Delete');
            }
          } else if (tagName === 'textarea') {
            await page.keyboard.type('This is a test message typed using only keyboard navigation.');
            await page.keyboard.press('Control+a');
            await page.keyboard.press('Delete');
          } else if (tagName === 'select') {
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowUp');
          } else if (tagName === 'button') {
            const buttonText = await focusedElement.textContent();
            if (buttonText && buttonText.toLowerCase().includes('submit')) {
              // Don't actually submit, just verify it's focusable
              expect(await focusedElement.isVisible()).toBeTruthy();
              break;
            }
          }
        }
      }
    });

    test('should handle keyboard navigation in mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find and focus mobile menu toggle
      const mobileMenuToggle = page.locator('.menu-toggle, .hamburger, [aria-label="Menu"]');
      
      if (await mobileMenuToggle.isVisible()) {
        // Navigate to mobile menu toggle using tab
        let tabCount = 0;
        while (tabCount < 10) {
          await page.keyboard.press('Tab');
          tabCount++;
          
          const focusedElement = page.locator(':focus');
          const isMobileToggle = await focusedElement.evaluate((el) => {
            return el.classList.contains('menu-toggle') || 
                   el.classList.contains('hamburger') ||
                   el.getAttribute('aria-label') === 'Menu';
          });
          
          if (isMobileToggle) {
            // Open mobile menu with Enter key
            await page.keyboard.press('Enter');
            
            const mobileMenu = page.locator('.mobile-menu, .mobile-nav');
            await expect(mobileMenu).toBeVisible();
            
            // Navigate through mobile menu items
            await page.keyboard.press('Tab');
            const firstMenuItem = page.locator(':focus');
            await expect(firstMenuItem).toBeVisible();
            
            // Close mobile menu with Escape
            await page.keyboard.press('Escape');
            await expect(mobileMenu).toBeHidden();
            
            break;
          }
        }
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for single H1
      const h1Elements = page.locator('h1');
      const h1Count = await h1Elements.count();
      expect(h1Count).toBe(1);
      
      // Check heading hierarchy (H1 -> H2 -> H3, etc.)
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels = [];
      
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }
      
      // Verify heading hierarchy doesn't skip levels
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        
        // Next heading should not skip more than one level
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });

    test('should have meaningful page titles', async ({ page }) => {
      const pages = [
        { url: '/', expectedKeywords: ['Credit', 'Gyems', 'Academy', 'Home'] },
        { url: '/services', expectedKeywords: ['Services', 'Credit', 'Consultation'] },
        { url: '/products', expectedKeywords: ['Products', 'E-books', 'Courses'] },
        { url: '/about', expectedKeywords: ['About', 'Coach', 'Tae'] },
        { url: '/contact', expectedKeywords: ['Contact', 'Get in Touch'] }
      ];
      
      for (const pageInfo of pages) {
        await page.goto(pageInfo.url);
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        expect(title.length).toBeLessThan(70); // SEO best practice
        
        // Title should contain relevant keywords
        const titleLower = title.toLowerCase();
        const hasRelevantKeyword = pageInfo.expectedKeywords.some(keyword => 
          titleLower.includes(keyword.toLowerCase())
        );
        expect(hasRelevantKeyword).toBeTruthy();
      }
    });

    test('should have proper form labels and descriptions', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const formInputs = page.locator('input:not([type="hidden"]), textarea, select');
      const inputCount = await formInputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = formInputs.nth(i);
        const inputId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const ariaDescribedBy = await input.getAttribute('aria-describedby');
        
        // Input should have a label
        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          const hasLabel = await label.count() > 0;
          const hasAriaLabel = ariaLabel || ariaLabelledBy;
          
          expect(hasLabel || hasAriaLabel).toBeTruthy();
          
          if (hasLabel) {
            const labelText = await label.textContent();
            expect(labelText.trim()).toBeTruthy();
          }
        }
        
        // Check for required field indicators
        const isRequired = await input.getAttribute('required') !== null || 
                          await input.getAttribute('aria-required') === 'true';
        
        if (isRequired) {
          // Required fields should have visual and programmatic indication
          const requiredIndicator = page.locator(`[for="${inputId}"] >> text="*", [aria-describedby="${ariaDescribedBy}"] >> text="required"`);
          if (await requiredIndicator.count() === 0) {
            // Check if aria-required is properly set
            const ariaRequired = await input.getAttribute('aria-required');
            expect(ariaRequired).toBe('true');
          }
        }
      }
    });

    test('should provide proper error announcements', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Submit empty form to trigger validation errors
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Check for ARIA live regions or alert roles
      const liveRegions = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
      await expect(liveRegions).toHaveCount({ min: 1 });
      
      // Check that error messages are associated with form fields
      const errorMessages = page.locator('.error, .error-message, [role="alert"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const error = errorMessages.nth(i);
          const errorId = await error.getAttribute('id');
          
          if (errorId) {
            // Find input associated with this error
            const associatedInput = page.locator(`[aria-describedby*="${errorId}"]`);
            if (await associatedInput.count() > 0) {
              expect(true).toBeTruthy(); // Error is properly associated
            }
          }
        }
      }
    });

    test('should have descriptive link text', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const links = page.locator('a');
      const linkCount = await links.count();
      
      const problematicLinkTexts = [
        'click here',
        'read more',
        'here',
        'more',
        'link',
        'this',
        'continue'
      ];
      
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');
        
        // Link should have meaningful text
        const effectiveText = ariaLabel || linkText || title || '';
        expect(effectiveText.trim()).toBeTruthy();
        
        // Avoid generic link text
        const isProblematic = problematicLinkTexts.some(problematic => 
          effectiveText.toLowerCase().trim() === problematic
        );
        
        if (isProblematic) {
          // If generic text is used, there should be additional context
          const hasAriaLabel = ariaLabel && ariaLabel !== linkText;
          const hasTitle = title && title !== linkText;
          expect(hasAriaLabel || hasTitle).toBeTruthy();
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('should meet WCAG color contrast requirements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Use axe-core to check color contrast
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .withRules(['color-contrast'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
      
      // Manual contrast check for key elements
      const keyElements = [
        'h1',
        'p',
        'button',
        'a',
        '.cta-button',
        'nav a'
      ];
      
      for (const selector of keyElements) {
        const element = page.locator(selector).first();
        
        if (await element.isVisible()) {
          const contrast = await element.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // Simple contrast check (actual implementation would be more complex)
            return {
              color,
              backgroundColor,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight
            };
          });
          
          // Log contrast information for manual review
          console.log(`${selector} contrast:`, contrast);
        }
      }
    });

    test('should not rely solely on color to convey information', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Check for color-only information
      const colorIndicators = page.locator('.status, .price, .availability');
      const indicatorCount = await colorIndicators.count();
      
      for (let i = 0; i < indicatorCount; i++) {
        const indicator = colorIndicators.nth(i);
        const text = await indicator.textContent();
        const ariaLabel = await indicator.getAttribute('aria-label');
        const title = await indicator.getAttribute('title');
        
        // Status should be conveyed through text, not just color
        const hasTextualIndication = text && text.trim().length > 0;
        const hasAriaLabel = ariaLabel && ariaLabel.length > 0;
        const hasTitle = title && title.length > 0;
        
        expect(hasTextualIndication || hasAriaLabel || hasTitle).toBeTruthy();
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const elementCount = await focusableElements.count();
      
      // Test first 10 focusable elements
      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = focusableElements.nth(i);
        
        if (await element.isVisible()) {
          await element.focus();
          
          // Check if element has visible focus indicator
          const hasFocusStyle = await element.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return (
              styles.outline !== 'none' ||
              styles.outlineWidth !== '0px' ||
              styles.boxShadow !== 'none' ||
              styles.border !== styles.getPropertyValue('border') // Changed on focus
            );
          });
          
          expect(hasFocusStyle).toBeTruthy();
        }
      }
    });

    test('should manage focus in modal dialogs', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for modal triggers
      const modalTrigger = page.locator('button:has-text("Sign Up"), button:has-text("Get Started"), .modal-trigger');
      
      if (await modalTrigger.first().isVisible()) {
        await modalTrigger.first().click();
        
        const modal = page.locator('.modal, [role="dialog"], [aria-modal="true"]');
        
        if (await modal.isVisible()) {
          // Focus should be trapped in modal
          await page.keyboard.press('Tab');
          const focusedElement = page.locator(':focus');
          
          // Focused element should be within modal
          const isWithinModal = await focusedElement.evaluate((el, modalEl) => {
            return modalEl.contains(el);
          }, await modal.elementHandle());
          
          expect(isWithinModal).toBeTruthy();
          
          // Test escape key to close modal
          await page.keyboard.press('Escape');
          await expect(modal).toBeHidden();
          
          // Focus should return to trigger element
          await expect(modalTrigger.first()).toBeFocused();
        }
      }
    });

    test('should handle focus in dropdown menus', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const dropdown = page.locator('.dropdown, [aria-haspopup="true"]');
      
      if (await dropdown.first().isVisible()) {
        await dropdown.first().click();
        
        const dropdownMenu = page.locator('.dropdown-menu, [role="menu"]');
        
        if (await dropdownMenu.isVisible()) {
          // Test arrow key navigation
          await page.keyboard.press('ArrowDown');
          const focusedItem = page.locator(':focus');
          
          const isMenuItem = await focusedItem.evaluate((el) => {
            return el.getAttribute('role') === 'menuitem' || 
                   el.closest('[role="menu"]') !== null;
          });
          
          expect(isMenuItem).toBeTruthy();
          
          // Test escape to close
          await page.keyboard.press('Escape');
          await expect(dropdownMenu).toBeHidden();
        }
      }
    });
  });

  test.describe('Images and Media Accessibility', () => {
    test('should have appropriate alt text for images', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute('alt');
        const role = await image.getAttribute('role');
        const ariaLabel = await image.getAttribute('aria-label');
        const isDecorative = role === 'presentation' || alt === '';
        
        if (isDecorative) {
          // Decorative images should have empty alt or presentation role
          expect(alt === '' || role === 'presentation').toBeTruthy();
        } else {
          // Content images should have meaningful alt text
          expect(alt || ariaLabel).toBeTruthy();
          
          if (alt) {
            expect(alt.length).toBeGreaterThan(3);
            expect(alt.length).toBeLessThan(150); // Keep alt text concise
          }
        }
      }
    });

    test('should provide captions or transcripts for video content', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const videos = page.locator('video');
      const videoCount = await videos.count();
      
      for (let i = 0; i < videoCount; i++) {
        const video = videos.nth(i);
        
        // Check for captions track
        const tracks = video.locator('track[kind="captions"], track[kind="subtitles"]');
        const hasCaption = await tracks.count() > 0;
        
        // Check for transcript link nearby
        const transcript = page.locator('text="Transcript", text="View Transcript", a[href*="transcript"]');
        const hasTranscript = await transcript.count() > 0;
        
        // Video should have either captions or transcript
        expect(hasCaption || hasTranscript).toBeTruthy();
      }
    });
  });

  test.describe('Language and Internationalization', () => {
    test('should have proper language attributes', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check html lang attribute
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBeTruthy();
      expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // Format: en or en-US
      
      // Check for mixed language content
      const langElements = page.locator('[lang]');
      const langCount = await langElements.count();
      
      for (let i = 0; i < langCount; i++) {
        const element = langElements.nth(i);
        const lang = await element.getAttribute('lang');
        expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      }
    });

    test('should handle text direction properly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for proper text direction
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6');
      const elementCount = await textElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = textElements.nth(i);
        const direction = await element.evaluate((el) => {
          return window.getComputedStyle(el).direction;
        });
        
        // For English content, direction should be ltr
        expect(direction).toBe('ltr');
      }
    });
  });

  test.describe('Dynamic Content Accessibility', () => {
    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Test filter changes
      const filterButton = page.locator('button:has-text("E-books"), .filter-option').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        
        // Check for live region updates
        const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"], [role="status"]');
        
        if (await liveRegion.count() > 0) {
          // Live region should announce the change
          const liveText = await liveRegion.textContent();
          expect(liveText).toBeTruthy();
        }
        
        // Results should be updated with proper labels
        const results = page.locator('.search-results, .product-grid');
        if (await results.isVisible()) {
          const resultsLabel = await results.getAttribute('aria-label') || 
                             await results.locator('.results-count').textContent();
          expect(resultsLabel).toBeTruthy();
        }
      }
    });

    test('should handle loading states accessibly', async ({ page }) => {
      await page.goto('/products');
      
      // Intercept requests to add delay
      await page.route('**/api/products', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await page.reload();
      
      // Check for loading indicators
      const loadingIndicator = page.locator('[aria-label*="loading"], [role="status"], .loading');
      
      if (await loadingIndicator.isVisible()) {
        const loadingText = await loadingIndicator.textContent() || 
                           await loadingIndicator.getAttribute('aria-label');
        expect(loadingText).toMatch(/loading|wait|please wait/i);
      }
      
      // Clean up route
      await page.unroute('**/api/products');
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Run accessibility scan on mobile
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
      
      // Check touch target sizes
      const buttons = page.locator('button, a, input[type="submit"]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          
          // Touch targets should be at least 44x44px (iOS HIG)
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });
});