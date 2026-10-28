const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/aiController');

router.use(requireAuth);
router.post(
  '/query',
  aiLimiter,
  validate([body('query').trim().notEmpty().withMessage('Query required').isLength({ max: 1000 })]),
  c.query
);
router.get('/suggestions', c.suggestions);
router.get('/history', c.history);

module.exports = router;
