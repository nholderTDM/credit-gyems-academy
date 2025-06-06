const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
  serviceType: {
    type: String,
    enum: ['credit_repair', 'credit_coaching', 'financial_planning'],
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  benefits: [{
    title: String,
    description: String
  }],
  duration: {
    type: Number,
    default: 60, // in minutes
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    displayPrice: {
      type: String // e.g., "$149" or "$149/session"
    }
  },
  pricingType: {
    type: String,
    enum: ['one_time', 'recurring', 'package'],
    default: 'one_time'
  },
  packageDetails: {
    numberOfSessions: Number,
    validityDays: Number, // How many days the package is valid
    savings: Number // Amount saved compared to individual sessions
  },
  requirements: [{
    type: String // What clients need to prepare
  }],
  deliverables: [{
    type: String // What clients will receive
  }],
  targetAudience: [{
    type: String
  }],
  faqs: [{
    question: String,
    answer: String
  }],
  testimonialIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Testimonial'
  }],
  relatedProductIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  bookingSettings: {
    allowOnlineBooking: {
      type: Boolean,
      default: true
    },
    advanceBookingDays: {
      type: Number,
      default: 30 // How many days in advance can book
    },
    minBookingNotice: {
      type: Number,
      default: 24 // Minimum hours notice required
    },
    cancellationPolicy: {
      type: String,
      default: '24 hours notice required for cancellation'
    },
    meetingType: {
      type: String,
      enum: ['virtual', 'in_person', 'hybrid'],
      default: 'virtual'
    },
    meetingPlatform: {
      type: String,
      default: 'Google Meet'
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true
    }
  },
  images: {
    thumbnail: String,
    banner: String,
    gallery: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming_soon'],
    default: 'active'
  },
  order: {
    type: Number,
    default: 0 // For display ordering
  },
  analytics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate slug if not provided
  if (!this.seo.slug && this.title) {
    this.seo.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  
  next();
});

// Virtual for formatted price
ServiceSchema.virtual('formattedPrice').get(function() {
  return this.price.displayPrice || `$${this.price.amount}`;
});

// Method to check if service is bookable
ServiceSchema.methods.isBookable = function() {
  return this.status === 'active' && this.bookingSettings.allowOnlineBooking;
};

// Static method to get active services
ServiceSchema.statics.getActiveServices = function() {
  return this.find({ status: 'active' }).sort('order');
};

