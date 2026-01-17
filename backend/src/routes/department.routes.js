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

    const departments = await prisma.department.findMany({ orderBy });
    res.json(departments);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateId, async (req, res, next) => {
  try {
    const department = await prisma.department.findUnique({ where: { id: req.params.id } });
    if (!department) {
      return res.status(404).json({ error: 'Not Found', message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const department = await prisma.department.create({ data: req.body });
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticate, requireAdmin, validateId, async (req, res, next) => {
  try {
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(department);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, validateId, async (req, res, next) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ message: 'Department deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

