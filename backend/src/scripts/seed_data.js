
// backend/src/scripts/seed_data.js
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

// Load environment variables manually if needed (likely already loaded if run via node)
// But better safe
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

const categories = [
    {
        name: 'Electronics',
        slug: 'electronics',
        sort_order: 1
    },
    {
        name: 'Fashion',
        slug: 'fashion',
        sort_order: 2
    },
    {
        name: 'Home',
        slug: 'home',
        sort_order: 3
    }
];

const products = [
    {
        name: 'Nebula Phone X',
        slug: 'nebula-phone-x',
        description: 'The future of communication. Holographic display included.',
        price: 999.99,
        stock_quantity: 50,
        category_slug: 'electronics',
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'],
        is_featured: true,
        is_new: true
    },
    {
        name: 'Quantum Headphones',
        slug: 'quantum-headphones',
        description: 'Noise cancelling taken to the quantum realm.',
        price: 299.99,
        stock_quantity: 100,
        category_slug: 'electronics',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'],
        is_featured: false,
        is_new: false
    },
    {
        name: 'Stealth Hoodie',
        slug: 'stealth-hoodie',
        description: 'Invisible to thermal cameras (not really, but looks cool).',
        price: 129.99,
        stock_quantity: 200,
        category_slug: 'fashion',
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop'],
        is_featured: true,
        is_new: true
    },
    {
        name: 'Anti-Gravity Sneakers',
        slug: 'anti-gravity-sneakers',
        description: 'Walk on air. Literally.',
        price: 199.99,
        stock_quantity: 75,
        category_slug: 'fashion',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'],
        is_featured: false,
        is_new: true
    },
    {
        name: 'Levitating Lamp',
        slug: 'levitating-lamp',
        description: 'Magnetic levitation technology.',
        price: 89.99,
        stock_quantity: 30,
        category_slug: 'home',
        images: ['https://images.unsplash.com/photo-1507473888900-52e1adad54cd?q=80&w=800&auto=format&fit=crop'],
        is_featured: true,
        is_new: false
    }
];

async function main() {
    console.log('🌱 Starting seed...');

    // Create Departments
    for (const cat of categories) {
        const existing = await prisma.department.findUnique({ where: { slug: cat.slug } });
        if (!existing) {
            await prisma.department.create({
                data: cat
            });
            console.log(`Created Department: ${cat.name}`);
        } else {
            console.log(`Department exists: ${cat.name}`);
        }
    }

    for (const prod of products) {
        const dept = await prisma.department.findUnique({ where: { slug: prod.category_slug } });
        if (dept) {
            // Use slug as SKU for unique identifying mechanism in this simplified seed
            const existing = await prisma.product.findUnique({ where: { sku: prod.slug } });
            if (!existing) {
                const createdProd = await prisma.product.create({
                    data: {
                        name: prod.name,
                        sku: prod.slug, // Mapping slug to sku
                        description: prod.description,
                        price: prod.price,
                        stock: prod.stock_quantity,
                        department_id: dept.id,
                        cover_image: prod.images[0] // Set cover image directly on product
                    }
                });

                // Create images via ProductImage
                if (prod.images.length > 0) {
                    await prisma.productImage.create({
                        data: {
                            product_id: createdProd.id,
                            url: prod.images[0],
                            sort_order: 0
                        }
                    });
                }

                console.log(`Created Product: ${prod.name}`);
            } else {
                console.log(`Product exists: ${prod.name}`);
            }
        }
    }

    console.log('✅ Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
