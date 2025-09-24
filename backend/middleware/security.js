const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Enhanced rate limiting for admin routes
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to include user agent for better tracking
  keyGenerator: (req) => {
    return `${req.ip}-${req.headers['user-agent']}`;
  },
  // Skip successful requests in rate limiting
  skipSuccessfulRequests: false,
  // Skip failed requests in rate limiting
  skipFailedRequests: false,
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    console.warn(`[SECURITY] Rate limit exceeded for IP: ${req.ip}`);
    console.warn(`[SECURITY] User-Agent: ${req.headers['user-agent']}`);
    console.warn(`[SECURITY] Timestamp: ${new Date().toISOString()}`);
    
    res.status(429).json({
      success: false,
      message: 'Too many admin requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 15 * 60
    });
  }
});

// Strict rate limiting for admin login attempts
const adminLoginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again later.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `${req.ip}-login`;
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false,
  handler: (req, res) => {
    console.warn(`[SECURITY] Login rate limit exceeded for IP: ${req.ip}`);
    console.warn(`[SECURITY] User-Agent: ${req.headers['user-agent']}`);
    console.warn(`[SECURITY] Timestamp: ${new Date().toISOString()}`);
    
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP, please try again later.',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      retryAfter: 15 * 60
    });
  }
});

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Strict Transport Security (HSTS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy for admin routes
  if (req.path.startsWith('/admin')) {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
    );
  }
  
  next();
};

// Request logging middleware for admin routes
const adminRequestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  const userAgent = req.headers['user-agent'];
  const method = req.method;
  const url = req.originalUrl;
  
  console.log(`[ADMIN] ${timestamp} - ${ip} - ${method} ${url}`);
  console.log(`[ADMIN] User-Agent: ${userAgent}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const logBody = { ...req.body };
    // Remove sensitive fields
    delete logBody.password;
    delete logBody.token;
    delete logBody.refreshToken;
    
    if (Object.keys(logBody).length > 0) {
      console.log(`[ADMIN] Request body: ${JSON.stringify(logBody)}`);
    }
  }
  
  next();
};

// Response time tracking
const responseTimeLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[ADMIN] Response time: ${duration}ms - Status: ${res.statusCode}`);
  });
  
  next();
};

// Suspicious activity detector
const suspiciousActivityDetector = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scanner/i,
    /curl/i,
    /wget/i,
    /python/i,
    /script/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    console.warn(`[SECURITY] Suspicious user agent detected: ${userAgent} from IP: ${ip}`);
    
    // You could implement additional actions here like:
    // - Blocking the request
    // - Adding to a blacklist
    // - Requiring additional verification
  }
  
  next();
};

module.exports = {
  adminRateLimit,
  adminLoginRateLimit,
  securityHeaders,
  adminRequestLogger,
  responseTimeLogger,
  suspiciousActivityDetector
};