// stress-test.js
// K6 Load and Stress Testing Script for Credit Gyems Academy
// Location: credit-gyems-academy/scripts/k6/
// 
// Installation:
// 1. Install K6: https://k6.io/docs/getting-started/installation/
// 2. Run: k6 run stress-test.js
// 3. For cloud results: k6 cloud stress-test.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const checkoutDuration = new Trend('checkout_duration');
const bookingDuration = new Trend('booking_duration');
const failedLogins = new Counter('failed_logins');
const failedCheckouts = new Counter('failed_checkouts');
const concurrentUsers = new Counter('concurrent_users');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:3000';

// Test scenarios
export const options = {
  scenarios: {
    // Scenario 1: Gradual ramp-up
    gradual_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 0 },    // Ramp down
      ],
      gracefulRampDown: '30s',
      exec: 'mainScenario',
    },
    // Scenario 2: Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },   // Warm up
        { duration: '10s', target: 200 },  // Spike to 200 users
        { duration: '3m', target: 200 },   // Stay at 200
        { duration: '10s', target: 10 },   // Drop back down
        { duration: '1m', target: 10 },    // Recovery
        { duration: '10s', target: 0 },    // Ramp down
      ],
      startTime: '16m',  // Start after gradual load test
      exec: 'spikeScenario',
    },
    // Scenario 3: Stress test
    stress_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 500,
      stages: [
        { duration: '2m', target: 50 },    // 50 requests/second
        { duration: '3m', target: 100 },   // 100 requests/second
        { duration: '2m', target: 200 },   // 200 requests/second
        { duration: '3m', target: 300 },   // 300 requests/second (breaking point?)
        { duration: '2m', target: 0 },     // Ramp down
      ],
      startTime: '28m',  // Start after spike test
      exec: 'stressScenario',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],  // 95% of requests under 3s
    http_req_failed: ['rate<0.1'],                    // Error rate under 10%
    errors: ['rate<0.05'],                             // Custom error rate under 5%
    login_duration: ['p(95)<2000'],                    // 95% of logins under 2s
    checkout_duration: ['p(95)<5000'],                 // 95% of checkouts under 5s
  },
};

// Shared test data
const testProducts = [
  { id: '000000000000000000000001', price: 49.99 },
  { id: '000000000000000000000002', price: 79.99 },
  { id: '000000000000000000000003', price: 299.99 },
];

const testServices = [
  { id: '000000000000000000000001', duration: 60 },
  { id: '000000000000000000000002', duration: 90 },
];

// Helper functions
function generateUser() {
  const timestamp = Date.now();
  const random = randomString(5);
  return {
    email: `stress_test_${timestamp}_${random}@creditgyemstest.com`,
    password: 'StressTest123!',
    firstName: 'Stress',
    lastName: 'Test',
    phone: `555-${randomIntBetween(1000, 9999)}`,
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
  
  const res = http.post(`${BASE_URL}/api/auth/register`, payload, params);
  
  const success = check(res, {
    'registration successful': (r) => r.status === 200 || r.status === 201,
    'token received': (r) => r.json('token') !== undefined,
  });
  
  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
  
  return success ? { ...user, token: res.json('token') } : null;
}

function login(email, password) {
  const payload = JSON.stringify({ email, password });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'login' },
  };
  
  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  loginDuration.add(Date.now() - start);
  
  const success = check(res, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('token') !== undefined,
  });
  
  if (!success) {
    failedLogins.add(1);
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
  
  return success ? res.json('token') : null;
}

function browseProducts(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'browse_products' },
  };
  
  // List products
  let res = http.get(`${BASE_URL}/api/products`, params);
  check(res, {
    'products listed': (r) => r.status === 200,
  });
  
  // View random product details
  const product = testProducts[randomIntBetween(0, testProducts.length - 1)];
  res = http.get(`${BASE_URL}/api/products/${product.id}`, params);
  check(res, {
    'product details loaded': (r) => r.status === 200,
  });
  
  return product;
}

function addToCart(token, productId, quantity = 1) {
  const payload = JSON.stringify({
    productId,
    quantity,
    type: 'product',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'add_to_cart' },
  };
  
  const res = http.post(`${BASE_URL}/api/cart/add`, payload, params);
  
  return check(res, {
    'added to cart': (r) => r.status === 200,
  });
}

