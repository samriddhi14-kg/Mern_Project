const express = require('express');
const router = express.Router();
const { getFoods, getFoodById } = require('../controllers/foodController');
const { validateObjectId } = require('../middleware/validate');

router.get('/', getFoods);
router.get('/:id', validateObjectId('id'), getFoodById);

module.exports = router;
