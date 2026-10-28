const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, `Not found: ${req.method} ${req.originalUrl}`));
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'INTERNAL_ERROR';
  let details = err.details;

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 422;
    message = 'VALIDATION_FAILED';
    details = Object.values(err.errors).map((e) => ({ field: e.path, msg: e.message }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'INVALID_ID';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'DUPLICATE_KEY';
    details = err.keyValue;
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = `UPLOAD_${err.code}`;
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: { message, details },
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
