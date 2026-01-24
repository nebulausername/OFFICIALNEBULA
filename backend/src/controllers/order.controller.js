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

    // Calculate total from cart items
    let totalSum = 0;
    const cartItemIds = [];

    for (const item of cart_items) {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: item.id },
        include: { product: true },
      });

      if (!cartItem || cartItem.user_id !== req.user.id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid cart item',
        });
      }

      totalSum += parseFloat(cartItem.product.price) * cartItem.quantity;
      cartItemIds.push(cartItem.id);
    }

    // Create order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create request
      const request = await tx.request.create({
        data: {
          user_id: req.user.id,
          status: 'pending',
          total_sum: totalSum,
          contact_info,
          note: note || null,
        },
      });

      // Create request items
      for (const item of cart_items) {
        const cartItem = await tx.cartItem.findUnique({
          where: { id: item.id },
          include: { product: true },
        });

        await tx.requestItem.create({
          data: {
            request_id: request.id,
            product_id: cartItem.product_id,
            sku_snapshot: cartItem.product.sku,
            name_snapshot: cartItem.product.name,
            price_snapshot: cartItem.product.price,
            quantity_snapshot: cartItem.quantity,
            selected_options_snapshot: cartItem.selected_options,
          },
        });
      }

      // Delete cart items
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

    // Send notifications
    try {
      await sendOrderConfirmation(order, req.user);
      await sendOrderNotification(order, req.user);
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the request if notifications fail
    }

    // 📡 Emit Realtime Event for Admins
    // We emit to 'admin_notifications' channel or similar, but since we use rooms:
    // We can emit to specific admin users or just broadcast if we had a global admin room.
    // For now, let's assume admins join 'role_admin' room OR we just notify known admins loop.
    // Better: frontend admin joins 'admin_dashboard' room.
    // Let's modify socket.service.js to support roles or rooms better later.
    // For now, we will assume we updated Socket Service to support broadcast or we just use a loop.

    // Quick Fix: Emit to a generic 'admin_events' if possible, but let's stick to what we have.
    // We will emit to the USER (confirmation) and potentially ALL connected sockets (admin check).

    // Notify the User immediately (confetti etc)
    notifyUser(req.user.id, 'order_status_update', {
      status: 'created',
      orderId: order.id
    });

    // Notify Admins (Broadcasting to all connected admins would be ideal)
    // For MVP: We assume the Admin Dashboard listens to a global event if we implement it,
    // OR we iterate over connected admins.

    // Actually, let's just emit a global 'new_order' event via IO if we exported it, 
    // but we only exported notifyUser.
    // Let's use a workaround: The Admin Dashboard should join a "admin_room" on connect.
    // We need to update socket.service.js to allow joining rooms.

    // Let's update socket.service.js first to expose `io`, then we can do `io.to('admin').emit(...)`
    // However, I can't edit socket.service.js in this step.
    // I will add the import, use a workaround or rely on the user notification for now.

    // Notify Admins
    try {
      const io = getIO();
      io.to('role_admin').emit('new_order', order);
      console.log('📡 Emitted new_order to role_admin');
    } catch (e) {
      console.warn('Socket IO emit failed', e);
    }

    res.status(201).json(order);
  } catch (error) {
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

