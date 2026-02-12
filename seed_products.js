
import { createClient } from '@insforge/sdk';

// Hardcoded keys (Verified Working)
const baseUrl = 'https://p5nhx8uz.eu-central.insforge.app';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODQ2MjZ9.AH4aflSw7gKSkf8qhzSbBVzceH5WF3qJPJA1X6cmnEE';

const insforge = createClient({
    baseUrl,
    anonKey
});
const db = insforge.database;

const categories = [
    { name: 'Shishas', slug: 'shishas', sort_order: 1 },
    { name: 'Vapes', slug: 'vapes', sort_order: 2 },
    { name: 'Tabak', slug: 'tabak', sort_order: 3 },
    { name: 'Kohle', slug: 'kohle', sort_order: 4 },
    { name: 'Zubehör', slug: 'zubehoer', sort_order: 5 },
    { name: 'Merch', slug: 'merch', sort_order: 6 }
];

const departments = [
    { name: 'Shishas', slug: 'shishas', sort_order: 1 },
    { name: 'Vapes', slug: 'vapes', sort_order: 2 },
    { name: 'Tabak', slug: 'tabak', sort_order: 3 },
    { name: 'Zubehör', slug: 'zubehoer', sort_order: 4 }
];

const products = [
    {
        name: 'Moze Breeze Two - Wavy Black',
        sku: 'MOZE-BRZ-BLK',
        description: 'Die Moze Breeze Two ist die Shisha des Jahres. Mit ihrem einzigartigen Ausblas-System und dem hochwertigen Design setzt sie neue Maßstäbe.',
        price: 149.90,
        cover_image: '/images/products/moze-breeze-two.png',
        in_stock: true,
        stock: 15,
        department_slug: 'shishas',
        category_slug: 'shishas',
        brand_name: 'Moze',
        images: ['/images/products/moze-breeze-two.png']
    },
    {
        name: 'Elfbar 600 - Watermelon Luxury',
        sku: 'ELF-600-WAT',
        description: 'Der Klassiker neu definiert. Intensiver Geschmack, perfektes Zugverhalten und bis zu 600 Züge.',
        price: 7.90,
        cover_image: '/images/products/elfbar-watermelon.png',
        in_stock: true,
        stock: 500,
        department_slug: 'vapes',
        category_slug: 'vapes',
        brand_name: 'Elfbar',
        images: ['/images/products/elfbar-watermelon.png']
    },
    {
        name: 'Nameless - Black Nana',
        sku: 'NAM-BLK-NANA',
        description: 'Die Legende unter den Traube-Minze Tabaken. Ein Muss für jeden Shisha-Liebhaber.',
        price: 17.90,
        cover_image: '/images/products/tobacco-black-nana.png',
        in_stock: true,
        stock: 100,
        department_slug: 'tabak',
        category_slug: 'tabak',
        brand_name: 'Nameless',
        images: ['/images/products/tobacco-black-nana.png']
    },
    {
        name: 'Vyro Spectre - Carbon Red',
        sku: 'VYRO-SPC-RED',
        description: 'Kompakt, innovativ und mit einem einzigartigen Blow-Off System. Die perfekte Travel-Shisha.',
        price: 119.90,
        cover_image: '/images/products/vyro-spectre.png',
        in_stock: true,
        stock: 8,
        department_slug: 'shishas',
        category_slug: 'shishas',
        brand_name: 'Vyro',
        images: ['/images/products/vyro-spectre.png']
    },
    {
        name: 'OCB Slim Premium Box',
        sku: 'OCB-BOX',
        description: 'Der Headshop Klassiker im Bulk-Pack. 50 Heftchen Premium Papers.',
        price: 25.00,
        cover_image: '/images/products/ocb-box.png',
        in_stock: true,
        stock: 200,
        department_slug: 'zubehoer',
        category_slug: 'zubehoer',
        brand_name: 'OCB',
        images: ['/images/products/ocb-box.png']
    },
    {
        name: '187 Strassenbande - Hamburg',
        sku: '187-HH',
        description: 'Ein wilder Beerenmix, der so legendär ist wie die Stadt selbst.',
        price: 9.90,
        cover_image: '/images/products/vape-187-hamburg.png',
        in_stock: true,
        stock: 50,
        department_slug: 'vapes',
        category_slug: 'vapes',
        brand_name: '187 Strassenbande',
        images: ['/images/products/vape-187-hamburg.png']
    }
];

