const Product = require('../models/Product');
const Category = require('../models/Category');
const debugLog = require('../utils/debugLog');
const { shouldUseFallbackData } = require('../utils/dbState');
const {
  getFallbackCategories,
  getFallbackProducts,
  getFallbackProduct,
  getFallbackAutocomplete,
  getFallbackProductsByIds,
} = require('../utils/fallbackData');

// @desc    Get all products with advanced filtering, sorting, search & pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    let query;

    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      const fallback = getFallbackProducts(req.query);
      return res.status(200).json({ success: true, count: fallback.data.length, total: fallback.total, pagination: fallback.pagination, data: fallback.data });
    }

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    // Parse back to object
    let filterObject = JSON.parse(queryStr);

    // Handle search query
    if (req.query.search) {
      filterObject.$text = { $search: req.query.search };
    }

    // Handle price range manually if passed as minPrice/maxPrice
    if (req.query.minPrice || req.query.maxPrice) {
      filterObject.price = {};
      if (req.query.minPrice) filterObject.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filterObject.price.$lte = Number(req.query.maxPrice);
    }

    // Handle rating filter
    if (req.query.rating) {
      filterObject.ratings = { $gte: Number(req.query.rating) };
    }

    // Handle featured filter (query params arrive as strings)
    if (req.query.isFeatured === 'true') {
      filterObject.isFeatured = true;
    } else if (req.query.isFeatured === 'false') {
      filterObject.isFeatured = false;
    }

    // #region agent log
    debugLog('productController.js:getProducts', 'Filter after boolean coercion', { rawIsFeatured: req.query.isFeatured, filterIsFeatured: filterObject.isFeatured, filterIsFeaturedType: typeof filterObject.isFeatured }, 'H2', 'post-fix');
    // #endregion

    // Handle discount filter
    if (req.query.hasDiscount === 'true') {
      filterObject.discountPrice = { $gt: 0 };
    }

    // Handle availability
    if (req.query.inStock === 'true') {
      filterObject.stock = { $gt: 0 };
    }

    // Finding resource
    query = Product.find(filterObject);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default: Newest first
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(filterObject);

    // #region agent log
    debugLog('productController.js:getProducts', 'Query result count', { total, filterIsFeatured: filterObject.isFeatured, filterIsFeaturedType: typeof filterObject.isFeatured, page, limit }, 'H2', 'post-fix');
    // #endregion

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query.populate('category', 'name slug');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:idOrSlug
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const isId = req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      const product = getFallbackProduct(req.params.idOrSlug);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      return res.status(200).json({ success: true, data: product });
    }
    const filter = isId ? { _id: req.params.idOrSlug } : { slug: req.params.idOrSlug };

    const product = await Product.findOne(filter)
      .populate('category', 'name slug')
      .populate('seller', 'name email avatar');

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Seller/Admin)
exports.createProduct = async (req, res, next) => {
  try {
    // Add seller to req.body
    req.body.seller = req.user.id;

    // Validate category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({ success: false, error: 'Invalid category ID' });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Make sure user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: `User ${req.user.id} is not authorized to update this product`,
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Make sure user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: `User ${req.user.id} is not authorized to delete this product`,
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Autocomplete search suggestions
// @route   GET /api/products/autocomplete
// @access  Public
exports.getAutocompleteSuggestions = async (req, res, next) => {
  try {
    const search = req.query.q;
    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      return res.status(200).json({ success: true, data: getFallbackAutocomplete(search) });
    }
    if (!search) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Search by title prefix or text matching
    const suggestions = await Product.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ],
    })
      .select('title slug category brand price images')
      .limit(8)
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by array of IDs (recently viewed, compare, cart details)
// @route   POST /api/products/batch
// @access  Public
exports.getProductsBatch = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      return res.status(200).json({ success: true, data: getFallbackProductsByIds(ids || []) });
    }

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'Please provide an array of product IDs' });
    }

    const products = await Product.find({ _id: { $in: ids } }).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
