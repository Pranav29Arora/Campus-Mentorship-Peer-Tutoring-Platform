const errorMiddleware = (err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : null
  });
};

module.exports = errorMiddleware;
