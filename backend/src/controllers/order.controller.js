import prisma from '../config/database.js';
import { sendOrderConfirmation, sendStatusUpdate } from '../services/email.service.js';
import { sendOrderNotification } from '../services/telegram.service.js';
import { notifyUser, getIO } from '../services/socket.service.js';
import { updateRankForUser } from '../services/ranking.service.js';

export const listOrders = async (req, res, next) => {
  try {
    const { status, sort = '-created_at', limit, page = 1 } = req.query;

    const where = {};

    // Admin can see all orders, users only their own
    if (req.user.role !== 'admin') {
      where.user_id = req.user.id;
    }

    if (status) where.status = status;

    const orderBy = {};
    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }

    const take = limit ? parseInt(limit) : undefined;
    const skip = take ? (parseInt(page) - 1) * take : undefined;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              telegram_id: true,
            },
          },
          request_items: {
            include: {
              product: {
                include: {
                  product_images: {
                    orderBy: { sort_order: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
      prisma.request.count({ where }),
    ]);

    res.json({
      data: requests,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: take ? Math.ceil(total / take) : 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            telegram_id: true,
            username: true,
          },
        },
        request_items: {
          include: {
            product: {
              include: {
                product_images: {
                  orderBy: { sort_order: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
      });
    }

    // Check if user has access
    if (request.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { contact_info, note, cart_items } = req.body;

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'Cart is empty' });
    }

    const cartItemIds = cart_items.map(item => item.id);

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      let totalSum = 0;
      const requestItemsData = [];

      // 1. Validate & Decrement Stock
      for (const item of cart_items) {
        const dbCartItem = await tx.cartItem.findUnique({
          where: { id: item.id },
          include: { product: true },
        });

        if (!dbCartItem || dbCartItem.user_id !== req.user.id) {
          throw new Error(`Invalid cart item: ${item.id}`);
        }

        const product = dbCartItem.product;

        // Stock Check
        if (product.stock < dbCartItem.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name} (Available: ${product.stock}, Requested: ${dbCartItem.quantity})`);
        }

        // Decrement Stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: dbCartItem.quantity } }
        });

        totalSum += parseFloat(product.price) * dbCartItem.quantity;

        requestItemsData.push({
          product_id: product.id,
          sku_snapshot: product.sku,
          name_snapshot: product.name,
          price_snapshot: product.price,
          quantity_snapshot: dbCartItem.quantity,
          selected_options_snapshot: dbCartItem.selected_options,
        });
      }

      // 2. Create Request
      const request = await tx.request.create({
        data: {
          user_id: req.user.id,
          status: 'pending',
          total_sum: totalSum,
          contact_info: typeof contact_info === 'string' ? contact_info : JSON.stringify(contact_info),
          note: note || null,
          request_items: {
            create: requestItemsData
          }
        },
      });

      // 3. Clear Cart
      await tx.cartItem.deleteMany({
        where: {
          id: { in: cartItemIds },
        },
      });

      return request;
    });

    // Get full order with relations
    const order = await prisma.request.findUnique({
      where: { id: result.id },
      include: {
        user: true,
        request_items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Send notifications (async, don't block response)
    sendOrderConfirmation(order, req.user).catch(err => console.error('Email Notification Error:', err));
    sendOrderNotification(order, req.user).catch(err => console.error('Telegram Notification Error:', err));

    // Notify User
    notifyUser(req.user.id, 'order_status_update', {
      status: 'created',
      orderId: order.id
    });

    // Notify Admins
    try {
      const io = getIO();
      if (io) {
        io.to('role_admin').emit('new_order', order);
      }
    } catch (e) {
      console.warn('Socket Admin Notification Error:', e);
    }

    res.status(201).json(order);
  } catch (error) {
    if (error.message.includes('Insufficient stock') || error.message.includes('Invalid cart item')) {
      return res.status(400).json({ error: 'Validation Error', message: error.message });
    }
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const request = await prisma.request.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        request_items: true,
      },
    });

    // Send status update notification
    if (message) {
      try {
        await sendStatusUpdate(request, status, message);
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    }

    // 🌟 Rank Progression Logic
    if ((status === 'shipped' || status === 'completed') && request.user_id) {
      try {
        const result = await updateRankForUser(request.user_id);
        if (result) {
          console.log(`🎉 Rank Update for ${request.user_id}: ${result.oldRank} -> ${result.newRank}`);

          // Notify User about Rank Up!
          if (result.newRank !== result.oldRank) {
            notifyUser(request.user_id, 'rank_up', {
              newRank: result.newRank,
              totalSpend: result.totalSpend
            });
          }
        }
      } catch (rankError) {
        console.error('Rank Update failed:', rankError);
      }
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};
