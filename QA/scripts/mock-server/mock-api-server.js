// mock-api-server.js
// Mock API server for GUI testing isolation
// Location: credit-gyems-academy/gui-tests/mock-server/

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.MOCK_PORT || 5001;
const JWT_SECRET = 'test-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data stores
const mockData = {
  users: [
    {
      id: '1',
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      creditScore: 750,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'admin@example.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  products: [
    {
      _id: 'prod_1',
      type: 'ebook',
      title: 'Credit Repair Master Guide',
      slug: 'credit-repair-master-guide',
      description: 'Complete guide to repairing your credit score',
      price: 49.99,
      shortDescription: 'Transform your credit score',
      features: ['10 Chapters', 'Worksheets', 'Lifetime Access'],
      status: 'published',
      inventory: 999,
      image: '/images/credit-guide.jpg'
    },
    {
      _id: 'prod_2',
      type: 'course',
      title: 'Financial Freedom Blueprint',
      slug: 'financial-freedom-blueprint',
      description: 'Step-by-step roadmap to financial independence',
      price: 299.99,
      shortDescription: 'Your path to financial freedom',
      features: ['15 Modules', 'Video Lessons', 'Community Access'],
      status: 'published',
      image: '/images/freedom-course.jpg'
    },
    {
      _id: 'prod_3',
      type: 'physical',
      title: 'Credit Workbook',
      slug: 'credit-workbook',
      description: 'Physical workbook for credit improvement',
      price: 29.99,
      shortDescription: 'Hands-on credit improvement',
      inventory: 50,
      trackInventory: true,
      status: 'published',
      image: '/images/workbook.jpg'
    }
  ],
  services: [
    {
      _id: 'serv_1',
      serviceType: 'credit_repair',
      title: 'Credit Repair Consultation',
      displayName: 'Credit Repair Session',
      description: 'One-on-one credit repair consultation',
      shortDescription: 'Personal credit repair help',
      duration: 60,
      price: { amount: 149, displayPrice: '$149' },
      features: ['Credit Analysis', 'Action Plan', 'Follow-up Support'],
      status: 'active'
    },
    {
      _id: 'serv_2',
      serviceType: 'financial_planning',
      title: 'Financial Planning Session',
      displayName: 'Financial Planning',
      description: 'Comprehensive financial planning session',
      shortDescription: 'Plan your financial future',
      duration: 90,
      price: { amount: 199, displayPrice: '$199' },
      features: ['Budget Review', 'Investment Strategy', 'Retirement Planning'],
      status: 'active'
    }
  ],
  orders: [],
  bookings: [],
  cart: {},
  discussions: [
    {
      _id: 'disc_1',
      title: 'How I improved my credit score by 200 points',
      content: 'Here\'s my success story...',
      author: '1',
      category: 'success_stories',
      likes: 15,
      replies: 3,
      createdAt: new Date().toISOString()
    }
  ]
};

// Utility functions
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  
  // Check if user exists
  if (mockData.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const newUser = {
    id: String(mockData.users.length + 1),
    email,
    password,
    firstName,
    lastName,
    phone,
    role: 'user',
    creditScore: 650,
    createdAt: new Date().toISOString()
  };
  
  mockData.users.push(newUser);
  const token = generateToken(newUser);
  
  res.json({
    token,
    user: { ...newUser, password: undefined }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockData.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken(user);
  
  res.json({
    token,
    user: { ...user, password: undefined }
  });
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = mockData.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ ...user, password: undefined });
});

