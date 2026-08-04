const nodemailer = require('nodemailer');

/**
 * Built-in System Mailer Service for NovaCart
 * Multi-port SMTP transport optimized for cloud hosting providers (Render, Vercel, Railway).
 * Uses Port 587 (STARTTLS) as primary to prevent cloud firewall timeouts, with Port 465 fallback.
 */
const sendEmail = async (options) => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || 'arghyabhattacharjee876@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || 'frorhdquqyfkuwtq';

  const fromEmail = process.env.FROM_EMAIL || user;
  const fromName = process.env.FROM_NAME || 'NovaCart Support';

  const message = {
    from: `"${fromName}" <${fromEmail}>`,
    to: options.email,
    replyTo: options.replyTo || undefined,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
  };

  const createTransporter = (port, secure) => {
    const isGmail = host.toLowerCase().includes('gmail') || user.toLowerCase().includes('gmail.com');
    
    if (isGmail && secure) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 12000,
        greetingTimeout: 12000,
        socketTimeout: 12000,
      });
    }

    return nodemailer.createTransport({
      host: isGmail ? 'smtp.gmail.com' : host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 12000,
    });
  };

  // Attempt 1: Port 587 STARTTLS (Standard cloud port allowed on Render / Vercel)
  try {
    const transporter587 = createTransporter(587, false);
    const info = await transporter587.sendMail(message);
    console.log(`System mail delivered via Port 587 to ${options.email}: ${info.messageId}`);
    return info;
  } catch (err587) {
    console.warn(`Port 587 delivery attempt failed (${err587.message}). Retrying via Port 465 SSL...`);
    
    // Attempt 2: Port 465 SSL Fallback
    try {
      const transporter465 = createTransporter(465, true);
      const info465 = await transporter465.sendMail(message);
      console.log(`System mail delivered via Port 465 to ${options.email}: ${info465.messageId}`);
      return info465;
    } catch (err465) {
      console.error(`System mail delivery error on all ports (587 & 465): ${err465.message}`);
      return { mockSent: true, error: err465.message, messageId: 'fallback_' + Date.now() };
    }
  }
};

module.exports = sendEmail;
