import { Telegraf, Scenes, session } from 'telegraf';
import prisma from '../config/database.js';

/**
 * E-Commerce Shop Bot with Telegraf
 * Handles product browsing, cart, and checkout
 * Uses existing Prisma schema (CartItem, Request models)
 */

// Shop Scene - Browse Products
const shopScene = new Scenes.BaseScene('shop');

shopScene.enter(async (ctx) => {
    try {
        // Get unique categories from products
        const products = await prisma.product.findMany({
            where: { in_stock: true },
            select: { category_id: true, category: { select: { name: true, id: true } } },
            distinct: ['category_id'],
        });

        const categories = products
            .filter(p => p.category)
            .map(p => p.category);

        if (categories.length === 0) {
            await ctx.reply('🚧 Noch keine Produkte verfügbar!');
            return;
        }

        const keyboard = [
            ...categories.map(c => [{ text: `🏷️ ${c.name}`, callback_data: `cat_${c.id}` }]),
            [{ text: '🛒 Warenkorb', callback_data: 'view_cart' }],
            [{ text: '🏠 Hauptmenü', callback_data: 'back_main' }],
        ];

        await ctx.reply(
            '🛍️ *NEBULA SUPPLY*\n\nWähle eine Kategorie:',
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard },
            }
        );
    } catch (error) {
        console.error('Shop enter error:', error);
        await ctx.reply('❌ Fehler beim Laden des Shops');
    }
});

// Handle category selection
shopScene.action(/^cat_(.+)$/, async (ctx) => {
    const categoryId = ctx.match[1];

    try {
        const products = await prisma.product.findMany({
            where: {
                category_id: categoryId,
                in_stock: true
            },
            take: 20,
            include: {
                category: true,
            }
        });

        if (products.length === 0) {
            await ctx.answerCbQuery('Keine Produkte in dieser Kategorie 😔');
            return;
        }

        // Store products in session
        ctx.session.currentProducts = products;
        ctx.session.currentProductIndex = 0;

        await ctx.answerCbQuery();
        await showProduct(ctx, products[0], 0, products.length);
    } catch (error) {
        console.error('Category selection error:', error);
        await ctx.answerCbQuery('❌ Fehler');
    }
});

// Show single product with navigation
async function showProduct(ctx, product, index, total) {
    const keyboard = [
        [
            { text: '◀️', callback_data: `prod_prev_${index}` },
            { text: `${index + 1}/${total}`, callback_data: 'noop' },
            { text: '▶️', callback_data: `prod_next_${index}` },
        ],
        [{ text: '🛒 In den Warenkorb', callback_data: `add_cart_${product.id}` }],
        [{ text: '📋 Kategorien', callback_data: 'back_categories' }],
    ];

    const price = parseFloat(product.price);
    const stock = product.stock || 0;

    const message = `
🔥 *${product.name}*

${product.description || 'Keine Beschreibung'}

💰 *Preis:* €${price.toFixed(2)}
📦 *Auf Lager:* ${stock} Stück
${product.category ? `🏷️ *Kategorie:* ${product.category.name}` : ''}
  `.trim();

    const options = {
        caption: message,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
    };

    try {
        if (product.cover_image) {
            await ctx.replyWithPhoto(product.cover_image, options);
        } else {
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard },
            });
        }
    } catch (error) {
        console.error('Show product error:', error);
    }
}

// Product navigation
shopScene.action(/^prod_(next|prev)_(\d+)$/, async (ctx) => {
    const direction = ctx.match[1];
    const currentIndex = parseInt(ctx.match[2]);
    const products = ctx.session.currentProducts;

    if (!products || products.length === 0) {
        await ctx.answerCbQuery('❌ Keine Produkte');
        return;
    }

    let newIndex = currentIndex;
    if (direction === 'next' && currentIndex < products.length - 1) {
        newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
        newIndex = currentIndex - 1;
    }

    ctx.session.currentProductIndex = newIndex;
    await ctx.answerCbQuery();

    try {
        await ctx.deleteMessage();
    } catch (e) {
        // Message might be too old to delete
    }

    await showProduct(ctx, products[newIndex], newIndex, products.length);
});

