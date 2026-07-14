class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(entity = 'Resource') {
    super(`${entity} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 400);
    this.details = details;
  }
}

const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details || undefined,
      },
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: err.errors.map((e) => ({ field: e.path, message: e.message })),
      },
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: {
        message: 'Duplicate entry',
        details: err.errors.map((e) => ({ field: e.path, message: e.message })),
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
};

module.exports = { AppError, NotFoundError, ValidationError, errorHandler };
