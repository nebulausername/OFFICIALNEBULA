import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateId } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { user_id: req.user.id },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            product_images: {
              orderBy: { sort_order: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/:product_id', validateId, async (req, res, next) => {
  try {
    const { product_id } = req.params;

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        user_id_product_id: {
          user_id: req.user.id,
          product_id,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Product already in wishlist',
      });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        user_id: req.user.id,
        product_id,
      },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            product_images: {
              orderBy: { sort_order: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:product_id', validateId, async (req, res, next) => {
  try {
    const { product_id } = req.params;

    await prisma.wishlistItem.delete({
      where: {
        user_id_product_id: {
          user_id: req.user.id,
          product_id,
        },
      },
    });

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
});

export default router;

