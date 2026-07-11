const nodemailer = require('nodemailer');
const https = require('https');

const sendEmail = async (options) => {
  // Option 1: Use Resend HTTP API (Recommended for production on Render Free tier where SMTP is blocked)
  if (process.env.RESEND_API_KEY) {
    return new Promise((resolve, reject) => {
      const sendViaResend = (recipient, isRetry = false) => {
        let fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

        // Safety check: Resend blocks sending from public domains like gmail.com unless verified.
        // Force fallback to onboarding@resend.dev if a public domain is specified.
        const publicDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@live.com', '@icloud.com'];
        if (publicDomains.some(domain => fromEmail.toLowerCase().includes(domain))) {
          fromEmail = 'onboarding@resend.dev';
        }

        const bodyPrefix = isRetry
          ? `[SANDBOX REDIRECT] This email was originally intended for ${options.email}. Since Resend is in sandbox mode, it has been redirected here.\n\n`
          : '';
        const htmlPrefix = isRetry
          ? `<div style="background:#fff3cd;color:#856404;padding:10px;margin-bottom:15px;border:1px solid #ffeeba;border-radius:4px;"><strong>[SANDBOX REDIRECT]</strong> This email was originally intended for <em>${options.email}</em>. Since Resend is in sandbox/testing mode, it has been redirected here.</div>`
          : '';

        const postData = JSON.stringify({
          from: `${process.env.FROM_NAME || 'NovaCart'} <${fromEmail}>`,
          to: recipient,
          subject: isRetry ? `[Redirected] ${options.subject}` : options.subject,
          text: bodyPrefix + options.message,
          html: htmlPrefix + (options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`),
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
                console.log(`Email sent via Resend API successfully${isRetry ? ' (after redirect)' : ''}: ${data.id}`);
                resolve({ messageId: data.id });
              } catch (e) {
                resolve({ messageId: 'resend_success' });
              }
            } else if (res.statusCode === 403 && !isRetry) {
              let errorMsg = '';
              try {
                const errorData = JSON.parse(body);
                errorMsg = errorData.message || '';
              } catch (e) {}

              console.warn(`Resend API 403 Error: ${body}`);

              // Check if it's a sandbox/validation restriction error
              if (errorMsg.includes('only send testing emails to your own email address') || body.includes('validation_error')) {
                let ownerEmail = 'arghyabhattacharjee876@gmail.com';
                const match = errorMsg.match(/your own email address \(([^)]+)\)/);
                if (match && match[1]) {
                  ownerEmail = match[1];
                } else if (process.env.SMTP_USER) {
                  ownerEmail = process.env.SMTP_USER;
                }

                console.log(`Resend sandbox detected. Redirecting email from ${options.email} to authorized recipient: ${ownerEmail}`);
                sendViaResend(ownerEmail, true);
              } else {
                console.error(`Resend API Error: Status ${res.statusCode}, Body: ${body}`);
                reject(new Error(`Resend API returned status code ${res.statusCode}`));
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
      };

      sendViaResend(options.email);
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
