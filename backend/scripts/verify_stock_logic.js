import prisma from '../src/config/database.js';
import { createOrder } from '../src/controllers/order.controller.js';

// Mock Express Objects
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const mockNext = (err) => {
    console.error('❌ Error caught by next():', err);
    throw err;
};

async function runTest() {
    console.log('🚀 Starting Stock Logic Verification...');

    // 1. Setup Test Data
    const testSku = 'TEST-STOCK-SKU-' + Date.now();
    const testTelegramId = BigInt(Date.now());

    console.log('📦 Creating Test Data...');

    // User
    const user = await prisma.user.create({
        data: {
            telegram_id: testTelegramId,
            full_name: 'Test User',
            role: 'user',
            verification_status: 'verified'
        }
    });

    // Product (Stock: 10)
    const product = await prisma.product.create({
        data: {
            sku: testSku,
            name: 'Test Stock Product',
            price: 10.00,
            stock: 10,
            in_stock: true,
            description: 'Test Description'
        }
    });

    try {
        // --- TEST CASE 1: Successful Order (Stock Decrement) ---
        console.log('\n🧪 Test Case 1: Valid Order (Qty: 2, Stock: 10)');

        // Create Cart Item
        const cartItem = await prisma.cartItem.create({
            data: {
                user_id: user.id,
                product_id: product.id,
                quantity: 2
            }
        });

        const req = {
            user: { id: user.id, role: 'user' },
            body: {
                contact_info: { city: 'Test City' },
                cart_items: [{ id: cartItem.id }]
            }
        };
        const res = mockRes();

        await createOrder(req, res, mockNext);

        if (res.statusCode !== 201) {
            throw new Error(`Expected 201 Created, got ${res.statusCode}`);
        }
        console.log('✅ Order Created Successfully');

        // Verify Stock
        const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
        console.log(`Checking Stock: Expected 8, Got ${updatedProduct.stock}`);

        if (updatedProduct.stock !== 8) {
            throw new Error('Stock was NOT decremented correctly!');
        }
        console.log('✅ Stock Decrement Verified');

        // --- TEST CASE 2: Insufficient Stock ---
        console.log('\n🧪 Test Case 2: Insufficient Stock (Qty: 9, Stock: 8)');

        // Create another Cart Item (Qty 9, but valid stock is 8)
        const cartItemFail = await prisma.cartItem.create({
            data: {
                user_id: user.id,
                product_id: product.id,
                quantity: 9 // Too many!
            }
        });

        const reqFail = {
            user: { id: user.id, role: 'user' },
            body: {
                contact_info: { city: 'Test City' },
                cart_items: [{ id: cartItemFail.id }]
            }
        };
        const resFail = mockRes();

        // Expect error
        let errorCaught = false;
        try {
            await createOrder(reqFail, resFail, (err) => {
                console.log('✅ Caught expected error:', err.message);
                if (err.message.includes('Insufficient stock')) {
                    errorCaught = true;
                }
            });
            // If createOrder handles error via res.status(400), we need to check resFail.statusCode
            if (resFail.statusCode === 400 && resFail.data?.message?.includes('Insufficient stock')) {
                console.log('✅ Caught expected 400 Bad Request');
                errorCaught = true;
            }

        } catch (e) {
            if (e.message.includes('Insufficient stock')) errorCaught = true;
        }

        if (!errorCaught && !resFail.statusCode) {
            // Just in case createOrder didn't define next() usage exactly (some frameworks differ)
            // My implementation: calling next(error) or res.status(400)
            // My code: if (product.stock < ...) throw new Error
            // catch(error) -> if (insufficient) res.status(400)
            // So it should have set resFail.statusCode
            if (resFail.statusCode === 400) {
                console.log('✅ CORRECT: Order Rejected (400)');
            } else {
                throw new Error('Order should have failed but did not return 400 or throw error');
            }
        }

        // Verify Stock Unchanged
        const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
        if (finalProduct.stock !== 8) {
            throw new Error(`Stock changed unexpectedly! Expected 8, Got ${finalProduct.stock}`);
        }
        console.log('✅ Stock Integrity Verified');

    } catch (err) {
        console.error('💥 TEST FAILED:', err);
        process.exit(1);
    } finally {
        // Cleanup
        console.log('\n🧹 Cleaning up...');
        await prisma.cartItem.deleteMany({ where: { user_id: user.id } });
        await prisma.requestItem.deleteMany({ where: { request: { user_id: user.id } } });
        await prisma.request.deleteMany({ where: { user_id: user.id } });
        await prisma.product.delete({ where: { id: product.id } });
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.$disconnect();
    }
}

runTest();
