const Order = require('../models/Order');
const User = require('../models/User');
const Food = require('../models/Food');
const Category = require('../models/Category');
const { applyStatusChange } = require('../services/orderStatusService');

/**
 * Get admin dashboard summary metrics
 * @route GET /api/v1/admin/dashboard
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const activeFoods = await Food.countDocuments({ isAvailable: true });
    const newOrders = await Order.countDocuments({ status: 'PLACED' });
    const ordersInProgress = await Order.countDocuments({
      status: { $in: ['CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY'] }
    });
    const deliveredOrders = await Order.countDocuments({ status: 'DELIVERED' });
    const cancelledOrders = await Order.countDocuments({ status: 'CANCELLED' });

    // Calculate total revenue from delivered orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeFoods,
        newOrders,
        ordersInProgress,
        deliveredOrders,
        cancelledOrders,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders with status/date filters and pagination
 * @route GET /api/v1/admin/orders
 */
const getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order details for admin
 * @route GET /api/v1/admin/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('statusHistory.changedBy', 'name role');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
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
 * Update order status through allowed state machine
 * @route PATCH /api/v1/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, cancellationReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Target status is required.'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Apply validated state transition
    applyStatusChange(order, status, note, req.user._id, cancellationReason);

    // If delivered, mark paymentStatus as PAID for COD
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Food Management
 */
const getAdminFoods = async (req, res, next) => {
  try {
    const foods = await Food.find().populate('category', 'name slug').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    next(error);
  }
};

const createFood = async (req, res, next) => {
  try {
    const { name, description, category, price, image, isAvailable, preparationTimeMinutes } = req.body;

    const food = await Food.create({
      name: name.trim(),
      description: description || '',
      category,
      price: Number(price),
      image: image || '/images/burger.jpg',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      preparationTimeMinutes: preparationTimeMinutes || 20
    });

    const populated = await Food.findById(food._id).populate('category', 'name slug');
    return res.status(201).json({ success: true, message: 'Food item created successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    return res.status(200).json({ success: true, message: 'Food item updated successfully.', data: food });
  } catch (error) {
    next(error);
  }
};

const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    // Check if food appears in any past orders
    const hasOrders = await Order.exists({ 'items.food': food._id });
    if (hasOrders) {
      // Soft-deactivate to preserve past order history integrity
      food.isAvailable = false;
      await food.save();
      return res.status(200).json({
        success: true,
        message: 'Food item exists in past orders; it has been deactivated rather than deleted.',
        data: food
      });
    }

    await Food.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Food item deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Category Management
 */
const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, isActive } = req.body;

    const generatedSlug = slug
      ? slug.toLowerCase().trim()
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await Category.create({
      name: name.trim(),
      slug: generatedSlug,
      description: description || '',
      image: image || '',
      isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json({ success: true, message: 'Category created successfully.', data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({ success: true, message: 'Category updated successfully.', data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if any foods belong to this category
    const linkedFoodCount = await Food.countDocuments({ category: category._id });
    if (linkedFoodCount > 0) {
      // Soft-deactivate if items are linked
      category.isActive = false;
      await category.save();
      return res.status(200).json({
        success: true,
        message: `Category has ${linkedFoodCount} linked food items; it has been deactivated rather than deleted.`,
        data: category
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getAdminFoods,
  createFood,
  updateFood,
  deleteFood,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
