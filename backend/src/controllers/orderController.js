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

    // Send Invoice Email (fired asynchronously so it doesn't block response)
    const User = require('../models/User');
    User.findById(req.user.id)
      .then(async (user) => {
        if (!user) return;
        const sendEmail = require('../utils/sendEmail');
        
        const itemsHtml = order.orderItems
          .map(
            (item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; color: #333;">${item.title}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 13px; color: #333;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px; color: #333;">$${item.price.toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 13px; color: #333;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `
          )
          .join('');

        const invoiceHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #6d28d9; margin: 0; font-size: 26px; font-weight: 800;">NovaCart</h1>
              <p style="color: #6b7280; font-size: 12px; margin-top: 5px;">Order Invoice & Confirmation</p>
            </div>
            
            <p style="font-size: 14px; color: #374151; margin-bottom: 20px;">Dear <strong>${user.name}</strong>,</p>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Thank you for shopping with us! Your order has been placed successfully. Below is your detailed purchase invoice:</p>
            
            <div style="margin: 25px 0; padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #6d28d9; font-size: 13px; line-height: 1.6; color: #374151;">
              <strong>Order ID:</strong> #${order._id}<br>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
              <strong>Payment Method:</strong> ${order.paymentMethod}<br>
              <strong>Payment Status:</strong> ${order.paymentStatus}
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 25px;">
              <thead>
                <tr style="background-color: #6d28d9; color: white;">
                  <th style="padding: 12px 10px; text-align: left; font-size: 12px; font-weight: bold; border-top-left-radius: 8px;">Product</th>
                  <th style="padding: 12px 10px; text-align: center; font-size: 12px; font-weight: bold;">Qty</th>
                  <th style="padding: 12px 10px; text-align: right; font-size: 12px; font-weight: bold;">Price</th>
                  <th style="padding: 12px 10px; text-align: right; font-size: 12px; font-weight: bold; border-top-right-radius: 8px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 25px; text-align: right; line-height: 1.8; font-size: 13px; color: #4b5563; padding-right: 10px;">
              <strong>Shipping Price:</strong> $${order.shippingPrice.toFixed(2)}<br>
              <strong>Tax:</strong> $${order.taxPrice.toFixed(2)}<br>
              <span style="font-size: 16px; color: #6d28d9;"><strong>Total Amount Paid:</strong> $${order.totalPrice.toFixed(2)}</span>
            </div>

            <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.5;">
              <p>For any inquiries regarding your purchase, please contact our support desk.</p>
              <p>&copy; ${new Date().getFullYear()} NovaCart. All rights reserved.</p>
            </div>
          </div>
        `;

        await sendEmail({
          email: user.email,
          subject: `NovaCart Order Invoice - #${order._id}`,
          message: `Thank you for your order! Your total is $${order.totalPrice.toFixed(2)}.`,
          html: invoiceHtml,
        });
      })
      .catch((err) => console.error('Failed to send invoice email:', err.message));

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
    // Populate user profile to get email/name
    const order = await Order.findById(req.params.id).populate('user', 'name email');

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

    // Send email update notifications
    if (order.user && order.user.email) {
      const sendEmail = require('../utils/sendEmail');
      const statusHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #6d28d9; margin: 0; font-size: 26px; font-weight: 800;">NovaCart</h1>
            <p style="color: #6b7280; font-size: 12px; margin-top: 5px;">Order Tracking Status</p>
          </div>

          <p style="font-size: 14px; color: #374151; margin-bottom: 20px;">Dear <strong>${order.user.name}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">The processing status for your order <strong>#${order._id}</strong> has been updated to:</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #6d28d9; font-size: 18px; font-weight: 800; text-align: center; color: #6d28d9; letter-spacing: 0.05em; text-transform: uppercase;">
            ${status}
          </div>

          ${
            trackingNumber
              ? `<div style="margin: 20px 0; padding: 15px; border: 1px dashed #6d28d9; border-radius: 8px; font-size: 13px; color: #374151;">
                  <strong>Tracking/Consignment Number:</strong> <span style="font-family: monospace; font-size: 14px; color: #6d28d9; font-weight: bold;">${trackingNumber}</span>
                 </div>`
              : ''
          }

          <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-top: 20px;">You can view detailed consignment progress inside your Shopper Dashboard under "My Orders".</p>

          <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
            <p>Thank you for buying premium goods on NovaCart!</p>
            <p>&copy; ${new Date().getFullYear()} NovaCart. All rights reserved.</p>
          </div>
        </div>
      `;

      sendEmail({
        email: order.user.email,
        subject: `NovaCart Order #${order._id} Status: ${status}`,
        message: `Your order status has been updated to: ${status}`,
        html: statusHtml,
      }).catch((err) => console.error('Failed to send status update email:', err.message));
    }

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
