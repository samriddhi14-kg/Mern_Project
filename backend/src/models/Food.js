const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide food name'],
      trim: true,
      maxlength: [100, 'Food name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Food item must belong to a category']
    },
    price: {
      type: Number,
      required: [true, 'Please specify price in NPR'],
      min: [0, 'Price must be positive']
    },
    image: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    preparationTimeMinutes: {
      type: Number,
      default: 20
    }
  },
  {
    timestamps: true
  }
);

foodSchema.index({ category: 1, isAvailable: 1 });
foodSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Food', foodSchema);
