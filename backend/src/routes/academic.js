const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/academicController');

// Mounted at /api — use per-route auth so non-academic /api paths pass through
// cleanly (no global requireAuth on unrelated routes).
router.get('/exams', requireAuth, c.listExams);
router.get('/exams/:id', requireAuth, c.getExam);
router.post('/exams/:id/save', requireAuth, c.saveExam);
router.get('/competitions', requireAuth, c.listCompetitions);
router.get('/materials', requireAuth, c.listMaterials);

module.exports = router;
