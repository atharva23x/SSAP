const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/profileController');

router.use(requireAuth);
router.put('/', c.updateProfile);
router.put(
  '/password',
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }).withMessage('Min 6 characters'),
  ]),
  c.changePassword
);
router.get('/saved', c.saved);
router.post('/documents', c.uploadDocument);
router.delete('/documents/:docType', c.removeDocument);

module.exports = router;
