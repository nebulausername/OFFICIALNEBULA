import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// All user routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Get all users (for dashboard)
router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                telegram_id: true,
                username: true,
                full_name: true,
                email: true,
                role: true,
                is_vip: true,
                verification_status: true,
                created_at: true,
                _count: {
                    select: {
                        requests: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get single user
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                requests: {
                    orderBy: { created_at: 'desc' },
                    take: 10,
                },
                _count: {
                    select: {
                        requests: true,
                        cart_items: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

export default router;
