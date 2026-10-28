const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/adminController');

router.use(requireAuth, requireAdmin);

router.get('/stats', c.stats);
router.get('/users', c.listUsers);
router.patch('/users/:id/verify-doc', c.verifyDoc);

const mount = (path, handlers) => {
  router.get(path, handlers.list);
  router.post(path, handlers.create);
  router.put(`${path}/:id`, handlers.update);
  router.patch(`${path}/:id`, handlers.update);
  router.delete(`${path}/:id`, handlers.remove);
};

mount('/schemes', c.schemes);
mount('/exams', c.exams);
mount('/competitions', c.competitions);
mount('/materials', c.materials);
mount('/offices', c.offices);
mount('/guides', c.guides);

module.exports = router;
