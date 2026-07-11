const nodemailer = require('nodemailer');
const https = require('https');

const sendEmail = async (options) => {
  // Option 1: Use Brevo (formerly Sendinblue) HTTP API
  // This is highly recommended for production on Render Free tier when SMTP hangs/is blocked.
  // Brevo allows sending from a verified Gmail/personal email to anyone, without requiring a custom domain.
  if (process.env.BREVO_API_KEY) {
    return new Promise((resolve, reject) => {
      const fromEmail = process.env.FROM_EMAIL || 'arghyabhattacharjee876@gmail.com';
      const postData = JSON.stringify({
        sender: {
          name: process.env.FROM_NAME || 'NovaCart',
          email: fromEmail
        },
        to: [
          {
            email: options.email
          }
        ],
        subject: options.subject,
        htmlContent: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
        textContent: options.message
      });

      const req = https.request({
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
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
              console.log(`Email sent via Brevo API successfully: ${data.messageId}`);
              resolve({ messageId: data.messageId });
            } catch (e) {
              resolve({ messageId: 'brevo_success' });
            }
          } else {
            console.error(`Brevo API Error: Status ${res.statusCode}, Body: ${body}`);
            reject(new Error(`Brevo API returned status code ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err) => {
        console.error('Brevo Request Error:', err.message);
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
      secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10s connection timeout so request doesn't hang forever
      greetingTimeout: 10000,
      socketTimeout: 10000,
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
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
  };

  const info = await transporter.sendMail(message);
  console.log(`Email sent successfully: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
