const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

function extractToken(req) {
  if (req.cookies && req.cookies.accessToken) return req.cookies.accessToken;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Require a valid access token and attach req.user. */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw new ApiError(401, 'AUTH_REQUIRED');
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new ApiError(401, 'TOKEN_INVALID');
    }
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, 'USER_NOT_FOUND');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Attach req.user if a valid token exists, otherwise continue anonymously. */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (user) req.user = user;
    }
  } catch {
    /* ignore */
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'ADMIN_REQUIRED'));
  }
  next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin, extractToken };
