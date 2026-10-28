const SUPPORTED = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu'];

/** Resolve requested language: query ?lang= > user profile > 'en'. */
function i18n(req, res, next) {
  const q = (req.query.lang || '').toString().toLowerCase();
  const header = (req.headers['accept-language'] || '').split(',')[0]?.split('-')[0];
  let lang = q || header || 'en';
  if (!SUPPORTED.includes(lang)) lang = 'en';
  req.lang = lang;
  next();
}

module.exports = { i18n, SUPPORTED };
