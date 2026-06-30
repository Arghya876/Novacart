const Product = require('../models/Product');
const { shouldUseFallbackData } = require('./dbState');
const { getFallbackProducts } = require('./fallbackData');

// Get products related to a specific product (Content-based filtering)
const getRelatedProducts = async (product, limit = 5) => {
  try {
    const related = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags || [] } },
      ],
    })
      .limit(limit)
      .populate('category', 'name slug');

    return related;
  } catch (error) {
    console.error('Error in getRelatedProducts:', error);
    return [];
  }
};

// Get personalized recommendations for a user based on recently viewed product IDs
const getPersonalizedRecommendations = async (recentlyViewedIds = [], limit = 6) => {
  try {
    if (shouldUseFallbackData()) {
      const fallback = getFallbackProducts({ limit, isFeatured: 'true' });
      return fallback.data.slice(0, limit);
    }

    // If no recent items, return featured or top rated products
    if (!recentlyViewedIds || recentlyViewedIds.length === 0) {
      return await Product.find({ isFeatured: true })
        .limit(limit)
        .populate('category', 'name slug');
    }

    // Get categories of recently viewed products
    const viewedProducts = await Product.find({ _id: { $in: recentlyViewedIds } });
    const categories = viewedProducts.map((p) => p.category);
    const brands = viewedProducts.map((p) => p.brand);

    // Find products in similar categories or brands, excluding already viewed
    const recommendations = await Product.find({
      _id: { $nin: recentlyViewedIds },
      $or: [
        { category: { $in: categories } },
        { brand: { $in: brands } },
      ],
    })
      .sort('-ratings')
      .limit(limit)
      .populate('category', 'name slug');

    // If we didn't get enough recommendations, backfill with top-rated products
    if (recommendations.length < limit) {
      const extraLimit = limit - recommendations.length;
      const alreadyIncludedIds = [
        ...recentlyViewedIds,
        ...recommendations.map((r) => r._id.toString()),
      ];
      const backfill = await Product.find({ _id: { $nin: alreadyIncludedIds } })
        .sort('-ratings')
        .limit(extraLimit)
        .populate('category', 'name slug');
      
      return [...recommendations, ...backfill];
    }

    return recommendations;
  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    return await Product.find().limit(limit).populate('category', 'name slug');
  }
};

module.exports = {
  getRelatedProducts,
  getPersonalizedRecommendations,
};
