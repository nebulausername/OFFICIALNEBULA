import prisma from '../config/database.js';

export const getCart = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
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

    res.json(cartItems);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1, selected_options } = req.body;

    // Check if item already exists
    const existing = await prisma.cartItem.findUnique({
      where: {
        user_id_product_id: {
          user_id: req.user.id,
          product_id,
        },
      },
    });

    let cartItem;
    if (existing) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          selected_options: selected_options || existing.selected_options,
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
    } else {
      // Create new item
      cartItem = await prisma.cartItem.create({
        data: {
          user_id: req.user.id,
          product_id,
          quantity,
          selected_options: selected_options || null,
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
    }

    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, selected_options } = req.body;

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(selected_options !== undefined && { selected_options }),
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

    res.json(cartItem);
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { user_id: req.user.id },
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

