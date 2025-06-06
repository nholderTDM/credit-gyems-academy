// Validate discount
exports.validateDiscount = async (discount, userId, subtotal, productIds) => {
    try {
      // Check if discount is active
      if (!discount.isActive) {
        return { valid: false, message: 'Discount code is inactive' };
      }
      
      // Check start and end dates
      const now = new Date();
      
      if (discount.startDate && new Date(discount.startDate) > now) {
        return { valid: false, message: 'Discount code is not yet active' };
      }
      
      if (discount.endDate && new Date(discount.endDate) < now) {
        return { valid: false, message: 'Discount code has expired' };
      }
      
      // Check min order amount
      if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
        return { 
          valid: false, 
          message: `Order must be at least $${discount.minOrderAmount.toFixed(2)} to use this discount` 
        };
      }
      
      // Check max uses
      if (discount.maxUses && discount.usesCount >= discount.maxUses) {
        return { valid: false, message: 'Discount code has reached maximum usage' };
      }
      
      // Check per user limit
      if (discount.perUserLimit) {
        const userUsage = discount.userUsage.find(
          usage => usage.userId.toString() === userId.toString()
        );
        
        if (userUsage && userUsage.usesCount >= discount.perUserLimit) {
          return { 
            valid: false, 
            message: `You have already used this discount code ${discount.perUserLimit} times` 
          };
        }
      }
      
      // Check applicable products
      if (discount.applicableProducts && discount.applicableProducts.length > 0) {
        const hasApplicableProduct = productIds.some(id => 
          discount.applicableProducts.some(
            productId => productId.toString() === id.toString()
          )
        );
        
        if (!hasApplicableProduct) {
          return { valid: false, message: 'Discount code is not applicable to these products' };
        }
      }
      
      // Calculate discount amount
      let amount = 0;
      
      if (discount.type === 'percentage') {
        amount = subtotal * (discount.value / 100);
      } else if (discount.type === 'fixed_amount') {
        amount = Math.min(discount.value, subtotal);
      }
      
      return { valid: true, amount };
    } catch (error) {
      console.error('Error validating discount:', error);
      return { valid: false, message: 'Error validating discount' };
    }
  };