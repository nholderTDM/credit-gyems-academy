// spike-test.js
// K6 Spike Testing Script for Credit Gyems Academy
// Location: QA/scripts/k6/
// 
// Purpose: Test system behavior under sudden traffic spikes
// Simulates scenarios like viral marketing campaigns, flash sales, or DDoS-like conditions

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const spikeRecoveryTime = new Trend('spike_recovery_time');
const droppedRequests = new Counter('dropped_requests');
const systemCrashDetected = new Counter('system_crashes');
const responseTimeSpike = new Trend('response_time_during_spike');
const timeToFirstByte = new Trend('time_to_first_byte');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:3000';

// Spike test configuration
export const options = {
  scenarios: {
    // Scenario 1: Sudden spike
    sudden_spike: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '30s', target: 5 },     // Baseline load
        { duration: '20s', target: 500 },   // Spike to 500 users in 20 seconds
        { duration: '2m', target: 500 },    // Hold spike for 2 minutes
        { duration: '20s', target: 5 },     // Drop back to baseline
        { duration: '2m', target: 5 },      // Recovery period
      ],
      gracefulRampDown: '10s',
      exec: 'spikeScenario',
    },
    // Scenario 2: Multiple spikes
    multiple_spikes: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 10 },    // Baseline
        { duration: '10s', target: 300 },   // First spike
        { duration: '30s', target: 300 },   // Hold
        { duration: '10s', target: 10 },    // Drop
        { duration: '30s', target: 10 },    // Rest
        { duration: '10s', target: 400 },   // Second spike (higher)
        { duration: '30s', target: 400 },   // Hold
        { duration: '10s', target: 10 },    // Drop
        { duration: '1m', target: 10 },     // Final recovery
      ],
      startTime: '6m',  // Start after sudden spike
      exec: 'multiSpikeScenario',
    },
    // Scenario 3: Sustained high spike
    sustained_spike: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '30s', target: 5 },     // Baseline
        { duration: '15s', target: 600 },   // Extreme spike
        { duration: '5m', target: 600 },    // Sustained high load
        { duration: '30s', target: 5 },     // Recovery
      ],
      startTime: '14m',  // Start after multiple spikes
      exec: 'sustainedSpikeScenario',
    },
  },
  thresholds: {
    http_req_duration: [
      'p(95)<5000',  // 95% of requests under 5s during spike
      'p(99)<10000', // 99% of requests under 10s during spike
    ],
    http_req_failed: ['rate<0.2'],         // Error rate under 20% during spike
    errors: ['rate<0.15'],                  // Custom error rate under 15%
    dropped_requests: ['count<100'],        // Less than 100 dropped requests
    system_crashes: ['count==0'],           // No system crashes
    spike_recovery_time: ['p(90)<30000'],   // 90% recover within 30s
  },
};

// Test data - reuse from main test suite or generate
const testProducts = [
  { id: '000000000000000000000001', price: 49.99, type: 'ebook' },
  { id: '000000000000000000000002', price: 79.99, type: 'course' },
  { id: '000000000000000000000003', price: 299.99, type: 'masterclass' },
];

const testServices = [
  { id: '000000000000000000000001', duration: 60, type: 'consultation' },
  { id: '000000000000000000000002', duration: 90, type: 'coaching' },
];

// Stripe test cards
const stripeTestCards = {
  success: { number: '4242424242424242', cvc: '123', exp_month: '12', exp_year: '2025' },
  decline: { number: '4000000000000002', cvc: '123', exp_month: '12', exp_year: '2025' },
};

// Helper functions
function generateUser() {
  const timestamp = Date.now();
  const random = randomString(5);
  return {
    email: `spike_test_${timestamp}_${random}@creditgyemstest.com`,
    password: 'SpikeTest123!',
    firstName: 'Spike',
    lastName: 'Test',
    phone: `555-${randomIntBetween(1000, 9999)}`,
  };
}

function measureResponseTime(response) {
  const duration = response.timings.duration;
  responseTimeSpike.add(duration);
  timeToFirstByte.add(response.timings.waiting);
  
  // Check if response indicates system issues
  if (response.status === 503 || response.status === 0) {
    systemCrashDetected.add(1);
  }
  
  if (response.status === 0 || duration > 30000) {
    droppedRequests.add(1);
  }
}

