import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validateId, validatePagination } from '../utils/validators.js';

const router = express.Router();

router.get('/', validatePagination, async (req, res, next) => {
  try {
    const { sort = 'sort_order' } = req.query;
    const orderBy = {};
    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }

    const brands = await prisma.brand.findMany({ orderBy });
    res.json(brands);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateId, async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({ where: { id: req.params.id } });
    if (!brand) {
      return res.status(404).json({ error: 'Not Found', message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const brand = await prisma.brand.create({ data: req.body });
    res.status(201).json(brand);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, requireAdmin, validateId, async (req, res, next) => {
  try {
    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(brand);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, validateId, async (req, res, next) => {
  try {
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.json({ message: 'Brand deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

