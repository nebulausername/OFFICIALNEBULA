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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate environment variables
try {
  const { validateEnv } = await import('./config/env.js');
  validateEnv();
} catch (err) {
  console.error('❌ Error validating environment variables:', err);
  process.exit(1);
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

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Serve static files (verification photos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
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

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize Telegram Bot (after server setup to avoid circular dependencies)
import('./services/telegram-bot.service.js').then(({ initializeBot }) => {
  if (process.env.TELEGRAM_BOT_TOKEN) {
    console.log('🤖 Initializing Telegram Bot...');
    const bot = initializeBot();
    if (bot) {
      console.log('✅ Telegram Bot initialized successfully!');
    } else {
      console.warn('⚠️  Telegram Bot initialization returned null');
    }
  } else {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN not found in environment variables');
  }
}).catch(err => {
  console.error('❌ Error initializing Telegram Bot:', err);
  console.error('Stack:', err.stack);
});

// Initialize Cleanup Service
import('./services/cleanup.service.js').then(({ initializeCleanupService }) => {
  initializeCleanupService();
}).catch(err => {
  console.error('❌ Error initializing Cleanup Service:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

