export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error(`❌ Server Error [${req.method} ${req.url}]:`, err.stack || err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
    error: err.code || 'SERVER_ERROR',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
export default errorHandler;
