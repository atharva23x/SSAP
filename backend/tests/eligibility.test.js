const { evaluateScheme, matchSchemes, classify, ageFromDob, documentGap } = require('../src/utils/eligibility');

const user = {
  name: 'Asha', gender: 'female', state: 'Maharashtra', category: 'OBC',
  classLevel: 'UG', annualIncome: 150000, dob: new Date('2005-06-15'),
  documents: [{ type: 'Aadhaar' }],
};

const scheme = {
  name: 'Test Scholarship', isActive: true, state: 'ALL',
  deadline: new Date(Date.now() + 20 * 86400000),
  eligibility: {
    minAge: 15, maxAge: 25,
    categories: ['OBC', 'SC', 'ST'],
    classLevels: ['UG', 'PG'],
    maxIncome: 800000,
    gender: 'any',
    domicileState: 'ALL',
  },
  requiredDocuments: ['Income Certificate', 'Caste Certificate', 'Aadhaar'],
};

describe('Eligibility engine', () => {
  it('computes age from DOB', () => {
    const age = ageFromDob(user.dob);
    expect(age).toBeGreaterThanOrEqual(18);
    expect(age).toBeLessThanOrEqual(25);
  });

  it('classifies match percentages correctly', () => {
    expect(classify(90)).toBe('eligible');
    expect(classify(80)).toBe('eligible');
    expect(classify(65)).toBe('action_needed');
    expect(classify(50)).toBe('action_needed');
    expect(classify(30)).toBe('not_eligible');
  });

  it('marks a matching user as eligible', () => {
    const result = evaluateScheme(user, scheme);
    expect(result.percent).toBe(100);
    expect(result.status).toBe('eligible');
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it('fails the income criterion when income exceeds the cap', () => {
    // Engine is score-based per spec: 1 failed criterion out of 4 => 75% => "action_needed"
    const richUser = { ...user, annualIncome: 2000000 };
    const result = evaluateScheme(richUser, scheme);
    const incomeCheck = result.checks.find((c) => c.label === 'Family Income');
    expect(incomeCheck.passed).toBe(false);
    expect(result.status).not.toBe('eligible');
  });

  it('is not eligible when most criteria fail', () => {
    const badUser = { ...user, annualIncome: 2000000, category: 'General', classLevel: '10th', dob: new Date('1990-01-01') };
    const result = evaluateScheme(badUser, scheme);
    expect(result.status).toBe('not_eligible');
  });

  it('fails when category is not allowed', () => {
    const generalUser = { ...user, category: 'General' };
    const s = { ...scheme, eligibility: { ...scheme.eligibility, categories: ['SC', 'ST'] } };
    const result = evaluateScheme(generalUser, s);
    expect(result.checks.find((c) => c.label === 'Category').passed).toBe(false);
  });

  it('fails domicile when state differs', () => {
    const s = { ...scheme, eligibility: { ...scheme.eligibility, domicileState: 'Karnataka' } };
    const result = evaluateScheme(user, s);
    expect(result.checks.find((c) => c.label === 'Domicile').passed).toBe(false);
  });

  it('respects gender-restricted schemes', () => {
    const maleUser = { ...user, gender: 'male' };
    const girlScheme = { ...scheme, tags: ['girl'] };
    const result = evaluateScheme(maleUser, girlScheme);
    expect(result.checks.find((c) => c.label === 'Girls / Women').passed).toBe(false);
  });

  it('sorts match results by percent then deadline', () => {
    const other = { ...scheme, name: 'Other', eligibility: { ...scheme.eligibility, categories: ['SC'] } };
    const results = matchSchemes(user, [other, scheme]);
    expect(results[0].scheme.name).toBe('Test Scholarship');
    expect(results[0].matchPercent).toBeGreaterThanOrEqual(results[1].matchPercent);
  });

  it('skips inactive schemes', () => {
    const results = matchSchemes(user, [{ ...scheme, isActive: false }]);
    expect(results).toHaveLength(0);
  });
});

describe('Document gap detector', () => {
  it('lists only missing documents', () => {
    const missing = documentGap(user, scheme.requiredDocuments);
    expect(missing.map((m) => m.docType)).toEqual(['Income Certificate', 'Caste Certificate']);
    expect(missing.every((m) => m.status === 'missing')).toBe(true);
  });

  it('returns empty when everything is present', () => {
    const fullUser = { documents: scheme.requiredDocuments.map((type) => ({ type })) };
    expect(documentGap(fullUser, scheme.requiredDocuments)).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    const u = { documents: [{ type: 'aadhaar' }] };
    expect(documentGap(u, ['Aadhaar'])).toHaveLength(0);
  });
});
