const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/documentController');

router.use(requireAuth);
router.get('/gap', c.gap);
router.get('/guides', c.listGuides);
router.get('/guide/:docType', c.guide);
router.post('/mark', c.markObtained);

module.exports = router;
