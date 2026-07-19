/**
 * Security Middleware for Input Sanitization
 * 1. mongoSanitize: Removes MongoDB operator characters ($ and .) from user inputs to prevent NoSQL Injection.
 * 2. xssClean: Strips malicious HTML tags and scripts from request body, query params, and parameters to prevent Reflected & Stored XSS.
 */

const cleanValue = (val) => {
  if (typeof val === 'string') {
    // Strip HTML script tags & dangerous characters for XSS prevention
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:[^\s"]*/gi, '');
  }
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return sanitizeObject(val);
  }
  if (Array.isArray(val)) {
    return val.map(cleanValue);
  }
  return val;
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const cleanObj = {};

  for (const key of Object.keys(obj)) {
    // Prevent NoSQL Injection by sanitizing keys starting with $ or containing .
    const safeKey = key.replace(/^\$/, '').replace(/\./g, '');
    cleanObj[safeKey] = cleanValue(obj[key]);
  }

  return cleanObj;
};

exports.sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};
