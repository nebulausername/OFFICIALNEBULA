// backend/src/scripts/seed_data.js
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

// Load environment variables
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

const categories = [
    { name: 'Shishas', slug: 'shishas', sort_order: 1 },
    { name: 'Vapes', slug: 'vapes', sort_order: 2 },
    { name: 'Tabak', slug: 'tabak', sort_order: 3 },
    { name: 'Kohle', slug: 'kohle', sort_order: 4 },
    { name: 'Zubehör', slug: 'zubehoer', sort_order: 5 },
    { name: 'Merch', slug: 'merch', sort_order: 6 }
];

const products = [
    // --- SHISHAS ---
    {
        name: 'Moze Breeze Two - Wavy Black',
        slug: 'moze-breeze-two-wavy-black',
        description: 'Die Moze Breeze Two ist die Shisha des Jahres. Mit ihrem einzigartigen Ausblassystem und dem austauschbaren Sleeve setzt sie neue Maßstäbe.',
        price: 149.90,
        stock_quantity: 50,
        category_slug: 'shishas',
        images: ['https://mozeshisha.de/media/image/product/12698/lg/moze-breeze-two-wavy-black.jpg'],
        tags: ['Bestseller', 'Premium'],
        in_stock: true
    },
    {
        name: 'Vyro Spectre - Carbon Red',
        slug: 'vyro-spectre-carbon-red',
        description: 'Die Vyro Spectre ist die kompakte Steckshisha aus V2A Edelstahl und echtem Carbon. Perfekt für unterwegs oder den Desktop.',
        price: 99.90,
        stock_quantity: 30,
        category_slug: 'shishas',
        images: ['https://aeon-shisha.com/media/image/product/5815/lg/vyro-spectre-carbon-red.jpg'],
        tags: ['New', 'Carbon'],
        in_stock: true
    },
    {
        name: 'Aeon Edition 4 - Premium',
        slug: 'aeon-edition-4-premium',
        description: 'Deutsche Ingenieurskunst in Perfektion. Die Aeon Edition 4 bietet den besten Durchzug auf dem Markt.',
        price: 349.90,
        stock_quantity: 10,
        category_slug: 'shishas',
        images: ['https://aeon-shisha.com/media/image/product/4096/lg/aeon-shisha-edition-4-premium-clear.jpg'],
        tags: ['Luxury', 'High-End'],
        in_stock: true
    },
    {
        name: 'Steamulation Pro X III',
        slug: 'steamulation-pro-x-iii',
        description: 'Die innovativste Shisha der Welt. Mit Airflow Control, Dip Tube Control und Purge Control.',
        price: 399.90,
        stock_quantity: 5,
        category_slug: 'shishas',
        images: ['https://shisha-cloud.de/media/image/product/23476/lg/steamulation-pro-x-iii-clear.jpg'],
        tags: ['Tech', 'Luxury'],
        in_stock: false
    },

    // --- VAPES ---
    {
        name: 'Elfbar 600 - Watermelon',
        slug: 'elfbar-600-watermelon',
        description: 'Der Klassiker unter den Disposables. 600 Züge purer Wassermelonen-Geschmack.',
        price: 7.90,
        stock_quantity: 500,
        category_slug: 'vapes',
        images: ['https://dampfdorado.de/media/image/5f/8c/9b/elfbar-600-watermelon.jpg'],
        tags: ['Bestseller', 'Sale'],
        in_stock: true
    },
    {
        name: 'Elfbar 600 - Blue Razz Lemonade',
        slug: 'elfbar-600-blue-razz',
        description: 'Süße Blaubeeren treffen auf spritzige Limonade. Ein absolutes Geschmackserlebnis.',
        price: 7.90,
        stock_quantity: 450,
        category_slug: 'vapes',
        images: ['https://dampfdorado.de/media/image/a8/8c/75/elfbar-600-blue-razz-lemonade.jpg'],
        tags: ['Bestseller'],
        in_stock: true
    },
    {
        name: '187 Strassenbande - Hamburg',
        slug: '187-vape-hamburg',
        description: 'Der legendäre Beerenmix jetzt als Vape. Intensiv und fruchtig.',
        price: 8.90,
        stock_quantity: 300,
        category_slug: 'vapes',
        images: ['https://www.shisha-world.com/media/image/product/22453/lg/187-strassenbande-einweg-e-shisha-hamburg-0700-20mg.jpg'],
        tags: ['New'],
        in_stock: true
    },

    // --- TABAK ---
    {
        name: 'Nameless - Black Nana 200g',
        slug: 'nameless-black-nana-200g',
        description: 'Die Legende. Dunkle Traube mit kühler Minze (Shot needed). Der meistverkaufte Tabak Deutschlands.',
        price: 17.90,
        stock_quantity: 100,
        category_slug: 'tabak',
        images: ['https://www.shisha-world.com/media/image/product/10186/lg/nameless-black-nana-200g-shisha-tabak.jpg'],
        tags: ['Legendary', 'Bestseller'],
        in_stock: true
    },
    {
        name: 'O´s Tobacco - African Queen 200g',
        slug: 'os-african-queen',
        description: 'Fruchtmix aus 16 verschiedenen Früchten. Ein süßer Traum.',
        price: 17.90,
        stock_quantity: 80,
        category_slug: 'tabak',
        images: ['https://www.shisha-world.com/media/image/product/12658/lg/os-tobacco-african-queen-200g.jpg'],
        tags: ['Bestseller'],
        in_stock: true
    },
    {
        name: 'Holster - Ice Kaktuz 200g',
        slug: 'holster-ice-kaktuz',
        description: 'Kaktusfeige mit einer ordentlichen Portion Eis. Spritzig, süß, kühl.',
        price: 17.90,
        stock_quantity: 120,
        category_slug: 'tabak',
        images: ['https://www.shisha-world.com/media/image/product/14842/lg/holster-tobacco-ice-kaktuz-200g.jpg'],
        tags: [],
        in_stock: true
    },

    // --- KOHLE ---
    {
        name: 'Blackcoco\'s - 1kg',
        slug: 'blackcocos-1kg',
        description: 'Die Referenz für Naturkohle. Brennt heiß, ascht wenig, stinkt nicht.',
        price: 6.90,
        stock_quantity: 1000,
        category_slug: 'kohle',
        images: ['https://www.shisha-world.com/media/image/product/7839/lg/blackcocospalms-kokoskohle-1kg-26mm.jpg'],
        tags: ['Essential'],
        in_stock: true
    },

    // --- ZUBEHÖR ---
    {
        name: 'Phunnel Bowl - Nebula Glaze',
        slug: 'nebula-phunnel-glaze',
        description: 'Handgetöpferter Phunnel mit spezieller Hitzeverteilung. Perfekt für HMDs.',
        price: 24.90,
        stock_quantity: 40,
        category_slug: 'zubehoer',
        images: ['https://mozeshisha.de/media/image/product/16669/lg/moze-epos-phunnel-cosmo.jpg'],
        tags: ['Premium', 'Handmade'],
        in_stock: true
    },
    {
        name: 'HMD - Heat Manager v2',
        slug: 'hmd-manager-v2',
        description: 'Edelstahl Heat Management Device für optimale Hitzeregulierung.',
        price: 39.90,
        stock_quantity: 60,
        category_slug: 'zubehoer',
        images: ['https://aeon-shisha.com/media/image/product/4022/lg/kaloud-lotus-i-plus-aus-edelstein-azubis.jpg'],
        tags: [],
        in_stock: true
    }
];

