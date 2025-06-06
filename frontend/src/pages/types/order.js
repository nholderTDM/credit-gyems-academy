export const OrderItemTemplate = {
    productId: '',
    quantity: 1,
    price: 0,
    productSnapshot: {
      title: '',
      price: 0,
      type: '',
      image: ''
    }
  };
  
  export const OrderTemplate = {
    id: '',
    orderNumber: '',
    userId: '',
    items: [OrderItemTemplate],
    subtotal: 0,
    discountCode: '',
    discountAmount: 0,
    tax: 0,
    total: 0,
    paymentMethod: '',
    paymentStatus: '',
    stripePaymentIntentId: '',
    fulfillmentStatus: '',
    fulfillmentDetails: {
      emailSent: false,
      emailSentAt: '',
      downloadLinks: [
        {
          productId: '',
          title: '',
          url: '',
          expiresAt: ''
        }
      ]
    },
    customerEmail: '',
    customerName: '',
    createdAt: '',
    updatedAt: '',
    paidAt: '',
    fulfilledAt: ''
  };
  