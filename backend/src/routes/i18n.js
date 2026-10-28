const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { SUPPORTED } = require('../middleware/i18n');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');

// GET /api/i18n/:lang  -> returns the UI string bundle for that language
router.get('/:lang', (req, res) => {
  const lang = req.params.lang;
  if (!SUPPORTED.includes(lang)) {
    return res.status(400).json({ success: false, error: { message: 'UNSUPPORTED_LANGUAGE' } });
  }
  const file = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) {
    return res.status(404).json({ success: false, error: { message: 'LOCALE_NOT_FOUND' } });
  }
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({ success: true, lang, data: JSON.parse(fs.readFileSync(file, 'utf8')) });
});

module.exports = router;
