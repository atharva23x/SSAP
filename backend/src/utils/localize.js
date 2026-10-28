/**
 * Localization helper.
 * Every localized field in the DB is an object like { hi, mr, ta, te, bn, gu }.
 * localize(obj, lang) returns the localized string with English fallback.
 */

const SUPPORTED = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu'];

function pickLocalized(localized, lang, fallback = '') {
  if (!localized) return fallback;
  if (typeof localized === 'string') return localized;
  if (lang && lang !== 'en' && localized[lang]) return localized[lang];
  return localized.en || fallback;
}

/**
 * Attach a computed localized display field to a document/plain object.
 * `field` is the base name, e.g. "name" -> reads nameLocalized, writes _l.name
 */
function localizeDoc(doc, lang, fields = ['name', 'description']) {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  obj._lang = lang || 'en';
  obj._l = {};
  fields.forEach((f) => {
    const localized = obj[`${f}Localized`];
    obj._l[f] = pickLocalized(localized, lang, obj[f] || '');
  });
  return obj;
}

function localizeDocs(docs, lang, fields) {
  return docs.map((d) => localizeDoc(d, lang, fields));
}

module.exports = { SUPPORTED, pickLocalized, localizeDoc, localizeDocs };
