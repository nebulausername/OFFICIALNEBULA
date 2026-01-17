/**
 * Environment variables validation
 */

const requiredEnvVars = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'Database connection URL',
  },
  
  // Telegram
  TELEGRAM_BOT_TOKEN: {
    required: true,
    description: 'Telegram Bot API token',
  },
  
  // JWT
  JWT_SECRET: {
    required: true,
    description: 'JWT secret key for token generation',
  },
};

const optionalEnvVars = {
  // Server
  PORT: {
    default: '8000',
    description: 'Server port',
  },
  
  NODE_ENV: {
    default: 'development',
    description: 'Node environment (development/production)',
  },
  
  // CORS
  CORS_ORIGIN: {
    default: 'http://localhost:3000',
    description: 'CORS allowed origin',
  },
  
  // WebApp
  WEBAPP_URL: {
    default: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://officialnebula.vercel.app',
    description: 'Frontend WebApp URL',
    requiredInProduction: true,
  },
  
  // Telegram Webhook
  USE_WEBHOOK: {
    default: 'false',
    description: 'Use webhook mode for Telegram bot (true/false)',
  },
  
  TELEGRAM_WEBHOOK_URL: {
    default: null,
    description: 'Telegram webhook URL (auto-generated if not set)',
  },
  
  // Logging
  BOT_LOG_LEVEL: {
    default: 'INFO',
    description: 'Bot logging level (DEBUG/INFO/WARN/ERROR)',
  },
};

/**
 * Validate environment variables
 */
export const validateEnv = () => {
  const errors = [];
  const warnings = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Check required variables
  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName} - ${config.description}`);
    }
  }

  // Check optional variables with defaults
  for (const [varName, config] of Object.entries(optionalEnvVars)) {
    if (!process.env[varName]) {
      if (config.requiredInProduction && isProduction) {
        errors.push(`Missing required environment variable for production: ${varName} - ${config.description}`);
      } else if (config.default) {
        process.env[varName] = config.default;
        console.log(`[ENV] Using default for ${varName}: ${config.default}`);
      } else {
        warnings.push(`Optional environment variable not set: ${varName} - ${config.description}`);
      }
    }
  }

  // Validate specific formats
  if (process.env.TELEGRAM_BOT_TOKEN) {
    // Telegram bot tokens are in format: number:alphanumeric
    const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenPattern.test(process.env.TELEGRAM_BOT_TOKEN)) {
      errors.push('TELEGRAM_BOT_TOKEN format is invalid (should be in format: number:alphanumeric)');
    }
  }

  if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL.startsWith('file:') && 
        !process.env.DATABASE_URL.startsWith('postgresql://') &&
        !process.env.DATABASE_URL.startsWith('mysql://')) {
      warnings.push('DATABASE_URL format might be invalid');
    }
  }

  // Print errors and warnings
  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\n');
    throw new Error('Environment validation failed. Please fix the errors above.');
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
    console.warn('\n');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Environment variables validated successfully');
  }
};

/**
 * Get environment variable with fallback
 */
export const getEnv = (varName, defaultValue = null) => {
  return process.env[varName] || defaultValue;
};
