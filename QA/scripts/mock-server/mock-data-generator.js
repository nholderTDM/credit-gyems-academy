// mock-data-generator.js
// Test data generator for Credit Gyems Academy mock server
// Location: QA/scripts/mock-server/

const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class MockDataGenerator {
  constructor() {
    this.userCounter = 1;
    this.productCounter = 1;
    this.orderCounter = 1;
    this.bookingCounter = 1;
    this.discussionCounter = 1;
    
    // Test credit card numbers
    this.testCards = {
      success: '4242424242424242',
      decline: '4000000000000002',
      insufficientFunds: '4000000000009995',
      expired: '4000000000000069',
      processingError: '4000000000000119',
      threeDSecure: '4000000000003220'
    };
    
    // Product templates
    this.productTemplates = {
      ebook: {
        titles: [
          'Credit Repair Master Guide',
          'DIY Credit Score Improvement',
          '30-Day Credit Challenge',
          'Credit Myths Debunked',
          'Financial Freedom Blueprint'
        ],
        priceRange: { min: 19.99, max: 99.99 }
      },
      course: {
        titles: [
          'Complete Credit Repair Course',
          'Advanced Financial Planning',
          'Business Credit Mastery',
          'Real Estate Credit Strategies',
          'Credit Coaching Certification'
        ],
        priceRange: { min: 199.99, max: 999.99 }
      },
      physical: {
        titles: [
          'Credit Repair Workbook',
          'Financial Planning Planner',
          'Credit Tracker Journal',
          'Budget Binder Kit',
          'Credit Repair Toolkit'
        ],
        priceRange: { min: 29.99, max: 149.99 }
      }
    };
    
    // Service templates
    this.serviceTemplates = {
      consultation: {
        titles: [
          'Credit Analysis Consultation',
          'Dispute Letter Review',
          'Credit Strategy Session',
          'Bureau Communication Review',
          'Identity Theft Recovery'
        ],
        durations: [30, 60, 90],
        priceRange: { min: 99, max: 299 }
      },
      coaching: {
        titles: [
          'Monthly Credit Coaching',
          'VIP Credit Transformation',
          'Group Coaching Session',
          'Credit Building Bootcamp',
          'Executive Credit Coaching'
        ],
        durations: [60, 90, 120],
        priceRange: { min: 199, max: 599 }
      }
    };
  }

  // Generate a single user
  generateUser(options = {}) {
    const userId = options.id || `user_${this.userCounter++}`;
    const role = options.role || faker.helpers.arrayElement(['user', 'user', 'user', 'premium', 'admin']);
    const creditScore = options.creditScore || faker.number.int({ min: 300, max: 850 });
    
    return {
      id: userId,
      email: options.email || faker.internet.email(),
      password: options.password || bcrypt.hashSync('Test123!', 10),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number('###-###-####'),
      role: role,
      creditScore: creditScore,
      creditGoal: creditScore + faker.number.int({ min: 50, max: 200 }),
      subscription: role === 'premium' ? {
        plan: faker.helpers.arrayElement(['monthly', 'yearly']),
        status: 'active',
        nextBilling: faker.date.future()
      } : null,
      profile: {
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        location: `${faker.location.city()}, ${faker.location.stateAbbr()}`,
        joinedCommunity: faker.datatype.boolean(),
        emailVerified: true,
        twoFactorEnabled: faker.datatype.boolean({ probability: 0.3 })
      },
      stats: {
        ordersCount: faker.number.int({ min: 0, max: 20 }),
        bookingsCount: faker.number.int({ min: 0, max: 10 }),
        discussionsCount: faker.number.int({ min: 0, max: 50 }),
        totalSpent: faker.number.float({ min: 0, max: 5000, precision: 0.01 })
      },
      createdAt: faker.date.past({ years: 2 }),
      lastLogin: faker.date.recent({ days: 7 }),
      isActive: true,
      isDeleted: false
    };
  }

  // Generate multiple users
  generateUsers(count = 10, options = {}) {
    const users = [];
    
    // Always include test users
    users.push(this.generateUser({
      id: 'test_user_1',
      email: 'test@example.com',
      password: 'Test123!',
      role: 'user',
      creditScore: 650
    }));
    
    users.push(this.generateUser({
      id: 'test_admin_1',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
      creditScore: 780
    }));
    
    // Generate random users
    for (let i = 0; i < count - 2; i++) {
      users.push(this.generateUser());
    }
    
    return users;
  }

  // Generate a product
  generateProduct(type = null, options = {}) {
    const productType = type || faker.helpers.arrayElement(['ebook', 'course', 'physical']);
    const template = this.productTemplates[productType];
    const productId = options.id || `prod_${this.productCounter++}`;
    
    const product = {
      _id: productId,
      type: productType,
      title: options.title || faker.helpers.arrayElement(template.titles),
      slug: options.slug || faker.helpers.slugify(options.title || template.titles[0]).toLowerCase(),
      description: faker.commerce.productDescription(),
      price: options.price || faker.number.float({ 
        min: template.priceRange.min, 
        max: template.priceRange.max, 
        precision: 0.01 
      }),
      shortDescription: faker.lorem.sentence(),
      features: this.generateProductFeatures(productType),
      status: options.status || faker.helpers.arrayElement(['published', 'published', 'published', 'draft']),
      image: faker.image.url(),
      images: [faker.image.url(), faker.image.url(), faker.image.url()],
      category: faker.helpers.arrayElement(['credit-repair', 'financial-planning', 'business-credit', 'real-estate']),
      tags: faker.helpers.arrayElements(['bestseller', 'new', 'featured', 'limited', 'popular'], { min: 0, max: 3 }),
      metadata: {
        author: 'Coach Tae',
        lastUpdated: faker.date.recent(),
        version: faker.system.semver()
      }
    };
    
    // Add type-specific fields
    if (productType === 'ebook') {
      product.downloadUrl = '/downloads/' + productId + '.pdf';
      product.fileSize = faker.number.int({ min: 1, max: 50 }) + ' MB';
      product.pageCount = faker.number.int({ min: 50, max: 300 });
      product.format = 'PDF';
    } else if (productType === 'course') {
      product.modules = faker.number.int({ min: 5, max: 20 });
      product.duration = faker.number.int({ min: 2, max: 40 }) + ' hours';
      product.enrollmentCount = faker.number.int({ min: 0, max: 1000 });
      product.rating = faker.number.float({ min: 4.0, max: 5.0, precision: 0.1 });
      product.reviews = faker.number.int({ min: 0, max: 200 });
    } else if (productType === 'physical') {
      product.inventory = options.inventory !== undefined ? options.inventory : faker.number.int({ min: 0, max: 100 });
      product.trackInventory = true;
      product.weight = faker.number.float({ min: 0.1, max: 5.0, precision: 0.1 }) + ' lbs';
      product.dimensions = {
        length: faker.number.int({ min: 5, max: 20 }),
        width: faker.number.int({ min: 5, max: 15 }),
        height: faker.number.int({ min: 1, max: 10 })
      };
      product.shippingClass = faker.helpers.arrayElement(['standard', 'express', 'overnight']);
    }
    
    return product;
  }

  // Generate product features based on type
  generateProductFeatures(type) {
    const featureTemplates = {
      ebook: [
        'Instant Download',
        'Printable Worksheets',
        'Lifetime Access',
        'Mobile Friendly',
        'Bonus Templates'
      ],
      course: [
        'Video Lessons',
        'Quizzes & Assessments',
        'Certificate of Completion',
        'Community Access',
        'Live Q&A Sessions',
        'Downloadable Resources'
      ],
      physical: [
        'Free Shipping',
        'Premium Quality',
        '30-Day Guarantee',
        'Eco-Friendly Materials'
      ]
    };
    
    return faker.helpers.arrayElements(
      featureTemplates[type] || featureTemplates.ebook,
      { min: 3, max: 5 }
    );
  }

  // Generate multiple products
  generateProducts(count = 20) {
    const products = [];
    const types = ['ebook', 'course', 'physical'];
    
    // Ensure at least one of each type
    types.forEach(type => {
      products.push(this.generateProduct(type));
    });
    
    // Generate remaining products randomly
    for (let i = types.length; i < count; i++) {
      products.push(this.generateProduct());
    }
    
    // Add some special test products
    products.push(this.generateProduct('physical', {
      id: 'limited_stock_prod',
      title: 'Limited Edition Credit Repair Kit',
      inventory: 5,
      price: 299.99
    }));
    
    products.push(this.generateProduct('ebook', {
      id: 'free_ebook',
      title: 'Free Credit Basics Guide',
      price: 0,
      status: 'published'
    }));
    
    return products;
  }

  // Generate a service
  generateService(type = null, options = {}) {
    const serviceType = type || faker.helpers.arrayElement(['consultation', 'coaching']);
    const template = this.serviceTemplates[serviceType];
    const serviceId = options.id || `serv_${uuidv4()}`;
    
    return {
      _id: serviceId,
      serviceType: serviceType,
      title: options.title || faker.helpers.arrayElement(template.titles),
      displayName: options.displayName || faker.helpers.arrayElement(template.titles),
      description: faker.lorem.paragraph(),
      shortDescription: faker.lorem.sentence(),
      duration: options.duration || faker.helpers.arrayElement(template.durations),
      price: {
        amount: options.price || faker.number.int({ 
          min: template.priceRange.min, 
          max: template.priceRange.max 
        }),
        displayPrice: null // Will be set after amount
      },
      features: this.generateServiceFeatures(serviceType),
      status: options.status || 'active',
      availability: {
        monday: { start: '09:00', end: '17:00', enabled: true },
        tuesday: { start: '09:00', end: '17:00', enabled: true },
        wednesday: { start: '09:00', end: '17:00', enabled: true },
        thursday: { start: '09:00', end: '17:00', enabled: true },
        friday: { start: '09:00', end: '15:00', enabled: true },
        saturday: { start: '10:00', end: '14:00', enabled: faker.datatype.boolean() },
        sunday: { enabled: false }
      },
      capacity: serviceType === 'coaching' ? faker.number.int({ min: 1, max: 10 }) : 1,
      bookingRequirements: {
        advanceBooking: faker.number.int({ min: 1, max: 7 }), // days
        cancellationPolicy: faker.number.int({ min: 24, max: 48 }), // hours
        requiresApproval: faker.datatype.boolean({ probability: 0.3 })
      },
      metadata: {
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        totalBookings: faker.number.int({ min: 0, max: 500 }),
        rating: faker.number.float({ min: 4.5, max: 5.0, precision: 0.1 })
      }
    };
  }

  // Generate service features
  generateServiceFeatures(type) {
    const featureTemplates = {
      consultation: [
        'Personalized Credit Analysis',
        'Action Plan Included',
        'Follow-up Email Support',
        'Credit Report Review',
        'Dispute Letter Templates'
      ],
      coaching: [
        'Weekly Check-ins',
        'Progress Tracking',
        'Resource Library Access',
        'Priority Support',
        'Goal Setting Workshop',
        'Accountability Partner'
      ]
    };
    
    return faker.helpers.arrayElements(
      featureTemplates[type] || featureTemplates.consultation,
      { min: 3, max: 5 }
    );
  }

  // Generate multiple services
  generateServices(count = 10) {
    const services = [];
    
    // Ensure variety
    services.push(this.generateService('consultation'));
    services.push(this.generateService('coaching'));
    
    for (let i = 2; i < count; i++) {
      services.push(this.generateService());
    }
    
    // Set display prices after amounts are determined
    services.forEach(service => {
      service.price.displayPrice = `$${service.price.amount}`;
    });
    
    return services;
  }

  // Generate an order
  generateOrder(userId, options = {}) {
    const orderId = options.id || `order_${Date.now()}_${this.orderCounter++}`;
    const items = options.items || this.generateOrderItems();
    const status = options.status || faker.helpers.arrayElement(['completed', 'completed', 'completed', 'processing', 'cancelled', 'refunded']);
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = items.some(item => item.type === 'physical') ? 9.99 : 0;
    const totalAmount = subtotal + tax + shipping;
    
    const order = {
      _id: orderId,
      userId: userId,
      orderNumber: `CGA-${faker.number.int({ min: 10000, max: 99999 })}`,
      items: items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: shipping,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: status,
      paymentMethod: {
        type: 'card',
        last4: faker.helpers.arrayElement(['4242', '5555', '3782']),
        brand: faker.helpers.arrayElement(['Visa', 'Mastercard', 'Amex'])
      },
      paymentStatus: status === 'completed' ? 'paid' : status === 'refunded' ? 'refunded' : 'pending',
      shippingAddress: items.some(item => item.type === 'physical') ? {
        name: faker.person.fullName(),
        address1: faker.location.streetAddress(),
        address2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }),
        city: faker.location.city(),
        state: faker.location.stateAbbr(),
        zip: faker.location.zipCode(),
        country: 'US'
      } : null,
      billingAddress: {
        name: faker.person.fullName(),
        address1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.stateAbbr(),
        zip: faker.location.zipCode(),
        country: 'US'
      },
      metadata: {
        ip: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        source: faker.helpers.arrayElement(['web', 'mobile', 'api']),
        affiliateCode: faker.helpers.maybe(() => faker.string.alphanumeric(8), { probability: 0.2 })
      },
      createdAt: options.createdAt || faker.date.recent({ days: 30 }),
      updatedAt: faker.date.recent({ days: 1 })
    };
    
    // Add status-specific fields
    if (status === 'completed') {
      order.completedAt = faker.date.recent({ days: 1 });
      order.fulfillment = {
        status: 'fulfilled',
        trackingNumber: items.some(item => item.type === 'physical') ? faker.string.alphanumeric(12).toUpperCase() : null,
        carrier: items.some(item => item.type === 'physical') ? faker.helpers.arrayElement(['USPS', 'UPS', 'FedEx']) : null
      };
    } else if (status === 'refunded') {
      order.refund = {
        amount: totalAmount,
        reason: faker.helpers.arrayElement(['customer_request', 'quality_issue', 'not_as_described']),
        refundedAt: faker.date.recent({ days: 5 }),
        notes: faker.lorem.sentence()
      };
    } else if (status === 'cancelled') {
      order.cancellation = {
        reason: faker.helpers.arrayElement(['customer_request', 'payment_failed', 'out_of_stock']),
        cancelledAt: faker.date.recent({ days: 2 }),
        cancelledBy: userId
      };
    }
    
    return order;
  }

  // Generate order items
  generateOrderItems() {
    const itemCount = faker.number.int({ min: 1, max: 4 });
    const items = [];
    const products = this.generateProducts(10); // Generate some products to choose from
    
    for (let i = 0; i < itemCount; i++) {
      const product = faker.helpers.arrayElement(products);
      items.push({
        productId: product._id,
        title: product.title,
        type: product.type,
        price: product.price,
        quantity: product.type === 'physical' ? faker.number.int({ min: 1, max: 3 }) : 1,
        image: product.image
      });
    }
    
    return items;
  }

  // Generate multiple orders
  generateOrders(users, count = 50) {
    const orders = [];
    
    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users);
      orders.push(this.generateOrder(user.id));
    }
    
    return orders;
  }

  // Generate a booking
  generateBooking(userId, services, options = {}) {
    const bookingId = options.id || `book_${Date.now()}_${this.bookingCounter++}`;
    const service = faker.helpers.arrayElement(services);
    const status = options.status || faker.helpers.arrayElement(['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled', 'completed']);
    
    // Generate booking date/time
    let startTime;
    if (status === 'completed') {
      startTime = faker.date.past({ years: 0.5 });
    } else if (status === 'cancelled') {
      startTime = faker.date.recent({ days: 30 });
    } else {
      startTime = faker.date.future({ years: 0.5 });
    }
    
    // Round to nearest hour
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.duration);
    
    const booking = {
      _id: bookingId,
      userId: userId,
      serviceId: service._id,
      serviceName: service.displayName,
      startTime: startTime,
      endTime: endTime,
      duration: service.duration,
      status: status,
      price: service.price.amount,
      notes: options.notes || faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }),
      meetingDetails: {
        type: faker.helpers.arrayElement(['zoom', 'phone', 'in-person']),
        location: null,
        link: null,
        phone: null
      },
      reminder: {
        email: true,
        sms: faker.datatype.boolean(),
        sent: status === 'completed' || status === 'cancelled'
      },
      metadata: {
        source: faker.helpers.arrayElement(['web', 'mobile', 'admin']),
        timezone: faker.helpers.arrayElement(['EST', 'CST', 'PST']),
        rescheduledFrom: faker.helpers.maybe(() => faker.date.past(), { probability: 0.1 })
      },
      createdAt: faker.date.past({ years: 0.5 }),
      updatedAt: faker.date.recent()
    };
    
    // Set meeting details based on type
    if (booking.meetingDetails.type === 'zoom') {
      booking.meetingDetails.link = `https://zoom.us/j/${faker.number.int({ min: 1000000000, max: 9999999999 })}`;
    } else if (booking.meetingDetails.type === 'phone') {
      booking.meetingDetails.phone = faker.phone.number('###-###-####');
    } else {
      booking.meetingDetails.location = faker.location.streetAddress(true);
    }
    
    // Add status-specific fields
    if (status === 'cancelled') {
      booking.cancellation = {
        reason: faker.helpers.arrayElement(['customer_request', 'provider_unavailable', 'rescheduled']),
        cancelledAt: faker.date.recent({ days: 5 }),
        cancelledBy: faker.helpers.arrayElement([userId, 'system', 'admin'])
      };
    } else if (status === 'completed') {
      booking.completion = {
        completedAt: endTime,
        duration: service.duration,
        feedback: {
          rating: faker.number.int({ min: 3, max: 5 }),
          comment: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 })
        }
      };
    }
    
    return booking;
  }

  // Generate multiple bookings
  generateBookings(users, services, count = 30) {
    const bookings = [];
    
    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users);
      bookings.push(this.generateBooking(user.id, services));
    }
    
    return bookings;
  }

  // Generate a discussion
  generateDiscussion(authorId, options = {}) {
    const discussionId = options.id || `disc_${Date.now()}_${this.discussionCounter++}`;
    const category = options.category || faker.helpers.arrayElement(['credit_repair', 'success_stories', 'questions', 'tips', 'general']);
    
    const discussion = {
      _id: discussionId,
      title: options.title || this.generateDiscussionTitle(category),
      content: faker.lorem.paragraphs({ min: 1, max: 3 }),
      author: authorId,
      category: category,
      tags: faker.helpers.arrayElements(['beginner', 'advanced', 'dispute', 'collections', 'mortgage', 'auto-loan', 'student-loans'], { min: 1, max: 3 }),
      status: options.status || 'active',
      likes: faker.number.int({ min: 0, max: 100 }),
      views: faker.number.int({ min: 10, max: 1000 }),
      replies: [],
      isPinned: faker.datatype.boolean({ probability: 0.1 }),
      isFeatured: faker.datatype.boolean({ probability: 0.05 }),
      metadata: {
        lastActivity: faker.date.recent({ days: 7 }),
        editedAt: faker.helpers.maybe(() => faker.date.recent({ days: 3 }), { probability: 0.2 })
      },
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 })
    };
    
    // Generate replies
    const replyCount = faker.number.int({ min: 0, max: 20 });
    for (let i = 0; i < replyCount; i++) {
      discussion.replies.push(this.generateReply(discussionId));
    }
    
    return discussion;
  }

  // Generate discussion title based on category
  generateDiscussionTitle(category) {
    const titleTemplates = {
      credit_repair: [
        'How do I dispute this collection account?',
        'Credit score dropped 50 points - help!',
        'Best way to remove late payments?',
        'Should I pay off collections or let them age?',
        'Goodwill letter success stories'
      ],
      success_stories: [
        'From 520 to 750 in 18 months!',
        'Finally approved for a mortgage!',
        'My credit repair journey - thank you Coach Tae!',
        'Removed 12 negative items in 6 months',
        'Zero to 700 club member!'
      ],
      questions: [
        'Is Credit Karma score accurate?',
        'How long do collections stay on report?',
        'Can I dispute online or should I mail letters?',
        'Best secured credit cards for rebuilding?',
        'How many credit cards should I have?'
      ],
      tips: [
        'The 30% utilization rule is a myth',
        'Always opt out of prescreened offers',
        'My dispute letter template that works',
        'How to negotiate with collection agencies',
        'Building credit with no credit history'
      ],
      general: [
        'New member introduction',
        'Weekly check-in thread',
        'Credit monitoring services comparison',
        'Anyone else dealing with identity theft?',
        'Student loan strategies'
      ]
    };
    
    return faker.helpers.arrayElement(titleTemplates[category] || titleTemplates.general);
  }

  // Generate a reply
  generateReply(discussionId, authorId = null) {
    return {
      _id: `reply_${uuidv4()}`,
      discussionId: discussionId,
      author: authorId || `user_${faker.number.int({ min: 1, max: 100 })}`,
      content: faker.lorem.paragraphs({ min: 1, max: 2 }),
      likes: faker.number.int({ min: 0, max: 50 }),
      isAnswer: faker.datatype.boolean({ probability: 0.1 }),
      mentions: faker.helpers.maybe(() => [`@user_${faker.number.int({ min: 1, max: 100 })}`], { probability: 0.3 }),
      createdAt: faker.date.recent({ days: 7 }),
      editedAt: faker.helpers.maybe(() => faker.date.recent({ days: 1 }), { probability: 0.1 })
    };
  }

  // Generate multiple discussions
  generateDiscussions(users, count = 50) {
    const discussions = [];
    
    for (let i = 0; i < count; i++) {
      const author = faker.helpers.arrayElement(users);
      discussions.push(this.generateDiscussion(author.id));
    }
    
    return discussions;
  }

  // Generate a lead
  generateLead(options = {}) {
    const leadId = options.id || `lead_${uuidv4()}`;
    const source = options.source || faker.helpers.arrayElement(['landing_page', 'popup', 'footer', 'blog', 'webinar', 'social_media']);
    
    return {
      _id: leadId,
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.helpers.maybe(() => faker.phone.number('###-###-####'), { probability: 0.7 }),
      source: source,
      campaign: faker.helpers.maybe(() => faker.helpers.arrayElement(['summer_special', 'black_friday', 'new_year', 'webinar_funnel']), { probability: 0.5 }),
      creditScore: faker.helpers.maybe(() => faker.number.int({ min: 300, max: 850 }), { probability: 0.6 }),
      interests: faker.helpers.arrayElements(['credit_repair', 'business_credit', 'real_estate', 'financial_planning'], { min: 1, max: 3 }),
      status: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'converted', 'unsubscribed']),
      tags: faker.helpers.arrayElements(['hot_lead', 'needs_nurturing', 'price_sensitive', 'ready_to_buy'], { min: 0, max: 2 }),
      utm: {
        source: faker.helpers.arrayElement(['google', 'facebook', 'instagram', 'email', 'direct']),
        medium: faker.helpers.arrayElement(['cpc', 'social', 'email', 'organic']),
        campaign: faker.helpers.maybe(() => faker.string.alphanumeric(10), { probability: 0.5 })
      },
      metadata: {
        ip: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        referrer: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.7 }),
        landingPage: faker.helpers.arrayElement(['/free-guide', '/webinar', '/consultation', '/'])
      },
      engagement: {
        emailsOpened: faker.number.int({ min: 0, max: 20 }),
        linksClicked: faker.number.int({ min: 0, max: 10 }),
        lastEngagement: faker.date.recent({ days: 14 })
      },
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 })
    };
  }

  // Generate multiple leads
  generateLeads(count = 100) {
    const leads = [];
    
    for (let i = 0; i < count; i++) {
      leads.push(this.generateLead());
    }
    
    return leads;
  }

  // Generate complete mock data set
  generateCompleteDataSet(options = {}) {
    const counts = {
      users: options.users || 50,
      products: options.products || 30,
      services: options.services || 10,
      orders: options.orders || 100,
      bookings: options.bookings || 50,
      discussions: options.discussions || 75,
      leads: options.leads || 200
    };
    
    console.log('Generating mock data set...');
    
    const users = this.generateUsers(counts.users);
    console.log(`✓ Generated ${users.length} users`);
    
    const products = this.generateProducts(counts.products);
    console.log(`✓ Generated ${products.length} products`);
    
    const services = this.generateServices(counts.services);
    console.log(`✓ Generated ${services.length} services`);
    
    const orders = this.generateOrders(users, counts.orders);
    console.log(`✓ Generated ${orders.length} orders`);
    
    const bookings = this.generateBookings(users, services, counts.bookings);
    console.log(`✓ Generated ${bookings.length} bookings`);
    
    const discussions = this.generateDiscussions(users, counts.discussions);
    console.log(`✓ Generated ${discussions.length} discussions`);
    
    const leads = this.generateLeads(counts.leads);
    console.log(`✓ Generated ${leads.length} leads`);
    
    return {
      users,
      products,
      services,
      orders,
      bookings,
      discussions,
      leads,
      metadata: {
        generated: new Date(),
        counts,
        version: '1.0.0'
      }
    };
  }

  // Export data to files
  async exportToFiles(data, outputDir = './test-data') {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Export each data type
    const exports = [
      { name: 'users', data: data.users, dir: 'users' },
      { name: 'products', data: data.products, dir: 'products' },
      { name: 'services', data: data.services, dir: 'services' },
      { name: 'orders', data: data.orders, dir: 'orders' },
      { name: 'bookings', data: data.bookings, dir: 'bookings' },
      { name: 'discussions', data: data.discussions, dir: 'community' },
      { name: 'leads', data: data.leads, dir: 'leads' }
    ];
    
    for (const exp of exports) {
      const dir = path.join(outputDir, exp.dir);
      await fs.mkdir(dir, { recursive: true });
      
      const filePath = path.join(dir, `test-${exp.name}.json`);
      await fs.writeFile(filePath, JSON.stringify(exp.data, null, 2));
      console.log(`✓ Exported ${exp.name} to ${filePath}`);
    }
    
    // Export metadata
    const metadataPath = path.join(outputDir, 'test-config.json');
    await fs.writeFile(metadataPath, JSON.stringify(data.metadata, null, 2));
    console.log(`✓ Exported metadata to ${metadataPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const generator = new MockDataGenerator();
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Mock Data Generator for Credit Gyems Academy

Usage:
  node mock-data-generator.js [options]

Options:
  --users <n>        Number of users to generate (default: 50)
  --products <n>     Number of products to generate (default: 30)
  --services <n>     Number of services to generate (default: 10)
  --orders <n>       Number of orders to generate (default: 100)
  --bookings <n>     Number of bookings to generate (default: 50)
  --discussions <n>  Number of discussions to generate (default: 75)
  --leads <n>        Number of leads to generate (default: 200)
  --output <dir>     Output directory (default: ./test-data)
  --export           Export to files
  --help             Show this help message

Examples:
  node mock-data-generator.js --export
  node mock-data-generator.js --users 100 --orders 500 --export
  node mock-data-generator.js --output ../QA/test-data --export
    `);
    process.exit(0);
  }
  
  // Parse arguments
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      if (key === 'export') {
        options.export = true;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = isNaN(args[i + 1]) ? args[i + 1] : parseInt(args[i + 1]);
        i++;
      }
    }
  }
  
  // Generate data
  const data = generator.generateCompleteDataSet(options);
  
  // Export if requested
  if (options.export) {
    const outputDir = options.output || './test-data';
    generator.exportToFiles(data, outputDir).then(() => {
      console.log('\n✅ Mock data generation complete!');
    }).catch(err => {
      console.error('Error exporting data:', err);
    });
  } else {
    console.log('\nGenerated data summary:');
    console.log(JSON.stringify(data.metadata, null, 2));
    console.log('\nUse --export flag to save data to files');
  }
}

module.exports = MockDataGenerator;