function checkout(token, items) {
  const payload = JSON.stringify({
    items,
    paymentMethod: {
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: '12',
        exp_year: '2025',
        cvc: '123',
      },
    },
    totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'checkout' },
  };
  
  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/orders`, payload, params);
  checkoutDuration.add(Date.now() - start);
  
  const success = check(res, {
    'checkout successful': (r) => r.status === 200 || r.status === 201,
    'order created': (r) => r.json('_id') !== undefined,
  });
  
  if (!success) {
    failedCheckouts.add(1);
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
  
  return success;
}

function bookConsultation(token) {
  const service = testServices[randomIntBetween(0, testServices.length - 1)];
  const startTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  const payload = JSON.stringify({
    serviceId: service.id,
    startTime: startTime.toISOString(),
    notes: 'Stress test booking',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'book_consultation' },
  };
  
  const start = Date.now();
  const res = http.post(`${BASE_URL}/api/bookings`, payload, params);
  bookingDuration.add(Date.now() - start);
  
  const success = check(res, {
    'booking successful': (r) => r.status === 200 || r.status === 201,
  });
  
  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
  
  return success;
}

function browseCommunity(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'browse_community' },
  };
  
  // List discussions
  const res = http.get(`${BASE_URL}/api/community/discussions`, params);
  check(res, {
    'discussions loaded': (r) => r.status === 200,
  });
  
  // Create a new discussion occasionally
  if (randomIntBetween(1, 10) === 1) {
    const discussionPayload = JSON.stringify({
      title: `Stress test discussion ${Date.now()}`,
      content: 'This is a stress test discussion to measure system performance.',
      category: 'general',
    });
    
    const postParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      tags: { name: 'create_discussion' },
    };
    
    http.post(`${BASE_URL}/api/community/discussions`, discussionPayload, postParams);
  }
}

// Main test scenario - typical user journey
export function mainScenario() {
  concurrentUsers.add(1);
  
  // Register new user
  const user = registerUser();
  if (!user) {
    concurrentUsers.add(-1);
    return;
  }
  
  sleep(randomIntBetween(1, 3));
  
  // User journey
  group('user_journey', () => {
    // Browse products
    group('browsing', () => {
      const product = browseProducts(user.token);
      sleep(randomIntBetween(2, 5));
      
      // Add to cart
      addToCart(user.token, product.id);
      sleep(randomIntBetween(1, 3));
    });
    
    // Checkout
    group('purchase', () => {
      const items = [{
        productId: testProducts[0].id,
        quantity: 1,
        price: testProducts[0].price,
      }];
      
      checkout(user.token, items);
      sleep(randomIntBetween(1, 2));
    });
    
    // Book consultation
    group('booking', () => {
      bookConsultation(user.token);
      sleep(randomIntBetween(2, 4));
    });
    
    // Browse community
    group('community', () => {
      browseCommunity(user.token);
      sleep(randomIntBetween(3, 7));
    });
  });
  
  concurrentUsers.add(-1);
}

// Spike scenario - sudden traffic burst
export function spikeScenario() {
  concurrentUsers.add(1);
  
  // Quick registration and immediate checkout
  const user = registerUser();
  if (!user) {
    concurrentUsers.add(-1);
    return;
  }
  
  // Immediate purchase attempt
  const items = [{
    productId: testProducts[randomIntBetween(0, testProducts.length - 1)].id,
    quantity: randomIntBetween(1, 3),
    price: testProducts[0].price,
  }];
  
  checkout(user.token, items);
  
  concurrentUsers.add(-1);
}

// Stress scenario - API endpoint hammering
export function stressScenario() {
  const endpoints = [
    { method: 'GET', path: '/api/products', weight: 4 },
    { method: 'GET', path: '/api/services', weight: 2 },
    { method: 'GET', path: '/api/community/discussions', weight: 3 },
    { method: 'GET', path: '/api/health', weight: 1 },
  ];
  
  // Select random endpoint based on weight
  const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
  let random = randomIntBetween(1, totalWeight);
  let selectedEndpoint = null;
  
  for (const endpoint of endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      selectedEndpoint = endpoint;
      break;
    }
  }
  
  const res = http[selectedEndpoint.method.toLowerCase()](`${BASE_URL}${selectedEndpoint.path}`);
  
  check(res, {
    [`${selectedEndpoint.path} available`]: (r) => r.status === 200,
  });
}

// Handle test lifecycle
export function setup() {
  console.log('Starting Credit Gyems Academy stress test...');
  console.log(`Target: ${BASE_URL}`);
  
  // Verify backend is accessible
  const res = http.get(`${BASE_URL}/api/health`);
  if (res.status !== 200) {
    throw new Error('Backend is not accessible. Please ensure servers are running.');
  }
  
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = Date.now() - data.startTime;
  console.log(`Test completed in ${Math.round(duration / 1000)} seconds`);
}

// Custom summary generation
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'stress-test-summary.json': JSON.stringify(data, null, 2),
    'stress-test-report.html': htmlReport(data),
  };
}

// Helper to generate HTML report
function htmlReport(data) {
  const metrics = data.metrics;
  const errorRateValue = metrics.errors ? metrics.errors.rate : 0;
  const p95Duration = metrics.http_req_duration ? metrics.http_req_duration.p95 : 0;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Credit Gyems Academy - Stress Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #FFD700; padding: 20px; border-radius: 8px; }
        .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .danger { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Credit Gyems Academy - Stress Test Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
    </div>
    
    <h2>Summary</h2>
    <div class="metric">
        <strong>Total Requests:</strong> ${metrics.http_reqs ? metrics.http_reqs.count : 0}<br>
        <strong>Error Rate:</strong> <span class="${errorRateValue < 0.05 ? 'success' : 'danger'}">${(errorRateValue * 100).toFixed(2)}%</span><br>
        <strong>95th Percentile Response Time:</strong> <span class="${p95Duration < 3000 ? 'success' : 'warning'}">${p95Duration.toFixed(0)}ms</span>
    </div>
    
    <h2>Key Metrics</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>Failed Logins</td>
            <td>${metrics.failed_logins ? metrics.failed_logins.count : 0}</td>
            <td class="${metrics.failed_logins && metrics.failed_logins.count > 0 ? 'warning' : 'success'}">
                ${metrics.failed_logins && metrics.failed_logins.count > 0 ? 'Needs Review' : 'Good'}
            </td>
        </tr>
        <tr>
            <td>Failed Checkouts</td>
            <td>${metrics.failed_checkouts ? metrics.failed_checkouts.count : 0}</td>
            <td class="${metrics.failed_checkouts && metrics.failed_checkouts.count > 0 ? 'danger' : 'success'}">
                ${metrics.failed_checkouts && metrics.failed_checkouts.count > 0 ? 'Critical' : 'Good'}
            </td>
        </tr>
        <tr>
            <td>Peak Concurrent Users</td>
            <td>${metrics.concurrent_users ? metrics.concurrent_users.max : 0}</td>
            <td class="success">Handled</td>
        </tr>
    </table>
    
    <h2>Recommendations</h2>
    <ul>
        ${errorRateValue > 0.05 ? '<li class="danger">High error rate detected. Review application logs for failures.</li>' : ''}
        ${p95Duration > 3000 ? '<li class="warning">Response times exceed target. Consider performance optimization.</li>' : ''}
        ${metrics.failed_checkouts && metrics.failed_checkouts.count > 10 ? '<li class="danger">Significant checkout failures. Payment system needs investigation.</li>' : ''}
        <li>Continue monitoring during peak traffic hours</li>
        <li>Set up alerting for error rates above 5%</li>
    </ul>
</body>
</html>
  `;
}

