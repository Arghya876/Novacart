const Review = require('../models/Review');
const Product = require('../models/Product');
const { getFallbackReviews } = require('../utils/fallbackData');
const { shouldUseFallbackData } = require('../utils/dbState');

// @desc    Add or update a review for a product
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check if user already reviewed the product
    let review = await Review.findOne({ product: productId, user: req.user.id });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } else {
      // Create new review
      review = await Review.create({
        product: productId,
        user: req.user.id,
        rating,
        comment,
      });

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: review,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Make sure user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review',
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      const reviews = getFallbackReviews(req.params.productId);
      return res.status(200).json({ success: true, count: reviews.length, data: reviews });
    }

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
