process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.CRON_ENABLED = 'false';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  const { connectDB } = require('../src/config/db');
  await connectDB(process.env.MONGO_URI);
  app = require('../src/app');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('Auth flow', () => {
  let cookie;

  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Student', email: 'test@example.com', password: 'secret123', preferredLanguage: 'hi' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
    // capture refresh cookie
    const setCookie = res.headers['set-cookie'] || [];
    cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    expect(cookie).toContain('refreshToken');
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup', email: 'test@example.com', password: 'secret123' })
      .expect(409);
    expect(res.body.error.message).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('rejects invalid credentials', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpass' })
      .expect(401);
  });

  it('logs in and returns a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'secret123' })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('Test Student');
  });

  it('validates required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad', password: 'x' })
      .expect(422);
    expect(res.body.error.message).toBe('VALIDATION_FAILED');
  });

  it('returns /auth/me for an authenticated request', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'secret123' })
      .expect(200);
    const setCookie = login.headers['set-cookie'] || [];
    const cookieHeader = setCookie.map((c) => c.split(';')[0]).join('; ');
    expect(cookieHeader).toContain('refreshToken');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookieHeader)
      .expect(200);
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('rejects protected routes without a token', async () => {
    await request(app).get('/api/schemes').expect(401);
  });
});

describe('i18n', () => {
  it('serves the English bundle', async () => {
    const res = await request(app).get('/api/i18n/en').expect(200);
    expect(res.body.data.app.shortName).toBe('SSAP');
    expect(res.body.data.nav.schemes).toBe('Schemes');
  });

  it('rejects unsupported languages', async () => {
    await request(app).get('/api/i18n/fr').expect(400);
  });
});

describe('Health', () => {
  it('responds to /api/health', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