// Add to cart
shopScene.action(/^add_cart_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    const telegramId = ctx.from.id.toString();

    try {
        // Get or create user
        let user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(telegramId) },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegram_id: BigInt(telegramId),
                    username: ctx.from.username || `user_${telegramId}`,
                    full_name: ctx.from.first_name || 'User',
                },
            });
        }

        // Check if product exists and has stock
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            await ctx.answerCbQuery('❌ Produkt nicht gefunden');
            return;
        }

        if (!product.in_stock || product.stock <= 0) {
            await ctx.answerCbQuery('❌ Produkt nicht verfügbar');
            return;
        }

        // Check if already in cart
        const existingCartItem = await prisma.cartItem.findUnique({
            where: {
                user_id_product_id: {
                    user_id: user.id,
                    product_id: productId,
                },
            },
        });

        if (existingCartItem) {
            // Check if we can add more
            if (existingCartItem.quantity >= product.stock) {
                await ctx.answerCbQuery('⚠️ Maximale Menge erreicht!');
                return;
            }

            // Increase quantity
            await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + 1 },
            });
        } else {
            // Add new item
            await prisma.cartItem.create({
                data: {
                    user_id: user.id,
                    product_id: productId,
                    quantity: 1,
                },
            });
        }

        await ctx.answerCbQuery('✅ Zum Warenkorb hinzugefügt!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        await ctx.answerCbQuery('❌ Fehler beim Hinzufügen');
    }
});

// View cart scene
const cartScene = new Scenes.BaseScene('cart');

cartScene.enter(async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
        const user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(telegramId) },
            include: {
                cart_items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!user || user.cart_items.length === 0) {
            await ctx.reply('🛒 Dein Warenkorb ist leer!', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🛍️ Weiter shoppen', callback_data: 'back_shop' }],
                    ],
                },
            });
            return;
        }

        // Build cart message
        let message = '🛒 *DEIN WARENKORB*\n\n';
        let total = 0;

        user.cart_items.forEach((item, index) => {
            const price = parseFloat(item.product.price);
            const subtotal = price * item.quantity;
            total += subtotal;
            message += `${index + 1}. *${item.product.name}*\n`;
            message += `   ${item.quantity}x €${price.toFixed(2)} = €${subtotal.toFixed(2)}\n\n`;
        });

        message += `\n💰 *Gesamt: €${total.toFixed(2)}*`;

        const keyboard = [
            [{ text: '✅ Zur Kasse', callback_data: 'checkout' }],
            [{ text: '🗑️ Warenkorb leeren', callback_data: 'clear_cart' }],
            [{ text: '🛍️ Weiter shoppen', callback_data: 'back_shop' }],
        ];

        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: keyboard },
        });
    } catch (error) {
        console.error('Cart view error:', error);
        await ctx.reply('❌ Fehler beim Laden des Warenkorbs');
    }
});

// Clear cart
cartScene.action('clear_cart', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
        const user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(telegramId) },
        });

        if (user) {
            await prisma.cartItem.deleteMany({
                where: { user_id: user.id },
            });
            await ctx.answerCbQuery('🗑️ Warenkorb geleert!');
            await ctx.scene.reenter();
        }
    } catch (error) {
        console.error('Clear cart error:', error);
        await ctx.answerCbQuery('❌ Fehler');
    }
});

// Checkout scene
const checkoutScene = new Scenes.BaseScene('checkout');

checkoutScene.enter(async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
        const user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(telegramId) },
            include: {
                cart_items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!user || user.cart_items.length === 0) {
            await ctx.reply('❌ Dein Warenkorb ist leer!');
            await ctx.scene.leave();
            return;
        }

        // Calculate total
        const total = user.cart_items.reduce((sum, item) => {
            return sum + (parseFloat(item.product.price) * item.quantity);
        }, 0);

        ctx.session.checkoutTotal = total;
        ctx.session.userId = user.id;

        await ctx.reply(
            `💳 *CHECKOUT*\n\nGesamtbetrag: *€${total.toFixed(2)}*\n\n` +
            `Bitte gib deine Kontaktdaten ein:\n\n` +
            `Format: Name | Straße | PLZ Ort | Telegram`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Checkout enter error:', error);
        await ctx.reply('❌ Fehler beim Checkout');
        await ctx.scene.leave();
    }
});

checkoutScene.on('text', async (ctx) => {
    const text = ctx.message.text;

    // Parse contact info
    const parts = text.split('|').map(p => p.trim());

    if (parts.length < 4) {
        await ctx.reply(
            '❌ Ungültiges Format!\n\n' +
            'Bitte nutze: Name | Straße | PLZ Ort | Telegram'
        );
        return;
    }

    const [name, street, city, telegram] = parts;

    ctx.session.contactInfo = {
        name,
        street,
        city,
        telegram,
    };

    await ctx.reply(
        `📍 *Deine Daten:*\n\n` +
        `Name: ${name}\n` +
        `Adresse: ${street}, ${city}\n` +
        `Telegram: ${telegram}\n\n` +
        `Ist das korrekt?`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Ja, bestellen', callback_data: 'confirm_order' },
                        { text: '❌ Abbrechen', callback_data: 'cancel_order' },
                    ],
                ],
            },
        }
    );
});

