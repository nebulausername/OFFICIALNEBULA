import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { performanceMiddleware } from './middleware/performance.middleware.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { jsonSerializerMiddleware } from './middleware/json-serializer.middleware.js';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate environment variables
let startupError = null;
try {
  const { validateEnv } = await import('./config/env.js');
  validateEnv();
} catch (err) {
  console.error('❌ Error validating environment variables:', err);
  startupError = err.message;
}

// Import routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import brandRoutes from './routes/brand.routes.js';
import departmentRoutes from './routes/department.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import emailRoutes from './routes/email.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import telegramRoutes from './routes/telegram.routes.js';
import cronRoutes from './routes/cron.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import userRoutes from './routes/user.routes.js';

import { createServer } from 'http';
import { initializeSocket } from './services/socket.service.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8000;

// Security middleware
app.use((req, res, next) => {
  if (startupError) {
    return res.status(500).json({
      error: 'Server Startup Error',
      message: startupError,
      hint: 'Please check your Vercel Environment Variables.'
    });
  }
  next();
});
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'https://officialnebula.vercel.app'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Normalize Prisma types (Decimal/BigInt/Date) for JSON responses
app.use(jsonSerializerMiddleware);

// Request logging (Vercel-friendly JSON logs)
app.use(requestLogger);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Performance monitoring
app.use(performanceMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Serve static files (admin dashboard)
app.use('/dashboard', express.static(path.join(__dirname, '../../dashboard')));

// Serve static files (verification photos)
app.use('/uploads', uploadsRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const { default: prisma } = await import('./config/database.js');

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get database info
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();

    res.json({
      status: 'healthy',
      database: {
        connected: true,
        url: process.env.DATABASE_URL?.replace(/:([^:@]*|[^@]*)@/, ':****@') || 'NOT_SET',
        stats: {
          users: userCount,
          products: productCount,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('🔴 Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error.message,
        code: error.code,
        url: process.env.DATABASE_URL?.replace(/:([^:@]*|[^@]*)@/, ':****@') || 'NOT_SET',
      },
      timestamp: new Date().toISOString(),
    });
  }
});


// Telegram webhook route (before rate limiting for faster processing)
app.use('/api/telegram', telegramRoutes);

// API routes
app.use('/api/cron', cronRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/cart-items', cartRoutes);
app.use('/api/requests', orderRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/wishlist-items', wishlistRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// In serverless (Vercel) we should not run long-lived background processes.
// Telegram bot and cleanup will be invoked via webhooks/cron routes instead.
if (!process.env.VERCEL) {
  // Initialize Telegram Bot (after server setup to avoid circular dependencies)
  import('./services/telegram-bot.service.js')
    .then(async ({ initializeBot }) => {
      if (process.env.TELEGRAM_BOT_TOKEN) {
        console.log('🤖 Initializing Telegram Bot...');
        const bot = await initializeBot();
        if (bot) {
          console.log('✅ Telegram Bot initialized successfully!');
        } else {
          console.warn('⚠️  Telegram Bot initialization returned null');
        }
      } else {
        console.warn('⚠️  TELEGRAM_BOT_TOKEN not found in environment variables');
      }
    })
    .catch((err) => {
      console.error('❌ Error initializing Telegram Bot:', err);
      console.error('Stack:', err.stack);
    });

  // Initialize Cleanup Service
  import('./services/cleanup.service.js')
    .then(({ initializeCleanupService }) => {
      initializeCleanupService();
    })
    .catch((err) => {
      console.error('❌ Error initializing Cleanup Service:', err);
    });

  // Initialize Socket.io
  initializeSocket(httpServer);

  // Start server (local / VPS only)
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  });
}

// Graceful shutdown with bot cleanup
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: starting graceful shutdown`);

  try {
    // Shutdown Telegram bot first
    const { shutdownBot } = await import('./services/telegram-bot.service.js');
    await shutdownBot();
    console.log('✅ Telegram bot shutdown complete');
  } catch (err) {
    console.error('⚠️  Error during bot shutdown:', err.message);
  }

  // Close HTTP server
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.warn('⚠️  Forcing exit after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;