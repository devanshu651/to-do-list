import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'VALIDATION_ERROR', 'Please check the submitted fields', errors.array().map(({ path, msg }) => ({ field: path, message: msg }))));
  }
  next();
}
