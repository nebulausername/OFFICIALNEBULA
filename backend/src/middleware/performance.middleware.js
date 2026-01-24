import { performance } from 'perf_hooks';

// Store for slow queries
const slowQueries = [];
const MAX_SLOW_QUERIES = 100;

export const performanceMiddleware = (req, res, next) => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (...args) {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    const memoryDelta = {
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      external: endMemory.external - startMemory.external,
    };

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      const slowRequest = {
        method: req.method,
        path: req.path,
        duration: Math.round(duration),
        timestamp: new Date().toISOString(),
        memoryDelta: Math.round(memoryDelta.heapUsed / 1024 / 1024), // MB
      };

      slowQueries.push(slowRequest);
      if (slowQueries.length > MAX_SLOW_QUERIES) {
        slowQueries.shift();
      }

      console.warn('⚠️ Slow Request Detected:', slowRequest);
    }

    // Log very slow requests (> 5 seconds)
    if (duration > 5000) {
      console.error('🚨 Very Slow Request:', {
        method: req.method,
        path: req.path,
        duration: Math.round(duration),
        query: req.query,
        body: req.body,
      });
    }

    // Add performance headers (only if headers haven't been sent yet)
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${Math.round(duration)}ms`);
      res.setHeader('X-Memory-Used', `${Math.round(memoryDelta.heapUsed / 1024 / 1024)}MB`);
    }

    // Call original end
    originalEnd.apply(this, args);
  };

  next();
};

// Get slow queries for monitoring
export const getSlowQueries = () => {
  return slowQueries.slice(-20); // Return last 20 slow queries
};

// Get performance stats
export const getPerformanceStats = () => {
  const memory = process.memoryUsage();
  return {
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
      external: Math.round(memory.external / 1024 / 1024), // MB
      rss: Math.round(memory.rss / 1024 / 1024), // MB
    },
    uptime: Math.round(process.uptime()), // seconds
    slowQueries: slowQueries.length,
    recentSlowQueries: slowQueries.slice(-10),
  };
};

