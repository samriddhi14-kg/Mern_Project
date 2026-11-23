const Order = require('../models/Order');
const { processCheckout } = require('../services/checkoutService');
const { applyStatusChange } = require('../services/orderStatusService');

/**
 * Place a new order
 * @route POST /api/v1/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, delivery } = req.body;

    // Server-side calculation and price snapshots
    const orderData = await processCheckout({
      items,
      delivery,
      user: req.user
    });

    const order = await Order.create(orderData);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders for currently logged in customer
 * @route GET /api/v1/orders/my
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a single order (owner or admin)
 * @route GET /api/v1/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('statusHistory.changedBy', 'name role')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Security check: Only the order owner or an admin can access this order
    const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view another customer’s order.'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order by customer (allowed only when status is PLACED)
 * @route PATCH /api/v1/orders/:id/cancel
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Ensure customer owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own order.'
      });
    }

    // Customer cancellation allowed only from PLACED status
    if (order.status !== 'PLACED') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already '${order.status}'. Cancellation is only allowed while order is PLACED.`
      });
    }

    const reason = req.body.reason || 'Cancelled by customer';
    applyStatusChange(order, 'CANCELLED', 'Order cancelled by customer', req.user._id, reason);
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
};
