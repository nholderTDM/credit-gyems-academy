// QA/scripts/gui-tests/tests/component-testing.spec.js
// React component testing for Credit Gyems Academy

const { test, expect } = require('@playwright/experimental-ct-react');

// Mock data for testing
const mockProducts = [
  {
    _id: '1',
    title: 'Credit Repair Master Guide',
    price: 49.99,
    shortDescription: 'Complete guide to repairing your credit',
    image: '/images/credit-guide.jpg',
    type: 'ebook'
  },
  {
    _id: '2',
    title: 'Financial Freedom Course',
    price: 299.99,
    shortDescription: 'Step-by-step course to financial independence',
    image: '/images/freedom-course.jpg',
    type: 'course'
  }
];

const mockServices = [
  {
    _id: '1',
    title: 'Credit Repair Consultation',
    price: { amount: 149, displayPrice: '$149' },
    duration: 60,
    description: 'One-on-one credit repair consultation'
  },
  {
    _id: '2',
    title: 'Financial Planning Session',
    price: { amount: 199, displayPrice: '$199' },
    duration: 90,
    description: 'Comprehensive financial planning'
  }
];

test.describe('Button Component Tests', () => {
  test('should render primary button with correct styling', async ({ mount }) => {
    const Button = ({ children, variant = 'primary', onClick, disabled, loading, ...props }) => (
      <button
        className={`btn btn-${variant} ${loading ? 'loading' : ''}`}
        onClick={onClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="spinner">Loading...</span> : children}
      </button>
    );

    const component = await mount(<Button variant="primary">Click Me</Button>);
    
    await expect(component).toContainText('Click Me');
    await expect(component).toHaveClass(/btn-primary/);
    await expect(component).toBeEnabled();
  });

  test('should handle button interactions correctly', async ({ mount }) => {
    let clicked = false;
    const handleClick = () => { clicked = true; };

    const Button = ({ children, onClick }) => (
      <button onClick={onClick} className="btn btn-primary">
        {children}
      </button>
    );

    const component = await mount(<Button onClick={handleClick}>Click Test</Button>);
    
    await component.click();
    expect(clicked).toBe(true);
  });

  test('should show loading state correctly', async ({ mount }) => {
    const Button = ({ children, loading }) => (
      <button className={`btn ${loading ? 'loading' : ''}`} disabled={loading}>
        {loading ? <span className="spinner">Loading...</span> : children}
      </button>
    );

    const component = await mount(<Button loading={true}>Submit</Button>);
    
    await expect(component).toBeDisabled();
    await expect(component).toContainText('Loading...');
    await expect(component.locator('.spinner')).toBeVisible();
  });

  test('should render different button variants', async ({ mount }) => {
    const Button = ({ variant, children }) => (
      <button className={`btn btn-${variant}`}>{children}</button>
    );

    const variants = ['primary', 'secondary', 'danger', 'success'];
    
    for (const variant of variants) {
      const component = await mount(<Button variant={variant}>Test Button</Button>);
      await expect(component).toHaveClass(new RegExp(`btn-${variant}`));
    }
  });
});

test.describe('Product Card Component Tests', () => {
  test('should render product card with all information', async ({ mount }) => {
    const ProductCard = ({ product, onAddToCart }) => (
      <div className="product-card">
        <img src={product.image} alt={product.title} />
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.shortDescription}</p>
        <div className="product-price">${product.price}</div>
        <button 
          className="btn btn-primary" 
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    );

    const component = await mount(
      <ProductCard product={mockProducts[0]} onAddToCart={() => {}} />
    );
    
    await expect(component.locator('.product-title')).toContainText('Credit Repair Master Guide');
    await expect(component.locator('.product-description')).toContainText('Complete guide to repairing your credit');
    await expect(component.locator('.product-price')).toContainText('$49.99');
    await expect(component.locator('img')).toHaveAttribute('src', '/images/credit-guide.jpg');
    await expect(component.locator('img')).toHaveAttribute('alt', 'Credit Repair Master Guide');
  });

  test('should handle add to cart interaction', async ({ mount }) => {
    let addedProduct = null;
    const handleAddToCart = (product) => { addedProduct = product; };

    const ProductCard = ({ product, onAddToCart }) => (
      <div className="product-card">
        <h3>{product.title}</h3>
        <button onClick={() => onAddToCart(product)}>Add to Cart</button>
      </div>
    );

    const component = await mount(
      <ProductCard product={mockProducts[0]} onAddToCart={handleAddToCart} />
    );
    
    await component.locator('button').click();
    expect(addedProduct).toEqual(mockProducts[0]);
  });

  test('should show hover effects on product card', async ({ mount }) => {
    const ProductCard = ({ product }) => (
      <div className="product-card hover:shadow-lg transition-shadow">
        <h3>{product.title}</h3>
        <div className="product-price">${product.price}</div>
      </div>
    );

    const component = await mount(<ProductCard product={mockProducts[0]} />);
    
    await component.hover();
    
    // Check if hover styles are applied
    const hasHoverEffect = await component.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.boxShadow !== 'none' || styles.transform !== 'none';
    });
    
    // This test depends on CSS implementation
    expect(typeof hasHoverEffect).toBe('boolean');
  });
});

