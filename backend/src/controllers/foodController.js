const Food = require('../models/Food');
const Category = require('../models/Category');

/**
 * Get public available foods with search and category filtering
 * @route GET /api/v1/foods
 */
const getFoods = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = { isAvailable: true };

    if (category) {
      // Check if category is slug or ObjectId
      let cat = await Category.findOne({ slug: category.toLowerCase() });
      if (!cat && category.match(/^[0-9a-fA-F]{24}$/)) {
        cat = await Category.findById(category);
      }
      if (cat) {
        filter.category = cat._id;
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const foods = await Food.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single food details
 * @route GET /api/v1/foods/:id
 */
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('category', 'name slug');
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: food
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoods,
  getFoodById
};
