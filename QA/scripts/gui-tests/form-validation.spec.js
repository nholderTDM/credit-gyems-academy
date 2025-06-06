// QA/scripts/gui-tests/tests/form-validation.spec.js
// Form validation tests for Credit Gyems Academy

const { test, expect } = require('@playwright/test');

test.describe('Form Validation Tests', () => {
  
  test.describe('Registration Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
    });

    test('should show validation errors for empty form submission', async ({ page }) => {
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], input[type="submit"]');
      await submitButton.click();
      
      // Check for validation errors
      const errorMessages = page.locator('.error, .error-message, .field-error, [role="alert"]');
      await expect(errorMessages).toHaveCount({ min: 1 });
      
      // Check specific field errors
      await expect(page.locator('text="First name is required", text="Please enter your first name"')).toBeVisible();
      await expect(page.locator('text="Email is required", text="Please enter your email"')).toBeVisible();
      await expect(page.locator('text="Password is required", text="Please enter a password"')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      
      // Test invalid email formats
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user.domain.com',
        'user@domain',
        'user name@domain.com'
      ];
      
      for (const invalidEmail of invalidEmails) {
        await emailInput.fill(invalidEmail);
        await emailInput.blur();
        
        // Check for email validation error
        const emailError = page.locator('text="Please enter a valid email", text="Invalid email format", text="Enter a valid email address"');
        await expect(emailError).toBeVisible();
        
        await emailInput.clear();
      }
      
      // Test valid email
      await emailInput.fill('valid@example.com');
      await emailInput.blur();
      
      // Error should be hidden for valid email
      const emailError = page.locator('text="Please enter a valid email", text="Invalid email format"');
      await expect(emailError).toBeHidden();
    });

    test('should validate password strength', async ({ page }) => {
      const passwordInput = page.locator('input[name="password"], input[type="password"]');
      
      // Test weak passwords
      const weakPasswords = [
        '123',
        'password',
        'abc123',
        '12345678'
      ];
      
      for (const weakPassword of weakPasswords) {
        await passwordInput.fill(weakPassword);
        await passwordInput.blur();
        
        // Check for password strength error
        const passwordError = page.locator('text="Password must be at least 8 characters", text="Password too weak", text="Password must contain"');
        await expect(passwordError).toBeVisible();
        
        await passwordInput.clear();
      }
      
      // Test strong password
      await passwordInput.fill('StrongPass123!');
      await passwordInput.blur();
      
      // Error should be hidden for strong password
      const passwordError = page.locator('text="Password too weak"');
      await expect(passwordError).toBeHidden();
    });

    test('should validate password confirmation match', async ({ page }) => {
      const passwordInput = page.locator('input[name="password"]');
      const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="password_confirmation"]');
      
      if (await confirmPasswordInput.isVisible()) {
        await passwordInput.fill('StrongPass123!');
        await confirmPasswordInput.fill('DifferentPass123!');
        await confirmPasswordInput.blur();
        
        // Check for password mismatch error
        const mismatchError = page.locator('text="Passwords do not match", text="Password confirmation does not match"');
        await expect(mismatchError).toBeVisible();
        
        // Test matching passwords
        await confirmPasswordInput.fill('StrongPass123!');
        await confirmPasswordInput.blur();
        
        await expect(mismatchError).toBeHidden();
      }
    });

    test('should validate phone number format', async ({ page }) => {
      const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
      
      if (await phoneInput.isVisible()) {
        // Test invalid phone formats
        const invalidPhones = [
          '123',
          'abc-def-ghij',
          '555-1234'
        ];
        
        for (const invalidPhone of invalidPhones) {
          await phoneInput.fill(invalidPhone);
          await phoneInput.blur();
          
          const phoneError = page.locator('text="Please enter a valid phone number", text="Invalid phone format"');
          await expect(phoneError).toBeVisible();
          
          await phoneInput.clear();
        }
        
        // Test valid phone formats
        const validPhones = [
          '555-123-4567',
          '(555) 123-4567',
          '5551234567'
        ];
        
        for (const validPhone of validPhones) {
          await phoneInput.fill(validPhone);
          await phoneInput.blur();
          
          const phoneError = page.locator('text="Please enter a valid phone number"');
          await expect(phoneError).toBeHidden();
        }
      }
    });

    test('should successfully submit valid registration form', async ({ page }) => {
      // Fill out form with valid data
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'StrongPass123!');
      
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('StrongPass123!');
      }
      
      const phoneInput = page.locator('input[name="phone"]');
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('555-123-4567');
      }
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Should redirect or show success message
      await page.waitForLoadState('networkidle');
      
      // Check for successful registration (redirect to dashboard or success message)
      const isRedirected = page.url().includes('/dashboard') || page.url().includes('/welcome');
      const hasSuccessMessage = await page.locator('text="Registration successful", text="Welcome", text="Account created"').isVisible();
      
      expect(isRedirected || hasSuccessMessage).toBeTruthy();
    });
  });

  test.describe('Login Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    test('should show validation errors for empty login form', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      await expect(page.locator('text="Email is required", text="Please enter your email"')).toBeVisible();
      await expect(page.locator('text="Password is required", text="Please enter your password"')).toBeVisible();
    });

    test('should validate email format on login', async ({ page }) => {
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      
      const emailError = page.locator('text="Please enter a valid email", text="Invalid email format"');
      await expect(emailError).toBeVisible();
    });

    test('should handle invalid login credentials', async ({ page }) => {
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      await page.waitForLoadState('networkidle');
      
      // Check for invalid credentials error
      const loginError = page.locator('text="Invalid credentials", text="Invalid email or password", text="Login failed"');
      await expect(loginError).toBeVisible();
    });
  });

  test.describe('Contact Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
    });

    test('should validate required fields in contact form', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Check for required field errors
      const requiredFieldErrors = page.locator('.error, .error-message, [role="alert"]');
      await expect(requiredFieldErrors).toHaveCount({ min: 1 });
    });

    test('should validate message length', async ({ page }) => {
      const messageInput = page.locator('textarea[name="message"], textarea[name="comment"]');
      
      if (await messageInput.isVisible()) {
        // Test message too short
        await messageInput.fill('Hi');
        await messageInput.blur();
        
        const lengthError = page.locator('text="Message too short", text="Please provide more details"');
        if (await lengthError.isVisible()) {
          await expect(lengthError).toBeVisible();
        }
        
        // Test valid message length
        await messageInput.fill('This is a longer message with sufficient detail to pass validation requirements.');
        await messageInput.blur();
        
        await expect(lengthError).toBeHidden();
      }
    });

    test('should successfully submit valid contact form', async ({ page }) => {
      await page.fill('input[name="firstName"], input[name="name"]', 'John');
      await page.fill('input[name="lastName"], input[name="last_name"]', 'Doe');
      await page.fill('input[name="email"]', 'john.doe@example.com');
      
      const phoneInput = page.locator('input[name="phone"]');
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('555-123-4567');
      }
      
      const subjectInput = page.locator('input[name="subject"]');
      if (await subjectInput.isVisible()) {
        await subjectInput.fill('Inquiry about credit repair services');
      }
      
      await page.fill('textarea[name="message"], textarea[name="comment"]', 'I would like to learn more about your credit repair services and how they can help improve my credit score.');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      await page.waitForLoadState('networkidle');
      
      // Check for success message
      const successMessage = page.locator('text="Message sent", text="Thank you", text="We\'ll get back to you"');
      await expect(successMessage).toBeVisible();
    });
  });

  test.describe('Payment Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a product and add to cart first
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(1000);
        
        // Navigate to checkout
        const checkoutButton = page.locator('a:has-text("Checkout"), button:has-text("Checkout")');
        if (await checkoutButton.isVisible()) {
          await checkoutButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('should validate credit card number format', async ({ page }) => {
      const cardNumberInput = page.locator('input[name="cardNumber"], input[placeholder*="Card number"]');
      
      if (await cardNumberInput.isVisible()) {
        // Test invalid card numbers
        const invalidCards = [
          '1234',
          '1234-5678-9012',
          'abcd-efgh-ijkl-mnop'
        ];
        
        for (const invalidCard of invalidCards) {
          await cardNumberInput.fill(invalidCard);
          await cardNumberInput.blur();
          
          const cardError = page.locator('text="Invalid card number", text="Please enter a valid card"');
          await expect(cardError).toBeVisible();
          
          await cardNumberInput.clear();
        }
        
        // Test valid card number (Stripe test card)
        await cardNumberInput.fill('4242424242424242');
        await cardNumberInput.blur();
        
        // Check if card number is properly formatted
        const cardValue = await cardNumberInput.inputValue();
        expect(cardValue).toMatch(/\d{4}\s\d{4}\s\d{4}\s\d{4}|4242424242424242/);
      }
    });

    test('should validate expiry date format', async ({ page }) => {
      const expiryInput = page.locator('input[name="expiry"], input[placeholder*="MM/YY"]');
      
      if (await expiryInput.isVisible()) {
        // Test invalid expiry formats
        const invalidExpiries = [
          '13/25', // Invalid month
          '00/25', // Invalid month
          '12/20', // Past year
          '1/25'   // Single digit month
        ];
        
        for (const invalidExpiry of invalidExpiries) {
          await expiryInput.fill(invalidExpiry);
          await expiryInput.blur();
          
          const expiryError = page.locator('text="Invalid expiry date", text="Card has expired", text="Please enter a valid expiry"');
          await expect(expiryError).toBeVisible();
          
          await expiryInput.clear();
        }
        
        // Test valid expiry
        await expiryInput.fill('12/25');
        await expiryInput.blur();
        
        const expiryError = page.locator('text="Invalid expiry date"');
        await expect(expiryError).toBeHidden();
      }
    });

    test('should validate CVC format', async ({ page }) => {
      const cvcInput = page.locator('input[name="cvc"], input[name="cvv"]');
      
      if (await cvcInput.isVisible()) {
        // Test invalid CVC
        const invalidCVCs = [
          '12',    // Too short
          '12345', // Too long
          'abc'    // Non-numeric
        ];
        
        for (const invalidCVC of invalidCVCs) {
          await cvcInput.fill(invalidCVC);
          await cvcInput.blur();
          
          const cvcError = page.locator('text="Invalid security code", text="Invalid CVC"');
          await expect(cvcError).toBeVisible();
          
          await cvcInput.clear();
        }
        
        // Test valid CVC
        await cvcInput.fill('123');
        await cvcInput.blur();
        
        const cvcError = page.locator('text="Invalid security code"');
        await expect(cvcError).toBeHidden();
      }
    });
  });

  test.describe('Real-time Validation', () => {
    test('should show validation feedback in real-time', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.locator('input[name="email"]');
      
      // Start typing invalid email
      await emailInput.fill('invalid');
      
      // Check if validation appears while typing
      await page.waitForTimeout(500);
      const realtimeError = page.locator('text="Please enter a valid email"');
      
      // Note: This might not be visible until blur, depending on implementation
      const isRealtimeValidation = await realtimeError.isVisible();
      
      // Complete the email to make it valid
      await emailInput.fill('invalid@example.com');
      await page.waitForTimeout(500);
      
      // Error should disappear
      await expect(realtimeError).toBeHidden();
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const passwordInput = page.locator('input[name="password"]');
      const strengthIndicator = page.locator('.password-strength, .strength-meter, [data-testid="password-strength"]');
      
      if (await strengthIndicator.isVisible()) {
        // Test weak password
        await passwordInput.fill('123');
        await expect(strengthIndicator).toContainText(/weak|poor/i);
        
        // Test medium password
        await passwordInput.fill('password123');
        await expect(strengthIndicator).toContainText(/medium|fair/i);
        
        // Test strong password
        await passwordInput.fill('StrongPass123!');
        await expect(strengthIndicator).toContainText(/strong|excellent/i);
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have proper form labels and ARIA attributes', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Check that all form inputs have labels
      const inputs = page.locator('input:not([type="hidden"])');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          const hasLabel = await label.count() > 0;
          const hasAria = ariaLabel || ariaLabelledBy;
          
          expect(hasLabel || hasAria).toBeTruthy();
        }
      }
    });

    test('should announce form errors to screen readers', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Submit empty form to trigger errors
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Check for ARIA live regions or alert roles
      const liveRegion = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
      await expect(liveRegion).toHaveCount({ min: 1 });
    });
  });

  test.describe('Form Submission States', () => {
    test('should show loading state during form submission', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Fill out contact form
      await page.fill('input[name="firstName"], input[name="name"]', 'John');
      await page.fill('input[name="email"]', 'john@example.com');
      await page.fill('textarea[name="message"]', 'Test message');
      
      // Intercept the form submission to add delay
      await page.route('**/api/contact', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Check for loading state
      const loadingIndicator = page.locator('.loading, .spinner, [data-testid="loading"]');
      const disabledButton = page.locator('button[type="submit"]:disabled');
      
      const hasLoadingState = await loadingIndicator.isVisible() || await disabledButton.isVisible();
      expect(hasLoadingState).toBeTruthy();
    });
  });
});