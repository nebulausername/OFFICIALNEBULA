import prisma from '../config/database.js';

export const listTickets = async (req, res, next) => {
  try {
    const { status, sort = '-last_message_at', limit, page = 1 } = req.query;

    const where = {};
    
    // Admin can see all tickets, users only their own
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

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
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
            },
          },
          ticket_messages: {
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      data: tickets,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: take ? Math.ceil(total / take) : 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
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
        ticket_messages: {
          orderBy: { created_at: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ticket not found',
      });
    }

    // Check access
    if (ticket.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    // Mark as read
    if (req.user.role === 'admin') {
      await prisma.ticket.update({
        where: { id },
        data: { unread_by_admin: false },
      });
    } else {
      await prisma.ticket.update({
        where: { id },
        data: { unread_by_user: false },
      });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const { subject, message, priority = 'medium' } = req.body;

    const ticket = await prisma.ticket.create({
      data: {
        user_id: req.user.id,
        subject,
        status: 'open',
        priority,
        unread_by_admin: true,
        ticket_messages: {
          create: {
            user_id: req.user.id,
            message,
            read_by_user: true,
            read_by_admin: false,
          },
        },
      },
      include: {
        user: true,
        ticket_messages: true,
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;

    // Check ticket access
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ticket not found',
      });
    }

    if (ticket.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    // Create message
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticket_id: id,
        user_id: req.user.id,
        message,
        attachments: attachments || null,
        read_by_user: req.user.role === 'admin' ? false : true,
        read_by_admin: req.user.role === 'admin' ? true : false,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
    });

    // Update ticket
    await prisma.ticket.update({
      where: { id },
      data: {
        last_message_at: new Date(),
        unread_by_user: req.user.role === 'admin',
        unread_by_admin: req.user.role !== 'admin',
        ...(ticket.status === 'solved' && req.user.role === 'admin' && { status: 'open' }),
      },
    });

    res.status(201).json(ticketMessage);
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
      },
      include: {
        user: true,
        ticket_messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

