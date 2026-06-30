const express = require('express');
const router = express.Router();
const debugLog = require('../utils/debugLog');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAutocompleteSuggestions,
  getProductsBatch,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { getPersonalizedRecommendations } = require('../utils/recommendations');

// Public routes
router.get('/', getProducts);
router.get('/autocomplete', getAutocompleteSuggestions);
router.post('/batch', getProductsBatch);
router.get('/:idOrSlug', getProduct);

// Recommendation route
router.post('/recommendations', async (req, res, next) => {
  try {
    const { recentlyViewedIds, limit } = req.body;
    // #region agent log
    debugLog('productRoutes.js:recommendations', 'Recommendations route hit', { recentlyViewedCount: recentlyViewedIds?.length ?? 0, limit }, 'H4', 'post-fix');
    // #endregion
    const products = await getPersonalizedRecommendations(recentlyViewedIds, limit);
    // #region agent log
    debugLog('productRoutes.js:recommendations', 'Recommendations result', { count: products.length }, 'H4', 'post-fix');
    // #endregion
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

// Protected routes (Sellers and Admins only)
router.post('/', protect, authorize('seller', 'admin'), createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