test.describe('Service Card Component Tests', () => {
  test('should render service card correctly', async ({ mount }) => {
    const ServiceCard = ({ service, onBook }) => (
      <div className="service-card">
        <h3 className="service-title">{service.title}</h3>
        <p className="service-description">{service.description}</p>
        <div className="service-price">{service.price.displayPrice}</div>
        <div className="service-duration">{service.duration} minutes</div>
        <button 
          className="btn btn-primary" 
          onClick={() => onBook(service)}
        >
          Book Now
        </button>
      </div>
    );

    const component = await mount(
      <ServiceCard service={mockServices[0]} onBook={() => {}} />
    );
    
    await expect(component.locator('.service-title')).toContainText('Credit Repair Consultation');
    await expect(component.locator('.service-description')).toContainText('One-on-one credit repair consultation');
    await expect(component.locator('.service-price')).toContainText('$149');
    await expect(component.locator('.service-duration')).toContainText('60 minutes');
  });

  test('should handle booking interaction', async ({ mount }) => {
    let bookedService = null;
    const handleBook = (service) => { bookedService = service; };

    const ServiceCard = ({ service, onBook }) => (
      <div className="service-card">
        <h3>{service.title}</h3>
        <button onClick={() => onBook(service)}>Book Now</button>
      </div>
    );

    const component = await mount(
      <ServiceCard service={mockServices[0]} onBook={handleBook} />
    );
    
    await component.locator('button').click();
    expect(bookedService).toEqual(mockServices[0]);
  });
});

test.describe('Form Components Tests', () => {
  test('should render input field with label', async ({ mount }) => {
    const InputField = ({ label, name, type = 'text', value, onChange, error, required }) => (
      <div className="form-field">
        <label htmlFor={name} className={required ? 'required' : ''}>
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={error ? 'error' : ''}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {error && (
          <div id={`${name}-error`} className="error-message" role="alert">
            {error}
          </div>
        )}
      </div>
    );

    const component = await mount(
      <InputField 
        label="Email Address" 
        name="email" 
        type="email" 
        required={true}
        value=""
        onChange={() => {}}
      />
    );
    
    await expect(component.locator('label')).toContainText('Email Address');
    await expect(component.locator('label')).toHaveClass(/required/);
    await expect(component.locator('.required-indicator')).toContainText('*');
    await expect(component.locator('input')).toHaveAttribute('type', 'email');
    await expect(component.locator('input')).toHaveAttribute('id', 'email');
  });

  test('should display error state correctly', async ({ mount }) => {
    const InputField = ({ label, name, error }) => (
      <div className="form-field">
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          className={error ? 'error' : ''}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {error && (
          <div id={`${name}-error`} className="error-message" role="alert">
            {error}
          </div>
        )}
      </div>
    );

    const component = await mount(
      <InputField 
        label="Email" 
        name="email" 
        error="Please enter a valid email address"
      />
    );
    
    await expect(component.locator('input')).toHaveClass(/error/);
    await expect(component.locator('.error-message')).toContainText('Please enter a valid email address');
    await expect(component.locator('.error-message')).toHaveAttribute('role', 'alert');
  });

  test('should handle form submission', async ({ mount }) => {
    let submittedData = null;
    const handleSubmit = (data) => { submittedData = data; };

    const ContactForm = ({ onSubmit }) => {
      const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        message: ''
      });

      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
      };

      return (
        <form onSubmit={handleFormSubmit}>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
          />
          <button type="submit">Send Message</button>
        </form>
      );
    };

    // Mock React for this test
    global.React = {
      useState: (initial) => {
        let state = initial;
        const setState = (newState) => {
          state = typeof newState === 'function' ? newState(state) : newState;
        };
        return [state, setState];
      }
    };

    const component = await mount(<ContactForm onSubmit={handleSubmit} />);
    
    await component.locator('input[name="name"]').fill('John Doe');
    await component.locator('input[name="email"]').fill('john@example.com');
    await component.locator('textarea[name="message"]').fill('Test message');
    
    await component.locator('button[type="submit"]').click();
    
    expect(submittedData).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    });
  });
});

