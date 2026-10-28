const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshExpiryMs,
} = require('../utils/jwt');
const env = require('../config/env');

const REFRESH_COOKIE = 'refreshToken';
const ACCESS_COOKIE = 'accessToken';

function cookieOpts() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
    path: '/',
  };
}

async function issueSession(user, req, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + refreshExpiryMs()),
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOpts(), maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOpts(), maxAge: refreshExpiryMs() });
  return { accessToken, refreshToken };
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, preferredLanguage } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED');

  const user = new User({
    name,
    email,
    phone,
    preferredLanguage: preferredLanguage || 'en',
  });
  await user.setPassword(password);
  await user.save();
  await issueSession(user, req, res);
  res.status(201).json({ success: true, user: user.toSafeJSON() });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS');
  }
  user.lastLogin = new Date();
  await user.save();
  await issueSession(user, req, res);
  res.json({ success: true, user: user.toSafeJSON() });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await RefreshToken.updateOne({ token }, { $set: { revoked: true } });
  }
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.json({ success: true });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'NO_REFRESH_TOKEN');
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'REFRESH_INVALID');
  }
  const stored = await RefreshToken.findOne({ token, revoked: false });
  if (!stored) throw new ApiError(401, 'REFRESH_REVOKED');
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'USER_NOT_FOUND');
  await issueSession(user, req, res);
  res.json({ success: true, user: user.toSafeJSON() });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

// POST /api/auth/logout-all
const logoutAll = asyncHandler(async (req, res) => {
  await RefreshToken.updateMany({ userId: req.user._id }, { $set: { revoked: true } });
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.json({ success: true });
});

// POST /api/auth/forgot-password  (demo: returns a reset token, emails if SMTP configured)
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() });
  // Always respond success to avoid email enumeration
  if (user) {
    const resetToken = crypto.randomBytes(24).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();
    const { sendMail } = require('../utils/mailer');
    await sendMail({
      to: user.email,
      subject: 'SSAP password reset',
      text: `Your reset token (valid 15 min): ${resetToken}`,
    });
  }
  res.json({ success: true, message: 'IF_REGISTERED' });
});

module.exports = { register, login, logout, refresh, me, logoutAll, forgotPassword };
