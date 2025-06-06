// QA/scripts/k6/load-test.js
// Sustained Load Testing for Credit Gyems Academy
// Tests normal traffic patterns and sustained user activity

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend, Gauge } from 'k6/metrics';
import { randomString, randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:3000';

// Custom metrics for Credit Gyems Academy specific scenarios
const userRegistrations = new Counter('credit_gyems_user_registrations');
const productPurchases = new Counter('credit_gyems_product_purchases');
const consultationBookings = new Counter('credit_gyems_consultation_bookings');
const communityPosts = new Counter('credit_gyems_community_posts');
const leadCaptures = new Counter('credit_gyems_lead_captures');
const creditScoreChecks = new Counter('credit_gyems_credit_score_checks');
const loginDuration = new Trend('credit_gyems_login_duration');
const purchaseDuration = new Trend('credit_gyems_purchase_duration');
const bookingDuration = new Trend('credit_gyems_booking_duration');
const activeUsers = new Gauge('credit_gyems_active_users');

// Test configuration for load testing
export const options = {
  stages: [
    // Warm up
    { duration: '2m', target: 10 },    // Ramp up to 10 users
    { duration: '5m', target: 10 },    // Stay at 10 users
    
    // Load increase
    { duration: '3m', target: 25 },    // Ramp up to 25 users
    { duration: '10m', target: 25 },   // Stay at 25 users (normal traffic)
    
    // Peak hours simulation
    { duration: '2m', target: 50 },    // Ramp up to 50 users
    { duration: '15m', target: 50 },   // Stay at 50 users (peak traffic)
    
    // Evening traffic
    { duration: '3m', target: 75 },    // Ramp up to 75 users
    { duration: '10m', target: 75 },   // Stay at 75 users (evening peak)
    
    // Cool down
    { duration: '2m', target: 25 },    // Scale back down
    { duration: '5m', target: 25 },    // Maintain reduced load
    { duration: '2m', target: 0 },     // Ramp down to 0
  ],
  
  thresholds: {
    // Overall performance thresholds
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],  // 95% under 2s, 99% under 5s
    http_req_failed: ['rate<0.05'],                    // Error rate under 5%
    
    // Credit Gyems specific thresholds
    credit_gyems_login_duration: ['p(95)<1500'],       // Login under 1.5s
    credit_gyems_purchase_duration: ['p(95)<3000'],    // Purchase under 3s
    credit_gyems_booking_duration: ['p(95)<2000'],     // Booking under 2s
    
    // Business metrics thresholds
    credit_gyems_user_registrations: ['count>0'],      // Should have registrations
    credit_gyems_product_purchases: ['count>0'],       // Should have purchases
    credit_gyems_consultation_bookings: ['count>0'],   // Should have bookings
  },
};

// Test data for Credit Gyems Academy
const testProducts = [
  { id: '000000000000000000000001', name: 'Credit Repair Master Guide', price: 49.99, type: 'ebook' },
  { id: '000000000000000000000002', name: 'Financial Freedom Blueprint', price: 299.99, type: 'course' },
  { id: '000000000000000000000003', name: 'Credit Score Workbook', price: 29.99, type: 'physical' },
  { id: '000000000000000000000004', name: 'Debt Elimination Strategy', price: 89.99, type: 'ebook' },
  { id: '000000000000000000000005', name: 'Investment Basics Course', price: 199.99, type: 'course' }
];

const testServices = [
  { id: '000000000000000000000001', name: 'Credit Repair Consultation', price: 149.00, duration: 60 },
  { id: '000000000000000000000002', name: 'Financial Planning Session', price: 199.00, duration: 90 },
  { id: '000000000000000000000003', name: 'Debt Counseling', price: 99.00, duration: 45 },
  { id: '000000000000000000000004', name: 'Investment Strategy Review', price: 249.00, duration: 120 }
];

const creditScoreRanges = [
  { min: 300, max: 579, category: 'Poor' },
  { min: 580, max: 669, category: 'Fair' },
  { min: 670, max: 739, category: 'Good' },
  { min: 740, max: 799, category: 'Very Good' },
  { min: 800, max: 850, category: 'Excellent' }
];