// Main spike scenario
export function spikeScenario() {
  const startTime = Date.now();
  
  group('spike_user_registration', () => {
    const user = generateUser();
    const payload = JSON.stringify(user);
    
    const params = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'spike_register' },
      timeout: '30s',
    };
    
    const res = http.post(`${BASE_URL}/api/auth/register`, payload, params);
    measureResponseTime(res);
    
    const success = check(res, {
      'registration successful': (r) => r.status === 200 || r.status === 201,
      'response time acceptable': (r) => r.timings.duration < 5000,
    });
    
    if (!success) {
      errorRate.add(1);
    } else {
      errorRate.add(0);
      
      // Continue with user flow
      const token = res.json('token');
      if (token) {
        spikeUserFlow(token);
      }
    }
  });
  
  // Measure recovery time after spike
  const recoveryTime = Date.now() - startTime;
  if (__VU === 1) {  // Only measure once
    spikeRecoveryTime.add(recoveryTime);
  }
  
  sleep(randomIntBetween(1, 3));
}

// Multi-spike scenario
export function multiSpikeScenario() {
  group('multi_spike_browsing', () => {
    // Quick browsing pattern during spikes
    const endpoints = [
      '/api/products',
      '/api/services',
      '/api/community/discussions',
    ];
    
    const endpoint = endpoints[randomIntBetween(0, endpoints.length - 1)];
    const res = http.get(`${BASE_URL}${endpoint}`, {
      tags: { name: 'spike_browse' },
      timeout: '20s',
    });
    
    measureResponseTime(res);
    
    check(res, {
      'browse successful': (r) => r.status === 200,
      'has content': (r) => r.body.length > 0,
    });
  });
  
  sleep(randomIntBetween(0.5, 2));
}

// Sustained spike scenario
export function sustainedSpikeScenario() {
  // Simulate heavy operations during sustained spike
  group('sustained_spike_operations', () => {
    const operations = [
      heavySearchOperation,
      concurrentCheckout,
      massBookingAttempt,
      complexDataQuery,
    ];
    
    const operation = operations[randomIntBetween(0, operations.length - 1)];
    operation();
  });
  
  sleep(randomIntBetween(0.5, 1.5));
}

// Spike user flow
function spikeUserFlow(token) {
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  // Quick product browse
  const productsRes = http.get(`${BASE_URL}/api/products`, {
    headers: authHeaders,
    tags: { name: 'spike_products' },
    timeout: '15s',
  });
  
  measureResponseTime(productsRes);
  
  if (productsRes.status === 200) {
    // Quick add to cart
    const product = testProducts[randomIntBetween(0, testProducts.length - 1)];
    
    const cartRes = http.post(`${BASE_URL}/api/cart/add`, 
      JSON.stringify({
        productId: product.id,
        quantity: 1,
        type: product.type,
      }), {
        headers: authHeaders,
        tags: { name: 'spike_add_cart' },
        timeout: '10s',
      }
    );
    
    measureResponseTime(cartRes);
    
    // Attempt quick checkout
    if (cartRes.status === 200 && randomIntBetween(1, 10) <= 3) {  // 30% attempt checkout
      const checkoutRes = http.post(`${BASE_URL}/api/orders`,
        JSON.stringify({
          items: [{
            productId: product.id,
            quantity: 1,
            price: product.price,
          }],
          paymentMethod: {
            type: 'card',
            card: stripeTestCards.success,
          },
          totalAmount: product.price,
        }), {
          headers: authHeaders,
          tags: { name: 'spike_checkout' },
          timeout: '20s',
        }
      );
      
      measureResponseTime(checkoutRes);
      
      check(checkoutRes, {
        'checkout completed': (r) => r.status === 200 || r.status === 201,
      });
    }
  }
}

// Heavy operations for sustained spike
function heavySearchOperation() {
  const searchTerms = ['credit', 'repair', 'score', 'coaching', 'financial'];
  const term = searchTerms[randomIntBetween(0, searchTerms.length - 1)];
  
  const res = http.get(`${BASE_URL}/api/products?search=${term}&limit=50`, {
    tags: { name: 'spike_heavy_search' },
    timeout: '15s',
  });
  
  measureResponseTime(res);
}

