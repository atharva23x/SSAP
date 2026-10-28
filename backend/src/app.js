const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const { i18n } = require('./middleware/i18n');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.set('trust proxy', 1);

// Security & parsing
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Serve uploaded documents
const { UPLOAD_DIR } = require('./middleware/upload');
app.use('/uploads', express.static(UPLOAD_DIR));

// Language resolution for every request
app.use(i18n);

// Health check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    env: env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// Rate limit everything under /api (except health)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  return apiLimiter(req, res, next);
});

// Routes
app.use('/api/i18n', require('./routes/i18n'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schemes', require('./routes/schemes'));
// academic router exposes /exams, /competitions, /materials → mount at /api
app.use('/api', require('./routes/academic'));
app.use('/api/offices', require('./routes/offices'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));

// Serve frontend build if present (single-service deploy). Falls back to the
// raw `frontend/` folder so local dev works with no build step.
const FRONT_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
const FRONT_SRC = path.join(__dirname, '..', '..', 'frontend');
const activeFront = fs.existsSync(FRONT_DIST) ? FRONT_DIST : fs.existsSync(FRONT_SRC) ? FRONT_SRC : null;
if (activeFront) {
  app.use(express.static(activeFront));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(activeFront, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