const discussionTopics = [
  'How I improved my credit score by 200 points',
  'Best credit cards for rebuilding credit',
  'Dealing with debt collectors - success stories',
  'Student loan forgiveness options in 2024',
  'First-time home buyer with low credit score',
  'Credit repair vs credit monitoring services',
  'Building credit from scratch at 18',
  'Bankruptcy recovery timeline and tips'
];

// Stripe test cards for different scenarios
const stripeTestCards = {
  success: {
    number: '4242424242424242',
    exp_month: '12',
    exp_year: '2025',
    cvc: '123'
  },
  decline: {
    number: '4000000000000002',
    exp_month: '12',
    exp_year: '2025',
    cvc: '123'
  },
  insufficient_funds: {
    number: '4000000000009995',
    exp_month: '12',
    exp_year: '2025',
    cvc: '123'
  }
};

// Helper functions
function generateUser() {
  const timestamp = Date.now();
  const random = randomString(5);
  return {
    firstName: randomItem(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Amanda']),
    lastName: randomItem(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']),
    email: `loadtest_${timestamp}_${random}@creditgyemstest.com`,
    password: 'LoadTest123!',
    phone: `555-${randomIntBetween(100, 999)}-${randomIntBetween(1000, 9999)}`,
    creditScore: randomIntBetween(300, 850)
  };
}

function registerUser() {
  const user = generateUser();
  
  const payload = JSON.stringify(user);
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'register' },
  };
  
  const response = http.post(`${BASE_URL}/api/auth/register`, payload, params);
  
  const success = check(response, {
    'registration successful': (r) => r.status === 200 || r.status === 201,
    'token received': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (success) {
    userRegistrations.add(1);
    try {
      const responseData = JSON.parse(response.body);
      return { ...user, token: responseData.token, userId: responseData.user?.id };
    } catch {
      return null;
    }
  }
  
  return null;
}

function loginUser(email, password) {
  const payload = JSON.stringify({ email, password });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'login' },
  };
  
  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  loginDuration.add(Date.now() - startTime);
  
  const success = check(response, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (success) {
    try {
      const responseData = JSON.parse(response.body);
      return responseData.token;
    } catch {
      return null;
    }
  }
  
  return null;
}

function browseProducts(token) {
  const params = {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    tags: { name: 'browse_products' },
  };
  
  // List all products
  const listResponse = http.get(`${BASE_URL}/api/products`, params);
  check(listResponse, {
    'products list loaded': (r) => r.status === 200,
  });
  
  // View random product details
  const product = randomItem(testProducts);
  const detailResponse = http.get(`${BASE_URL}/api/products/${product.id}`, params);
  check(detailResponse, {
    'product details loaded': (r) => r.status === 200,
  });
  
  // Search products
  const searchTerm = randomItem(['credit', 'debt', 'financial', 'investment', 'score']);
  const searchResponse = http.get(`${BASE_URL}/api/products?search=${searchTerm}`, params);
  check(searchResponse, {
    'product search works': (r) => r.status === 200,
  });
  
  return product;
}

function purchaseProduct(token, product) {
  if (!token) return false;
  
  const orderData = {
    items: [{
      productId: product.id,
      quantity: 1,
      price: product.price
    }],
    paymentMethod: {
      type: 'card',
      card: randomIntBetween(1, 10) <= 8 ? stripeTestCards.success : stripeTestCards.decline
    },
    totalAmount: product.price
  };
  
  const payload = JSON.stringify(orderData);
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    tags: { name: 'purchase_product' },
  };
  
  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/orders`, payload, params);
  purchaseDuration.add(Date.now() - startTime);
  
  const success = check(response, {
    'purchase successful': (r) => r.status === 200 || r.status === 201,
    'order created': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body._id !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (success) {
    productPurchases.add(1);
  }
  
  return success;
}

function bookConsultation(token) {
  if (!token) return false;
  
  const service = randomItem(testServices);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + randomIntBetween(1, 14));
  futureDate.setHours(randomIntBetween(9, 17), 0, 0, 0);
  
  const bookingData = {
    serviceId: service.id,
    startTime: futureDate.toISOString(),
    notes: `Load test booking for ${service.name}. Looking forward to improving my credit situation.`
  };
  
  const payload = JSON.stringify(bookingData);
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    tags: { name: 'book_consultation' },
  };
  
  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/bookings`, payload, params);
  bookingDuration.add(Date.now() - startTime);
  
  const success = check(response, {
    'booking successful': (r) => r.status === 200 || r.status === 201,
    'booking created': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.booking && body.booking._id !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (success) {
    consultationBookings.add(1);
  }
  
  return success;
}

function engageWithCommunity(token) {
  if (!token) return false;
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    tags: { name: 'community_engagement' },
  };
  
  // Browse discussions
  const listResponse = http.get(`${BASE_URL}/api/community/discussions`, params);
  check(listResponse, {
    'discussions loaded': (r) => r.status === 200,
  });
  
  // 30% chance to create a new discussion
  if (randomIntBetween(1, 10) <= 3) {
    const topic = randomItem(discussionTopics);
    const discussionData = {
      title: topic,
      content: `This is a load test discussion about ${topic.toLowerCase()}. I'm sharing my experience and looking for advice from the community.`,
      category: randomItem(['credit_repair', 'debt_management', 'financial_planning', 'success_stories'])
    };
    
    const createParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      tags: { name: 'create_discussion' },
    };
    
    const createResponse = http.post(`${BASE_URL}/api/community/discussions`, JSON.stringify(discussionData), createParams);
    const created = check(createResponse, {
      'discussion created': (r) => r.status === 200 || r.status === 201,
    });
    
    if (created) {
      communityPosts.add(1);
    }
  }
  
  return true;
}

