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
        { name: 'Köpfe', slug: 'bowls', sort_order: 15, department: 'accessories' }
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
        { name: 'Oblako', slug: 'oblako', sort_order: 19 }
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
        // Vapes (Elfbar)
        {
            sku: 'ELF-600-BLUE',
            name: 'Elfbar 600 - Blue Razz Lemonade',
            description: 'Der Klassiker. 600 Züge purer Geschmack. Blau-Himbeere trifft auf spritzige Zitrone.',
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
            description: 'Saftige Wassermelone für den perfekten Sommer-Vibe, egal zu welcher Jahreszeit.',
            price: 6.90,
            stock: 300,
            department_id: depts.unisex,
            brand_id: brandIds['elfbar'],
            category_id: cats['vapes'],
            cover_image: 'https://www.flotter-dampfer.de/img/cms/elfbar/elf-bar-600-watermelon.jpg',
            tags: ['Bestseller', 'Summer'],
            variants: [{ size: 'Standard', color: 'Red', stock: 300 }]
        },
        {
            sku: 'ELF-600-PINK',
            name: 'Elfbar 600 - Pink Lemonade',
            description: 'Süße Himbeeren treffen auf spritzige Limonade. Ein erfrischender Genuss.',
            price: 6.90,
            stock: 450,
            department_id: depts.unisex,
            brand_id: brandIds['elfbar'],
            category_id: cats['vapes'],
            cover_image: 'https://www.flotter-dampfer.de/img/cms/elfbar/elf-bar-600-pink-lemonade.jpg',
            tags: ['Tasty', 'Fruity'],
            variants: [{ size: 'Standard', color: 'Pink', stock: 450 }]
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
        {
            sku: '187-QUELLE',
            name: '187 Box - Quelle',
            description: 'Traube Minze in Perfektion. Der Klassiker in Vape Form.',
            price: 9.90,
            stock: 150,
            department_id: depts.unisex,
            brand_id: brandIds['187'],
            category_id: cats['vapes'],
            cover_image: 'https://files.shisha-world.com/187-Strassenbande-E-Shisha-Quelle-0004.jpg',
            tags: ['Classic', 'Hype'],
            variants: [{ size: 'Standard', color: 'Purple', stock: 150 }]
        },
        // Tabak (Holster, Nameless, Hookain, Al Massiva)
        {
            sku: 'HOL-ICE-KAKTUZ',
            name: 'Holster - Ice Kaktuz',
            description: 'Der wohl bekannteste Tabak Deutschlands. Kaktusfeige mit einer ordentlichen Portion Kühle.',
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
            description: 'Die Legende unter den Traube-Minze Tabaken. Dunkle Taube trifft auf echte marokkanische Minze.',
            price: 17.90,
            stock: 80,
            department_id: depts.unisex,
            brand_id: brandIds['nameless'],
            category_id: cats['shisha-tobacco'],
            cover_image: 'https://shisha-cloud.de/media/image/c2/f0/54/nameless-tobacco-black-nana-25g.jpg',
            tags: ['Legendary', 'Grape'],
            variants: [{ size: '25g', color: 'Purple', stock: 80 }]
        },
        {
            sku: 'HK-WHITE-CAEK',
            name: 'Hookain - White Caek',
            description: 'Cremiger Käsekuchen mit einer leichten Zitronennote.',
            price: 17.90,
            stock: 60,
            department_id: depts.unisex,
            brand_id: brandIds['hookain'],
            category_id: cats['shisha-tobacco'],
            cover_image: 'https://shisha-cloud.de/media/image/hookain-white-caek-25g.jpg',
            tags: ['Dessert', 'Sweet'],
            variants: [{ size: '25g', color: 'White', stock: 60 }]
        },
        {
            sku: 'AM-BRUDERHERZ',
            name: 'Al Massiva - Bruderherz',
            description: 'Drachenfrucht pur. Exotisch und intensiv.',
            price: 17.90,
            stock: 75,
            department_id: depts.unisex,
            brand_id: brandIds['almassiva'],
            category_id: cats['shisha-tobacco'],
            cover_image: 'https://shisha-cloud.de/media/image/al-massiva-bruderherz-25g.jpg',
            tags: ['Fruity', 'Dragonfruit'],
            variants: [{ size: '25g', color: 'Red', stock: 75 }]
        },
        // Kohle
        {
            sku: 'BLK-COCO-1KG',
            name: 'Black Coco - 1kg',
            description: 'Premium Naturkokoskohle. Brennt heiß, ascht wenig, stinkt nicht.',
            price: 7.90,
            stock: 1000,
            department_id: depts.accessories,
            brand_id: brandIds['blackcoco'],
            category_id: cats['charcoal'],
            cover_image: 'https://m.media-amazon.com/images/I/81+mC+lQpL._AC_SL1500_.jpg',
            tags: ['Essential'],
            variants: [{ size: '1kg', color: 'Black', stock: 1000 }]
        },
        // Shishas (Moze, Vyro)
        {
            sku: 'MOZE-BREEZE-TWO',
            name: 'Moze Breeze Two - Wavy Blue',
            description: 'Die Moze Breeze Two ist nicht umsonst eine der beliebtesten Pfeifen. Austauschbare Sleeves und unschlagbares Ausblas-System.',
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
        // Zubehör
        {
            sku: 'OBLAKO-M-MONO',
            name: 'Oblako M - Mono Cyan',
            description: 'Der Phunnel für beste Performance und Hitzeverteilung.',
            price: 24.90,
            stock: 40,
            department_id: depts.accessories,
            brand_id: brandIds['oblako'],
            category_id: cats['bowls'],
            cover_image: 'https://shisha-cloud.de/media/image/oblako-phunnel-m-mono-cyan.jpg',
            tags: ['Phunnel', 'Performance'],
            variants: [{ size: 'M', color: 'Cyan', stock: 40 }]
        },
        {
            sku: 'MOZE-TIP-CARBON',
            name: 'Moze Carbon Mundstück - Black',
            description: 'Echtes Carbon, liegt perfekt in der Hand.',
            price: 19.90,
            stock: 100,
            department_id: depts.accessories,
            brand_id: brandIds['moze'],
            category_id: cats['mouthpieces'],
            cover_image: 'https://mozeshisha.de/media/image/product/11545/lg/moze-carbon-mundstueck-schwarz-matt.jpg',
            tags: ['Carbon', 'Style'],
            variants: [{ size: 'Standard', color: 'Black', stock: 100 }]
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
