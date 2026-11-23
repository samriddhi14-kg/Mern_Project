const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateObjectId } = require('../middleware/validate');

const { getUsers, getUserById } = require('../controllers/adminUserController');
const {
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
} = require('../controllers/adminOrderController');

// All admin routes strictly require authentication and role=admin
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardMetrics);

// Users
router.get('/users', getUsers);
router.get('/users/:id', validateObjectId('id'), getUserById);

// Foods
router.get('/foods', getAdminFoods);
router.post('/foods', createFood);
router.patch('/foods/:id', validateObjectId('id'), updateFood);
router.delete('/foods/:id', validateObjectId('id'), deleteFood);

// Categories
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', validateObjectId('id'), updateCategory);
router.delete('/categories/:id', validateObjectId('id'), deleteCategory);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', validateObjectId('id'), getOrderById);
router.patch('/orders/:id/status', validateObjectId('id'), updateOrderStatus);

module.exports = router;
