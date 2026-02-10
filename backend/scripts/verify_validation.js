
import { createOrderSchema } from '../src/schemas/order.schema.js';
import { productSchema } from '../src/schemas/product.schema.js';
import { z } from 'zod';

const mockReq = (body) => ({ body });

async function verifyValidation() {
    console.log("Starting Validation Verification...");

    // 1. Test Order Schema
    console.log("\nTesting Order Schema...");
    try {
        // Invalid Order (Empty Cart)
        console.log("- Testing Empty Cart (Should Fail)...");
        await createOrderSchema.parseAsync({ body: { cart_items: [] } });
        console.error("FAILURE: Empty cart validated successfully!");
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.log("SUCCESS: Caught expected ZodError for empty cart.");
        } else {
            console.error("FAILURE: Caught unexpected error:", e);
        }
    }

    try {
        // Valid Order
        console.log("- Testing Valid Order...");
        await createOrderSchema.parseAsync({
            body: {
                cart_items: [{ id: "item1" }],
                shipping_address: {
                    street: "Test St",
                    city: "Test City",
                    postal_code: "12345",
                    country: "DE"
                },
                payment_method: "credit_card"
            }
        });
        console.log("SUCCESS: Valid order validated.");
    } catch (e) {
        console.error("FAILURE: Valid order failed validation:", e);
    }

    // 2. Test Product Schema
    console.log("\nTesting Product Schema...");
    try {
        // Invalid Price
        console.log("- Testing Invalid Price (Negative)...");
        await productSchema.parseAsync({
            body: {
                name: "Test Product",
                price: -10,
                stock: 5
            }
        });
        console.error("FAILURE: Negative price validated!");
    } catch (e) {
        console.log("SUCCESS: Negative price rejected.");
    }

    try {
        // Valid Product
        console.log("- Testing Valid Product...");
        await productSchema.parseAsync({
            body: {
                name: "Valid Product",
                price: 19.99,
                stock: 100
            }
        });
        console.log("SUCCESS: Valid product accepted.");
    } catch (e) {
        console.error("FAILURE: Valid product rejected:", e);
    }
}

verifyValidation();
