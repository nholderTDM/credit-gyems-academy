// QA/scripts/gui-tests/tests/performance.spec.js
// Performance tests for Credit Gyems Academy

const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  
  test.describe('Page Load Performance', () => {
    test('should load homepage within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Homepage should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Get detailed performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          timeToInteractive: navigation.loadEventEnd - navigation.navigationStart,
          totalLoadTime: loadTime
        };
      });
      
      console.log('Homepage Performance Metrics:', metrics);
      
      // Performance assertions
      expect(metrics.firstContentfulPaint).toBeLessThan(1500); // 1.5s
      expect(metrics.domContentLoaded).toBeLessThan(2000); // 2s
      expect(metrics.timeToInteractive).toBeLessThan(3500); // 3.5s
    });

    test('should load products page efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(4000); // Products page may have more content
      
      // Check that product grid loads efficiently
      const productCards = page.locator('.product-card, .product-item');
      const productCount = await productCards.count();
      
      if (productCount > 0) {
        // Ensure products are visible quickly
        const firstProduct = productCards.first();
        await expect(firstProduct).toBeVisible();
        
        // Test image loading performance
        const productImages = productCards.locator('img');
        const imageCount = await productImages.count();
        
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = productImages.nth(i);
          await expect(img).toBeVisible();
          
          // Check if image has loaded
          const isLoaded = await img.evaluate((image) => {
            return image.complete && image.naturalHeight !== 0;
          });
          
          expect(isLoaded).toBeTruthy();
        }
      }
      
      console.log(`Products page loaded in ${loadTime}ms with ${productCount} products`);
    });

    test('should load services page within budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3500);
      
      console.log(`Services page loaded in ${loadTime}ms`);
    });

    test('should handle slow network conditions gracefully', async ({ page }) => {
      // Simulate slow 3G network
      await page.context().route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      
      // Should show loading indicators
      const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Even on slow network, should load within reasonable time
      expect(loadTime).toBeLessThan(10000); // 10s max on slow network
      
      console.log(`Slow network load time: ${loadTime}ms`);
    });
  });

  test.describe('Resource Optimization', () => {
    test('should not load oversized resources', async ({ page }) => {
      // Monitor network requests
      const resourceSizes = [];
      
      page.on('response', async (response) => {
        const url = response.url();
        const contentLength = response.headers()['content-length'];
        
        if (contentLength) {
          const size = parseInt(contentLength);
          resourceSizes.push({
            url,
            size,
            type: response.headers()['content-type'] || 'unknown'
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for oversized resources
      const largeResources = resourceSizes.filter(resource => resource.size > 500000); // 500KB
      
      if (largeResources.length > 0) {
        console.log('Large resources found:');
        largeResources.forEach(resource => {
          console.log(`  ${resource.url}: ${(resource.size / 1024).toFixed(2)}KB (${resource.type})`);
        });
      }
      
      // Images should not exceed 200KB (adjust based on your requirements)
      const largeImages = resourceSizes.filter(resource => 
        resource.type.startsWith('image/') && resource.size > 200000
      );
      
      expect(largeImages.length).toBeLessThan(3); // Allow some large hero images
      
      // JavaScript bundles should not exceed 300KB
      const largeScripts = resourceSizes.filter(resource => 
        resource.type.includes('javascript') && resource.size > 300000
      );
      
      expect(largeScripts.length).toBeLessThan(2);
      
      // Calculate total page weight
      const totalSize = resourceSizes.reduce((sum, resource) => sum + resource.size, 0);
      console.log(`Total page weight: ${(totalSize / 1024).toFixed(2)}KB`);
      
      // Total page should not exceed 2MB
      expect(totalSize).toBeLessThan(2000000);
    });

    test('should use efficient image formats', async ({ page }) => {
      const imageRequests = [];
      
      page.on('response', async (response) => {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.startsWith('image/')) {
          imageRequests.push({
            url: response.url(),
            contentType,
            size: parseInt(response.headers()['content-length'] || '0')
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check image formats
      const inefficientFormats = imageRequests.filter(img => 
        img.contentType.includes('image/jpeg') && img.size > 100000 ||
        img.contentType.includes('image/png') && img.size > 150000
      );
      
      if (inefficientFormats.length > 0) {
        console.log('Consider optimizing these images:');
        inefficientFormats.forEach(img => {
          console.log(`  ${img.url}: ${(img.size / 1024).toFixed(2)}KB (${img.contentType})`);
        });
      }
      
      // Modern formats should be preferred for large images
      const modernFormats = imageRequests.filter(img => 
        img.contentType.includes('image/webp') || 
        img.contentType.includes('image/avif')
      );
      
      console.log(`Modern image formats: ${modernFormats.length}/${imageRequests.length}`);
    });

    test('should leverage browser caching', async ({ page }) => {
      const cachedRequests = [];
      const uncachedRequests = [];
      
      page.on('response', async (response) => {
        const cacheControl = response.headers()['cache-control'];
        const expires = response.headers()['expires'];
        const etag = response.headers()['etag'];
        
        const url = response.url();
        const isCacheable = cacheControl || expires || etag;
        
        if (url.includes('localhost:3000') || url.includes('localhost:5000')) {
          if (isCacheable) {
            cachedRequests.push({ url, cacheControl, etag });
          } else {
            uncachedRequests.push(url);
          }
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      console.log(`Cacheable requests: ${cachedRequests.length}`);
      console.log(`Non-cacheable requests: ${uncachedRequests.length}`);
      
      if (uncachedRequests.length > 0) {
        console.log('Consider adding cache headers for:');
        uncachedRequests.slice(0, 5).forEach(url => console.log(`  ${url}`));
      }
      
      // Static assets should be cacheable
      const staticAssets = cachedRequests.filter(req => 
        req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)
      );
      
      expect(staticAssets.length).toBeGreaterThan(0);
    });
  });

  test.describe('Runtime Performance', () => {
    test('should handle rapid user interactions efficiently', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Test rapid clicking on filter buttons
      const filterButtons = page.locator('.filter-button, .category-filter');
      const buttonCount = await filterButtons.count();
      
      if (buttonCount > 0) {
        const startTime = Date.now();
        
        // Rapidly click different filters
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          await filterButtons.nth(i).click();
          await page.waitForTimeout(100); // Small delay between clicks
        }
        
        const interactionTime = Date.now() - startTime;
        
        // UI should remain responsive
        expect(interactionTime).toBeLessThan(2000);
        
        // Check that the page is still responsive
        const searchInput = page.locator('input[type="search"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('test');
          await expect(searchInput).toHaveValue('test');
        }
      }
    });

    test('should scroll smoothly on long pages', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Measure scroll performance
      const scrollStart = Date.now();
      
      // Scroll to bottom
      await page.evaluate(() => {
        return new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            
            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 10);
        });
      });
      
      const scrollTime = Date.now() - scrollStart;
      
      // Smooth scrolling should complete quickly
      expect(scrollTime).toBeLessThan(3000);
      
      // Check final scroll position
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(100);
      
      console.log(`Scroll performance: ${scrollTime}ms`);
    });

    test('should handle form interactions efficiently', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        const startTime = Date.now();
        
        // Fill form fields rapidly
        const formData = {
          'input[name="firstName"], input[name="name"]': 'John',
          'input[name="lastName"]': 'Doe',
          'input[name="email"]': 'john.doe@example.com',
          'input[name="phone"]': '555-123-4567',
          'textarea[name="message"]': 'This is a test message to check form performance'
        };
        
        for (const [selector, value] of Object.entries(formData)) {
          const field = page.locator(selector);
          if (await field.isVisible()) {
            await field.fill(value);
          }
        }
        
        const formFillTime = Date.now() - startTime;
        
        // Form should respond quickly to input
        expect(formFillTime).toBeLessThan(1000);
        
        console.log(`Form fill time: ${formFillTime}ms`);
      }
    });
  });

  test.describe('Memory Performance', () => {
    test('should not have memory leaks during navigation', async ({ page }) => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
          };
        }
        return null;
      });
      
      if (!initialMemory) {
        test.skip('Performance.memory not available in this browser');
      }
      
      // Navigate through multiple pages
      const pages = ['/', '/products', '/services', '/about', '/contact'];
      
      for (let i = 0; i < 3; i++) { // Repeat 3 times
        for (const url of pages) {
          await page.goto(url);
          await page.waitForLoadState('networkidle');
        }
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) window.gc();
      });
      
      await page.waitForTimeout(1000);
      
      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
          };
        }
        return null;
      });
      
      if (finalMemory && initialMemory) {
        const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const growthPercentage = (memoryGrowth / initialMemory.usedJSHeapSize) * 100;
        
        console.log(`Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB (${growthPercentage.toFixed(2)}%)`);
        
        // Memory shouldn't grow more than 50% after navigation
        expect(growthPercentage).toBeLessThan(50);
      }
    });

    test('should handle large lists efficiently', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Measure memory before loading more content
      const beforeMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      // Scroll through product list to trigger lazy loading
      let scrollPosition = 0;
      const scrollStep = 500;
      const maxScrolls = 10;
      
      for (let i = 0; i < maxScrolls; i++) {
        scrollPosition += scrollStep;
        await page.evaluate((y) => window.scrollTo(0, y), scrollPosition);
        await page.waitForTimeout(200);
      }
      
      // Measure memory after scrolling
      const afterMemory = await page.evaluate(() => {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
      });
      
      if (beforeMemory && afterMemory) {
        const memoryIncrease = afterMemory - beforeMemory;
        console.log(`Memory increase during scrolling: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        
        // Memory increase should be reasonable
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB max increase
      }
    });
  });

  test.describe('API Response Performance', () => {
    test('should load data efficiently', async ({ page }) => {
      const apiRequests = [];
      
      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/')) {
          const timing = response.timing();
          apiRequests.push({
            url,
            status: response.status(),
            responseTime: timing.responseEnd - timing.requestStart
          });
        }
      });
      
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Check API response times
      apiRequests.forEach(request => {
        console.log(`API ${request.url}: ${request.responseTime}ms (${request.status})`);
        
        // API responses should be fast
        expect(request.responseTime).toBeLessThan(2000); // 2s max
        expect(request.status).toBeLessThan(400); // No client/server errors
      });
      
      // Calculate average API response time
      if (apiRequests.length > 0) {
        const avgResponseTime = apiRequests.reduce((sum, req) => sum + req.responseTime, 0) / apiRequests.length;
        console.log(`Average API response time: ${avgResponseTime.toFixed(2)}ms`);
        
        expect(avgResponseTime).toBeLessThan(1000); // 1s average
      }
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Simulate API failure
      await page.route('**/api/products', route => route.abort());
      
      const startTime = Date.now();
      await page.goto('/products');
      
      // Should show error state within reasonable time
      const errorMessage = page.locator('.error, .error-message, text="Error", text="Failed to load"');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      const errorDisplayTime = Date.now() - startTime;
      expect(errorDisplayTime).toBeLessThan(3000);
      
      console.log(`Error state displayed in: ${errorDisplayTime}ms`);
      
      // Clean up route
      await page.unroute('**/api/products');
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Simulate mobile network conditions
      await page.context().route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay for mobile
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Mobile should still load reasonably fast
      expect(loadTime).toBeLessThan(5000);
      
      // Test mobile interactions
      const mobileMenuToggle = page.locator('.menu-toggle, .hamburger');
      if (await mobileMenuToggle.isVisible()) {
        const tapStart = Date.now();
        await mobileMenuToggle.tap();
        
        const mobileMenu = page.locator('.mobile-menu, .mobile-nav');
        await expect(mobileMenu).toBeVisible();
        
        const tapResponseTime = Date.now() - tapStart;
        expect(tapResponseTime).toBeLessThan(300); // Touch should be responsive
        
        console.log(`Mobile tap response time: ${tapResponseTime}ms`);
      }
      
      console.log(`Mobile load time: ${loadTime}ms`);
    });

    test('should handle touch gestures efficiently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Test swipe/scroll performance
      const startY = 300;
      const endY = 100;
      
      const swipeStart = Date.now();
      
      await page.touchscreen.tap(200, startY);
      await page.touchscreen.tap(200, endY);
      
      const swipeTime = Date.now() - swipeStart;
      expect(swipeTime).toBeLessThan(500);
      
      console.log(`Touch gesture response time: ${swipeTime}ms`);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should log performance metrics for monitoring', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Collect comprehensive performance data
      const performanceData = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        const resources = performance.getEntriesByType('resource');
        
        return {
          navigation: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnect: navigation.connectEnd - navigation.connectStart,
            serverResponse: navigation.responseEnd - navigation.requestStart
          },
          paint: {
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
          },
          resources: {
            totalRequests: resources.length,
            totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
            slowestResource: Math.max(...resources.map(r => r.duration || 0))
          },
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null
        };
      });
      
      // Log performance data (could be sent to monitoring service)
      console.log('Performance Metrics:', JSON.stringify(performanceData, null, 2));
      
      // Basic performance assertions
      expect(performanceData.navigation.loadComplete).toBeLessThan(3000);
      expect(performanceData.paint.firstContentfulPaint).toBeLessThan(1500);
      expect(performanceData.resources.totalSize).toBeLessThan(2000000); // 2MB
      
      // Save metrics for reporting
      await page.evaluate((data) => {
        window.performanceMetrics = data;
      }, performanceData);
    });
  });
});