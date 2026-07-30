/**
 * Professional HTML Email Templates for NovaCart
 * Modern, responsive, mobile-optimized HTML designs with vibrant styling, dark mode support, and clean typography.
 */

// Global Brand Header & Footer Wrapper
const wrapEmailTemplate = (contentHtml, headerTitle = 'NovaCart Notifications') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerTitle}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; color: #1f2937;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
              
              <!-- Brand Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 25px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">NovaCart</h1>
                  <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 13px; font-weight: 500; tracking-wide: 0.5px;">Premium E-Commerce Shopping & Marketplace Platform</p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 30px 25px;">
                  ${contentHtml}
                </td>
              </tr>

              <!-- Professional Footer -->
              <tr>
                <td style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 20px 25px; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600;">NovaCart Inc. • Authorized Communications Desk</p>
                  <p style="margin: 0; font-size: 11px; color: #9ca3af;">This is an automated operational notification regarding your NovaCart account. Please do not reply to this system address.</p>
                  <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af;">&copy; ${new Date().getFullYear()} NovaCart. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// 1. Welcome & Email Verification Template
const getWelcomeOtpTemplate = ({ name, email, role, otp }) => {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Welcome aboard, ${name}! 🎉</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      Thank you for creating your new <strong>NovaCart</strong> account. We are excited to have you join our marketplace!
    </p>

    <div style="margin: 20px 0; padding: 18px; background-color: #f8fafc; border-left: 4px solid #7c3aed; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.8;">
      <strong>Account Details:</strong><br>
      • <strong>Full Name:</strong> ${name}<br>
      • <strong>Email Address:</strong> ${email}<br>
      • <strong>Account Type:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #7c3aed;">${role}</span><br>
      • <strong>Created Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    </div>

    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      Please complete your account activation by entering the 6-digit One-Time Password (OTP) below:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; padding: 16px 32px; background: #f3e8ff; border: 2px dashed #9333ea; border-radius: 16px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #6d28d9; font-family: monospace;">${otp}</span>
      </div>
      <p style="margin-top: 8px; color: #9ca3af; font-size: 11px;">This verification code is valid for 1 hour.</p>
    </div>
  `;
  return wrapEmailTemplate(content, 'Welcome to NovaCart - Activate Your Account');
};

// 2. Account Login Security Alert Template
const getLoginAlertTemplate = ({ name, email, role, loginTime, ipAddress, userAgent }) => {
  const content = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
      <span style="display: inline-block; padding: 6px 12px; background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Security Notification</span>
    </div>
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Account Login Detected</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      Hello <strong>${name}</strong>, your NovaCart <strong style="text-transform: capitalize;">${role}</strong> account was just accessed successfully.
    </p>

    <div style="margin: 20px 0; padding: 18px; background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.8;">
      <strong>Session Details:</strong><br>
      • <strong>Account Email:</strong> ${email}<br>
      • <strong>Account Role:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #059669;">${role}</span><br>
      • <strong>Login Timestamp:</strong> ${loginTime}<br>
      • <strong>Device / Browser:</strong> ${userAgent || 'Web Browser'}
    </div>

    <p style="color: #6b7280; font-size: 12px; line-height: 1.5;">
      If this login was authorized by you, no action is required. If you did not perform this login, please change your password immediately or contact our support security team.
    </p>
  `;
  return wrapEmailTemplate(content, 'NovaCart - Security Alert: Login Notification');
};

// 3. Customer Order Invoice & Confirmation Template
const getCustomerInvoiceTemplate = ({ customerName, order, itemsHtml, formattedPrices }) => {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Order Confirmation & Invoice 🎉</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      Dear <strong>${customerName}</strong>, thank you for shopping on <strong>NovaCart</strong>! Your order has been confirmed and is being processed.
    </p>

    <div style="margin: 20px 0; padding: 18px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.8;">
      <strong>Order Reference Information:</strong><br>
      • <strong>Order ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #4f46e5;">#${order._id}</span><br>
      • <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br>
      • <strong>Payment Method:</strong> ${order.paymentMethod}<br>
      • <strong>Payment Status:</strong> <span style="font-weight: bold; color: #059669;">${order.paymentStatus}</span><br>
      • <strong>Shipping Address:</strong> ${order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}` : 'Address provided'}
    </div>

    <h3 style="color: #111827; font-size: 15px; font-weight: 700; margin: 25px 0 12px 0;">Purchased Items Breakdown:</h3>
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; font-size: 13px;">
      <thead>
        <tr style="background-color: #4f46e5; color: #ffffff;">
          <th style="padding: 12px; text-align: left; border-top-left-radius: 8px;">Product</th>
          <th style="padding: 12px; text-align: center;">Qty</th>
          <th style="padding: 12px; text-align: right;">Unit Price</th>
          <th style="padding: 12px; text-align: right; border-top-right-radius: 8px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="margin-top: 20px; text-align: right; font-size: 13px; color: #4b5563; line-height: 1.8;">
      <strong>Subtotal:</strong> ${formattedPrices.subtotal}<br>
      <strong>Shipping Fee:</strong> ${formattedPrices.shipping}<br>
      <strong>Tax & GST:</strong> ${formattedPrices.tax}<br>
      <span style="font-size: 16px; color: #4f46e5; font-weight: bold;">Grand Total Paid: ${formattedPrices.total}</span>
    </div>
  `;
  return wrapEmailTemplate(content, `NovaCart Invoice - Order #${order._id}`);
};