// Products
app.get('/api/products', (req, res) => {
  const { type, search, minPrice, maxPrice } = req.query;
  let products = [...mockData.products];
  
  if (type) {
    products = products.filter(p => p.type === type);
  }
  
  if (search) {
    products = products.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  res.json({ data: products });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockData.products.find(p => p._id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json({ data: product });
});

// Services
app.get('/api/services', (req, res) => {
  res.json({ data: mockData.services });
});

app.get('/api/services/:id', (req, res) => {
  const service = mockData.services.find(s => s._id === req.params.id);
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  res.json({ data: service });
});

// Cart
app.get('/api/cart', authenticateToken, (req, res) => {
  const userCart = mockData.cart[req.user.id] || { items: [] };
  res.json({ data: userCart });
});

app.post('/api/cart/add', authenticateToken, (req, res) => {
  const { productId, quantity = 1, type = 'product' } = req.body;
  
  if (!mockData.cart[req.user.id]) {
    mockData.cart[req.user.id] = { items: [] };
  }
  
  const cart = mockData.cart[req.user.id];
  const existingItem = cart.items.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const product = mockData.products.find(p => p._id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    cart.items.push({
      productId,
      quantity,
      type,
      price: product.price,
      title: product.title
    });
  }
  
  res.json({ data: cart });
});

// Orders
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, paymentMethod, totalAmount } = req.body;
  
  // Simulate payment processing
  if (paymentMethod.card && paymentMethod.card.number === '4000000000000002') {
    return res.status(400).json({ error: 'Payment declined' });
  }
  
  const order = {
    _id: `order_${Date.now()}`,
    userId: req.user.id,
    items,
    totalAmount,
    status: 'completed',
    paymentMethod: paymentMethod.type,
    createdAt: new Date().toISOString()
  };
  
  mockData.orders.push(order);
  
  // Clear cart
  if (mockData.cart[req.user.id]) {
    mockData.cart[req.user.id].items = [];
  }
  
  res.json(order);
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = mockData.orders.filter(o => o.userId === req.user.id);
  res.json({ data: userOrders });
});

// Bookings
app.get('/api/bookings/available-slots', authenticateToken, (req, res) => {
  const { date, serviceId } = req.query;
  
  // Generate available slots
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push({
      startTime: `${date}T${hour.toString().padStart(2, '0')}:00:00`,
      endTime: `${date}T${(hour + 1).toString().padStart(2, '0')}:00:00`,
      available: Math.random() > 0.3 // 70% availability
    });
  }
  
  res.json({ availableSlots: slots.filter(s => s.available) });
});

app.post('/api/bookings', authenticateToken, (req, res) => {
  const { serviceId, startTime, notes } = req.body;
  
  const service = mockData.services.find(s => s._id === serviceId);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  const booking = {
    _id: `book_${Date.now()}`,
    userId: req.user.id,
    serviceId,
    startTime,
    endTime: new Date(new Date(startTime).getTime() + service.duration * 60000).toISOString(),
    notes,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  mockData.bookings.push(booking);
  
  res.json({ booking });
});

app.get('/api/bookings/my-bookings', authenticateToken, (req, res) => {
  const userBookings = mockData.bookings.filter(b => b.userId === req.user.id);
  res.json(userBookings);
});

// Community
app.get('/api/community/discussions', authenticateToken, (req, res) => {
  const { category, search, sort = 'recent' } = req.query;
  let discussions = [...mockData.discussions];
  
  if (category) {
    discussions = discussions.filter(d => d.category === category);
  }
  
  if (search) {
    discussions = discussions.filter(d => 
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Sort
  if (sort === 'popular') {
    discussions.sort((a, b) => b.likes - a.likes);
  } else {
    discussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  res.json({
    data: {
      discussions,
      pagination: {
        page: 1,
        pages: 1,
        total: discussions.length
      }
    }
  });
});

app.post('/api/community/discussions', authenticateToken, (req, res) => {
  const { title, content, category } = req.body;
  
  const discussion = {
    _id: `disc_${Date.now()}`,
    title,
    content,
    category,
    author: req.user.id,
    likes: 0,
    replies: 0,
    createdAt: new Date().toISOString()
  };
  
  mockData.discussions.push(discussion);
  
  res.json(discussion);
});

// Lead capture
app.post('/api/leads', (req, res) => {
  const { email, firstName, lastName, phone, source } = req.body;
  
  // Simulate email validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  res.json({
    _id: `lead_${Date.now()}`,
    email,
    firstName,
    lastName,
    phone,
    source,
    createdAt: new Date().toISOString()
  });
});

app.post('/api/contact', (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body;
  
  res.json({
    data: {
      referenceId: `REF-${Date.now()}`,
      status: 'received',
      message: 'Your message has been received. We\'ll get back to you soon.'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Mock server closed');
  });
});

module.exports = { app, server };