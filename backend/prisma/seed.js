import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MASSIVE database seed...');

  // Optional: Clean up existing shop data (careful in prod)
  // This ensures we don't have duplicates or mixed data
  console.log('🧹 Cleaning up old shop data...');
  try {
    // Order matters due to foreign keys
    await prisma.cartItem.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.department.deleteMany({});
    console.log('✅ Cleanup done.');
  } catch (e) {
    console.warn('⚠️ Cleanup warning (might be first run):', e.message);
  }

  // 1. Departments (The Main Pillars)
  const departments = [
    { name: 'Shisha World', slug: 'shisha-world', sort_order: 1 },
    { name: 'Headshop', slug: 'headshop', sort_order: 2 },
    { name: 'Grow', slug: 'grow', sort_order: 3 },
    { name: 'Vapes', slug: 'vapes', sort_order: 4 },
    { name: 'CBD', slug: 'cbd', sort_order: 5 },
  ];

  console.log('Creating Departments...');
  const deptMap = {};
  for (const dept of departments) {
    const created = await prisma.department.create({ data: dept });
    deptMap[dept.slug] = created.id;
  }

  // 2. Brands (The Hype)
  const brands = [
    // Shisha
    { name: '187 Strassenbande', slug: '187-strassenbande', sort_order: 1 },
    { name: 'Nameless', slug: 'nameless', sort_order: 2 },
    { name: 'O\'s', slug: 'os', sort_order: 3 },
    { name: 'Holster', slug: 'holster', sort_order: 4 },
    { name: 'Al Massiva', slug: 'al-massiva', sort_order: 5 },
    { name: 'Darkside', slug: 'darkside', sort_order: 6 },
    { name: 'Moze', slug: 'moze', sort_order: 7 },
    { name: 'Aeon', slug: 'aeon', sort_order: 8 },
    { name: 'Vyro', slug: 'vyro', sort_order: 9 },
    // Headshop
    { name: 'RAW', slug: 'raw', sort_order: 10 },
    { name: 'OCB', slug: 'ocb', sort_order: 11 },
    { name: 'Gizeh', slug: 'gizeh', sort_order: 12 },
    { name: 'Purize', slug: 'purize', sort_order: 13 },
    { name: 'RooR', slug: 'roor', sort_order: 14 },
    // Grow
    { name: 'BioBizz', slug: 'biobizz', sort_order: 20 },
    { name: 'Hesi', slug: 'hesi', sort_order: 21 },
    { name: 'Canna', slug: 'canna', sort_order: 22 },
    { name: 'Sanlight', slug: 'sanlight', sort_order: 23 },
    // Vapes
    { name: 'Elfbar', slug: 'elfbar', sort_order: 30 },
    { name: 'HQD', slug: 'hqd', sort_order: 31 },
    { name: 'Lost Mary', slug: 'lost-mary', sort_order: 32 },
  ];

  console.log('Creating Brands...');
  const brandMap = {};
  for (const brand of brands) {
    const created = await prisma.brand.create({ data: brand });
    brandMap[brand.slug] = created.id;
  }

  // 3. Categories (The Structure)
  const categories = [
    // Shisha
    { name: 'Shisha Tabak', slug: 'shisha-tabak', sort_order: 1 },
    { name: 'Shisha Kohle', slug: 'shisha-kohle', sort_order: 2 },
    { name: 'Shishas', slug: 'shishas', sort_order: 3 },
    { name: 'Köpfe & Aufsätze', slug: 'koepfe', sort_order: 4 },
    { name: 'Zubehör', slug: 'zubehoer', sort_order: 5 },
    // Headshop
    { name: 'Papers & Filter', slug: 'papers', sort_order: 10 },
    { name: 'Grinder', slug: 'grinder', sort_order: 11 },
    { name: 'Bongs', slug: 'bongs', sort_order: 12 },
    { name: 'Vaporizer', slug: 'vaporizer', sort_order: 13 },
    // Grow
    { name: 'Dünger', slug: 'duenger', sort_order: 20 },
    { name: 'Erde & Substrate', slug: 'erde', sort_order: 21 },
    { name: 'Beleuchtung', slug: 'beleuchtung', sort_order: 22 },
    { name: 'Growboxen', slug: 'growboxen', sort_order: 23 },
    // Vapes
    { name: 'Einweg E-Zigaretten', slug: 'einweg-vapes', sort_order: 30 },
    { name: 'Pods & Liquids', slug: 'pods', sort_order: 31 },
  ];

  console.log('Creating Categories...');
  const catMap = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    catMap[cat.slug] = created.id;
  }

  // 4. Products (The Goods)
  // Helper to generate some variants
  const tobaccoVariants = [
    { size: '25g', price_override: 4.00, stock: 100 },
    { size: '200g', price_override: 24.90, stock: 50 },
    { size: '1kg', price_override: 89.90, stock: 10 },
  ];

  const products = [
    // --- SHISHA TABAK ---
    {
      sku: '187-001',
      name: '187 Strassenbande - Hamburg',
      description: 'Der Klassiker aus Hamburg. Beerenmix vom Feinsten. Ein Muss für jeden Shisha-Fan.',
      price: 24.90,
      stock: 500,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['187-strassenbande'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://cdn02.plentymarkets.com/m7o09w8t15s3/item/images/8302/full/187-Strassenbande-Tobacco-Hamburg-200g-Dose-Shisha-Tabak-8302.jpg',
      tags: ['Bestseller', 'Top'],
      variants: tobaccoVariants.map(v => ({ ...v, sku: `187-001-${v.size}` }))
    },
    {
      sku: 'NAM-001',
      name: 'Nameless - Black Nana',
      description: 'Die Legende unter den Traube-Minze Tabaken. Echte schwarze Traube trifft auf authentische Minze.',
      price: 24.90,
      stock: 420,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['nameless'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://cdn02.plentymarkets.com/m7o09w8t15s3/item/images/7355/full/Nameless-Tabak-Black-Nana-200g-Shisha-Tabak-7355.jpg',
      tags: ['Legendary', 'Bestseller'],
      variants: tobaccoVariants
    },
    {
      sku: 'OS-001',
      name: 'O\'s Tobacco - African Queen',
      description: 'Ein fruchtiger Mix aus verschiedenen Beeren und Trauben. Sehr intensiv und beliebt.',
      price: 24.90,
      stock: 300,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['os'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://www.shisha-world.com/media/image/product/14876/lg/os-tobacco-african-queen-200g.jpg',
      tags: ['Popular'],
    },
    {
      sku: 'HOL-001',
      name: 'Holster - Ice Kaktuz',
      description: 'Kaktusfeige mit einer ordentlichen Portion Kühle. Perfekt für den Sommer.',
      price: 24.90,
      stock: 150,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['holster'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://www.shisha-world.com/media/image/product/16694/lg/holster-tobacco-ice-kaktuz-200g.jpg',
      tags: ['New'],
    },
    {
      sku: 'ALM-001',
      name: 'Al Massiva - Bruderherz',
      description: 'Drachenfrucht pur. Massiv hat hier abgeliefert.',
      price: 24.90,
      stock: 200,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['al-massiva'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://www.shisha-world.com/media/image/product/16900/lg/al-massiva-tobacco-bruderherz-200g.jpg',
      tags: [],
    },

    // --- SHISHAS ---
    {
      sku: 'MOZ-BREEZE-2',
      name: 'Moze Breeze Two - Wavy Black',
      description: 'Die Moze Breeze Two ist eine der beliebtesten Shishas auf dem Markt. Tolles Ausblassystem und austauschbare Sleeves.',
      price: 149.90,
      stock: 20,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['moze'],
      category_id: catMap['shishas'],
      cover_image: 'https://mozeshisha.de/media/b6/2d/87/1632746374/Moze_Breeze_Two_Wavy_Black_1.jpg',
      tags: ['Premium', 'Hardware'],
    },
    {
      sku: 'AEON-EDITION-4',
      name: 'Aeon Edition 4 - Premium',
      description: 'Deutsche Ingenieurskunst. Höhenverstellbarer Rauchrohr, Durchzugsoptimiert. Die Königsklasse.',
      price: 349.90,
      stock: 5,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['aeon'],
      category_id: catMap['shishas'],
      cover_image: 'https://aeon-shisha.com/media/image/product/572/lg/aeon-shisha-edition-4-premium-frozen-clear.jpg',
      tags: ['High-End'],
    },
    {
      sku: 'VYRO-SPC-RED',
      name: 'Vyro Spectre - Carbon Red',
      description: 'Kompakt, innovativ und mit einem einzigartigen Blow-Off System. Die perfekte Travel-Shisha mit Carbon-Elementen.',
      price: 119.90,
      stock: 8,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['vyro'],
      category_id: catMap['shishas'], // Assuming 'travel-shishas' maps to 'shishas' or I should add category. 'shishas' is fine for now.
      cover_image: '/images/products/vyro-spectre.png', // Keeping generic path or finding a web url. Used local for now to match frontend.
      tags: ['Innovation', 'Premium', 'Shisha'],
    },

    // --- SHISHA KOHLE ---
    {
      sku: 'COC-001',
      name: 'Blackcoco\'s - 1kg',
      description: 'Die Standardkohle. Brennt lange, ascht wenig. 26er Würfel.',
      price: 7.90,
      stock: 1000,
      department_id: deptMap['shisha-world'],
      brand_id: null, // Generic or add Blackcocos
      category_id: catMap['shisha-kohle'],
      cover_image: 'https://m.media-amazon.com/images/I/71wI-g6T-CL._AC_SL1500_.jpg',
      tags: ['Essential'],
    },

    // --- HEADSHOP ---
    {
      sku: 'RAW-BLK-K',
      name: 'RAW Black King Size Slim',
      description: 'Das dünnste Papier von RAW. Für echte Genießer.',
      price: 1.50,
      stock: 2000,
      department_id: deptMap['headshop'],
      brand_id: brandMap['raw'],
      category_id: catMap['papers'],
      cover_image: 'https://m.media-amazon.com/images/I/71k+Xn4KxJL._AC_SL1500_.jpg',
      tags: ['Essential'],
    },
    {
      sku: 'OCB-PREM',
      name: 'OCB Premium Longpapers + Filter',
      description: 'Der Klassiker. Schwarz verpackt, immer gut.',
      price: 1.80,
      stock: 1500,
      department_id: deptMap['headshop'],
      brand_id: brandMap['ocb'],
      category_id: catMap['papers'],
      cover_image: 'https://m.media-amazon.com/images/I/71yRjG4s+ZL._AC_SL1500_.jpg',
      tags: [],
    },
    {
      sku: 'PUR-XTRA-50',
      name: 'Purize XTRA Slim Filter (50er)',
      description: 'Aktivkohlefilter im 50er Glas. Reduziert Schadstoffe, nicht den Geschmack.',
      price: 9.90,
      stock: 400,
      department_id: deptMap['headshop'],
      brand_id: brandMap['purize'],
      category_id: catMap['papers'], // actually filters but paper cat ok
      cover_image: 'https://www.purize-filters.com/media/image/product/105/lg/xtra-slim-size-active-charcoal-filter-50-glass.jpg',
      tags: ['Top Seller'],
    },
    {
      sku: 'GRI-ALU-01',
      name: 'Premium Alu Grinder 4-tlg',
      description: 'Scharfer Schliff, Pollensieb, Magnetverschluss. 50mm Durchmesser.',
      price: 19.90,
      stock: 100,
      department_id: deptMap['headshop'],
      brand_id: null,
      category_id: catMap['grinder'],
      cover_image: 'https://m.media-amazon.com/images/I/71Q3Xq-I+lL._AC_SL1500_.jpg',
      tags: [],
    },

    // --- GROW ---
    {
      sku: 'BB-GROW-1L',
      name: 'BioBizz Bio-Grow 1L',
      description: 'Flüssigdünger für die Wachstumsphase. 100% Organisch. Zuckerübenextrakt Basis.',
      price: 11.90,
      stock: 50,
      department_id: deptMap['grow'],
      brand_id: brandMap['biobizz'],
      category_id: catMap['duenger'],
      cover_image: 'https://www.growmart.de/images/product_images/original_images/BioBizz-Bio-Grow-1-Liter.jpg',
      tags: [],
    },
    {
      sku: 'BB-ALLMIX-50',
      name: 'BioBizz All-Mix 50L',
      description: 'Stark vorgedüngte Erde. Perfekt für blühende Pflanzen.',
      price: 16.90,
      stock: 200,
      department_id: deptMap['grow'],
      brand_id: brandMap['biobizz'],
      category_id: catMap['erde'],
      cover_image: 'https://www.growmart.de/images/product_images/original_images/BioBizz-All-Mix-50-Liter.jpg',
      tags: ['Schwergut'],
    },
    {
      sku: 'SAN-EVO-4',
      name: 'Sanlight EVO 4-120',
      description: 'High-End LED Grow Lampe. 250W. Das Beste vom Besten.',
      price: 499.00,
      stock: 5,
      department_id: deptMap['grow'],
      brand_id: brandMap['sanlight'],
      category_id: catMap['beleuchtung'],
      cover_image: 'https://www.growmart.de/images/product_images/original_images/SANlight-EVO-4-120.jpg',
      tags: ['Premium'],
    },

    // --- VAPES ---
    {
      sku: 'ELF-600-WM',
      name: 'Elfbar 600 - Watermelon',
      description: 'Die beliebteste Einweg Vape. Süße Wassermelone. 600 Züge.',
      price: 6.90,
      stock: 1000,
      department_id: deptMap['vapes'],
      brand_id: brandMap['elfbar'],
      category_id: catMap['einweg-vapes'],
      cover_image: 'https://dampfdorado.de/media/image/product/12345/lg/elf-bar-600-einweg-e-zigarette-watermelon.jpg',
      tags: ['Bestseller'],
      variants: [
        { size: '20mg', color: 'Red', stock: 500 },
        { size: '0mg', color: 'Red', stock: 500 }
      ]
    },
    {
      sku: 'ELF-600-BB',
      name: 'Elfbar 600 - Blueberry',
      description: 'Blaubeere pur. Intensiv und süß.',
      price: 6.90,
      stock: 800,
      department_id: deptMap['vapes'],
      brand_id: brandMap['elfbar'],
      category_id: catMap['einweg-vapes'],
      cover_image: 'https://dampfdorado.de/media/image/product/12347/lg/elf-bar-600-einweg-e-zigarette-blueberry.jpg',
      tags: [],
    },
  ];

  console.log('Seeding Products...');
  for (const product of products) {
    // Check if exists by name to avoid duplicates if cleanup failed
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: product });
      console.log(`✅ Created: ${product.name}`);
    }
  }

  console.log('🎉 Seed completed successfully! Shop should be massive now.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