function checkCreditScore(token) {
  if (!token) return false;
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    tags: { name: 'credit_score_check' },
  };
  
  const response = http.get(`${BASE_URL}/api/auth/profile`, params);
  const success = check(response, {
    'profile loaded': (r) => r.status === 200,
  });
  
  if (success) {
    creditScoreChecks.add(1);
  }
  
  return success;
}

function captureLeadThroughContact() {
  const leadData = {
    firstName: randomItem(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily']),
    lastName: randomItem(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones']),
    email: `lead_${Date.now()}_${randomString(4)}@example.com`,
    phone: `555-${randomIntBetween(100, 999)}-${randomIntBetween(1000, 9999)}`,
    subject: 'Interested in Credit Repair Services',
    message: 'I am interested in learning more about your credit repair services. My current score is around ' + randomIntBetween(300, 650) + ' and I would like to improve it.'
  };
  
  const payload = JSON.stringify(leadData);
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'lead_capture' },
  };
  
  const response = http.post(`${BASE_URL}/api/contact`, payload, params);
  const success = check(response, {
    'lead captured': (r) => r.status === 200 || r.status === 201,
  });
  
  if (success) {
    leadCaptures.add(1);
  }
  
  return success;
}

// Main test scenarios
export default function() {
  activeUsers.add(1);
  
  // Determine user behavior based on realistic patterns
  const userBehavior = randomIntBetween(1, 100);
  
  if (userBehavior <= 20) {
    // 20% - New user registration and exploration
    group('New User Journey', () => {
      const user = registerUser();
      if (user && user.token) {
        sleep(randomIntBetween(2, 5)); // Reading welcome message
        
        // Browse products
        const product = browseProducts(user.token);
        sleep(randomIntBetween(3, 8)); // Considering purchase
        
        // 40% chance to make a purchase
        if (randomIntBetween(1, 10) <= 4) {
          purchaseProduct(user.token, product);
          sleep(randomIntBetween(1, 3)); // Processing purchase
        }
        
        // Check community
        engageWithCommunity(user.token);
        sleep(randomIntBetween(2, 6)); // Reading discussions
      }
    });
    
  } else if (userBehavior <= 45) {
    // 25% - Returning user browsing and purchasing
    group('Returning User Purchase Journey', () => {
      // Simulate existing user login
      const existingUser = generateUser();
      const token = loginUser(existingUser.email, existingUser.password);
      
      if (token) {
        sleep(randomIntBetween(1, 3)); // Dashboard review
        
        // Browse products with higher purchase intent
        const product = browseProducts(token);
        sleep(randomIntBetween(2, 5)); // Product evaluation
        
        // 70% chance to purchase (returning users more likely)
        if (randomIntBetween(1, 10) <= 7) {
          purchaseProduct(token, product);
          sleep(randomIntBetween(1, 2));
        }
        
        // Check credit score
        checkCreditScore(token);
        sleep(randomIntBetween(1, 3));
      }
    });
    
  } else if (userBehavior <= 65) {
    // 20% - Users booking consultations
    group('Consultation Booking Journey', () => {
      const user = registerUser();
      if (user && user.token) {
        sleep(randomIntBetween(2, 4)); // Account setup
        
        // Book consultation
        bookConsultation(user.token);
        sleep(randomIntBetween(1, 3)); // Booking confirmation review
        
        // Often purchase related products
        if (randomIntBetween(1, 10) <= 6) {
          const product = browseProducts(user.token);
          sleep(randomIntBetween(2, 4));
          purchaseProduct(user.token, product);
        }
      }
    });
    
  } else if (userBehavior <= 85) {
    // 20% - Community engagement users
    group('Community Engagement Journey', () => {
      const user = generateUser();
      const token = loginUser(user.email, user.password);
      
      if (token) {
        sleep(randomIntBetween(1, 2));
        
        // Primary focus on community
        engageWithCommunity(token);
        sleep(randomIntBetween(5, 12)); // Extended community browsing
        
        // Occasional product interest
        if (randomIntBetween(1, 10) <= 3) {
          browseProducts(token);
          sleep(randomIntBetween(3, 6));
        }
      }
    });
    
  } else {
    // 15% - Lead capture (anonymous users)
    group('Lead Capture Journey', () => {
      // Browse products without account
      browseProducts(null);
      sleep(randomIntBetween(3, 8)); // Anonymous browsing
      
      // Contact form submission
      captureLeadThroughContact();
      sleep(randomIntBetween(1, 2));
      
      // Some convert to registration
      if (randomIntBetween(1, 10) <= 3) {
        const user = registerUser();
        if (user && user.token) {
          sleep(randomIntBetween(2, 4));
          browseProducts(user.token);
        }
      }
    });
  }
  
  activeUsers.add(-1);
  
  // Realistic user session pause
  sleep(randomIntBetween(1, 3));
}

