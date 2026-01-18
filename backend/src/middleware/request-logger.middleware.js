import { randomUUID } from 'crypto';
import { performance } from 'perf_hooks';

const shouldLog = () => {
  // Default to logging on Vercel; can be disabled by setting HTTP_LOG=false
  const flag = process.env.HTTP_LOG;
  if (flag === undefined || flag === null || flag === '') {
    return !!process.env.VERCEL || process.env.NODE_ENV !== 'production';
  }
  return flag !== 'false' && flag !== '0';
};

export const requestLogger = (req, res, next) => {
  if (!shouldLog()) return next();

  const start = performance.now();
  const requestId = (req.headers['x-request-id'] || randomUUID()).toString();
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Math.round(performance.now() - start);
    const log = {
      level: 'info',
      msg: 'http_request',
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      userId: req.user?.id || null,
      ts: new Date().toISOString(),
    };

    // JSON logs are easiest to filter in Vercel
    console.log(JSON.stringify(log));
  });

  next();
};

