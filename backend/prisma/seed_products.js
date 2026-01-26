import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Extended Product Seed...');

    // Helper to find IDs
    const getDept = async (slug) => (await prisma.department.findUnique({ where: { slug } }))?.id;
    const getCat = async (slug) => (await prisma.category.findUnique({ where: { slug } }))?.id;
    const getBrand = async (slug) => (await prisma.brand.findUnique({ where: { slug } }))?.id;

    // Ensure Departments exist
    const departments = [
        { name: 'Unisex', slug: 'unisex', sort_order: 1 },
        { name: 'Zubehör', slug: 'accessories', sort_order: 2 },
    ];

    const depts = {};
    for (const d of departments) {
        let dept = await prisma.department.findUnique({ where: { slug: d.slug } });
        if (!dept) {
            dept = await prisma.department.create({ data: d });
        }
        depts[d.slug] = dept.id;
    }

    // Create/Get Categories
    const categoriesToCreate = [
        { name: 'E-Shisha / Vapes', slug: 'vapes', sort_order: 10, department: 'unisex' },
        { name: 'Tabak', slug: 'shisha-tobacco', sort_order: 11, department: 'unisex' },
        { name: 'Kohle', slug: 'charcoal', sort_order: 12, department: 'accessories' },
        { name: 'Shishas', slug: 'shishas', sort_order: 13, department: 'unisex' },
        { name: 'Mundstücke', slug: 'mouthpieces', sort_order: 14, department: 'accessories' },
        { name: 'Köpfe', slug: 'bowls', sort_order: 15, department: 'accessories' },
        { name: 'Headshop', slug: 'headshop', sort_order: 16, department: 'accessories' },
        { name: 'Bundles', slug: 'bundles', sort_order: 9, department: 'unisex' }
    ];

    const cats = {};
    for (const c of categoriesToCreate) {
        let cat = await prisma.category.findUnique({ where: { slug: c.slug } });
        if (!cat) {
            cat = await prisma.category.create({
                data: {
                    name: c.name,
                    slug: c.slug,
                    sort_order: c.sort_order,
                    department_id: depts[c.department]
                }
            });
        }
        cats[c.slug] = cat.id;
    }

    // Create/Get Brands
    const brandsToCreate = [
        { name: '187 Strassenbande', slug: '187', sort_order: 10 },
        { name: 'Elfbar', slug: 'elfbar', sort_order: 11 },
        { name: 'Nameless', slug: 'nameless', sort_order: 12 },
        { name: 'Black Coco', slug: 'blackcoco', sort_order: 13 },
        { name: 'Moze', slug: 'moze', sort_order: 14 },
        { name: 'Holster', slug: 'holster', sort_order: 15 },
        { name: 'Hookain', slug: 'hookain', sort_order: 16 },
        { name: 'Al Massiva', slug: 'almassiva', sort_order: 17 },
        { name: 'Vyro', slug: 'vyro', sort_order: 18 },
        { name: 'Oblako', slug: 'oblako', sort_order: 19 },
        { name: 'OCB', slug: 'ocb', sort_order: 20 },
        { name: 'Clipper', slug: 'clipper', sort_order: 21 },
        { name: 'Nebula', slug: 'nebula', sort_order: 1 }
    ];

    const brandIds = {};
    for (const b of brandsToCreate) {
        let brand = await prisma.brand.findUnique({ where: { slug: b.slug } });
        if (!brand) {
            brand = await prisma.brand.create({ data: b });
        }
        brandIds[b.slug] = brand.id;
    }

    // Products List
    const products = [
        // Wholesale / Bulk Deals (MOQ Logic)
        {
            sku: 'ELF-600-BULK-20',
            name: 'Elfbar 600 - Großhandelspaket (20 Stk)',
            description: 'Der Klassiker im Business-Paket. Perfekt für Reseller oder Großverbraucher.',
            price: 7.00, // Unit price
            min_order_quantity: 20, // MOQ
            stock: 1000,
            department_id: depts.unisex,
            brand_id: brandIds['elfbar'],
            category_id: cats['bundles'],
            cover_image: 'https://dampfdorado.de/media/image/5f/8c/9b/elfbar-600-watermelon.jpg',
            tags: ['B2B', 'Bulk', 'Deal'],
            variants: [{ size: 'Bundle', color: 'Mixed', stock: 100 }]
        },

        // Vapes (Elfbar)
        {
            sku: 'ELF-600-BLUE',
            name: 'Elfbar 600 - Blue Razz Lemonade',
            description: '600 Züge purer Geschmack. Blau-Himbeere trifft auf spritzige Zitrone.',
            price: 6.90,
            stock: 500,
            department_id: depts.unisex,
            brand_id: brandIds['elfbar'],
            category_id: cats['vapes'],
            cover_image: 'https://www.flotter-dampfer.de/img/cms/elfbar/elf-bar-600-blue-razz-lemonade.jpg',
            tags: ['Bestseller', 'Disposable'],
            variants: [{ size: 'Standard', color: 'Blue', stock: 500 }]
        },
        {
            sku: 'ELF-600-WATER',
            name: 'Elfbar 600 - Watermelon',
            description: 'Saftige Wassermelone für den perfekten Sommer-Vibe.',
            price: 6.90,
            stock: 300,
            department_id: depts.unisex,
            brand_id: brandIds['elfbar'],
            category_id: cats['vapes'],
            cover_image: 'https://www.flotter-dampfer.de/img/cms/elfbar/elf-bar-600-watermelon.jpg',
            tags: ['Bestseller', 'Summer'],
            variants: [{ size: 'Standard', color: 'Red', stock: 300 }]
        },
        // 187 Vapes
        {
            sku: '187-HAMBURG',
            name: '187 Box - Hamburg',
            description: 'Ein wilder Beerenmix, der so legendär ist wie die Stadt selbst.',
            price: 9.90,
            stock: 200,
            department_id: depts.unisex,
            brand_id: brandIds['187'],
            category_id: cats['vapes'],
            cover_image: 'https://files.shisha-world.com/187-Strassenbande-E-Shisha-Hamburg-0004.jpg',
            tags: ['New', 'Hype'],
            variants: [{ size: 'Standard', color: 'Purple', stock: 200 }]
        },
        // Tabak
        {
            sku: 'HOL-ICE-KAKTUZ',
            name: 'Holster - Ice Kaktuz',
            description: 'Kaktusfeige mit einer ordentlichen Portion Kühle.',
            price: 17.90,
            stock: 50,
            department_id: depts.unisex,
            brand_id: brandIds['holster'],
            category_id: cats['shisha-tobacco'],
            cover_image: 'https://shisha-cloud.de/media/image/8f/1a/0c/holster-tobacco-ice-kaktuz-25g.jpg',
            tags: ['Classic', 'Ice'],
            variants: [{ size: '25g', color: 'Green', stock: 50 }]
        },
        {
            sku: 'NAM-BLACK-NANA',
            name: 'Nameless - Black Nana',
            description: 'Dunkle Taube trifft auf echte marokkanische Minze.',
            price: 17.90,
            stock: 80,
            department_id: depts.unisex,
            brand_id: brandIds['nameless'],
            category_id: cats['shisha-tobacco'],
            cover_image: 'https://shisha-cloud.de/media/image/c2/f0/54/nameless-tobacco-black-nana-25g.jpg',
            tags: ['Legendary', 'Grape'],
            variants: [{ size: '25g', color: 'Purple', stock: 80 }]
        },
        // Kohle
        {
            sku: 'BLK-COCO-1KG',
            name: 'Black Coco - 1kg',
            description: 'Premium Naturkokoskohle. Brennt heiß, ascht wenig.',
            price: 7.90,
            stock: 1000,
            department_id: depts.accessories,
            brand_id: brandIds['blackcoco'],
            category_id: cats['charcoal'],
            cover_image: 'https://m.media-amazon.com/images/I/81+mC+lQpL._AC_SL1500_.jpg',
            tags: ['Essential'],
            variants: [{ size: '1kg', color: 'Black', stock: 1000 }]
        },
        // Shishas
        {
            sku: 'MOZE-BREEZE-TWO',
            name: 'Moze Breeze Two - Wavy Blue',
            description: 'Die Moze Breeze Two ist eine der beliebtesten Pfeifen auf dem Markt.',
            price: 149.90,
            stock: 10,
            department_id: depts.unisex,
            brand_id: brandIds['moze'],
            category_id: cats['shishas'],
            cover_image: 'https://mozeshisha.de/media/image/product/14987/lg/moze-breeze-two-wavy-blue~2.jpg',
            tags: ['Premium', 'Hardware'],
            variants: [{ size: 'One Size', color: 'Blue', stock: 10 }]
        },
        {
            sku: 'VYRO-SPECTRE',
            name: 'Vyro Spectre - Carbon Red',
            description: 'Kompakt, innovativ und mit einem einzigartigen Blow-Off System.',
            price: 119.90,
            stock: 15,
            department_id: depts.unisex,
            brand_id: brandIds['vyro'],
            category_id: cats['shishas'],
            cover_image: 'https://aeon-shisha.com/media/image/product/23306/lg/vyro-spectre-carbon-red.jpg',
            tags: ['Innovation', 'Compact'],
            variants: [{ size: 'One Size', color: 'Red', stock: 15 }]
        },
        // Headshop Items
        {
            sku: 'OCB-SLIM-BOX',
            name: 'OCB Slim Premium + Filter - Box (50 Stk)',
            description: 'Der Klassiker. 50 Packungen OCB Slim mit Filter Tips.',
            price: 1.20, // Unit Price displayed as single pack price but sold in box? Or keep logic simple.
            min_order_quantity: 50,
            stock: 200,
            department_id: depts.accessories,
            brand_id: brandIds['ocb'],
            category_id: cats['headshop'],
            cover_image: 'https://m.media-amazon.com/images/I/71wLpQd0LBL._AC_SL1500_.jpg',
            tags: ['Headshop', 'Bulk'],
            variants: [{ size: 'Box', color: 'Black', stock: 200 }]
        },
        {
            sku: 'CLIPPER-NEON',
            name: 'Clipper - Neon Mix',
            description: 'Kultfeuerzeug in Neonfarben.',
            price: 1.50,
            stock: 100,
            department_id: depts.accessories,
            brand_id: brandIds['clipper'],
            category_id: cats['headshop'],
            cover_image: 'https://www.clipper.eu/wp-content/uploads/2020/09/CP11R_NEON_LIGHTERS_GROUP.jpg',
            tags: ['Small', 'Essential'],
            variants: [{ size: 'Standard', color: 'Mix', stock: 100 }]
        }
    ];

    console.log(`Adding ${products.length} products...`);
    for (const p of products) {
        const exists = await prisma.product.findUnique({ where: { sku: p.sku } });
        if (!exists) {
            await prisma.product.create({ data: p });
            console.log(`+ Added: ${p.name}`);
        } else {
            console.log(`= Skipped: ${p.name} (exists)`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