async function main() {
    console.log('🌌 Ignite Nebula Seed...');

    // 1. Clean up existing (Optional, be careful in prod!)
    // await prisma.cartItem.deleteMany({});
    // await prisma.productReview.deleteMany({});
    // await prisma.productImage.deleteMany({});
    // await prisma.productVariant.deleteMany({});
    // await prisma.product.deleteMany({});
    // await prisma.department.deleteMany({});

    // Create Departments
    console.log('📦 Creating Departments...');
    const deptMap = {};
    for (const cat of categories) {
        const existing = await prisma.department.findUnique({ where: { slug: cat.slug } });
        if (!existing) {
            const created = await prisma.department.create({ data: cat });
            deptMap[cat.slug] = created.id;
        } else {
            console.log(`  -> Exists: ${cat.name}`);
            deptMap[cat.slug] = existing.id;
        }
    }

    // Create Products
    console.log('🚀 Launching Products...');
    for (const prod of products) {
        const deptId = deptMap[prod.category_slug];
        if (!deptId) {
            console.warn(`⚠️ Dept not found for ${prod.name}`);
            continue;
        }

        const existing = await prisma.product.findUnique({ where: { sku: prod.slug } }); // Using slug as SKU for unique check
        if (!existing) {
            const createdProd = await prisma.product.create({
                data: {
                    name: prod.name,
                    sku: prod.slug,
                    description: prod.description,
                    price: prod.price,
                    stock: prod.stock_quantity,
                    department_id: deptId,
                    cover_image: prod.images[0],
                    in_stock: prod.in_stock,
                    // Store tags as JSON array or similar if schema supports it, 
                    // else we might need a separate relation. 
                    // For now assuming we don't have a tags relation in basic schema, 
                    // so we just rely on the name/desc or fields we have.
                }
            });

            // Images
            if (prod.images.length > 0) {
                await prisma.productImage.createMany({
                    data: prod.images.map((url, idx) => ({
                        product_id: createdProd.id,
                        url: url,
                        sort_order: idx
                    }))
                });
            }

            console.log(`  -> Created: ${prod.name}`);
        } else {
            console.log(`  -> Exists: ${prod.name}`);
            // Optional: Update stock or price if needed
            await prisma.product.update({
                where: { id: existing.id },
                data: {
                    in_stock: prod.in_stock,
                    stock: prod.stock_quantity,
                    cover_image: prod.images[0]
                }
            });
        }
    }

    console.log('✅ Nebula System Online. Seed completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
