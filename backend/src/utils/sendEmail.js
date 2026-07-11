const nodemailer = require('nodemailer');
const https = require('https');

const sendEmail = async (options) => {
  // Option 1: Use Resend HTTP API (Recommended for production on Render Free tier where SMTP is blocked)
  if (process.env.RESEND_API_KEY) {
    return new Promise((resolve, reject) => {
      let fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

      // Safety check: Resend blocks sending from public domains like gmail.com unless verified.
      // Force fallback to onboarding@resend.dev if a public domain is specified.
      const publicDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@live.com', '@icloud.com'];
      if (publicDomains.some(domain => fromEmail.toLowerCase().includes(domain))) {
        fromEmail = 'onboarding@resend.dev';
      }

      const postData = JSON.stringify({
        from: `${process.env.FROM_NAME || 'NovaCart'} <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
      });

      const req = https.request({
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(body);
              console.log(`Email sent via Resend API successfully: ${data.id}`);
              resolve({ messageId: data.id });
            } catch (e) {
              resolve({ messageId: 'resend_success' });
            }
          } else {
            console.error(`Resend API Error: Status ${res.statusCode}, Body: ${body}`);
            reject(new Error(`Resend API returned status code ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err) => {
        console.error('Resend Request Error:', err.message);
        reject(err);
      });

      req.write(postData);
      req.end();
    });
  }

  let transporter;

  // Check if SMTP is configured in env variables
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback: Automatically create a real Ethereal SMTP test account
    try {
      console.log('SMTP credentials not configured. Spawning Ethereal Test Mail Account...');
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const message = {
        from: `NovaCart Support <${testAccount.user}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
      };

      const info = await transporter.sendMail(message);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      
      console.log('\n==================================================');
      console.log(`[ETHEREAL TEST MAIL SENT TO]: ${options.email}`);
      console.log(`[SUBJECT]: ${options.subject}`);
      console.log(`[PREVIEW URL]: ${previewUrl}`);
      console.log('==================================================\n');
      
      return { previewUrl, messageId: info.messageId };
    } catch (err) {
      console.error('Failed to create Ethereal SMTP transporter:', err.message);
      // Absolute fallback: log to console
      console.log('\n==================================================');
      console.log(`[MOCK EMAIL SENT TO]: ${options.email}`);
      console.log(`[SUBJECT]: ${options.subject}`);
      console.log(`[MESSAGE]:\n${options.message}`);
      console.log('==================================================\n');
      return { mockSent: true, messageId: 'mock_' + Date.now() };
    }
  }

  const message = {
    from: `${process.env.FROM_NAME || 'NovaCart'} <${process.env.FROM_EMAIL || 'noreply@novacart.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log(`Email sent successfully: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
