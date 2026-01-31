import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array(),
    });
  }
  next();
};

// Product validators
export const validateProduct = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').optional({ checkFalsy: true }).isUUID().withMessage('Invalid category ID'),
  body('brand_id').optional({ checkFalsy: true }).isUUID().withMessage('Invalid brand ID'),
  body('department_id').optional({ checkFalsy: true }).isUUID().withMessage('Invalid department ID'),
  validate,
];

export const validateProductUpdate = [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  validate,
];

// Order validators
export const validateOrder = [
  body('contact_info.name').trim().notEmpty().withMessage('Name is required'),
  body('contact_info.telegram').trim().notEmpty().withMessage('Telegram is required'),
  body('contact_info.email').optional().isEmail().withMessage('Invalid email'),
  validate,
];

// Ticket validators
export const validateTicket = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  validate,
];

// ID validators
export const validateId = [
  param('id').isUUID().withMessage('Invalid ID format'),
  validate,
];

// Pagination validators
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate,
];

