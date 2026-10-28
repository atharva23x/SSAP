const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/notificationController');

router.use(requireAuth);
router.get('/', c.list);
router.patch('/read-all', c.markAllRead);
router.patch('/:id/read', c.markRead);
router.delete('/clear', c.clearAll);

module.exports = router;
