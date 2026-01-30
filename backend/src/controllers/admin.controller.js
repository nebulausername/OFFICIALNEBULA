import prisma from '../config/database.js';

// Helper to normalize JSON inputs (supports both arrays/objects and JSON-strings)
const toJsonValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

export const getStats = async (req, res, next) => {
  try {
    // Optimized: Batch queries and use indexes efficiently
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Use Promise.all for parallel execution
    const [
      totalProducts,
      totalOrders,
      totalCategories,
      totalBrands,
      totalTickets,
      totalUsers,
      vipUsers,
      openTickets,
      pendingOrders,
      revenueData,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.request.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.ticket.count(),
      prisma.user.count(),
      prisma.user.count({ where: { is_vip: true } }),
      prisma.ticket.count({
        where: {
          status: { in: ['open', 'in_progress'] },
        },
      }),
      prisma.request.count({
        where: { status: 'pending' },
      }),
      // Batch revenue queries
      Promise.all([
        prisma.request.aggregate({
          where: { status: { in: ['completed', 'shipped'] } },
          _sum: { total_sum: true },
        }),
        prisma.request.aggregate({
          where: {
            status: { in: ['completed', 'shipped'] },
            created_at: { gte: todayStart },
          },
          _sum: { total_sum: true },
        }),
        prisma.request.aggregate({
          where: {
            status: { in: ['completed', 'shipped'] },
            created_at: { gte: weekStart },
          },
          _sum: { total_sum: true },
        }),
        prisma.request.aggregate({
          where: {
            status: { in: ['completed', 'shipped'] },
            created_at: { gte: monthStart },
          },
          _sum: { total_sum: true },
        }),
      ]),
    ]);

    const [totalRevenue, todayRevenue, weekRevenue, monthRevenue] = revenueData;

    // Get recent orders
    const recentOrders = await prisma.request.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    // Get top products (by order count)
    const topProducts = await prisma.requestItem.groupBy({
      by: ['product_id'],
      _count: { product_id: true },
      orderBy: { _count: { product_id: 'desc' } },
      take: 5,
    });

    const topProductIds = topProducts.map((p) => p.product_id).filter(Boolean);
    const topProductsData = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      include: {
        product_images: {
          orderBy: { sort_order: 'asc' },
          take: 1,
        },
      },
    });

    res.json({
      overview: {
        products: totalProducts,
        orders: totalOrders,
        categories: totalCategories,
        brands: totalBrands,
        tickets: totalTickets,
        users: totalUsers,
        vipUsers,
        openTickets,
        pendingOrders,
      },
      revenue: {
        total: totalRevenue._sum.total_sum || 0,
        today: todayRevenue._sum.total_sum || 0,
        week: weekRevenue._sum.total_sum || 0,
        month: monthRevenue._sum.total_sum || 0,
      },
      recentOrders,
      topProducts: topProductsData,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiagnostics = async (req, res, next) => {
  try {
    const [
      products,
      categories,
      brands,
      departments,
      users,
      requests,
      tickets,
      verifications,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.department.count(),
      prisma.user.count(),
      prisma.request.count(),
      prisma.ticket.count(),
      prisma.verificationRequest.count().catch(() => 0),
    ]);

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      counts: {
        products,
        categories,
        brands,
        departments,
        users,
        requests,
        tickets,
        verificationRequests: verifications,
      },
      env: {
        nodeEnv: process.env.NODE_ENV || 'development',
        vercel: !!process.env.VERCEL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasCronSecret: !!process.env.CRON_SECRET,
        hasTelegramBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { search, role, is_vip, sort = '-created_at', limit, page = 1 } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (is_vip !== undefined) where.is_vip = is_vip === 'true';

    const orderBy = {};
    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }

    const take = limit ? parseInt(limit) : undefined;
    const skip = take ? (parseInt(page) - 1) * take : undefined;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        take,
        skip,
        select: {
          id: true,
          telegram_id: true,
          username: true,
          full_name: true,
          email: true,
          phone: true,
          role: true,
          is_vip: true,
          vip_expires_at: true,
          created_at: true,
          _count: {
            select: {
              requests: true,
              tickets: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users.map((u) => ({
        ...u,
        telegram_id: u.telegram_id?.toString(),
      })),
      total,
      page: parseInt(page),
      limit: take,
      totalPages: take ? Math.ceil(total / take) : 1,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleVIP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_vip, vip_expires_at } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        is_vip: is_vip !== undefined ? is_vip : undefined,
        vip_expires_at: vip_expires_at || null,
      },
      select: {
        id: true,
        telegram_id: true,
        username: true,
        full_name: true,
        email: true,
        role: true,
        is_vip: true,
        vip_expires_at: true,
      },
    });

    res.json({
      ...user,
      telegram_id: user.telegram_id?.toString(),
    });
  } catch (error) {
    next(error);
  }
};

