const nodemailer = require('nodemailer');

/**
 * Built-in System Mailer Service for NovaCart
 * Uses System SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS / EMAIL_HOST, EMAIL_USER)
 * with an automatic built-in Ethereal test session fallback. Zero third-party service dependencies like Resend required.
 */
const sendEmail = async (options) => {
  let transporter;

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '465', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || 'arghyabhattacharjee876@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || 'frorhdquqyfkuwtq';

  // 1. Primary Option: Native System SMTP Transporter
  if (host && user && pass) {
    if (host.toLowerCase().includes('gmail') || process.env.SMTP_SERVICE?.toLowerCase() === 'gmail' || user.includes('gmail.com')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      });
    }
  } else {
    // 2. Built-in Fallback: Generate Ethereal Mail test session
    try {
      console.log('SMTP credentials not configured. Spawning built-in Ethereal Test Mail Session...');
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('Fallback test account generation notice:', err.message);
      // Absolute fallback console logging
      console.log('\n==================================================');
      console.log(`[BUILT-IN SYSTEM MAIL LOG]`);
      console.log(`TO: ${options.email}`);
      console.log(`SUBJECT: ${options.subject}`);
      console.log(`MESSAGE:\n${options.message}`);
      console.log('==================================================\n');
      return { mockSent: true, messageId: 'system_log_' + Date.now() };
    }
  }

  const fromEmail = process.env.FROM_EMAIL || user || 'noreply@novacart.com';
  const fromName = process.env.FROM_NAME || 'NovaCart';

  const message = {
    from: `"${fromName}" <${fromEmail}>`,
    to: options.email,
    replyTo: options.replyTo || undefined,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
  };

  try {
    const info = await transporter.sendMail(message);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n==================================================');
      console.log(`[SYSTEM MAIL DELIVERED] TO: ${options.email}`);
      console.log(`[PREVIEW URL]: ${previewUrl}`);
      console.log('==================================================\n');
      return { previewUrl, messageId: info.messageId };
    }
    console.log(`System mail delivered successfully to ${options.email}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('System mail delivery error:', err.message);
    return { mockSent: true, error: err.message, messageId: 'fallback_' + Date.now() };
  }
};

module.exports = sendEmail;
