const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe customer
exports.createStripeCustomer = async (customerData) => {
  try {
    const customer = await stripe.customers.create({
      email: customerData.email,
      name: customerData.name
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Get or create customer
exports.getOrCreateCustomer = async (user) => {
  try {
    if (user.stripeCustomerId) {
      // Get existing customer
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      
      // Check if customer exists
      if (!customer.deleted) {
        return customer;
      }
    }
    
    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });
    
    // Update user with customer ID
    user.stripeCustomerId = customer.id;
    await user.save();
    
    return customer;
  } catch (error) {
    console.error('Error getting or creating Stripe customer:', error);
    throw error;
  }
};

// Create payment method
exports.createPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

// Get payment methods
exports.getPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });
    
    return paymentMethods.data;
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
};

// Create subscription
exports.createSubscription = async (customerId, priceId, paymentMethodId) => {
  try {
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId
        }
      ],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent']
    });
    
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Cancel subscription
exports.cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Create checkout session
exports.createCheckoutSession = async (customerId, priceId, successUrl, cancelUrl) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};