// 4. Seller New Sale Alert Template
const getSellerOrderTemplate = ({ sellerName, order, customerName }) => {
  const content = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
      <span style="display: inline-block; padding: 6px 12px; background-color: #f3e8ff; color: #7c3aed; font-size: 11px; font-weight: 700; border-radius: 20px; text-transform: uppercase;">New Sale Alert</span>
    </div>
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Congratulations, ${sellerName}! 🚀</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      You have received a new customer order on NovaCart Marketplace!
    </p>

    <div style="margin: 20px 0; padding: 18px; background-color: #f8fafc; border-left: 4px solid #7c3aed; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.8;">
      <strong>Sale Details:</strong><br>
      • <strong>Order ID:</strong> #${order._id}<br>
      • <strong>Customer Name:</strong> ${customerName}<br>
      • <strong>Order Value:</strong> <span style="font-weight: bold; color: #7c3aed;">₹${order.totalPrice.toLocaleString('en-IN')}</span><br>
      • <strong>Payment Status:</strong> ${order.paymentStatus}
    </div>

    <p style="color: #4b5563; font-size: 13px; line-height: 1.5;">
      Please log in to your <strong>Seller Dashboard</strong> to review shipping details and prepare items for dispatch.
    </p>
  `;
  return wrapEmailTemplate(content, `New Sale Received - Order #${order._id}`);
};

// 5. Admin System Order Alert Template
const getAdminOrderTemplate = ({ order, customerName }) => {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">System Order Placed Alert 📊</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      A new order has been created in the NovaCart production database.
    </p>

    <div style="margin: 20px 0; padding: 18px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.8;">
      • <strong>Order ID:</strong> #${order._id}<br>
      • <strong>Customer:</strong> ${customerName}<br>
      • <strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}<br>
      • <strong>Payment Method:</strong> ${order.paymentMethod}<br>
      • <strong>Timestamp:</strong> ${new Date(order.createdAt).toISOString()}
    </div>
  `;
  return wrapEmailTemplate(content, `System Order Alert - #${order._id}`);
};

// 6. Order Status & Delivery Progress Update Template
const getOrderStatusUpdateTemplate = ({ customerName, order, newStatus, trackingNumber }) => {
  const content = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
      <span style="display: inline-block; padding: 6px 12px; background-color: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; border-radius: 20px; text-transform: uppercase;">Shipment Update</span>
    </div>
    <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Order Status Updated: ${newStatus} 🚚</h2>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      Hello <strong>${customerName}</strong>, your NovaCart order <strong>#${order._id}</strong> has been updated.
    </p>

    <div style="margin: 20px 0; padding: 18px; background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.8;">
      • <strong>Order Number:</strong> #${order._id}<br>
      • <strong>New Status:</strong> <span style="font-weight: bold; color: #2563eb; font-size: 14px;">${newStatus}</span><br>
      • <strong>Tracking ID:</strong> <span style="font-family: monospace; font-weight: bold;">${trackingNumber || order.trackingNumber || 'NV-EXP-88492'}</span><br>
      • <strong>Logistics Carrier:</strong> NovaExpress Priority Delivery
    </div>

    <p style="color: #4b5563; font-size: 13px; line-height: 1.5;">
      You can track live delivery updates by signing in to your NovaCart Customer Account at any time.
    </p>
  `;
  return wrapEmailTemplate(content, `Shipment Update: Order #${order._id} is ${newStatus}`);
};

module.exports = {
  wrapEmailTemplate,
  getWelcomeOtpTemplate,
  getLoginAlertTemplate,
  getCustomerInvoiceTemplate,
  getSellerOrderTemplate,
  getAdminOrderTemplate,
  getOrderStatusUpdateTemplate,
};
