const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/officeController');

router.use(requireAuth);
router.get('/nearby', c.nearby);
router.get('/', c.listOffices);

module.exports = router;
