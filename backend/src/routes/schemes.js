const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/schemeController');

router.use(requireAuth);
router.get('/', c.listSchemes);
router.get('/match', c.matchForUser);
router.get('/:id', c.getScheme);
router.post('/:id/save', c.saveScheme);

module.exports = router;
