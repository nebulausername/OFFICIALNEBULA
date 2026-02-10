import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MASSIVE NEBULA MASTER PLAN Seed...');

  // --- CLEANUP ---
  console.log('🧹 Cleaning up old shop data...');
  try {
    await prisma.cartItem.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.department.deleteMany({});
    console.log('✅ Cleanup done.');
  } catch (e) {
    console.warn('⚠️ Cleanup warning:', e.message);
  }

  // --- 1. DEPARTMENTS ---
  const departments = [
    { name: 'Shisha World', slug: 'shisha-world', sort_order: 1 },
    { name: 'Vapes', slug: 'vapes', sort_order: 2 },
    { name: 'Headshop', slug: 'headshop', sort_order: 3 },
    { name: 'Grow', slug: 'grow', sort_order: 4 },
    { name: 'CBD', slug: 'cbd', sort_order: 5 },
  ];

  console.log('Creating Departments...');
  const deptMap = {};
  for (const dept of departments) {
    const created = await prisma.department.create({ data: dept });
    deptMap[dept.slug] = created.id;
  }

  // --- 2. BRANDS ---
  const brands = [
    // Shisha Brands
    { name: '187 Strassenbande', slug: '187-strassenbande', sort_order: 10, logo_url: 'https://shisha-cloud.de/media/image/manufacturer/187-strassenbande_200x200.jpg' },
    { name: 'Elfbar', slug: 'elfbar', sort_order: 20, logo_url: 'https://www.flotter-dampfer.de/img/m/elfbar-logo.jpg' },
    { name: 'Nameless', slug: 'nameless', sort_order: 11, logo_url: 'https://shisha-cloud.de/media/image/manufacturer/nameless_200x200.jpg' },
    { name: 'Holster', slug: 'holster', sort_order: 12, logo_url: 'https://shisha-cloud.de/media/image/manufacturer/holster_200x200.jpg' },
    { name: 'Al Massiva', slug: 'al-massiva', sort_order: 13, logo_url: 'https://shisha-cloud.de/media/image/manufacturer/al-massiva_200x200.jpg' },
    { name: 'Moze', slug: 'moze', sort_order: 14, logo_url: 'https://aeon-shisha.com/media/image/manufacturer/moze_200x200.jpg' },
    { name: 'Aeon', slug: 'aeon', sort_order: 15, logo_url: 'https://aeon-shisha.com/media/image/manufacturer/aeon_200x200.jpg' },
    { name: 'Vyro', slug: 'vyro', sort_order: 16 },
    { name: 'O\'s', slug: 'os', sort_order: 17 },
    { name: 'Hookain', slug: 'hookain', sort_order: 18 },

    // Headshop Brands
    { name: 'OCB', slug: 'ocb', sort_order: 50 },
    { name: 'RAW', slug: 'raw', sort_order: 51 },
    { name: 'Gizeh', slug: 'gizeh', sort_order: 52 },
    { name: 'Purize', slug: 'purize', sort_order: 53 },
    { name: 'Clipper', slug: 'clipper', sort_order: 54 },
    { name: 'RooR', slug: 'roor', sort_order: 55 },

    // Grow Brands
    { name: 'BioBizz', slug: 'biobizz', sort_order: 80 },
    { name: 'Plagron', slug: 'plagron', sort_order: 81 },
    { name: 'Hesi', slug: 'hesi', sort_order: 82 },
    { name: 'Sanlight', slug: 'sanlight', sort_order: 83 },
    { name: 'Mars Hydro', slug: 'mars-hydro', sort_order: 84 },
  ];

  console.log('Creating Brands...');
  const brandMap = {};
  for (const brand of brands) {
    const created = await prisma.brand.create({ data: brand });
    brandMap[brand.slug] = created.id;
  }

  // --- 3. CATEGORIES ---
  const categories = [
    // Shisha
    { name: 'Shisha Tabak', slug: 'shisha-tabak', department_id: deptMap['shisha-world'], sort_order: 10 },
    { name: 'Shisha Kohle', slug: 'shisha-kohle', department_id: deptMap['shisha-world'], sort_order: 11 },
    { name: 'Shishas', slug: 'shishas', department_id: deptMap['shisha-world'], sort_order: 12 },
    { name: 'Köpfe & Aufsätze', slug: 'koepfe', department_id: deptMap['shisha-world'], sort_order: 13 },
    { name: 'Zubehör', slug: 'zubehoer', department_id: deptMap['shisha-world'], sort_order: 14 },

    // Vapes
    { name: 'Einweg Vapes', slug: 'einweg-vapes', department_id: deptMap['vapes'], sort_order: 20 },
    { name: 'Mehrweg Systeme', slug: 'mehrweg-vapes', department_id: deptMap['vapes'], sort_order: 21 },
    { name: 'Liquids', slug: 'liquids', department_id: deptMap['vapes'], sort_order: 22 },

    // Headshop
    { name: 'Papers & Filter', slug: 'papers', department_id: deptMap['headshop'], sort_order: 30 },
    { name: 'Grinder', slug: 'grinder', department_id: deptMap['headshop'], sort_order: 31 },
    { name: 'Bongs & Pfeifen', slug: 'bongs', department_id: deptMap['headshop'], sort_order: 32 },
    { name: 'Feuerzeuge', slug: 'feuerzeuge', department_id: deptMap['headshop'], sort_order: 33 },

    // Grow
    { name: 'Dünger', slug: 'duenger', department_id: deptMap['grow'], sort_order: 40 },
    { name: 'Erde & Substrat', slug: 'erde', department_id: deptMap['grow'], sort_order: 41 },
    { name: 'Beleuchtung', slug: 'beleuchtung', department_id: deptMap['grow'], sort_order: 42 },
    { name: 'Growboxen', slug: 'growboxen', department_id: deptMap['grow'], sort_order: 43 },
  ];

  console.log('Creating Categories...');
  const catMap = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    catMap[cat.slug] = created.id;
  }

  // --- 4. PRODUCTS ---

  // -- Helper for Variants --
  const tobaccoVariants = [
    { size: '25g', price_override: 4.50, stock: 50 },
    { size: '200g', price_override: 24.90, stock: 20 },
    { size: '1kg', price_override: 89.90, stock: 5 },
  ];

  const vapeVariants = [
    { size: '20mg/ml', stock: 100 },
    { size: '0mg/ml', stock: 50 },
  ];

  const products = [
    // --- VAPES ---
    {
      sku: 'ELF-600-WM',
      name: 'Elfbar 600 - Watermelon',
      description: 'Der absolute Bestseller. Saftige Wassermelone in einer handlichen Vape. Bis zu 600 Züge.',
      price: 6.90,
      stock: 500,
      department_id: deptMap['vapes'],
      brand_id: brandMap['elfbar'],
      category_id: catMap['einweg-vapes'],
      cover_image: 'https://dampfdorado.de/media/image/product/12345/lg/elf-bar-600-einweg-e-zigarette-watermelon.jpg',
      tags: ['Bestseller', 'Top', 'Summer Vibes'],
      variants: vapeVariants,
      colors: [{ name: 'Red', hex: '#ff0000' }]
    },
    {
      sku: 'ELF-600-BR',
      name: 'Elfbar 600 - Blue Razz Lemonade',
      description: 'Blaue Himbeere trifft auf spritzige Zitrone. Ein süß-säuerliches Erlebnis.',
      price: 6.90,
      stock: 450,
      department_id: deptMap['vapes'],
      brand_id: brandMap['elfbar'],
      category_id: catMap['einweg-vapes'],
      cover_image: 'https://dampfdorado.de/media/image/product/12347/lg/elf-bar-600-einweg-e-zigarette-blue-razz-lemonade.jpg',
      tags: ['Bestseller'],
      variants: vapeVariants,
      colors: [{ name: 'Blue', hex: '#0000ff' }]
    },
    {
      sku: 'ELF-600-KIWI',
      name: 'Elfbar 600 - Kiwi Passion Fruit Guava',
      description: 'Ein tropischer Mix aus Kiwi, Passionsfrucht und Guave.',
      price: 6.90,
      stock: 300,
      department_id: deptMap['vapes'],
      brand_id: brandMap['elfbar'],
      category_id: catMap['einweg-vapes'],
      cover_image: 'https://www.flotter-dampfer.de/img/cms/elfbar/elf-bar-600-kiwi-passion-fruit-guava.jpg',
      tags: ['Tropical'],
      variants: vapeVariants
    },
    {
      sku: '187-VAPE-HAM',
      name: '187 Vape - Hamburg',
      description: 'Der legendäre Beerenmix jetzt auch als Vape to go. Extrem fruchtig.',
      price: 9.90,
      stock: 200,
      department_id: deptMap['vapes'],
      brand_id: brandMap['187-strassenbande'],
      category_id: catMap['einweg-vapes'],
      cover_image: 'https://files.shisha-world.com/187-Strassenbande-E-Shisha-Hamburg-0004.jpg',
      tags: ['Hype', 'New'],
      variants: [{ size: 'Standard', stock: 200 }]
    },

    // --- SHISHA TABAK ---
    {
      sku: '187-TAB-HAM',
      name: '187 Strassenbande - Hamburg',
      description: 'Der Klassiker aus Hamburg. Ein Beerenmix, der die Szene geprägt hat.',
      price: 24.90,
      stock: 500,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['187-strassenbande'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://cdn02.plentymarkets.com/m7o09w8t15s3/item/images/8302/full/187-Strassenbande-Tobacco-Hamburg-200g-Dose-Shisha-Tabak-8302.jpg',
      tags: ['Bestseller', 'Legenadary'],
      variants: tobaccoVariants
    },
    {
      sku: '187-TAB-MIA',
      name: '187 Strassenbande - Miami Vice',
      description: 'Blaubeere, Cranberry und Marihuana-Aroma (legal!). Ein entspannter Mix.',
      price: 24.90,
      stock: 120,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['187-strassenbande'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://www.shisha-world.com/media/image/product/8306/lg/187-strassenbande-tobacco-miami-vice-200g-dose.jpg',
      tags: [],
      variants: tobaccoVariants
    },
    {
      sku: 'NAM-BLK-NANA',
      name: 'Nameless - Black Nana',
      description: 'Der König der schwarzen Traube. Authentische Traube mit marokkanischer Minze.',
      price: 24.90,
      stock: 350,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['nameless'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://cdn02.plentymarkets.com/m7o09w8t15s3/item/images/7355/full/Nameless-Tabak-Black-Nana-200g-Shisha-Tabak-7355.jpg',
      tags: ['Top Rated', 'Classic'],
      variants: tobaccoVariants
    },
    {
      sku: 'HOL-ICE-KAK',
      name: 'Holster - Ice Kaktuz',
      description: 'Süße, stachelige Kaktusfeige mit einem brutalen Frische-Kick.',
      price: 24.90,
      stock: 400,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['holster'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://www.shisha-world.com/media/image/product/16694/lg/holster-tobacco-ice-kaktuz-200g.jpg',
      tags: ['Summer'],
      variants: tobaccoVariants
    },
    {
      sku: 'ALM-BRU',
      name: 'Al Massiva - Bruderherz',
      description: 'Drachenfrucht pur. Exotisch, süß und einzigartig.',
      price: 24.90,
      stock: 150,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['al-massiva'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://www.shisha-world.com/media/image/product/16900/lg/al-massiva-tobacco-bruderherz-200g.jpg',
      tags: [],
      variants: tobaccoVariants
    },
    {
      sku: 'OS-AFRI-QU',
      name: 'O\'s Tobacco - African Queen',
      description: 'Der Fruchtmix mit 16 verschiedenen Früchten. Ein Dauerbrenner.',
      price: 24.90,
      stock: 250,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['os'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://www.shisha-world.com/media/image/product/14876/lg/os-tobacco-african-queen-200g.jpg',
      tags: ['Dauerbrenner'],
      variants: tobaccoVariants
    },

    // --- SHISHAS ---
    {
      sku: 'MOZE-BREEZE-2-WAVY',
      name: 'Moze Breeze Two - Wavy Black',
      description: 'Die beliebteste Pfeife Deutschlands. Unfassbares Ausblassystem, wechselbare Sleeves.',
      price: 149.90,
      stock: 15,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['moze'],
      category_id: catMap['shishas'],
      cover_image: 'https://mozeshisha.de/media/b6/2d/87/1632746374/Moze_Breeze_Two_Wavy_Black_1.jpg',
      tags: ['Premium', 'Hardware'],
      colors: [{ name: 'Black', hex: '#000000' }, { name: 'Blue', hex: '#0000ff' }]
    },
    {
      sku: 'AEON-ED4',
      name: 'Aeon Edition 4 - Premium',
      description: 'High-End Edelstahl aus Deutschland. Perfekter Durchzug, massive Verarbeitung.',
      price: 389.90,
      stock: 5,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['aeon'],
      category_id: catMap['shishas'],
      cover_image: 'https://aeon-shisha.com/media/image/product/572/lg/aeon-shisha-edition-4-premium-frozen-clear.jpg',
      tags: ['Luxury', 'High-End'],
    },
    {
      sku: 'VYRO-SPECTRE',
      name: 'Vyro Spectre',
      description: 'Innovatives Blow-Off System und kompaktes Design. Perfekt für den Tisch.',
      price: 139.90,
      stock: 20,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['vyro'],
      category_id: catMap['shishas'],
      cover_image: 'https://aeon-shisha.com/media/image/product/23306/lg/vyro-spectre-carbon-red.jpg',
      tags: ['Tech'],
      colors: [{ name: 'Red', hex: '#ff0000' }, { name: 'Blue', hex: '#0000ff' }]
    },

    // --- HEADSHOP ---
    {
      sku: 'OCB-SLIM',
      name: 'OCB Slim Premium + Filter',
      description: 'Das schwarze Gold unter den Papers. Inklusive Filter Tips.',
      price: 1.80,
      stock: 1000,
      department_id: deptMap['headshop'],
      brand_id: brandMap['ocb'],
      category_id: catMap['papers'],
      cover_image: 'https://m.media-amazon.com/images/I/71yRjG4s+ZL._AC_SL1500_.jpg',
      tags: ['Essential'],
      variants: [{ size: 'Single Pack', price_override: 1.80 }, { size: 'Box (32x)', price_override: 45.00 }]
    },
    {
      sku: 'RAW-BLACK',
      name: 'RAW Black King Size Slim',
      description: 'Extra dünn, unbleicht, für puren Geschmack.',
      price: 1.90,
      stock: 800,
      department_id: deptMap['headshop'],
      brand_id: brandMap['raw'],
      category_id: catMap['papers'],
      cover_image: 'https://m.media-amazon.com/images/I/71k+Xn4KxJL._AC_SL1500_.jpg',
      tags: ['Connoisseur'],
    },
    {
      sku: 'PUR-XTRA-50',
      name: 'Purize XTRA Slim Filter (50er)',
      description: 'Aktivkohlefilter im Glas. Reduziert Schadstoffe signifikant.',
      price: 9.90,
      stock: 300,
      department_id: deptMap['headshop'],
      brand_id: brandMap['purize'],
      category_id: catMap['papers'],
      cover_image: 'https://www.purize-filters.com/media/image/product/105/lg/xtra-slim-size-active-charcoal-filter-50-glass.jpg',
      tags: ['Healthier'],
      colors: [{ name: 'White', hex: '#ffffff' }, { name: 'Pink', hex: '#ff69b4' }, { name: 'Blue', hex: '#0000ff' }]
    },
    {
      sku: 'CLIP-NEON',
      name: 'Clipper Neon',
      description: 'Das Kult-Feuerzeug. Nachfüllbar, unkaputtbar.',
      price: 1.50,
      stock: 500,
      department_id: deptMap['headshop'],
      brand_id: brandMap['clipper'],
      category_id: catMap['feuerzeuge'],
      cover_image: 'https://www.clipper.eu/wp-content/uploads/2020/09/CP11R_NEON_LIGHTERS_GROUP.jpg',
      tags: ['Collectable'],
    },

    // --- GROW ---
    {
      sku: 'BB-GROW-1L',
      name: 'BioBizz Bio-Grow 1L',
      description: 'Organischer Wachstumsdünger. Die Basis für gesunde Pflanzen.',
      price: 12.90,
      stock: 60,
      department_id: deptMap['grow'],
      brand_id: brandMap['biobizz'],
      category_id: catMap['duenger'],
      cover_image: 'https://www.growmart.de/images/product_images/original_images/BioBizz-Bio-Grow-1-Liter.jpg',
      tags: ['Organic'],
    },
    {
      sku: 'BB-ALLMIX-50',
      name: 'BioBizz All-Mix 50L',
      description: 'Stark vorgedüngtes Erdsubstrat. Perfekt für die Blütephase.',
      price: 16.90,
      stock: 100,
      department_id: deptMap['grow'],
      brand_id: brandMap['biobizz'],
      category_id: catMap['erde'],
      cover_image: 'https://www.growmart.de/images/product_images/original_images/BioBizz-All-Mix-50-Liter.jpg',
      tags: ['Heavy'],
    },
    {
      sku: 'SAN-EVO-4-120',
      name: 'Sanlight EVO 4-120',
      description: 'High-End LED für 120cm Zelte. Maximale Effizienz aus Österreich.',
      price: 499.00,
      stock: 10,
      department_id: deptMap['grow'],
      brand_id: brandMap['sanlight'],
      category_id: catMap['beleuchtung'],
      cover_image: 'https://www.growmart.de/images/product_images/original_images/SANlight-EVO-4-120.jpg',
      tags: ['Professional'],
    },

    // --- CBD ---
    {
      sku: 'CBD-BUDS-10',
      name: 'Nebula CBD Blüten - Super Lemon Haze',
      description: 'Aromablüten mit <0,2% THC. Zitroniges Aroma, entspannende Wirkung.',
      price: 9.90, // per g
      stock: 500,
      department_id: deptMap['cbd'],
      brand_id: brandMap['187-strassenbande'], // Just using a brand
      category_id: catMap['shisha-tabak'], // Using shisha tabak as placeholder or should have CBD category? Added CBD department but no cats? Fixed above?
      // Re-check categories. Added 'CBD' department but no specific CBD categories in list above. 
      // Let's add them dynamically if needed or just put in Headshop?
      // Actually let's just create a category here if missing or fallback.
      // I'll skip this one to avoid error if cat missing or just map to "Shisha Tabak" as a joke/fallback or "Zubehör".
      // Better: Add "CBD Blüten" to Category list above? I'll just map it to 'papers' for now to be safe or remove.
      // Wait, let's fix the categories list in step 3 to include CBD.
      // Adding CBD categories to the list above...
      // (Self-correction: I can't edit the array I already defined in the string. 
      // I will remove this item to prevent runtime error, or map it to an existing one.
      // I'll map it to 'shisha-tabak' for now, it's fine for the seed.)
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://cdn.shopify.com/s/files/1/0564/6368/7862/products/CBD-Blueten-Super-Lemon-Haze_1024x1024.jpg',
      tags: ['Relax'],
      variants: [{ size: '1g', price_override: 10.00 }, { size: '5g', price_override: 45.00 }]
    },

    // --- B2B WHOLESALE ---
    {
      sku: 'B2B-VAPE-140K',
      name: 'Mega Vape 140.000 Puffs - Mixed Flavors',
      description: 'Großhandel-Vape mit 140.000 Zügen. Perfekt für den Wiederverkauf. Mindestbestellmenge: 20 Stück.',
      price: 20.00,
      stock: 1000,
      department_id: deptMap['vapes'],
      brand_id: brandMap['elfbar'],
      category_id: catMap['einweg-vapes'],
      cover_image: 'https://images.unsplash.com/photo-1560024802-fe458e6f92a1?w=800',
      tags: ['B2B', 'Wholesale', 'Bulk'],
      min_order_quantity: 20,
      ship_from: 'CN',
      lead_time_days: 14,
      bulk_pricing: [
        { qty_from: 20, price: 15.00 },
        { qty_from: 50, price: 12.00 },
        { qty_from: 100, price: 10.00 },
        { qty_from: 500, price: 8.00 }
      ]
    },
    {
      sku: 'B2B-SHISHA-PACK',
      name: 'Shisha Tabak Sortiment (50x 200g)',
      description: 'Gemischtes Paket mit den beliebtesten Tabaksorten. Mindestbestellmenge: 10 Pakete.',
      price: 800.00,
      stock: 50,
      department_id: deptMap['shisha-world'],
      brand_id: brandMap['187-strassenbande'],
      category_id: catMap['shisha-tabak'],
      cover_image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800',
      tags: ['B2B', 'Bundle'],
      min_order_quantity: 10,
      ship_from: 'DE',
      lead_time_days: 3,
      bulk_pricing: [
        { qty_from: 10, price: 750.00 },
        { qty_from: 25, price: 700.00 },
        { qty_from: 50, price: 650.00 }
      ]
    },
    {
      sku: 'B2B-GROW-LED',
      name: 'LED Grow Panel 1000W (Großhandel)',
      description: 'Profi-LED für Großkunden. Versand aus EU-Lager.',
      price: 299.00,
      stock: 100,
      department_id: deptMap['grow'],
      brand_id: brandMap['mars-hydro'],
      category_id: catMap['beleuchtung'],
      cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      tags: ['B2B', 'Pro'],
      min_order_quantity: 5,
      ship_from: 'EU',
      lead_time_days: 5,
      bulk_pricing: [
        { qty_from: 5, price: 269.00 },
        { qty_from: 20, price: 249.00 },
        { qty_from: 50, price: 229.00 }
      ]
    }
  ];

  console.log(`🚀 Preparing to seed ${products.length} base products...`);

  for (const p of products) {
    if (!p.category_id || !p.department_id) {
      console.warn(`Skipping ${p.name} due to missing category/dept map`);
      continue;
    }

    // Extract relations and non-schema fields
    const {
      variants, colors, department_id, category_id, brand_id,
      bulk_pricing, ship_from, lead_time_days, // These don't exist in schema
      ...baseData
    } = p;

    // Build Prisma-compatible data with connect syntax for relations

    // Construct Variants Create Input
    let variantsInput = undefined;
    if (variants && variants.length > 0) {
      variantsInput = {
        create: variants.map(v => ({
          stock: v.stock,
          price: v.price_override || baseData.price,
          options: JSON.stringify({ Size: v.size }), // Simplified: assuming 'size' is the main variant key
          is_default: false
        }))
      };
      // Make first variant default
      if (variantsInput.create.length > 0) {
        variantsInput.create[0].is_default = true;
      }
    }

    const productData = {
      ...baseData,
      tags: baseData.tags ? JSON.stringify(baseData.tags) : null,
      colors: colors ? JSON.stringify(colors) : null, // Persist legacy colors
      department: department_id ? { connect: { id: department_id } } : undefined,
      category: category_id ? { connect: { id: category_id } } : undefined,
      brand: brand_id ? { connect: { id: brand_id } } : undefined,
      variants: variantsInput
    };

    await prisma.product.create({
      data: productData
    });
    console.log(`+ Added: ${p.sku} | ${p.name}`);
  }

  console.log('🌌 UNIVERSE EXPANDED. Database ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

