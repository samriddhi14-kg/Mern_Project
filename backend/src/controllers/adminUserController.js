const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Get paginated list of customers (admin only)
 * @route GET /api/v1/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { role: 'customer' };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single customer details with order history summary
 * @route GET /api/v1/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    const orderCount = await Order.countDocuments({ user: user._id });

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        orderCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById
};
