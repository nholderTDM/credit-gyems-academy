// middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

module.exports = (app) => {
  // Set security HTTP headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.stripe.com"],
      },
    },
  }));
  
  // Rate limiting
  const limiter = rateLimit({
    max: 100, // 100 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: {
      error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', limiter);
  
  // Stricter rate limits for sensitive routes
  const authLimiter = rateLimit({
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: {
      error: 'Too many authentication attempts, please try again after 15 minutes'
    }
  });
  app.use('/api/auth', authLimiter);
  
  const leadCaptureLimiter = rateLimit({
    max: 5, // Only 5 lead submissions per 15 minutes
    windowMs: 15 * 60 * 1000,
    message: {
      error: 'Too many lead submissions, please try again later'
    }
  });
  app.use('/api/leads', leadCaptureLimiter);
  
  // Body parser with size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized key: ${key} in ${req.method} ${req.originalUrl}`);
    }
  }));
  
  // Data sanitization against XSS
  app.use(xss());
  
  // CORS configuration
  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000', // For development
        'https://localhost:3000' // For development with HTTPS
      ];
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));
  
  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};