function concurrentCheckout() {
  // Simulate multiple users checking out same limited inventory item
  const limitedProduct = testProducts[0];  // Assume first product has limited stock
  
  const res = http.post(`${BASE_URL}/api/orders`,
    JSON.stringify({
      items: [{
        productId: limitedProduct.id,
        quantity: randomIntBetween(1, 5),
        price: limitedProduct.price,
      }],
      paymentMethod: {
        type: 'card',
        card: stripeTestCards.success,
      },
    }), {
      tags: { name: 'spike_concurrent_checkout' },
      timeout: '20s',
    }
  );
  
  measureResponseTime(res);
}

function massBookingAttempt() {
  // Many users trying to book same time slot
  const popularTime = new Date();
  popularTime.setDate(popularTime.getDate() + 7);
  popularTime.setHours(14, 0, 0, 0);  // 2 PM next week
  
  const res = http.post(`${BASE_URL}/api/bookings`,
    JSON.stringify({
      serviceId: testServices[0].id,
      startTime: popularTime.toISOString(),
      notes: 'Spike test booking',
    }), {
      tags: { name: 'spike_mass_booking' },
      timeout: '15s',
    }
  );
  
  measureResponseTime(res);
}

function complexDataQuery() {
  // Request that requires complex database operations
  const res = http.get(`${BASE_URL}/api/analytics/user-activity?days=90&detailed=true`, {
    tags: { name: 'spike_complex_query' },
    timeout: '25s',
  });
  
  measureResponseTime(res);
}

// Lifecycle hooks
export function setup() {
  console.log('Starting Credit Gyems Academy Spike Tests...');
  console.log(`Target: ${BASE_URL}`);
  console.log('Spike Pattern: 5 → 500 → 5 VUs (main spike)');
  
  // Verify backend is accessible
  const res = http.get(`${BASE_URL}/api/health`, { timeout: '10s' });
  if (res.status !== 200) {
    throw new Error('Backend is not accessible. Please ensure servers are running.');
  }
  
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = Date.now() - data.startTime;
  console.log(`Spike tests completed in ${Math.round(duration / 1000)} seconds`);
  
  // Summary recommendations based on results
  console.log('\n=== Spike Test Recommendations ===');
  console.log('1. If error rate > 10%: Implement circuit breakers');
  console.log('2. If recovery time > 30s: Optimize connection pooling');
  console.log('3. If dropped requests > 50: Scale infrastructure or implement queue');
  console.log('4. If system crashes detected: Review memory management and limits');
}

// Custom summary
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'spike-test-summary.json': JSON.stringify(data, null, 2),
    'spike-test-report.html': htmlReport(data),
  };
}

