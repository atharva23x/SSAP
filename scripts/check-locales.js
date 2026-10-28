#!/usr/bin/env node
/**
 * CI guard: verify every locale file has exactly the same key set as en.json.
 * Usage: node scripts/check-locales.js
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'backend', 'src', 'locales');
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, prefix + k + '.') : [prefix + k]
  );

const en = flatten(JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'))).sort();
const langs = ['hi', 'mr', 'ta', 'te', 'bn', 'gu'];
let ok = true;

for (const lang of langs) {
  const file = path.join(dir, `${lang}.json`);
  if (!fs.existsSync(file)) {
    console.error(`✗ ${lang}.json missing`);
    ok = false;
    continue;
  }
  const keys = flatten(JSON.parse(fs.readFileSync(file, 'utf8'))).sort();
  if (JSON.stringify(keys) !== JSON.stringify(en)) {
    console.error(`✗ ${lang}.json key set differs from en.json (${keys.length} vs ${en.length})`);
    ok = false;
  } else {
    console.log(`✓ ${lang}.json — ${keys.length} keys match`);
  }
}

process.exit(ok ? 0 : 1);
