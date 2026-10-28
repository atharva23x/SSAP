/**
 * Eligibility Engine (core logic).
 *
 * For each active scheme we score the student against its criteria:
 *   age, gender, category, classLevel, annualIncome, domicile state.
 * match% = passed / total * 100
 *   >= 80  -> eligible
 *   50-79  -> action_needed
 *   < 50   -> not_eligible
 */

function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function classify(matchPercent) {
  if (matchPercent >= 80) return 'eligible';
  if (matchPercent >= 50) return 'action_needed';
  return 'not_eligible';
}

/**
 * Evaluate a single scheme against a user profile.
 * Returns { percent, status, checks: [{label, passed, reason}] }
 */
function evaluateScheme(user, scheme) {
  const el = scheme.eligibility || {};
  const checks = [];

  const age = ageFromDob(user.dob);
  if (el.minAge != null || el.maxAge != null) {
    let passed = true;
    let reason = 'Age criteria';
    if (age == null) {
      passed = false;
      reason = 'Add your date of birth in profile';
    } else {
      if (el.minAge != null && age < el.minAge) {
        passed = false;
        reason = `Minimum age ${el.minAge}`;
      }
      if (el.maxAge != null && age > el.maxAge) {
        passed = false;
        reason = `Maximum age ${el.maxAge}`;
      }
    }
    checks.push({ label: 'Age', passed, reason });
  }

  if (el.gender && el.gender !== 'any') {
    const passed = !!user.gender && user.gender === el.gender;
    checks.push({ label: 'Gender', passed, reason: `Open to ${el.gender} candidates` });
  }

  if (Array.isArray(el.categories) && el.categories.length) {
    const passed = !!user.category && el.categories.includes(user.category);
    checks.push({
      label: 'Category',
      passed,
      reason: `Eligible categories: ${el.categories.join(', ')}`,
    });
  }

  if (Array.isArray(el.classLevels) && el.classLevels.length) {
    const passed = !!user.classLevel && el.classLevels.includes(user.classLevel);
    checks.push({
      label: 'Class / Level',
      passed,
      reason: `Eligible levels: ${el.classLevels.join(', ')}`,
    });
  }

  if (el.maxIncome != null) {
    const income = typeof user.annualIncome === 'number' ? user.annualIncome : null;
    let passed = true;
    let reason = `Family income ≤ ₹${el.maxIncome.toLocaleString('en-IN')}`;
    if (income == null) {
      passed = false;
      reason = 'Add your annual income in profile';
    } else if (income > el.maxIncome) {
      passed = false;
      reason = `Income exceeds ₹${el.maxIncome.toLocaleString('en-IN')}`;
    }
    checks.push({ label: 'Family Income', passed, reason });
  }

  if (el.domicileState && el.domicileState !== 'ALL') {
    const passed = !!user.state && user.state === el.domicileState;
    checks.push({ label: 'Domicile', passed, reason: `Only ${el.domicileState} residents` });
  } else if (scheme.state && scheme.state !== 'ALL') {
    const passed = !!user.state && user.state === scheme.state;
    checks.push({ label: 'State', passed, reason: `Only ${scheme.state} students` });
  }

  // Scheme-level gender tag (some schemes encode it in tags)
  if (Array.isArray(scheme.tags) && scheme.tags.some((t) => /girl|female|women/i.test(t))) {
    const passed = user.gender === 'female';
    checks.push({ label: 'Girls / Women', passed, reason: 'Reserved for female students' });
  }

  const total = checks.length || 1;
  const passedCount = checks.filter((c) => c.passed).length;
  const percent = Math.round((passedCount / total) * 100);

  return { percent, status: classify(percent), checks, total, passedCount };
}

/**
 * Score every active scheme for a user, sorted by match% then deadline.
 * @param {object} user
 * @param {Array} schemes plain objects or mongoose docs
 */
function matchSchemes(user, schemes) {
  const now = Date.now();
  return schemes
    .filter((s) => s.isActive !== false)
    .map((scheme) => {
      const s = typeof scheme.toObject === 'function' ? scheme.toObject() : scheme;
      const result = evaluateScheme(user, s);
      return {
        scheme: s,
        matchPercent: result.percent,
        status: result.status,
        checks: result.checks,
        deadline: s.deadline,
        deadlineDays: s.deadline ? Math.ceil((new Date(s.deadline).getTime() - now) / 86400000) : null,
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent || (a.deadline || 0) - (b.deadline || 0));
}

/**
 * Given a user and a list of required docs, return missing ones.
 */
function documentGap(user, requiredDocs = []) {
  const have = new Set((user.documents || []).map((d) => String(d.type).toLowerCase().trim()));
  return requiredDocs
    .map((d) => String(d).trim())
    .filter((d) => !have.has(d.toLowerCase()))
    .map((d) => ({ docType: d, status: 'missing' }));
}

module.exports = { ageFromDob, classify, evaluateScheme, matchSchemes, documentGap };