// Generate HTML report
function htmlReport(data) {
  const metrics = data.metrics;
  const errorRate = metrics.errors ? metrics.errors.rate : 0;
  const droppedCount = metrics.dropped_requests ? metrics.dropped_requests.count : 0;
  const crashes = metrics.system_crashes ? metrics.system_crashes.count : 0;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Credit Gyems Academy - Spike Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: #FFD700; padding: 20px; border-radius: 8px; text-align: center; }
        .metric { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .critical { background: #ffe6e6; border-left: 4px solid #ff4444; }
        .warning { background: #fff9e6; border-left: 4px solid #ffaa00; }
        .success { background: #e6ffe6; border-left: 4px solid #44ff44; }
        .chart { margin: 20px 0; padding: 20px; background: white; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Credit Gyems Academy - Spike Test Report</h1>
        <p>Testing sudden traffic surges and system recovery</p>
    </div>
    
    <h2>Critical Metrics</h2>
    <div class="metric ${crashes > 0 ? 'critical' : 'success'}">
        <strong>System Crashes:</strong> ${crashes}
        ${crashes > 0 ? '⚠️ CRITICAL: System failures detected during spike!' : '✅ System remained stable'}
    </div>
    
    <div class="metric ${droppedCount > 100 ? 'critical' : droppedCount > 50 ? 'warning' : 'success'}">
        <strong>Dropped Requests:</strong> ${droppedCount}
        ${droppedCount > 100 ? '⚠️ Severe request dropping' : droppedCount > 50 ? '⚠️ Moderate request dropping' : '✅ Minimal request loss'}
    </div>
    
    <div class="metric ${errorRate > 0.15 ? 'critical' : errorRate > 0.10 ? 'warning' : 'success'}">
        <strong>Error Rate:</strong> ${(errorRate * 100).toFixed(2)}%
        ${errorRate > 0.15 ? '⚠️ High error rate during spike' : errorRate > 0.10 ? '⚠️ Elevated errors' : '✅ Acceptable error rate'}
    </div>
    
    <h2>Performance During Spike</h2>
    <table>
        <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Target</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>95th Percentile Response Time</td>
            <td>${metrics.http_req_duration ? metrics.http_req_duration.p95.toFixed(0) : 0}ms</td>
            <td>< 5000ms</td>
            <td>${metrics.http_req_duration && metrics.http_req_duration.p95 < 5000 ? '✅' : '❌'}</td>
        </tr>
        <tr>
            <td>99th Percentile Response Time</td>
            <td>${metrics.http_req_duration ? metrics.http_req_duration.p99.toFixed(0) : 0}ms</td>
            <td>< 10000ms</td>
            <td>${metrics.http_req_duration && metrics.http_req_duration.p99 < 10000 ? '✅' : '❌'}</td>
        </tr>
        <tr>
            <td>Average Recovery Time</td>
            <td>${metrics.spike_recovery_time ? metrics.spike_recovery_time.avg.toFixed(0) : 0}ms</td>
            <td>< 30000ms</td>
            <td>${metrics.spike_recovery_time && metrics.spike_recovery_time.avg < 30000 ? '✅' : '❌'}</td>
        </tr>
    </table>
    
    <h2>Spike Patterns Tested</h2>
    <ul>
        <li><strong>Sudden Spike:</strong> 5 → 500 users in 20 seconds</li>
        <li><strong>Multiple Spikes:</strong> Repeated surges to test recovery</li>
        <li><strong>Sustained High Load:</strong> 600 users for 5 minutes</li>
    </ul>
    
    <h2>Recommendations</h2>
    <div class="metric">
        ${crashes > 0 ? '<p>🔴 <strong>Implement auto-scaling immediately</strong> - System crashes indicate infrastructure limits</p>' : ''}
        ${droppedCount > 50 ? '<p>🟡 <strong>Add request queuing</strong> - Implement message queues to handle traffic bursts</p>' : ''}
        ${errorRate > 0.10 ? '<p>🟡 <strong>Implement circuit breakers</strong> - Prevent cascade failures during spikes</p>' : ''}
        <p>🔵 <strong>Monitor continuously</strong> - Set up alerts for traffic anomalies</p>
        <p>🔵 <strong>Cache aggressively</strong> - Reduce database load during traffic spikes</p>
    </div>
</body>
</html>
  `;
}

// Text summary helper
function textSummary(data, options) {
  const { metrics } = data;
  const errorRate = metrics.errors ? (metrics.errors.rate * 100).toFixed(2) : 0;
  const crashes = metrics.system_crashes ? metrics.system_crashes.count : 0;
  
  return `
SPIKE TEST SUMMARY
==================
Peak Load: 600 concurrent users
Error Rate: ${errorRate}%
System Crashes: ${crashes}
Dropped Requests: ${metrics.dropped_requests ? metrics.dropped_requests.count : 0}

RESPONSE TIMES DURING SPIKE
---------------------------
Average: ${metrics.http_req_duration ? metrics.http_req_duration.avg.toFixed(0) : 0}ms
95th Percentile: ${metrics.http_req_duration ? metrics.http_req_duration.p95.toFixed(0) : 0}ms
99th Percentile: ${metrics.http_req_duration ? metrics.http_req_duration.p99.toFixed(0) : 0}ms

RECOMMENDATION: ${crashes > 0 || errorRate > 15 ? 'URGENT infrastructure scaling needed!' : errorRate > 10 ? 'Consider performance optimizations' : 'System handles spikes acceptably'}
`;
}