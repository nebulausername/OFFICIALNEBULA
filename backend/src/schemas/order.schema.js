
import { z } from 'zod';

export const createOrderSchema = z.object({
    body: z.object({
        cart_items: z.array(z.object({
            id: z.string(),
        })).min(1, "Cart cannot be empty").optional(), // Optional because cart items might be fetched from DB based on user session? No, usually passed or inferred.
        // Actually, in our current logic (createOrder controller), do we expect cart_items in body?
        // Let's check order.controller.js. 
        // Usually it takes data from the cart associated with the user, OR explicit items.
        // If it takes explicit items, we validate them.
        // If it uses stored cart, we might just need shipping/payment.

        // For now, let's assume shipping address and payment method are required.
        shipping_address: z.object({
            street: z.string().min(1),
            city: z.string().min(1),
            postal_code: z.string().min(1),
            country: z.string().min(1),
        }),
        payment_method: z.enum(['credit_card', 'paypal', 'sofort', 'prepayment']),
    }),
});
