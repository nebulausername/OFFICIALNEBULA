export const errorHandler = (err, req, res, next) => {
  // Enhanced error logging
  const isDev = process.env.NODE_ENV === 'development';

  const safeBody =
    isDev
      ? req.body
      : req.body && typeof req.body === 'object'
        ? Object.keys(req.body)
        : undefined;

  const safeQuery =
    isDev
      ? req.query
      : req.query && typeof req.query === 'object'
        ? Object.keys(req.query)
        : undefined;

  const errorDetails = {
    message: err.message,
    stack: isDev ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    user: req.user?.id || 'anonymous',
    body: safeBody,
    query: safeQuery,
  };

  console.error('Error Details:', JSON.stringify(errorDetails, null, 2));
  
  // Log to error aggregation service (if available)
  // In production, you might want to send this to Sentry, LogRocket, etc.

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Duplicate entry',
      field: err.meta?.target?.[0],
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Record not found',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired',
    });
  }

  // Default error
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

