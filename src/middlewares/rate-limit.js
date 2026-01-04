import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware to prevent brute-force attacks
 */

// Global rate limiter for all requests
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
  },
});

// 2FA verification limiter
export const twoFactorLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 2FA attempts
  message: {
    success: false,
    error: 'Too many 2FA attempts, please try again later.',
  },
});

// Custom rate limiter
export const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: message || {
      success: false,
      error: 'Too many requests, please try again later.',
    },
  });
};