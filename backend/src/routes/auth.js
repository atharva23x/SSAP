const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/authController');

router.post(
  '/register',
  authLimiter,
  validate([
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Min 6 characters'),
    body('phone').optional().isLength({ max: 20 }),
    body('preferredLanguage').optional().isIn(['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu']),
  ]),
  c.register
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ]),
  c.login
);

router.post('/logout', c.logout);
router.post('/refresh', c.refresh);
router.get('/me', requireAuth, c.me);
router.post('/logout-all', requireAuth, c.logoutAll);
router.post(
  '/forgot-password',
  authLimiter,
  validate([body('email').isEmail().normalizeEmail()]),
  c.forgotPassword
);

module.exports = router;