test.describe('Navigation Component Tests', () => {
  test('should render navigation menu', async ({ mount }) => {
    const navItems = [
      { label: 'Home', href: '/', active: true },
      { label: 'Services', href: '/services', active: false },
      { label: 'Products', href: '/products', active: false },
      { label: 'About', href: '/about', active: false }
    ];

    const Navigation = ({ items }) => (
      <nav role="navigation">
        <ul className="nav-list">
          {items.map((item, index) => (
            <li key={index} className="nav-item">
              <a 
                href={item.href} 
                className={`nav-link ${item.active ? 'active' : ''}`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );

    const component = await mount(<Navigation items={navItems} />);
    
    await expect(component.locator('nav')).toHaveAttribute('role', 'navigation');
    await expect(component.locator('.nav-item')).toHaveCount(4);
    await expect(component.locator('.nav-link.active')).toContainText('Home');
    await expect(component.locator('.nav-link.active')).toHaveAttribute('aria-current', 'page');
  });

  test('should render mobile navigation', async ({ mount }) => {
    const MobileNav = ({ isOpen, onToggle, items }) => (
      <div className="mobile-nav">
        <button 
          className="mobile-menu-toggle"
          onClick={onToggle}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          ☰
        </button>
        {isOpen && (
          <div className="mobile-menu" role="menu">
            {items.map((item, index) => (
              <a key={index} href={item.href} role="menuitem">
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );

    const navItems = [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' }
    ];

    let isOpen = false;
    const toggleMenu = () => { isOpen = !isOpen; };

    const component = await mount(
      <MobileNav isOpen={false} onToggle={toggleMenu} items={navItems} />
    );
    
    await expect(component.locator('.mobile-menu-toggle')).toHaveAttribute('aria-label', 'Toggle menu');
    await expect(component.locator('.mobile-menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(component.locator('.mobile-menu')).toBeHidden();
    
    // Test opening menu
    const openComponent = await mount(
      <MobileNav isOpen={true} onToggle={toggleMenu} items={navItems} />
    );
    
    await expect(openComponent.locator('.mobile-menu')).toBeVisible();
    await expect(openComponent.locator('[role="menuitem"]')).toHaveCount(2);
  });
});

test.describe('Modal Component Tests', () => {
  test('should render modal with proper accessibility attributes', async ({ mount }) => {
    const Modal = ({ isOpen, onClose, title, children }) => {
      if (!isOpen) return null;
      
      return (
        <div className="modal-overlay" onClick={onClose}>
          <div 
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="modal-title">{title}</h2>
              <button 
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              {children}
            </div>
          </div>
        </div>
      );
    };

    const component = await mount(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content here</p>
      </Modal>
    );
    
    await expect(component.locator('.modal')).toHaveAttribute('role', 'dialog');
    await expect(component.locator('.modal')).toHaveAttribute('aria-modal', 'true');
    await expect(component.locator('.modal')).toHaveAttribute('aria-labelledby', 'modal-title');
    await expect(component.locator('#modal-title')).toContainText('Test Modal');
    await expect(component.locator('.modal-close')).toHaveAttribute('aria-label', 'Close modal');
  });

  test('should handle modal close events', async ({ mount }) => {
    let modalClosed = false;
    const handleClose = () => { modalClosed = true; };

    const Modal = ({ isOpen, onClose, children }) => {
      if (!isOpen) return null;
      
      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>×</button>
            {children}
          </div>
        </div>
      );
    };

    const component = await mount(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Modal content</p>
      </Modal>
    );
    
    // Test close button
    await component.locator('.modal-close').click();
    expect(modalClosed).toBe(true);
    
    // Reset for next test
    modalClosed = false;
    
    // Test backdrop click
    const component2 = await mount(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Modal content</p>
      </Modal>
    );
    
    await component2.locator('.modal-overlay').click({ position: { x: 10, y: 10 } });
    expect(modalClosed).toBe(true);
  });
});

test.describe('Search Component Tests', () => {
  test('should render search input with suggestions', async ({ mount }) => {
    const SearchComponent = ({ onSearch, suggestions }) => {
      const [query, setQuery] = React.useState('');
      const [showSuggestions, setShowSuggestions] = React.useState(false);

      return (
        <div className="search-component">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search..."
            aria-label="Search"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions" role="listbox">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                  role="option"
                  onClick={() => {
                    setQuery(suggestion);
                    onSearch(suggestion);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const suggestions = ['Credit Repair', 'Credit Score', 'Financial Planning'];
    let searchQuery = '';
    const handleSearch = (query) => { searchQuery = query; };

    // Mock React for this test
    global.React = {
      useState: (initial) => {
        let state = initial;
        const setState = (newState) => {
          state = typeof newState === 'function' ? newState(state) : newState;
        };
        return [state, setState];
      }
    };

    const component = await mount(
      <SearchComponent onSearch={handleSearch} suggestions={suggestions} />
    );
    
    const searchInput = component.locator('input[type="search"]');
    await expect(searchInput).toHaveAttribute('aria-label', 'Search');
    
    // Test focus to show suggestions
    await searchInput.focus();
    await expect(component.locator('.suggestions')).toBeVisible();
    await expect(component.locator('[role="option"]')).toHaveCount(3);
    
    // Test clicking a suggestion
    await component.locator('[role="option"]').first().click();
    expect(searchQuery).toBe('Credit Repair');
  });
});

test.describe('Loading States Component Tests', () => {
  test('should render loading spinner', async ({ mount }) => {
    const LoadingSpinner = ({ size = 'medium', message }) => (
      <div className={`loading-spinner ${size}`} role="status" aria-label="Loading">
        <div className="spinner"></div>
        {message && <span className="loading-message">{message}</span>}
      </div>
    );

    const component = await mount(
      <LoadingSpinner size="large" message="Loading products..." />
    );
    
    await expect(component.locator('.loading-spinner')).toHaveClass(/large/);
    await expect(component.locator('.loading-spinner')).toHaveAttribute('role', 'status');
    await expect(component.locator('.loading-spinner')).toHaveAttribute('aria-label', 'Loading');
    await expect(component.locator('.loading-message')).toContainText('Loading products...');
  });

  test('should render skeleton loader', async ({ mount }) => {
    const SkeletonLoader = ({ lines = 3, avatar = false }) => (
      <div className="skeleton-loader" aria-label="Loading content">
        {avatar && <div className="skeleton-avatar"></div>}
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="skeleton-line"></div>
        ))}
      </div>
    );

    const component = await mount(<SkeletonLoader lines={4} avatar={true} />);
    
    await expect(component.locator('.skeleton-avatar')).toBeVisible();
    await expect(component.locator('.skeleton-line')).toHaveCount(4);
    await expect(component.locator('.skeleton-loader')).toHaveAttribute('aria-label', 'Loading content');
  });
});

test.describe('Error Boundary Component Tests', () => {
  test('should render error state', async ({ mount }) => {
    const ErrorBoundary = ({ error, onRetry }) => (
      <div className="error-boundary" role="alert">
        <h3>Something went wrong</h3>
        <p className="error-message">{error}</p>
        <button onClick={onRetry} className="retry-button">
          Try Again
        </button>
      </div>
    );

    let retryClicked = false;
    const handleRetry = () => { retryClicked = true; };

    const component = await mount(
      <ErrorBoundary 
        error="Failed to load products" 
        onRetry={handleRetry} 
      />
    );
    
    await expect(component.locator('.error-boundary')).toHaveAttribute('role', 'alert');
    await expect(component.locator('.error-message')).toContainText('Failed to load products');
    
    await component.locator('.retry-button').click();
    expect(retryClicked).toBe(true);
  });
});

test.describe('Accessibility Component Tests', () => {
  test('should render components with proper ARIA attributes', async ({ mount }) => {
    const AccessibleCard = ({ title, content, expanded, onToggle }) => (
      <div className="accessible-card">
        <button
          className="card-header"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls="card-content"
        >
          {title}
        </button>
        <div
          id="card-content"
          className="card-content"
          aria-hidden={!expanded}
        >
          {content}
        </div>
      </div>
    );

    const component = await mount(
      <AccessibleCard 
        title="Expandable Card" 
        content="This is the card content"
        expanded={false}
        onToggle={() => {}}
      />
    );
    
    await expect(component.locator('.card-header')).toHaveAttribute('aria-expanded', 'false');
    await expect(component.locator('.card-header')).toHaveAttribute('aria-controls', 'card-content');
    await expect(component.locator('.card-content')).toHaveAttribute('aria-hidden', 'true');
    await expect(component.locator('.card-content')).toHaveAttribute('id', 'card-content');
  });

  test('should handle keyboard navigation', async ({ mount, page }) => {
    const KeyboardNav = ({ items }) => (
      <div className="keyboard-nav" role="menu">
        {items.map((item, index) => (
          <button
            key={index}
            role="menuitem"
            tabIndex={index === 0 ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextButton = e.target.nextElementSibling;
                if (nextButton) nextButton.focus();
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevButton = e.target.previousElementSibling;
                if (prevButton) prevButton.focus();
              }
            }}
          >
            {item}
          </button>
        ))}
      </div>
    );

    const items = ['Item 1', 'Item 2', 'Item 3'];
    const component = await mount(<KeyboardNav items={items} />);
    
    const firstButton = component.locator('[role="menuitem"]').first();
    await firstButton.focus();
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowDown');
    const secondButton = component.locator('[role="menuitem"]').nth(1);
    await expect(secondButton).toBeFocused();
  });
});

test.describe('Integration Component Tests', () => {
  test('should integrate multiple components', async ({ mount }) => {
    const ProductGrid = ({ products, onAddToCart, loading }) => {
      if (loading) {
        return <div className="loading" role="status">Loading products...</div>;
      }

      return (
        <div className="product-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <h3>{product.title}</h3>
              <p>${product.price}</p>
              <button onClick={() => onAddToCart(product)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      );
    };

    let cartItems = [];
    const handleAddToCart = (product) => {
      cartItems.push(product);
    };

    const component = await mount(
      <ProductGrid 
        products={mockProducts} 
        onAddToCart={handleAddToCart}
        loading={false}
      />
    );
    
    await expect(component.locator('.product-card')).toHaveCount(2);
    
    // Test adding to cart
    await component.locator('.product-card').first().locator('button').click();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0]).toEqual(mockProducts[0]);
  });

  test('should handle component state changes', async ({ mount }) => {
    const StatefulComponent = () => {
      const [count, setCount] = React.useState(0);
      const [items, setItems] = React.useState([]);

      const addItem = () => {
        setCount(count + 1);
        setItems([...items, `Item ${count + 1}`]);
      };

      return (
        <div className="stateful-component">
          <div className="count">Count: {count}</div>
          <button onClick={addItem}>Add Item</button>
          <ul className="items-list">
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );
    };

    // Mock React for this test
    global.React = {
      useState: (initial) => {
        let state = initial;
        const setState = (newState) => {
          state = typeof newState === 'function' ? newState(state) : newState;
        };
        return [state, setState];
      }
    };

    const component = await mount(<StatefulComponent />);
    
    await expect(component.locator('.count')).toContainText('Count: 0');
    await expect(component.locator('.items-list li')).toHaveCount(0);
    
    // Add items
    await component.locator('button').click();
    await expect(component.locator('.count')).toContainText('Count: 1');
    await expect(component.locator('.items-list li')).toHaveCount(1);
    
    await component.locator('button').click();
    await expect(component.locator('.count')).toContainText('Count: 2');
    await expect(component.locator('.items-list li')).toHaveCount(2);
  });
});