// Helper for text summary
function textSummary(data, options) {
  const { metrics } = data;
  const errorRate = metrics.errors ? (metrics.errors.rate * 100).toFixed(2) : 0;
  const reqDuration = metrics.http_req_duration;
  
  return `
CREDIT GYEMS ACADEMY - STRESS TEST RESULTS
==========================================

SUMMARY
-------
Total Requests: ${metrics.http_reqs ? metrics.http_reqs.count : 0}
Error Rate: ${errorRate}%
Average Response Time: ${reqDuration ? reqDuration.avg.toFixed(0) : 0}ms
95th Percentile: ${reqDuration ? reqDuration.p95.toFixed(0) : 0}ms
99th Percentile: ${reqDuration ? reqDuration.p99.toFixed(0) : 0}ms

CRITICAL METRICS
----------------
Failed Logins: ${metrics.failed_logins ? metrics.failed_logins.count : 0}
Failed Checkouts: ${metrics.failed_checkouts ? metrics.failed_checkouts.count : 0}
Peak Concurrent Users: ${metrics.concurrent_users ? metrics.concurrent_users.max : 0}

ENDPOINT PERFORMANCE
-------------------
Login Duration (p95): ${metrics.login_duration ? metrics.login_duration.p95.toFixed(0) : 0}ms
Checkout Duration (p95): ${metrics.checkout_duration ? metrics.checkout_duration.p95.toFixed(0) : 0}ms
Booking Duration (p95): ${metrics.booking_duration ? metrics.booking_duration.p95.toFixed(0) : 0}ms

STATUS: ${errorRate < 5 && reqDuration.p95 < 3000 ? 'PASSED' : 'NEEDS ATTENTION'}
`;
}