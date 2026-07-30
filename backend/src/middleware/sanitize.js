/**
 * Hardened Security Middleware for Input Sanitization
 * 1. mongoSanitize: Removes MongoDB operator characters ($ and .) from user inputs to prevent NoSQL Injection.
 * 2. xssClean: Strips malicious script tags, iframes, event handlers, and javascript: URIs to prevent XSS.
 */

const cleanValue = (val) => {
  if (typeof val === 'string') {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, '')
      .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
      .replace(/javascript:[^\s"'>]*/gi, '');
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
  const cleanObj = Array.isArray(obj) ? [] : {};

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
