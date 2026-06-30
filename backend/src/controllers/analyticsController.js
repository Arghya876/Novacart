const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard analytics (Admin)
// @route   GET /api/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // 1. General counts
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalOrders = await Order.countDocuments();

    // 2. Total Revenue & Sales over time (monthly)
    const salesData = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedSales = salesData.map((item) => ({
      month: months[item._id - 1] || `Month ${item._id}`,
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.orders,
    }));

    const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);

    // 3. Category Sales Distribution
    const categorySales = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails.name',
          value: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ]);

    // 4. Recent Orders
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalUsers,
          totalSellers,
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
        },
        salesOverTime: formattedSales,
        categorySales,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics (Seller)
// @route   GET /api/analytics/seller
// @access  Private (Seller)
exports.getSellerAnalytics = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // 1. Get products owned by this seller
    const sellerProducts = await Product.find({ seller: sellerId });
    const sellerProductIds = sellerProducts.map((p) => p._id);

    // 2. Aggregate orders containing this seller's products
    const ordersWithSellerProducts = await Order.aggregate([
      { $match: { 'orderItems.product': { $in: sellerProductIds } } },
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.product': { $in: sellerProductIds } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          totalItemsSold: { $sum: '$orderItems.quantity' },
        },
      },
    ]);

    const revenue = ordersWithSellerProducts[0]?.totalRevenue || 0;
    const itemsSold = ordersWithSellerProducts[0]?.totalItemsSold || 0;

    // 3. Seller sales over time (monthly)
    const monthlySales = await Order.aggregate([
      { $match: { 'orderItems.product': { $in: sellerProductIds } } },
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.product': { $in: sellerProductIds } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          sales: { $sum: '$orderItems.quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedSales = monthlySales.map((item) => ({
      month: months[item._id - 1] || `Month ${item._id}`,
      revenue: Math.round(item.revenue * 100) / 100,
      sales: item.sales,
    }));

    // 4. Top Selling Products
    const topProducts = await Order.aggregate([
      { $match: { 'orderItems.product': { $in: sellerProductIds } } },
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.product': { $in: sellerProductIds } } },
      {
        $group: {
          _id: '$orderItems.product',
          title: { $first: '$orderItems.title' },
          image: { $first: '$orderItems.image' },
          quantitySold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProducts: sellerProducts.length,
          totalRevenue: Math.round(revenue * 100) / 100,
          totalItemsSold: itemsSold,
        },
        salesOverTime: formattedSales,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};
