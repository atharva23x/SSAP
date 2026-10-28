const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// Rate limiting is a production concern; disable in tests to avoid flaky 429s.
const isTest = env.NODE_ENV === 'test';
const off = (req, res, next) => next();

const apiLimiter = isTest ? off : rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'TOO_MANY_REQUESTS' } },
});

/** Stricter limiter for login/register: 5 attempts / minute per IP. */
const authLimiter = isTest ? off : rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'TOO_MANY_AUTH_ATTEMPTS' } },
});

const aiLimiter = isTest ? off : rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'TOO_MANY_AI_REQUESTS' } },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