checkoutScene.action('confirm_order', async (ctx) => {
    const userId = ctx.session.userId;
    const total = ctx.session.checkoutTotal;
    const contactInfo = ctx.session.contactInfo;

    try {
        // Get cart items
        const cartItems = await prisma.cartItem.findMany({
            where: { user_id: userId },
            include: { product: true },
        });

        // Create request (order)
        const request = await prisma.request.create({
            data: {
                user_id: userId,
                total_sum: total,
                status: 'pending',
                contact_info: contactInfo,
                request_items: {
                    create: cartItems.map(item => ({
                        product_id: item.product_id,
                        sku_snapshot: item.product.sku,
                        name_snapshot: item.product.name,
                        price_snapshot: item.product.price,
                        quantity_snapshot: item.quantity,
                        selected_options_snapshot: item.selected_options,
                    })),
                },
            },
        });

        // Clear cart
        await prisma.cartItem.deleteMany({
            where: { user_id: userId },
        });

        // Update stock
        for (const item of cartItems) {
            await prisma.product.update({
                where: { id: item.product_id },
                data: {
                    stock: { decrement: item.quantity },
                    in_stock: {
                        set: (item.product.stock - item.quantity) > 0
                    }
                },
            });
        }

        await ctx.answerCbQuery('✅ Bestellt!');
        await ctx.reply(
            `✅ *BESTELLUNG BESTÄTIGT!*\n\n` +
            `📦 Bestellnummer: #${request.id.substring(0, 8)}\n` +
            `💰 Betrag: €${total.toFixed(2)}\n\n` +
            `Wir melden uns in Kürze bei dir! 🔥`,
            { parse_mode: 'Markdown' }
        );

        await ctx.scene.leave();

    } catch (error) {
        console.error('Error creating order:', error);
        await ctx.answerCbQuery('❌ Fehler');
        await ctx.reply('❌ Fehler beim Erstellen der Bestellung. Bitte versuche es erneut.');
    }
});

checkoutScene.action('cancel_order', async (ctx) => {
    await ctx.answerCbQuery('Abgebrochen');
    await ctx.reply('❌ Bestellung abgebrochen.');
    await ctx.scene.leave();
});

// Action handlers for navigation
shopScene.action('view_cart', async (ctx) => {
    await ctx.scene.enter('cart');
});

shopScene.action('back_main', async (ctx) => {
    await ctx.scene.leave();
});

cartScene.action('checkout', async (ctx) => {
    await ctx.scene.enter('checkout');
});

cartScene.action('back_shop', async (ctx) => {
    await ctx.scene.enter('shop');
});

shopScene.action('back_categories', async (ctx) => {
    await ctx.answerCbQuery();
    try {
        await ctx.deleteMessage();
    } catch (e) {
        // Ignore
    }
    await ctx.scene.reenter();
});

shopScene.action('noop', async (ctx) => {
    await ctx.answerCbQuery();
});

// Create stage
const stage = new Scenes.Stage([shopScene, cartScene, checkoutScene]);

// Initialize shop bot
export function initializeShopBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        console.warn('⚠️ TELEGRAM_BOT_TOKEN not set - Shop bot disabled');
        return null;
    }

    const bot = new Telegraf(token);

    // Middleware
    bot.use(session());
    bot.use(stage.middleware());

    // Commands
    bot.command('shop', async (ctx) => {
        await ctx.scene.enter('shop');
    });

    bot.command('cart', async (ctx) => {
        await ctx.scene.enter('cart');
    });

    bot.command('help', async (ctx) => {
        await ctx.reply(
            `🤖 *NEBULA SUPPLY BOT*\n\n` +
            `Verfügbare Befehle:\n` +
            `/shop - Produkte durchstöbern\n` +
            `/cart - Warenkorb anzeigen\n` +
            `/help - Diese Hilfe anzeigen`,
            { parse_mode: 'Markdown' }
        );
    });

    // Start command
    bot.command('start', async (ctx) => {
        await ctx.reply(
            `🔥 *Willkommen bei NEBULA SUPPLY!*\n\n` +
            `Dein Premium Shop für Streetwear & mehr.\n\n` +
            `Nutze /shop um zu stöbern! 🛍️`,
            { parse_mode: 'Markdown' }
        );
    });

    // Start bot in long polling mode (development)
    if (process.env.NODE_ENV !== 'production') {
        bot.launch().then(() => {
            console.log('🤖 Shop Bot started successfully (polling mode)!');
        }).catch((error) => {
            console.error('❌ Error starting shop bot:', error);
        });

        // Graceful shutdown
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    }

    return bot;
}

export { stage as shopStage };
