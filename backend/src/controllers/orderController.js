const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      shippingPrice,
      taxPrice,
      couponCode,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No order items' });
    }

    // Verify stock and calculate prices
    let calculatedSubtotal = 0;
    const itemsToCreate = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product ${product.title}. Available: ${product.stock}`,
        });
      }

      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      calculatedSubtotal += price * item.quantity;

      itemsToCreate.push({
        product: product._id,
        title: product.title,
        quantity: item.quantity,
        image: product.images[0],
        price: price,
      });
    }

    // Process Coupon if any
    let discount = 0;
    let couponApplied = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid(calculatedSubtotal)) {
        couponApplied = coupon._id;
        if (coupon.discountType === 'percentage') {
          discount = (calculatedSubtotal * coupon.discountAmount) / 100;
        } else {
          discount = coupon.discountAmount;
        }
      }
    }

    const totalPrice = calculatedSubtotal - discount + Number(shippingPrice) + Number(taxPrice);

    // Create Order
    const order = await Order.create({
      user: req.user.id,
      orderItems: itemsToCreate,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid', // In real app, check payment status from gateway
      paymentDetails,
      shippingPrice,
      taxPrice,
      totalPrice: Math.max(0, totalPrice),
      couponApplied,
    });

    // Update product stock levels
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('couponApplied', 'code discountAmount discountType');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Check if user is owner, seller of any item, or admin
    const isAdmin = req.user.role === 'admin';
    const isOwner = order.user._id.toString() === req.user.id;

    let isSellerOfItem = false;
    if (req.user.role === 'seller') {
      // Check if seller owns any product in this order
      const productIds = order.orderItems.map((item) => item.product);
      const sellerProducts = await Product.find({
        _id: { $in: productIds },
        seller: req.user.id,
      });
      if (sellerProducts.length > 0) {
        isSellerOfItem = true;
      }
    }

    if (!isOwner && !isAdmin && !isSellerOfItem) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order',
      });
    }

    // For sellers, filter out other sellers' items for privacy
    if (req.user.role === 'seller' && !isAdmin) {
      const sellerProducts = await Product.find({ seller: req.user.id });
      const sellerProductIds = sellerProducts.map((p) => p._id.toString());
      const filteredItems = order.orderItems.filter((item) =>
        sellerProductIds.includes(item.product.toString())
      );
      
      // Return a modified order object with only the seller's items
      const sellerOrder = order.toObject();
      sellerOrder.orderItems = filteredItems;
      return res.status(200).json({ success: true, data: sellerOrder });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('couponApplied', 'code')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin / Seller)
// @route   GET /api/orders
// @access  Private (Seller/Admin)
exports.getOrders = async (req, res, next) => {
  try {
    let orders;

    if (req.user.role === 'admin') {
      orders = await Order.find()
        .populate('user', 'name email')
        .sort('-createdAt');
    } else if (req.user.role === 'seller') {
      // Find products belonging to this seller
      const sellerProducts = await Product.find({ seller: req.user.id });
      const sellerProductIds = sellerProducts.map((p) => p._id);

      // Find orders that contain this seller's products
      orders = await Order.find({
        'orderItems.product': { $in: sellerProductIds },
      })
        .populate('user', 'name email')
        .sort('-createdAt');

      // Filter orderItems for each order to only include this seller's items
      orders = orders.map((order) => {
        const orderObj = order.toObject();
        orderObj.orderItems = orderObj.orderItems.filter((item) =>
          sellerProductIds.some((spId) => spId.toString() === item.product.toString())
        );
        return orderObj;
      });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'Paid'; // Cash on delivery is now paid
    }

    order.orderStatus = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin only)
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer who placed the order)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Make sure the order belongs to the logged-in user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to cancel this order',
      });
    }

    // Only allow cancelling if status is Pending or Processing
    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Processing') {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel an order that is already ${order.orderStatus}`,
      });
    }

    // Cancel all items too
    order.orderItems.forEach(item => {
      item.status = 'Cancelled';
    });

    order.orderStatus = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel individual order item
// @route   PUT /api/orders/:id/items/:productId/cancel
// @access  Private (Customer who placed the order)
exports.cancelOrderItem = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify ownership
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You are not authorized to cancel this item' });
    }

    // Check if order is processing/pending
    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Processing') {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel item. Order is already ${order.orderStatus}`,
      });
    }

    // Find the item
    const item = order.orderItems.find(
      (i) => i.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found in order' });
    }

    if (item.status === 'Cancelled') {
      return res.status(400).json({ success: false, error: 'Item is already cancelled' });
    }

    // Cancel it
    item.status = 'Cancelled';

    // Recalculate total price
    const itemCost = item.price * item.quantity;
    order.totalPrice = Math.max(0, order.totalPrice - itemCost);

    // Check if all items are cancelled
    const allCancelled = order.orderItems.every((i) => i.status === 'Cancelled');
    if (allCancelled) {
      order.orderStatus = 'Cancelled';
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
