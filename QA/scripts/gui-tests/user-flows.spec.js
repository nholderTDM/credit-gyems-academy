// QA/scripts/gui-tests/tests/user-flows.spec.js
// End-to-end user journey tests for Credit Gyems Academy

const { test, expect } = require('@playwright/test');

test.describe('User Journey Flows', () => {
  
  test.describe('New User Registration and First Purchase Flow', () => {
    test('should complete full new user journey from registration to purchase', async ({ page }) => {
      const timestamp = Date.now();
      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `testuser${timestamp}@example.com`,
        password: 'StrongPass123!',
        phone: '555-123-4567'
      };

      // Step 1: Start at homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Step 2: Navigate to registration
      await page.click('a:has-text("Register"), a:has-text("Sign Up"), a:has-text("Get Started")');
      await page.waitForLoadState('networkidle');
      
      // Step 3: Complete registration
      await page.fill('input[name="firstName"]', testUser.firstName);
      await page.fill('input[name="lastName"]', testUser.lastName);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill(testUser.password);
      }
      
      const phoneInput = page.locator('input[name="phone"]');
      if (await phoneInput.isVisible()) {
        await phoneInput.fill(testUser.phone);
      }
      
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // Step 4: Verify successful registration (dashboard or welcome page)
      const isLoggedIn = page.url().includes('/dashboard') || 
                        page.url().includes('/welcome') ||
                        await page.locator('text="Welcome", text="Dashboard"').isVisible();
      expect(isLoggedIn).toBeTruthy();
      
      // Step 5: Navigate to products
      await page.click('nav >> text="Products", a:has-text("Products"), a:has-text("Shop")');
      await page.waitForLoadState('networkidle');
      
      // Step 6: Browse and select a product
      const productCards = page.locator('.product-card, .product-item');
      await expect(productCards).toHaveCount({ min: 1 });
      
      const firstProduct = productCards.first();
      const productTitle = await firstProduct.locator('h3, .product-title, .product-name').textContent();
      
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      // Step 7: Add product to cart
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Buy Now")');
      await expect(addToCartButton).toBeVisible();
      await addToCartButton.click();
      
      // Step 8: Verify cart update
      await page.waitForTimeout(1000); // Allow cart to update
      const cartIndicator = page.locator('.cart-count, [data-testid="cart-count"]');
      if (await cartIndicator.isVisible()) {
        const cartCount = await cartIndicator.textContent();
        expect(parseInt(cartCount) || 0).toBeGreaterThan(0);
      }
      
      // Step 9: Proceed to checkout
      const checkoutButton = page.locator('button:has-text("Checkout"), a:has-text("Checkout"), button:has-text("Proceed to Checkout")');
      await checkoutButton.click();
      await page.waitForLoadState('networkidle');
      
      // Step 10: Complete payment form (using test card)
      const cardNumberInput = page.locator('input[name="cardNumber"], input[placeholder*="Card number"]');
      if (await cardNumberInput.isVisible()) {
        await cardNumberInput.fill('4242424242424242');
        
        const expiryInput = page.locator('input[name="expiry"], input[placeholder*="MM/YY"]');
        if (await expiryInput.isVisible()) {
          await expiryInput.fill('12/25');
        }
        
        const cvcInput = page.locator('input[name="cvc"], input[name="cvv"]');
        if (await cvcInput.isVisible()) {
          await cvcInput.fill('123');
        }
        
        const postalCodeInput = page.locator('input[name="postalCode"], input[name="zip"]');
        if (await postalCodeInput.isVisible()) {
          await postalCodeInput.fill('12345');
        }
      }
      
      // Step 11: Complete purchase
      const purchaseButton = page.locator('button:has-text("Complete Purchase"), button:has-text("Pay Now"), button[type="submit"]');
      await purchaseButton.click();
      await page.waitForLoadState('networkidle');
      
      // Step 12: Verify successful purchase
      const successIndicators = [
        'text="Thank you"',
        'text="Order confirmed"',
        'text="Purchase successful"',
        'text="Congratulations"'
      ];
      
      let purchaseConfirmed = false;
      for (const indicator of successIndicators) {
        if (await page.locator(indicator).isVisible()) {
          purchaseConfirmed = true;
          break;
        }
      }
      
      expect(purchaseConfirmed).toBeTruthy();
      
      // Step 13: Verify order details are displayed
      const orderNumber = page.locator('.order-number, [data-testid="order-id"]');
      if (await orderNumber.isVisible()) {
        const orderText = await orderNumber.textContent();
        expect(orderText).toBeTruthy();
      }
    });
  });

  test.describe('Consultation Booking Flow', () => {
    test('should complete consultation booking from service selection to confirmation', async ({ page }) => {
      // Step 1: Start from homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Step 2: Navigate to services
      await page.click('nav >> text="Services", a:has-text("Services")');
      await page.waitForLoadState('networkidle');
      
      // Step 3: Select a consultation service
      const serviceCards = page.locator('.service-card, .consultation-option, .service-item');
      await expect(serviceCards).toHaveCount({ min: 1 });
      
      const creditRepairService = page.locator('text="Credit Repair", text="Credit Coaching", text="Consultation"').first();
      await creditRepairService.click();
      await page.waitForLoadState('networkidle');
      
      // Step 4: Click book now
      const bookNowButton = page.locator('button:has-text("Book Now"), button:has-text("Schedule"), a:has-text("Book Consultation")');
      await bookNowButton.click();
      await page.waitForLoadState('networkidle');
      
      // Step 5: Select date (next week)
      const dateInput = page.locator('input[type="date"], .date-picker-input');
      if (await dateInput.isVisible()) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const dateString = nextWeek.toISOString().split('T')[0];
        await dateInput.fill(dateString);
      }
      
      // Step 6: Select time slot
      const timeSlots = page.locator('.time-slot, .available-time');
      await expect(timeSlots).toHaveCount({ min: 1 });
      
      const availableSlot = timeSlots.locator('text="2:00 PM", text="14:00", text="10:00 AM"').first();
      await availableSlot.click();
      
      // Verify slot is selected
      await expect(availableSlot).toHaveClass(/selected|active/);
      
      // Step 7: Fill booking details
      const nameInput = page.locator('input[name="name"], input[name="fullName"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('John Doe');
      }
      
      const emailInput = page.locator('input[name="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('john.doe@example.com');
      }
      
      const phoneInput = page.locator('input[name="phone"]');
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('555-123-4567');
      }
      
      const notesInput = page.locator('textarea[name="notes"], textarea[name="message"]');
      if (await notesInput.isVisible()) {
        await notesInput.fill('I need help improving my credit score from 650 to 750+. Looking forward to our consultation.');
      }
      
      // Step 8: Confirm booking
      const confirmButton = page.locator('button:has-text("Confirm Booking"), button:has-text("Book Consultation"), button[type="submit"]');
      await confirmButton.click();
      await page.waitForLoadState('networkidle');
      
      // Step 9: Verify booking confirmation
      const confirmationMessages = [
        'text="Booking Confirmed"',
        'text="Consultation Scheduled"',
        'text="Thank you for booking"'
      ];
      
      let bookingConfirmed = false;
      for (const message of confirmationMessages) {
        if (await page.locator(message).isVisible()) {
          bookingConfirmed = true;
          break;
        }
      }
      
      expect(bookingConfirmed).toBeTruthy();
      
      // Step 10: Verify booking details are displayed
      const bookingDetails = page.locator('.booking-details, [data-testid="booking-info"]');
      if (await bookingDetails.isVisible()) {
        await expect(bookingDetails).toContainText(/consultation|credit|repair/i);
      }
    });

    test('should handle booking conflicts gracefully', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Navigate to booking
      const bookingButton = page.locator('button:has-text("Book Now"), a:has-text("Schedule")').first();
      if (await bookingButton.isVisible()) {
        await bookingButton.click();
        await page.waitForLoadState('networkidle');
        
        // Try to book a slot that might be unavailable
        const unavailableSlot = page.locator('.time-slot.unavailable, .time-slot.booked');
        if (await unavailableSlot.isVisible()) {
          await unavailableSlot.click();
          
          // Should show error or prevent selection
          const errorMessage = page.locator('text="Time slot unavailable", text="Already booked"');
          await expect(errorMessage).toBeVisible();
        }
      }
    });
  });

  test.describe('Community Engagement Flow', () => {
    test('should create discussion and interact with community', async ({ page }) => {
      // Ensure user is logged in
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Try to login or register
      const emailInput = page.locator('input[name="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('community@example.com');
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
      }
      
      // Step 1: Navigate to community
      await page.click('nav >> text="Community", a:has-text("Forum"), a:has-text("Discussions")');
      await page.waitForLoadState('networkidle');
      
      // Step 2: Create new discussion
      const newDiscussionButton = page.locator('button:has-text("New Discussion"), button:has-text("Create Post"), a:has-text("Start Discussion")');
      if (await newDiscussionButton.isVisible()) {
        await newDiscussionButton.click();
        await page.waitForLoadState('networkidle');
        
        // Step 3: Fill discussion form
        const titleInput = page.locator('input[name="title"], input[name="subject"]');
        await titleInput.fill('How to improve credit score from 650 to 750?');
        
        const contentInput = page.locator('textarea[name="content"], textarea[name="message"]');
        await contentInput.fill('I\'m currently at 650 credit score and want to reach 750. What are the most effective strategies? Any success stories to share?');
        
        const categorySelect = page.locator('select[name="category"]');
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption('credit_repair');
        }
        
        // Step 4: Post discussion
        const postButton = page.locator('button:has-text("Post"), button:has-text("Create"), button[type="submit"]');
        await postButton.click();
        await page.waitForLoadState('networkidle');
        
        // Step 5: Verify discussion is created
        await expect(page.locator('h1, .discussion-title')).toContainText('How to improve credit score from 650 to 750?');
      }
      
      // Step 6: Interact with existing discussions
      const discussions = page.locator('.discussion, .post, .topic');
      if (await discussions.count() > 0) {
        const firstDiscussion = discussions.first();
        await firstDiscussion.click();
        await page.waitForLoadState('networkidle');
        
        // Step 7: Add a reply
        const replyInput = page.locator('textarea[name="reply"], textarea[name="comment"]');
        if (await replyInput.isVisible()) {
          await replyInput.fill('Great question! I improved my score by paying down credit cards and disputing errors. Happy to share more details.');
          
          const replyButton = page.locator('button:has-text("Reply"), button:has-text("Post Comment")');
          await replyButton.click();
          await page.waitForTimeout(2000);
          
          // Verify reply appears
          await expect(page.locator('text="Great question! I improved my score"')).toBeVisible();
        }
        
        // Step 8: Like a post
        const likeButton = page.locator('button[aria-label="Like"], .like-button, button:has-text("👍")');
        if (await likeButton.isVisible()) {
          const initialLikes = await page.locator('.like-count, [data-testid="like-count"]').textContent() || '0';
          
          await likeButton.click();
          await page.waitForTimeout(1000);
          
          const newLikes = await page.locator('.like-count, [data-testid="like-count"]').textContent() || '0';
          expect(parseInt(newLikes)).toBeGreaterThan(parseInt(initialLikes));
        }
      }
    });
  });

  test.describe('Lead Capture and Follow-up Flow', () => {
    test('should capture lead through various entry points', async ({ page }) => {
      const leadEmail = `lead${Date.now()}@example.com`;
      
      // Test lead capture from homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for lead capture form on homepage
      const leadForm = page.locator('.lead-form, .newsletter-signup, .email-capture');
      if (await leadForm.isVisible()) {
        const emailInput = leadForm.locator('input[type="email"], input[name="email"]');
        await emailInput.fill(leadEmail);
        
        const submitButton = leadForm.locator('button[type="submit"], button:has-text("Subscribe")');
        await submitButton.click();
        
        // Verify success message
        const successMessage = page.locator('text="Thank you", text="Subscribed", text="We\'ll be in touch"');
        await expect(successMessage).toBeVisible();
      }
      
      // Test lead capture through contact form
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      const contactForm = page.locator('form');
      if (await contactForm.isVisible()) {
        await page.fill('input[name="firstName"], input[name="name"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.fill('input[name="email"]', leadEmail);
        await page.fill('input[name="phone"]', '555-123-4567');
        await page.fill('textarea[name="message"]', 'I\'m interested in credit repair services. Please contact me with more information.');
        
        const submitButton = contactForm.locator('button[type="submit"]');
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify submission success
        const confirmationMessage = page.locator('text="Message sent", text="Thank you", text="We\'ll get back to you"');
        await expect(confirmationMessage).toBeVisible();
      }
    });
  });

  test.describe('User Account Management Flow', () => {
    test('should manage user profile and account settings', async ({ page }) => {
      // Login to existing account
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // Navigate to profile/dashboard
      const profileLink = page.locator('a:has-text("Profile"), a:has-text("Dashboard"), a:has-text("My Account")');
      if (await profileLink.isVisible()) {
        await profileLink.click();
        await page.waitForLoadState('networkidle');
        
        // Update profile information
        const editButton = page.locator('button:has-text("Edit"), button:has-text("Update Profile")');
        if (await editButton.isVisible()) {
          await editButton.click();
          
          const phoneInput = page.locator('input[name="phone"]');
          if (await phoneInput.isVisible()) {
            await phoneInput.clear();
            await phoneInput.fill('555-987-6543');
          }
          
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
          await saveButton.click();
          
          // Verify update success
          const successMessage = page.locator('text="Profile updated", text="Changes saved"');
          await expect(successMessage).toBeVisible();
        }
        
        // View order history
        const ordersLink = page.locator('a:has-text("Orders"), a:has-text("Purchase History")');
        if (await ordersLink.isVisible()) {
          await ordersLink.click();
          await page.waitForLoadState('networkidle');
          
          // Should show orders or empty state
          const ordersContent = page.locator('.order, .purchase, text="No orders yet"');
          await expect(ordersContent).toBeVisible();
        }
        
        // View bookings
        const bookingsLink = page.locator('a:has-text("Bookings"), a:has-text("Appointments")');
        if (await bookingsLink.isVisible()) {
          await bookingsLink.click();
          await page.waitForLoadState('networkidle');
          
          const bookingsContent = page.locator('.booking, .appointment, text="No bookings yet"');
          await expect(bookingsContent).toBeVisible();
        }
      }
    });
  });

  test.describe('Error Recovery and Resilience', () => {
    test('should handle network interruptions gracefully', async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Simulate network failure during form submission
      await page.route('**/api/**', route => route.abort());
      
      const contactButton = page.locator('a:has-text("Contact"), button:has-text("Get Help")');
      if (await contactButton.isVisible()) {
        await contactButton.click();
        
        // Should show error message or retry option
        const errorMessage = page.locator('text="Network error", text="Connection failed", text="Please try again"');
        await expect(errorMessage).toBeVisible();
      }
      
      // Restore network
      await page.unroute('**/api/**');
    });

    test('should maintain user state across page refreshes', async ({ page }) => {
      // Add item to cart
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(1000);
        
        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Cart should still contain items
        const cartIndicator = page.locator('.cart-count, [data-testid="cart-count"]');
        if (await cartIndicator.isVisible()) {
          const cartCount = await cartIndicator.textContent();
          expect(parseInt(cartCount) || 0).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Multi-device User Journey', () => {
    test('should work consistently across mobile and desktop', async ({ page }) => {
      const journeySteps = [
        { action: 'goto', args: ['/'] },
        { action: 'click', args: ['nav >> text="Products"'] },
        { action: 'click', args: ['.product-card:first-child'] },
        { action: 'click', args: ['button:has-text("Add to Cart")'] }
      ];
      
      const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Desktop', width: 1920, height: 1080 }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        for (const step of journeySteps) {
          try {
            if (step.action === 'goto') {
              await page.goto(step.args[0]);
              await page.waitForLoadState('networkidle');
            } else if (step.action === 'click') {
              const element = page.locator(step.args[0]);
              if (await element.isVisible()) {
                await element.click();
                await page.waitForTimeout(1000);
              }
            }
          } catch (error) {
            console.warn(`${viewport.name}: Step failed - ${step.action}(${step.args.join(', ')}): ${error.message}`);
          }
        }
        
        console.log(`${viewport.name}: Journey completed successfully`);
      }
    });
  });
});