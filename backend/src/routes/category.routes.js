import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateId, validatePagination } from '../utils/validators.js';

const router = express.Router();

router.get('/', validatePagination, async (req, res, next) => {
  try {
    const { department_id, sort = 'sort_order' } = req.query;
    const where = department_id ? { department_id } : {};
    
    const orderBy = {};
    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy,
      include: { department: true },
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateId, async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { department: true },
    });

    if (!category) {
      return res.status(404).json({ error: 'Not Found', message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, requireAdmin, validateId, async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, validateId, async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