// Test lifecycle functions
export function setup() {
  console.log('🚀 Starting Credit Gyems Academy Load Test');
  console.log(`📊 Target: ${BASE_URL}`);
  console.log(`⏱️  Duration: ~1 hour sustained load test`);
  console.log(`👥 Peak Users: 75 concurrent users`);
  
  // Verify backend is accessible
  const healthCheck = http.get(`${BASE_URL}/api/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`Backend health check failed: ${healthCheck.status}`);
  }
  
  console.log('✅ Backend health check passed');
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = Date.now() - data.startTime;
  console.log(`\n🏁 Load test completed in ${Math.round(duration / 1000)} seconds`);
}

// Enhanced reporting
export function handleSummary(data) {
  const htmlReportPath = '../../../test-reports/k6-load-test-report.html';
  const jsonReportPath = '../../../test-reports/k6-load-test-results.json';
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [htmlReportPath]: htmlReport(data),
    [jsonReportPath]: JSON.stringify(data, null, 2),
    '../../../test-reports/k6-load-test-summary.json': JSON.stringify({
      testType: 'load_test',
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: data.metrics.http_reqs ? data.metrics.http_reqs.count : 0,
        errorRate: data.metrics.http_req_failed ? data.metrics.http_req_failed.rate : 0,
        avgResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.avg : 0,
        p95ResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.p95 : 0,
        p99ResponseTime: data.metrics.http_req_duration ? data.metrics.http_req_duration.p99 : 0,
        peakUsers: 75,
        businessMetrics: {
          userRegistrations: data.metrics.credit_gyems_user_registrations ? data.metrics.credit_gyems_user_registrations.count : 0,
          productPurchases: data.metrics.credit_gyems_product_purchases ? data.metrics.credit_gyems_product_purchases.count : 0,
          consultationBookings: data.metrics.credit_gyems_consultation_bookings ? data.metrics.credit_gyems_consultation_bookings.count : 0,
          communityPosts: data.metrics.credit_gyems_community_posts ? data.metrics.credit_gyems_community_posts.count : 0,
          leadCaptures: data.metrics.credit_gyems_lead_captures ? data.metrics.credit_gyems_lead_captures.count : 0,
          creditScoreChecks: data.metrics.credit_gyems_credit_score_checks ? data.metrics.credit_gyems_credit_score_checks.count : 0
        }
      }
    }, null, 2)
  };
}