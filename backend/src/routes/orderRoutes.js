const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} = require('../controllers/orderController');
const protect = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', validateObjectId('id'), getOrderById);
router.patch('/:id/cancel', validateObjectId('id'), cancelOrder);

module.exports = router;
