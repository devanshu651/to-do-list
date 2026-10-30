import ApiError from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found`));
}

export function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details;

  if (err.name === 'ValidationError') {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Please check the submitted fields';
    details = Object.values(err.errors).map(({ path, message: reason }) => ({ field: path, message: reason }));
  } else if (err.name === 'CastError') {
    status = 400; code = 'INVALID_ID'; message = 'The supplied resource ID is invalid';
  } else if (err.code === 11000) {
    status = 409; code = 'CONFLICT'; message = 'An account with this email already exists';
  } else if (status === 500) {
    console.error({ name: err.name, code: err.code || 'INTERNAL_ERROR' });
    message = 'An unexpected error occurred';
  }

  res.status(status).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
}
