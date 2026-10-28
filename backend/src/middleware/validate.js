const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/** Run express-validator chains and fail fast with 422. */
function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) return next();
      next(
        new ApiError(422, 'VALIDATION_FAILED', errors.array().map((e) => ({ field: e.path, msg: e.msg })))
      );
    },
  ];
}

module.exports = validate;
