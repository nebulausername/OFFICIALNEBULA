import prisma from '../config/database.js';

export const listUsers = async (req, res, next) => {
    try {
        const { search, role, is_vip, page = 1, limit = 10, sort = '-created_at' } = req.query;

        const where = {};
        if (role) where.role = role;
        if (is_vip) where.is_vip = is_vip === 'true';
        if (search) {
            where.OR = [
                { full_name: { contains: search } }, // SQLite limitation: no insensitive mode easily via Prisma without raw or strict setup on some versions, but 'contains' usually works.
                { email: { contains: search } },
                { username: { contains: search } }
            ];
        }

        const orderBy = {};
        if (sort.startsWith('-')) {
            orderBy[sort.substring(1)] = 'desc';
        } else {
            orderBy[sort] = 'asc';
        }

        const take = parseInt(limit);
        const skip = (parseInt(page) - 1) * take;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy,
                take,
                skip,
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    username: true,
                    role: true,
                    is_vip: true,
                    created_at: true,
                    _count: {
                        select: { requests: true }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            data: users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / take)
        });

    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        constuser = await prisma.user.findUnique({
            where: { id },
            include: {
                _count: { select: { requests: true } }
            }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, is_vip } = req.body;

        const updateData = {};
        if (role) updateData.role = role;
        if (is_vip !== undefined) updateData.is_vip = is_vip;

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json(user);
    } catch (error) {
        next(error);
    }
};