export const bulkImportProducts = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Products array is required',
      });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    for (const productData of products) {
      try {
        await prisma.product.upsert({
          where: { sku: productData.sku },
          update: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            in_stock: productData.in_stock !== false,
            cover_image: productData.cover_image,
            tags: toJsonValue(productData.tags || []),
            ...(productData.department_id && { department_id: productData.department_id }),
            ...(productData.category_id && { category_id: productData.category_id }),
            ...(productData.brand_id && { brand_id: productData.brand_id }),
          },
          create: {
            sku: productData.sku,
            name: productData.name,
            description: productData.description || '',
            price: productData.price,
            currency: productData.currency || 'EUR',
            department_id: productData.department_id,
            category_id: productData.category_id,
            brand_id: productData.brand_id,
            in_stock: productData.in_stock !== false,
            cover_image: productData.cover_image,
            tags: toJsonValue(productData.tags || []),
            product_type: productData.product_type || 'other',
            colors: toJsonValue(productData.colors || []),
            sizes: toJsonValue(productData.sizes || []),
            variants: toJsonValue(productData.variants || []),
          },
        });

        results.updated++;
      } catch (error) {
        results.errors.push({
          sku: productData.sku,
          error: error.message,
        });
      }
    }

    res.json({
      message: 'Bulk import completed',
      ...results,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesData = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await prisma.request.findMany({
      where: {
        status: { in: ['completed', 'shipped'] },
        created_at: { gte: startDate },
      },
      select: {
        created_at: true,
        total_sum: true,
      },
      orderBy: { created_at: 'asc' },
    });

    res.json({
      period: days,
      data: orders.map(o => ({
        date: o.created_at,
        revenue: parseFloat(o.total_sum) || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await prisma.requestItem.groupBy({
      by: ['product_id'],
      _count: { product_id: true },
      _sum: { quantity_snapshot: true },
      orderBy: { _count: { product_id: 'desc' } },
      take: parseInt(limit),
    });

    const productIds = topProducts.map(p => p.product_id).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        cover_image: true,
        price: true,
      },
    });

    const productsMap = new Map(products.map(p => [p.id, p]));

    res.json(
      topProducts
        .map(item => ({
          product: productsMap.get(item.product_id),
          orderCount: item._count.product_id,
          totalQuantity: item._sum.quantity_snapshot || 0,
        }))
        .filter(item => item.product)
    );
  } catch (error) {
    next(error);
  }
};

export const getCategoryRevenue = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const requestItems = await prisma.requestItem.findMany({
      where: {
        request: {
          status: { in: ['completed', 'shipped'] },
          created_at: { gte: startDate },
        },
      },
      include: {
        product: {
          select: {
            category_id: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const categoryRevenue = {};
    requestItems.forEach(item => {
      const categoryId = item.product?.category_id;
      const categoryName = item.product?.category?.name || 'Unbekannt';
      if (categoryId) {
        if (!categoryRevenue[categoryId]) {
          categoryRevenue[categoryId] = {
            id: categoryId,
            name: categoryName,
            revenue: 0,
            count: 0,
          };
        }
        const price = typeof item.price_snapshot === 'number'
          ? item.price_snapshot
          : parseFloat(item.price_snapshot) || 0;
        categoryRevenue[categoryId].revenue += price * item.quantity_snapshot;
        categoryRevenue[categoryId].count += item.quantity_snapshot;
      }
    });

    res.json(Object.values(categoryRevenue).sort((a, b) => b.revenue - a.revenue));
  } catch (error) {
    next(error);
  }
};

export const getUserGrowth = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      where: {
        created_at: { gte: startDate },
      },
      select: {
        created_at: true,
      },
      orderBy: { created_at: 'asc' },
    });

    // Group by date
    const growthData = {};
    users.forEach(user => {
      const date = user.created_at.toISOString().split('T')[0];
      growthData[date] = (growthData[date] || 0) + 1;
    });

    res.json(
      Object.entries(growthData).map(([date, count]) => ({
        date,
        count,
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const [recentOrders, recentTickets, recentUsers] = await Promise.all([
      prisma.request.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              full_name: true,
              email: true,
            },
          },
        },
      }),
      prisma.ticket.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              full_name: true,
              email: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          full_name: true,
          email: true,
          created_at: true,
        },
      }),
    ]);

    res.json({
      orders: recentOrders,
      tickets: recentTickets,
      users: recentUsers,
    });

  } catch (error) {
    next(error);
  }
};

export const getChatSessions = async (req, res, next) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updated_at: 'desc' },
      include: {
        user: { select: { id: true, full_name: true, email: true, rank: true } },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: { where: { is_read: false, sender: 'user' } } }
        }
      }
    });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const messages = await prisma.chatMessage.findMany({
      where: { session_id: sessionId },
      orderBy: { created_at: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};