// Static method to seed initial services
ServiceSchema.statics.seedServices = async function() {
  const services = [
    {
      serviceType: 'credit_repair',
      title: 'Credit Repair Service',
      displayName: 'Credit Repair Consultation',
      description: 'Professional credit repair service to help you remove negative items, dispute errors, and rebuild your credit score. Our proven strategies have helped thousands improve their creditworthiness.',
      shortDescription: 'Remove negative items and rebuild your credit score with expert guidance.',
      features: [
        'Comprehensive credit report analysis',
        'Dispute letter creation and submission',
        'Negative item removal strategies',
        'Credit bureau communication',
        'Monthly progress tracking',
        'Personalized credit improvement plan'
      ],
      benefits: [
        {
          title: 'Remove Negative Items',
          description: 'We help identify and dispute inaccurate negative items on your credit report'
        },
        {
          title: 'Improve Credit Score',
          description: 'Our strategies can help improve your credit score by 100+ points'
        },
        {
          title: 'Expert Guidance',
          description: 'Work with certified credit repair specialists'
        }
      ],
      duration: 60,
      price: {
        amount: 149,
        displayPrice: '$149/session'
      },
      pricingType: 'one_time',
      requirements: [
        'Recent credit reports from all 3 bureaus',
        'List of specific credit concerns',
        'Any relevant documentation'
      ],
      deliverables: [
        'Detailed credit report analysis',
        'Custom dispute letters',
        'Action plan for credit improvement',
        'Follow-up consultation'
      ],
      targetAudience: [
        'Individuals with poor credit scores',
        'Those with collections or charge-offs',
        'People preparing for major purchases',
        'Anyone wanting to improve their creditworthiness'
      ],
      bookingSettings: {
        allowOnlineBooking: true,
        advanceBookingDays: 30,
        minBookingNotice: 24,
        cancellationPolicy: '24 hours notice required for cancellation or rescheduling'
      },
      seo: {
        metaTitle: 'Credit Repair Service | Remove Negative Items | Credit Gyems 369',
        metaDescription: 'Professional credit repair service to remove negative items and improve your credit score. Book your consultation today.',
        keywords: ['credit repair', 'fix credit', 'remove collections', 'improve credit score'],
        slug: 'credit-repair'
      },
      status: 'active',
      order: 1
    },
    {
      serviceType: 'credit_coaching',
      title: 'Credit Coaching Session',
      displayName: 'Credit Coaching Session',
      description: 'One-on-one credit coaching to help you understand credit fundamentals, develop healthy credit habits, and create a personalized roadmap to achieve your credit goals.',
      shortDescription: 'Personal coaching to master credit fundamentals and achieve your goals.',
      features: [
        'Personal credit assessment',
        'Credit education and fundamentals',
        'Goal setting and planning',
        'Budget and debt management strategies',
        'Credit building techniques',
        'Ongoing support and accountability'
      ],
      benefits: [
        {
          title: 'Personalized Strategy',
          description: 'Get a custom plan tailored to your specific credit situation'
        },
        {
          title: 'Education & Empowerment',
          description: 'Learn how credit works and how to manage it effectively'
        },
        {
          title: 'Long-term Success',
          description: 'Build habits for maintaining excellent credit'
        }
      ],
      duration: 60,
      price: {
        amount: 99,
        displayPrice: '$99/session'
      },
      pricingType: 'one_time',
      requirements: [
        'Current credit reports',
        'Financial goals worksheet (provided)',
        'List of questions or concerns'
      ],
      deliverables: [
        'Personalized credit improvement plan',
        'Educational resources',
        'Action item checklist',
        'Follow-up email support'
      ],
      targetAudience: [
        'Credit beginners',
        'Young adults building credit',
        'People recovering from financial setbacks',
        'Anyone wanting to understand credit better'
      ],
      bookingSettings: {
        allowOnlineBooking: true,
        advanceBookingDays: 30,
        minBookingNotice: 24,
        cancellationPolicy: '24 hours notice required for cancellation or rescheduling'
      },
      seo: {
        metaTitle: 'Credit Coaching | Personal Credit Education | Credit Gyems 369',
        metaDescription: 'One-on-one credit coaching sessions to help you understand and improve your credit. Book your session today.',
        keywords: ['credit coaching', 'credit education', 'credit counseling', 'credit help'],
        slug: 'credit-coaching'
      },
      status: 'active',
      order: 2
    },
    {
      serviceType: 'financial_planning',
      title: 'Financial Planning Consultation',
      displayName: 'Financial Planning Session',
      description: 'Comprehensive financial planning session to help you create a roadmap for financial success, including budgeting, debt management, savings strategies, and investment basics.',
      shortDescription: 'Create your personalized roadmap to financial freedom.',
      features: [
        'Financial health assessment',
        'Budget creation and optimization',
        'Debt reduction strategies',
        'Savings and emergency fund planning',
        'Investment basics and options',
        'Retirement planning introduction'
      ],
      benefits: [
        {
          title: 'Clear Financial Roadmap',
          description: 'Get a step-by-step plan to achieve your financial goals'
        },
        {
          title: 'Debt Freedom Strategy',
          description: 'Learn proven methods to eliminate debt faster'
        },
        {
          title: 'Build Wealth',
          description: 'Discover strategies to save and invest for your future'
        }
      ],
      duration: 90,
      price: {
        amount: 199,
        displayPrice: '$199/session'
      },
      pricingType: 'one_time',
      requirements: [
        'Recent bank statements',
        'List of debts and monthly expenses',
        'Income information',
        'Financial goals questionnaire (provided)'
      ],
      deliverables: [
        'Comprehensive financial plan',
        'Custom budget template',
        'Debt payoff calculator',
        'Investment starter guide',
        '30-day follow-up consultation'
      ],
      targetAudience: [
        'Individuals seeking financial stability',
        'Families planning for the future',
        'People with multiple debts',
        'Anyone wanting to build wealth'
      ],
      bookingSettings: {
        allowOnlineBooking: true,
        advanceBookingDays: 30,
        minBookingNotice: 48,
        cancellationPolicy: '48 hours notice required for cancellation or rescheduling'
      },
      seo: {
        metaTitle: 'Financial Planning Consultation | Build Wealth | Credit Gyems 369',
        metaDescription: 'Comprehensive financial planning to help you achieve financial freedom. Book your consultation today.',
        keywords: ['financial planning', 'financial advisor', 'debt management', 'wealth building'],
        slug: 'financial-planning'
      },
      status: 'active',
      order: 3
    }
  ];

  // Check if services already exist
  const existingServices = await this.find({});
  
  if (existingServices.length === 0) {
    console.log('🌱 Seeding services...');
    await this.insertMany(services);
    console.log('✅ Services seeded successfully');
  } else {
    console.log('ℹ️ Services already exist, skipping seed');
  }
};

module.exports = mongoose.model('Service', ServiceSchema);