async function seed() {
    console.log('🌱 Starting Seed to:', baseUrl);

    // 1. Departments
    console.log('\n📦 Seeding Departments...');
    const deptMap = {};
    for (const dept of departments) {
        const { data: existing } = await db.from('departments').select('id').eq('slug', dept.slug).single();
        if (existing) {
            deptMap[dept.slug] = existing.id;
            console.log(`  -> Exists: ${dept.name}`);
        } else {
            const { data, error } = await db.from('departments').insert(dept).select().single();
            if (error) {
                console.error(`  ❌ Error creating dept ${dept.name}:`, error.message);
            } else {
                deptMap[dept.slug] = data.id;
                console.log(`  ✅ Created: ${dept.name}`);
            }
        }
    }

    // 2. Categories
    console.log('\n📂 Seeding Categories...');
    const catMap = {};
    for (const cat of categories) {
        const { data: existing } = await db.from('categories').select('id').eq('slug', cat.slug).single();
        if (existing) {
            catMap[cat.slug] = existing.id;
            console.log(`  -> Exists: ${cat.name}`);
        } else {
            const { data, error } = await db.from('categories').insert(cat).select().single();
            if (error) {
                console.error(`  ❌ Error creating category ${cat.name}:`, error.message);
            } else {
                catMap[cat.slug] = data.id;
                console.log(`  ✅ Created: ${cat.name}`);
            }
        }
    }

    // 3. Brands (Dynamic)
    console.log('\n🏷️ Seeding Brands...');
    const brandMap = {};
    const brands = [...new Set(products.map(p => p.brand_name))];
    for (const brandName of brands) {
        const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: existing } = await db.from('brands').select('id').eq('name', brandName).maybeSingle();
        if (existing) {
            brandMap[brandName] = existing.id;
            console.log(`  -> Exists: ${brandName}`);
        } else {
            const { data, error } = await db.from('brands').insert({
                name: brandName,
                slug: slug,
                sort_order: 10
            }).select().single();

            if (error) {
                console.error(`  ❌ Error creating brand ${brandName}:`, error.message);
            } else {
                brandMap[brandName] = data.id;
                console.log(`  ✅ Created: ${brandName}`);
            }
        }
    }

    // 4. Products
    console.log('\n🚀 Seeding Products...');
    for (const prod of products) {
        const deptId = deptMap[prod.department_slug];
        const catId = catMap[prod.category_slug];
        const brandId = brandMap[prod.brand_name];

        if (!deptId || !catId || !brandId) {
            // console.warn(`  ⚠️ Skipping ${prod.name} due to missing relation`);
            // Continue trying even if relations missing (though logic above should capture them)
        }

        const { data: existing } = await db.from('products').select('id').eq('sku', prod.sku).maybeSingle();

        const productData = {
            name: prod.name,
            sku: prod.sku,
            description: prod.description,
            price: prod.price,
            stock: prod.stock,
            in_stock: prod.in_stock,
            department_id: deptId,
            category_id: catId,
            brand_id: brandId,
            cover_image: prod.cover_image
        };

        if (existing) {
            console.log(`  -> Exists: ${prod.name}`);
            await db.from('products').update(productData).eq('id', existing.id);
        } else {
            const { data, error } = await db.from('products').insert(productData).select().single();
            if (error) {
                console.error(`  ❌ Error creating ${prod.name}:`, error.message);
            } else {
                console.log(`  ✅ Created: ${prod.name}`);

                // Add Images
                if (prod.images && prod.images.length > 0) {
                    const imageInserts = prod.images.map((url, idx) => ({
                        product_id: data.id,
                        url: url,
                        sort_order: idx
                    }));
                    await db.from('product_images').insert(imageInserts);
                }
            }
        }
    }
    console.log('\n✨ Seed Complete!');
}

seed().catch(console.error);
