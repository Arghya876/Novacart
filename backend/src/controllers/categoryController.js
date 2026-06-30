const Category = require('../models/Category');
const { getFallbackCategories } = require('../utils/fallbackData');
const { shouldUseFallbackData } = require('../utils/dbState');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      return res.status(200).json({ success: true, count: getFallbackCategories().length, data: getFallbackCategories() });
    }

    const categories = await Category.find().populate('parentCategory', 'name slug');
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:idOrSlug
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const isId = req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const filter = isId ? { _id: req.params.idOrSlug } : { slug: req.params.idOrSlug };

    const category = await Category.findOne(filter).populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
