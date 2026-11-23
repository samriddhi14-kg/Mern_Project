const Food = require('../models/Food');
const generateOrderNumber = require('../utils/createOrderNumber');

/**
 * Validates checkout items against database prices and stock,
 * creates immutable snapshots, and recalculates totals.
 */
const processCheckout = async ({ items, delivery, user }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Checkout must contain at least one item.');
    error.statusCode = 400;
    throw error;
  }

  if (!delivery || !delivery.recipientName || !delivery.phone || !delivery.address) {
    const error = new Error('Delivery details (recipient name, phone, address) are required.');
    error.statusCode = 400;
    throw error;
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    if (!item.foodId || !item.quantity || item.quantity < 1) {
      const error = new Error('Each item must include a valid foodId and a positive quantity.');
      error.statusCode = 400;
      throw error;
    }

    const food = await Food.findById(item.foodId);
    if (!food) {
      const error = new Error(`Food item with ID ${item.foodId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (!food.isAvailable) {
      const error = new Error(`'${food.name}' is currently unavailable. Please remove it from your cart.`);
      error.statusCode = 400;
      throw error;
    }

    const quantity = parseInt(item.quantity, 10);
    const unitPrice = food.price;
    const lineTotal = unitPrice * quantity;

    subtotal += lineTotal;

    orderItems.push({
      food: food._id,
      name: food.name,
      image: food.image || '',
      unitPrice,
      quantity,
      lineTotal
    });
  }

  const deliveryFee = Number(process.env.DELIVERY_FEE) || 50;
  const total = subtotal + deliveryFee;
  const orderNumber = await generateOrderNumber();

  return {
    orderNumber,
    user: user._id,
    items: orderItems,
    delivery: {
      recipientName: delivery.recipientName.trim(),
      phone: delivery.phone.trim(),
      address: delivery.address.trim(),
      instructions: (delivery.instructions || '').trim()
    },
    subtotal,
    deliveryFee,
    total,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'PLACED',
    statusHistory: [
      {
        status: 'PLACED',
        note: 'Order placed by customer',
        changedBy: user._id,
        changedAt: new Date()
      }
    ]
  };
};

module.exports = {
  processCheckout
};
