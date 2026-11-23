const Order = require('../models/Order');

const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  let unique = false;
  let orderNumber = '';

  while (!unique) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    orderNumber = `FD-${year}-${randomSuffix}`;
    const existing = await Order.findOne({ orderNumber });
    if (!existing) {
      unique = true;
    }
  }

  return orderNumber;
};

module.exports = generateOrderNumber;
