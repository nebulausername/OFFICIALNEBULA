import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Json columns (Postgres JSONB / Prisma Json) accept arrays/objects directly.
// Keep this helper minimal and non-destructive for backwards compatibility.
const toJsonValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    // If someone accidentally provides a JSON string, try to parse it.
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

async function main() {
  console.log('🌱 Starting database seed with CSV data...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nebula.supply' },
    update: {
      telegram_id: BigInt(8120079318),
      verification_status: 'verified',
    },
    create: {
      telegram_id: BigInt(8120079318),
      username: 'admin',
      full_name: 'Admin User',
      email: 'admin@nebula.supply',
      role: 'admin',
      is_vip: true,
      verification_status: 'verified',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create Departments from CSV
  const departmentsData = [
    { name: 'Herren', slug: 'herren', sort_order: 1 },
    { name: 'Damen', slug: 'damen', sort_order: 2 },
    { name: 'Unisex', slug: 'unisex', sort_order: 3 },
    { name: 'Accessoires', slug: 'accessoires', sort_order: 4 },
  ];

  const departments = {};
  for (const dept of departmentsData) {
    const department = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: { sort_order: dept.sort_order },
      create: dept,
    });
    departments[dept.slug] = department;
    console.log(`✅ Department created: ${department.name}`);
  }

  // Create Categories from CSV
  const categoriesData = [
    { name: 'Schuhe', slug: 'schuhe', department_slug: 'herren', sort_order: 1 },
    { name: 'Fashion', slug: 'fashion', department_slug: 'herren', sort_order: 2 },
    { name: 'Accessories', slug: 'accessories', department_slug: 'unisex', sort_order: 3 },
    { name: 'Vapes', slug: 'vapes', department_slug: 'unisex', sort_order: 4 },
    { name: 'Tech', slug: 'tech', department_slug: 'unisex', sort_order: 5 },
    { name: 'Parfum', slug: 'parfum', department_slug: 'unisex', sort_order: 6 },
    // Damen Kategorien
    { name: 'Schuhe', slug: 'damen-schuhe', department_slug: 'damen', sort_order: 1 },
    { name: 'Fashion', slug: 'damen-fashion', department_slug: 'damen', sort_order: 2 },
    { name: 'Accessoires', slug: 'damen-accessoires', department_slug: 'damen', sort_order: 3 },
    // Accessoires Kategorien
    { name: 'Uhren', slug: 'uhren', department_slug: 'accessoires', sort_order: 1 },
    { name: 'Taschen', slug: 'taschen', department_slug: 'accessoires', sort_order: 2 },
    { name: 'Schmuck', slug: 'schmuck', department_slug: 'accessoires', sort_order: 3 },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        department_id: departments[cat.department_slug].id,
        sort_order: cat.sort_order,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        department_id: departments[cat.department_slug].id,
        sort_order: cat.sort_order,
      },
    });
    categories[cat.slug] = category;
    console.log(`✅ Category created: ${category.name}`);
  }

  // Create Brands
  const brandsData = [
    { name: 'Jordan', slug: 'jordan', sort_order: 1 },
    { name: 'Supreme', slug: 'supreme', sort_order: 2 },
    { name: 'Nike', slug: 'nike', sort_order: 3 },
    { name: 'Off-White', slug: 'off-white', sort_order: 4 },
    { name: 'Elf Bar', slug: 'elf-bar', sort_order: 5 },
    { name: 'Apple', slug: 'apple', sort_order: 6 },
    { name: 'Rolex', slug: 'rolex', sort_order: 7 },
    { name: 'Dior', slug: 'dior', sort_order: 8 },
  ];

  const brands = {};
  for (const brand of brandsData) {
    const brandRecord = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { sort_order: brand.sort_order },
      create: brand,
    });
    brands[brand.slug] = brandRecord;
    console.log(`✅ Brand created: ${brandRecord.name}`);
  }

  // Create Products from CSV
  const productsData = [
    {
      sku: 'NS-J1-001',
      name: 'Air Jordan 1 Retro High OG \'Chicago\'',
      description: 'Legendärer Klassiker in ikonischer Chicago-Colorway. Premium Leder, zeitloses Design.',
      price: 189.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'jordan',
      in_stock: false,
      cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      tags: ['Sneaker', 'Jordan', 'Basketball', 'Limited'],
      product_type: 'shoes',
      colors: [
        { id: 'color_1', name: 'Chicago', hex: '#CE1141', images: [] },
        { id: 'color_2', name: 'Black', hex: '#000000', images: [] },
      ],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      sku: 'NS-J4-002',
      name: 'Air Jordan 4 Retro \'Military Black\'',
      description: 'Premium Jordan 4 in Military Black. Exklusive Qualität, limitierte Verfügbarkeit.',
      price: 219.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'jordan',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      tags: ['Sneaker', 'Jordan', 'Limited', 'Premium'],
      product_type: 'shoes',
      colors: [
        { id: 'color_1', name: 'Military Black', hex: '#2C2C2C', images: [] },
      ],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      sku: 'NS-SUP-003',
      name: 'Supreme Box Logo Hoodie Black',
      description: 'Original Supreme Box Logo Hoodie. Hohe Qualität, authentisch, mit Nachweis.',
      price: 449.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'fashion',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      tags: ['Streetwear', 'Hoodie', 'Supreme', 'Limited'],
      product_type: 'clothing',
      colors: [
        { id: 'color_1', name: 'Black', hex: '#000000', images: [] },
        { id: 'color_2', name: 'Red', hex: '#DC2626', images: [] },
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      sku: 'NS-OW-004',
      name: 'Off-White Industrial Belt Yellow',
      description: 'Signature Off-White Industrial Belt in Yellow. Must-have Accessoire für jeden Streetwear-Fan.',
      price: 129.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'accessories',
      brand_slug: 'off-white',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800',
      tags: ['Belt', 'Off-White', 'Accessories', 'Hype'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Yellow', hex: '#FCD34D', images: [] },
        { id: 'color_2', name: 'Black', hex: '#000000', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-VAPE-005',
      name: 'Elf Bar 5000 Mango Ice',
      description: 'Premium Vape mit 5000 Zügen. Intensiver Mango-Geschmack mit erfrischender Ice-Note.',
      price: 14.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'vapes',
      brand_slug: 'elf-bar',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1610640201935-d4d8cd144b18?w=800',
      tags: ['Vape', 'Mango', 'Ice', '5000 Puffs'],
      product_type: 'other',
      colors: [
        { id: 'color_1', name: 'Mango', hex: '#F59E0B', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-TECH-006',
      name: 'Apple AirPods Pro (2. Gen)',
      description: 'Neueste AirPods Pro mit verbesserter Noise Cancellation und USB-C Ladecase.',
      price: 279.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'tech',
      brand_slug: 'apple',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
      tags: ['Apple', 'Audio', 'ANC', 'Wireless'],
      product_type: 'other',
      colors: [
        { id: 'color_1', name: 'White', hex: '#FFFFFF', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-PARF-001',
      name: 'Dior Sauvage Eau de Parfum 100ml',
      description: 'Klassischer Duft mit frischen, würzigen Noten. Premium Parfum für Alltag und Abend.',
      price: 129.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'parfum',
      brand_slug: 'dior',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1585386959984-a41552231691?w=800',
      tags: ['Parfum', 'Dior', 'Sauvage', 'Fragrance'],
      product_type: 'other',
      colors: [{ id: 'color_1', name: 'Blue', hex: '#1E3A8A', images: [] }],
      sizes: ['100ml'],
    },
    {
      sku: 'NS-NIKE-007',
      name: 'Nike Tech Fleece Jogger Black',
      description: 'Premium Tech Fleece Material für maximalen Komfort. Moderner Slim Fit.',
      price: 89.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'fashion',
      brand_slug: 'nike',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
      tags: ['Nike', 'Jogger', 'Tech Fleece', 'Streetwear'],
      product_type: 'clothing',
      colors: [
        { id: 'color_1', name: 'Black', hex: '#000000', images: [] },
        { id: 'color_2', name: 'Grey', hex: '#6B7280', images: [] },
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      sku: 'NS-VAPE-008',
      name: 'Elf Bar 5000 Watermelon Ice',
      description: 'Erfrischender Wassermelonen-Geschmack mit kühler Ice-Note. 5000 Züge pure Genuss.',
      price: 14.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'vapes',
      brand_slug: 'elf-bar',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1610640201869-57f6c50d6ab3?w=800',
      tags: ['Vape', 'Watermelon', 'Ice', '5000 Puffs'],
      product_type: 'other',
      colors: [
        { id: 'color_1', name: 'Watermelon', hex: '#EC4899', images: [] },
      ],
      sizes: ['One Size'],
    },
  ];

  // Create all products
  for (const product of productsData) {
    try {
      const productRecord = await prisma.product.upsert({
        where: { sku: product.sku },
        update: {
          name: product.name,
          description: product.description,
          price: product.price,
          department_id: departments[product.department_slug].id,
          category_id: categories[product.category_slug].id,
          brand_id: brands[product.brand_slug].id,
          in_stock: product.in_stock,
          cover_image: product.cover_image,
          tags: toJsonValue(product.tags),
          product_type: product.product_type,
          colors: toJsonValue(product.colors),
          sizes: toJsonValue(product.sizes),
        },
        create: {
          sku: product.sku,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          department_id: departments[product.department_slug].id,
          category_id: categories[product.category_slug].id,
          brand_id: brands[product.brand_slug].id,
          in_stock: product.in_stock,
          cover_image: product.cover_image,
          tags: toJsonValue(product.tags),
          product_type: product.product_type,
          colors: toJsonValue(product.colors),
          sizes: toJsonValue(product.sizes),
          variants: toJsonValue(product.variants || []),
        },
      });
      console.log(`✅ Product created: ${productRecord.name} (${productRecord.sku})`);
    } catch (error) {
      console.error(`❌ Error creating product ${product.sku}:`, error.message);
    }
  }

  // Add more products for variety
  const additionalProducts = [
    {
      sku: 'NS-J1-003',
      name: 'Air Jordan 1 Retro High OG \'Bred\'',
      description: 'Legendärer Bred Colorway. Premium Leder, ikonisches Design.',
      price: 199.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'jordan',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      tags: ['Sneaker', 'Jordan', 'Basketball', 'Limited', 'Bred'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'Bred', hex: '#000000', images: [] }],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      sku: 'NS-SUP-009',
      name: 'Supreme Box Logo Tee White',
      description: 'Original Supreme Box Logo T-Shirt in White. Authentisch, limitiert.',
      price: 299.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'fashion',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      tags: ['T-Shirt', 'Supreme', 'Streetwear', 'Limited'],
      product_type: 'clothing',
      colors: [
        { id: 'color_1', name: 'White', hex: '#FFFFFF', images: [] },
        { id: 'color_2', name: 'Black', hex: '#000000', images: [] },
      ],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    {
      sku: 'NS-NIKE-010',
      name: 'Nike Dunk Low Panda',
      description: 'Klassischer Nike Dunk in Panda Colorway. Zeitlos, bequem, stylisch.',
      price: 119.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'nike',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
      tags: ['Sneaker', 'Nike', 'Dunk', 'Panda', 'Classic'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'Panda', hex: '#000000', images: [] }],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      sku: 'NS-OW-011',
      name: 'Off-White x Nike Air Force 1',
      description: 'Kollaboration zwischen Off-White und Nike. Exklusiv und limitiert.',
      price: 249.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'off-white',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      tags: ['Sneaker', 'Off-White', 'Nike', 'Collaboration', 'Limited'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'White', hex: '#FFFFFF', images: [] }],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      sku: 'NS-TECH-012',
      name: 'Apple iPhone 15 Pro Max',
      description: 'Neuestes iPhone mit Titanium-Gehäuse. 256GB Speicher.',
      price: 1299.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'tech',
      brand_slug: 'apple',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      tags: ['iPhone', 'Apple', 'Smartphone', 'Premium', 'Tech'],
      product_type: 'other',
      colors: [
        { id: 'color_1', name: 'Natural Titanium', hex: '#8E8E93', images: [] },
        { id: 'color_2', name: 'Blue Titanium', hex: '#5E9ED6', images: [] },
      ],
      sizes: ['256GB', '512GB', '1TB'],
    },
    {
      sku: 'NS-VAPE-013',
      name: 'Elf Bar 5000 Blue Razz Ice',
      description: 'Erfrischender Blue Razz Geschmack mit Ice-Note. 5000 Züge.',
      price: 14.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'vapes',
      brand_slug: 'elf-bar',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1610640201935-d4d8cd144b18?w=800',
      tags: ['Vape', 'Blue Razz', 'Ice', '5000 Puffs'],
      product_type: 'other',
      colors: [{ id: 'color_1', name: 'Blue Razz', hex: '#3B82F6', images: [] }],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-SUP-014',
      name: 'Supreme Bogo Beanie Black',
      description: 'Original Supreme Box Logo Beanie. Warm, stylisch, authentisch.',
      price: 89.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'accessories',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      tags: ['Beanie', 'Supreme', 'Accessories', 'Streetwear'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Black', hex: '#000000', images: [] },
        { id: 'color_2', name: 'Red', hex: '#DC2626', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-NIKE-015',
      name: 'Nike Air Max 90 White',
      description: 'Klassischer Air Max 90 in White. Komfortabel, zeitlos, ikonisch.',
      price: 129.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'nike',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      tags: ['Sneaker', 'Nike', 'Air Max', 'Classic', 'White'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'White', hex: '#FFFFFF', images: [] }],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
  ];

  // Create additional products
  for (const product of additionalProducts) {
    try {
      const productRecord = await prisma.product.upsert({
        where: { sku: product.sku },
        update: {
          name: product.name,
          description: product.description,
          price: product.price,
          department_id: departments[product.department_slug].id,
          category_id: categories[product.category_slug].id,
          brand_id: brands[product.brand_slug].id,
          in_stock: product.in_stock,
          cover_image: product.cover_image,
          tags: toJsonValue(product.tags),
          product_type: product.product_type,
          colors: toJsonValue(product.colors),
          sizes: toJsonValue(product.sizes),
        },
        create: {
          sku: product.sku,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          department_id: departments[product.department_slug].id,
          category_id: categories[product.category_slug].id,
          brand_id: brands[product.brand_slug].id,
          in_stock: product.in_stock,
          cover_image: product.cover_image,
          tags: toJsonValue(product.tags),
          product_type: product.product_type,
          colors: toJsonValue(product.colors),
          sizes: toJsonValue(product.sizes),
          variants: toJsonValue(product.variants || []),
        },
      });
      console.log(`✅ Additional product created: ${productRecord.name} (${productRecord.sku})`);
    } catch (error) {
      console.error(`❌ Error creating additional product ${product.sku}:`, error.message);
    }
  }

  // Create more products for all departments
  const moreProducts = [
    // Damen Schuhe
    {
      sku: 'NS-DAMEN-001',
      name: 'Nike Dunk Low Women\'s Panda',
      description: 'Klassischer Nike Dunk in Panda Colorway für Damen. Zeitlos, bequem, stylisch.',
      price: 109.99,
      currency: 'EUR',
      department_slug: 'damen',
      category_slug: 'damen-schuhe',
      brand_slug: 'nike',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
      tags: ['Sneaker', 'Nike', 'Dunk', 'Panda', 'Women'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'Panda', hex: '#000000', images: [] }],
      sizes: ['36', '37', '38', '39', '40', '41'],
    },
    {
      sku: 'NS-DAMEN-002',
      name: 'Air Jordan 1 Retro High OG Women\'s',
      description: 'Ikonischer Jordan 1 in Women\'s Größen. Premium Leder, zeitloses Design.',
      price: 179.99,
      currency: 'EUR',
      department_slug: 'damen',
      category_slug: 'damen-schuhe',
      brand_slug: 'jordan',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      tags: ['Sneaker', 'Jordan', 'Women', 'Premium'],
      product_type: 'shoes',
      colors: [
        { id: 'color_1', name: 'White', hex: '#FFFFFF', images: [] },
        { id: 'color_2', name: 'Pink', hex: '#EC4899', images: [] },
      ],
      sizes: ['36', '37', '38', '39', '40', '41'],
    },
    {
      sku: 'NS-DAMEN-003',
      name: 'Nike Air Force 1 Women\'s White',
      description: 'Klassischer Air Force 1 in White für Damen. Komfortabel, zeitlos, ikonisch.',
      price: 99.99,
      currency: 'EUR',
      department_slug: 'damen',
      category_slug: 'damen-schuhe',
      brand_slug: 'nike',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      tags: ['Sneaker', 'Nike', 'Air Force 1', 'Women', 'Classic'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'White', hex: '#FFFFFF', images: [] }],
      sizes: ['36', '37', '38', '39', '40', '41'],
    },
    // Damen Fashion
    {
      sku: 'NS-DAMEN-004',
      name: 'Supreme Box Logo Tee Women\'s',
      description: 'Original Supreme Box Logo T-Shirt für Damen. Authentisch, limitiert, stylisch.',
      price: 249.99,
      currency: 'EUR',
      department_slug: 'damen',
      category_slug: 'damen-fashion',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      tags: ['T-Shirt', 'Supreme', 'Streetwear', 'Women', 'Limited'],
      product_type: 'clothing',
      colors: [
        { id: 'color_1', name: 'Pink', hex: '#EC4899', images: [] },
        { id: 'color_2', name: 'White', hex: '#FFFFFF', images: [] },
      ],
      sizes: ['XS', 'S', 'M', 'L'],
    },
    {
      sku: 'NS-DAMEN-005',
      name: 'Nike Tech Fleece Women\'s Jogger',
      description: 'Premium Tech Fleece Jogger für Damen. Moderner Fit, maximaler Komfort.',
      price: 79.99,
      currency: 'EUR',
      department_slug: 'damen',
      category_slug: 'damen-fashion',
      brand_slug: 'nike',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
      tags: ['Nike', 'Jogger', 'Tech Fleece', 'Women', 'Streetwear'],
      product_type: 'clothing',
      colors: [
        { id: 'color_1', name: 'Black', hex: '#000000', images: [] },
        { id: 'color_2', name: 'Pink', hex: '#EC4899', images: [] },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    {
      sku: 'NS-DAMEN-006',
      name: 'Supreme Hoodie Women\'s',
      description: 'Original Supreme Hoodie für Damen. Warm, stylisch, authentisch.',
      price: 399.99,
      currency: 'EUR',
      department_slug: 'damen',
      category_slug: 'damen-fashion',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      tags: ['Hoodie', 'Supreme', 'Streetwear', 'Women', 'Limited'],
      product_type: 'clothing',
      colors: [
        { id: 'color_1', name: 'Pink', hex: '#EC4899', images: [] },
        { id: 'color_2', name: 'Black', hex: '#000000', images: [] },
      ],
      sizes: ['XS', 'S', 'M', 'L'],
    },
    // Damen Accessoires
    {
      sku: 'NS-DAMEN-007',
      name: 'Supreme Handbag Black',
      description: 'Original Supreme Handbag für Damen. Stylisch, praktisch, authentisch.',
      price: 299.99,
      currency: 'EUR',
      department_slug: 'damen',
      category_slug: 'damen-accessoires',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      tags: ['Handbag', 'Supreme', 'Accessories', 'Women'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Black', hex: '#000000', images: [] },
        { id: 'color_2', name: 'Red', hex: '#DC2626', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-DAMEN-008',
      name: 'Off-White Belt Women\'s',
      description: 'Signature Off-White Industrial Belt für Damen. Must-have Accessoire.',
      price: 119.99,
      currency: 'EUR',
      department_slug: 'damen',
      category_slug: 'damen-accessoires',
      brand_slug: 'off-white',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800',
      tags: ['Belt', 'Off-White', 'Accessories', 'Women'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Pink', hex: '#EC4899', images: [] },
        { id: 'color_2', name: 'Yellow', hex: '#FCD34D', images: [] },
      ],
      sizes: ['One Size'],
    },
    // Herren zusätzliche Produkte
    {
      sku: 'NS-HERREN-016',
      name: 'Air Jordan 4 Retro \'Fire Red\'',
      description: 'Premium Jordan 4 in Fire Red Colorway. Exklusive Qualität, limitierte Verfügbarkeit.',
      price: 229.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'jordan',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      tags: ['Sneaker', 'Jordan', 'Limited', 'Premium', 'Fire Red'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'Fire Red', hex: '#DC2626', images: [] }],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      sku: 'NS-HERREN-017',
      name: 'Supreme Box Logo Hoodie White',
      description: 'Original Supreme Box Logo Hoodie in White. Hohe Qualität, authentisch.',
      price: 449.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'fashion',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      tags: ['Streetwear', 'Hoodie', 'Supreme', 'Limited', 'White'],
      product_type: 'clothing',
      colors: [{ id: 'color_1', name: 'White', hex: '#FFFFFF', images: [] }],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      sku: 'NS-HERREN-018',
      name: 'Nike SB Dunk Low \'Panda\'',
      description: 'Klassischer Nike SB Dunk in Panda Colorway. Perfekt für Skateboarding.',
      price: 129.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'nike',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
      tags: ['Sneaker', 'Nike', 'SB Dunk', 'Panda', 'Skate'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'Panda', hex: '#000000', images: [] }],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      sku: 'NS-HERREN-019',
      name: 'Off-White x Nike Dunk Low',
      description: 'Exklusive Kollaboration zwischen Off-White und Nike. Limitierte Edition.',
      price: 299.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'schuhe',
      brand_slug: 'off-white',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      tags: ['Sneaker', 'Off-White', 'Nike', 'Collaboration', 'Limited'],
      product_type: 'shoes',
      colors: [{ id: 'color_1', name: 'White', hex: '#FFFFFF', images: [] }],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      sku: 'NS-HERREN-020',
      name: 'Supreme Cargo Pants Black',
      description: 'Original Supreme Cargo Pants. Funktional, stylisch, authentisch.',
      price: 249.99,
      currency: 'EUR',
      department_slug: 'herren',
      category_slug: 'fashion',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
      tags: ['Pants', 'Supreme', 'Streetwear', 'Cargo', 'Limited'],
      product_type: 'clothing',
      colors: [{ id: 'color_1', name: 'Black', hex: '#000000', images: [] }],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    // Unisex zusätzliche Produkte
    {
      sku: 'NS-UNISEX-009',
      name: 'Elf Bar 5000 Strawberry Ice',
      description: 'Süßer Erdbeer-Geschmack mit kühler Ice-Note. 5000 Züge pure Genuss.',
      price: 14.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'vapes',
      brand_slug: 'elf-bar',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1610640201935-d4d8cd144b18?w=800',
      tags: ['Vape', 'Strawberry', 'Ice', '5000 Puffs'],
      product_type: 'other',
      colors: [{ id: 'color_1', name: 'Strawberry', hex: '#EF4444', images: [] }],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-UNISEX-010',
      name: 'Elf Bar 5000 Peach Ice',
      description: 'Saftiger Pfirsich-Geschmack mit Ice-Note. 5000 Züge.',
      price: 14.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'vapes',
      brand_slug: 'elf-bar',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1610640201869-57f6c50d6ab3?w=800',
      tags: ['Vape', 'Peach', 'Ice', '5000 Puffs'],
      product_type: 'other',
      colors: [{ id: 'color_1', name: 'Peach', hex: '#F59E0B', images: [] }],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-UNISEX-011',
      name: 'Apple AirPods Max',
      description: 'Premium Over-Ear Kopfhörer mit Active Noise Cancellation. Exzellenter Sound.',
      price: 549.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'tech',
      brand_slug: 'apple',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
      tags: ['Apple', 'Audio', 'ANC', 'Wireless', 'Premium'],
      product_type: 'other',
      colors: [
        { id: 'color_1', name: 'Space Gray', hex: '#6B7280', images: [] },
        { id: 'color_2', name: 'Silver', hex: '#E5E7EB', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-UNISEX-012',
      name: 'Apple iPad Pro 12.9"',
      description: 'Neuestes iPad Pro mit M2 Chip. 256GB Speicher, Wi-Fi.',
      price: 1199.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'tech',
      brand_slug: 'apple',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      tags: ['iPad', 'Apple', 'Tablet', 'Premium', 'Tech'],
      product_type: 'other',
      colors: [{ id: 'color_1', name: 'Space Gray', hex: '#6B7280', images: [] }],
      sizes: ['256GB', '512GB', '1TB'],
    },
    {
      sku: 'NS-UNISEX-013',
      name: 'Supreme Backpack Black',
      description: 'Original Supreme Backpack. Funktional, stylisch, authentisch.',
      price: 199.99,
      currency: 'EUR',
      department_slug: 'unisex',
      category_slug: 'accessories',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      tags: ['Backpack', 'Supreme', 'Accessories', 'Streetwear'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Black', hex: '#000000', images: [] },
        { id: 'color_2', name: 'Red', hex: '#DC2626', images: [] },
      ],
      sizes: ['One Size'],
    },
    // Accessoires Department Produkte
    {
      sku: 'NS-ACC-001',
      name: 'Apple Watch Series 9',
      description: 'Neueste Apple Watch mit Always-On Display. GPS, 45mm, Aluminium.',
      price: 449.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'uhren',
      brand_slug: 'apple',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
      tags: ['Apple Watch', 'Smartwatch', 'Tech', 'Premium'],
      product_type: 'other',
      colors: [
        { id: 'color_1', name: 'Midnight', hex: '#1E293B', images: [] },
        { id: 'color_2', name: 'Starlight', hex: '#F5F5F5', images: [] },
      ],
      sizes: ['41mm', '45mm'],
    },
    {
      sku: 'NS-ACC-002',
      name: 'Rolex Submariner Date',
      description: 'Ikonische Rolex Submariner mit Datumsanzeige. Automatikwerk, wasserdicht.',
      price: 8999.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'uhren',
      brand_slug: 'rolex',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      tags: ['Rolex', 'Luxury', 'Watch', 'Premium', 'Automatic'],
      product_type: 'other',
      colors: [{ id: 'color_1', name: 'Black', hex: '#000000', images: [] }],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-ACC-003',
      name: 'Supreme Shoulder Bag',
      description: 'Original Supreme Shoulder Bag. Kompakt, stylisch, authentisch.',
      price: 149.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'taschen',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      tags: ['Bag', 'Supreme', 'Accessories', 'Streetwear'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Black', hex: '#000000', images: [] },
        { id: 'color_2', name: 'Red', hex: '#DC2626', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-ACC-004',
      name: 'Off-White Tote Bag',
      description: 'Signature Off-White Tote Bag. Must-have Accessoire für jeden Streetwear-Fan.',
      price: 199.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'taschen',
      brand_slug: 'off-white',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      tags: ['Tote Bag', 'Off-White', 'Accessories', 'Hype'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Yellow', hex: '#FCD34D', images: [] },
        { id: 'color_2', name: 'Black', hex: '#000000', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-ACC-005',
      name: 'Supreme Chain Necklace',
      description: 'Original Supreme Chain Necklace. Stylisch, authentisch, limitiert.',
      price: 89.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'schmuck',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      tags: ['Necklace', 'Supreme', 'Jewelry', 'Accessories'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Silver', hex: '#C0C0C0', images: [] },
        { id: 'color_2', name: 'Gold', hex: '#FFD700', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-ACC-006',
      name: 'Off-White Chain',
      description: 'Signature Off-White Chain. Must-have Schmuck für jeden Streetwear-Fan.',
      price: 129.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'schmuck',
      brand_slug: 'off-white',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      tags: ['Chain', 'Off-White', 'Jewelry', 'Hype'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Silver', hex: '#C0C0C0', images: [] },
        { id: 'color_2', name: 'Gold', hex: '#FFD700', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-ACC-007',
      name: 'Supreme Ring Set',
      description: 'Original Supreme Ring Set. 3 verschiedene Ringe, authentisch, limitiert.',
      price: 79.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'schmuck',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      tags: ['Rings', 'Supreme', 'Jewelry', 'Accessories'],
      product_type: 'accessories',
      colors: [{ id: 'color_1', name: 'Silver', hex: '#C0C0C0', images: [] }],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-ACC-008',
      name: 'Apple Watch Ultra',
      description: 'Premium Apple Watch Ultra für Abenteurer. Titanium, GPS, 49mm.',
      price: 899.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'uhren',
      brand_slug: 'apple',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
      tags: ['Apple Watch', 'Ultra', 'Smartwatch', 'Premium', 'Titanium'],
      product_type: 'other',
      colors: [{ id: 'color_1', name: 'Titanium', hex: '#8E8E93', images: [] }],
      sizes: ['49mm'],
    },
    {
      sku: 'NS-ACC-009',
      name: 'Supreme Duffle Bag',
      description: 'Original Supreme Duffle Bag. Großzügig, funktional, authentisch.',
      price: 249.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'taschen',
      brand_slug: 'supreme',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      tags: ['Duffle Bag', 'Supreme', 'Accessories', 'Travel'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Black', hex: '#000000', images: [] },
        { id: 'color_2', name: 'Red', hex: '#DC2626', images: [] },
      ],
      sizes: ['One Size'],
    },
    {
      sku: 'NS-ACC-010',
      name: 'Off-White Crossbody Bag',
      description: 'Signature Off-White Crossbody Bag. Kompakt, stylisch, must-have.',
      price: 179.99,
      currency: 'EUR',
      department_slug: 'accessoires',
      category_slug: 'taschen',
      brand_slug: 'off-white',
      in_stock: true,
      cover_image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      tags: ['Crossbody Bag', 'Off-White', 'Accessories', 'Hype'],
      product_type: 'accessories',
      colors: [
        { id: 'color_1', name: 'Yellow', hex: '#FCD34D', images: [] },
        { id: 'color_2', name: 'Black', hex: '#000000', images: [] },
      ],
      sizes: ['One Size'],
    },
  ];

  // Create more products
  for (const product of moreProducts) {
    try {
      const productRecord = await prisma.product.upsert({
        where: { sku: product.sku },
        update: {
          name: product.name,
          description: product.description,
          price: product.price,
          department_id: departments[product.department_slug].id,
          category_id: categories[product.category_slug].id,
          brand_id: brands[product.brand_slug].id,
          in_stock: product.in_stock,
          cover_image: product.cover_image,
          tags: toJsonValue(product.tags),
          product_type: product.product_type,
          colors: toJsonValue(product.colors),
          sizes: toJsonValue(product.sizes),
        },
        create: {
          sku: product.sku,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          department_id: departments[product.department_slug].id,
          category_id: categories[product.category_slug].id,
          brand_id: brands[product.brand_slug].id,
          in_stock: product.in_stock,
          cover_image: product.cover_image,
          tags: toJsonValue(product.tags),
          product_type: product.product_type,
          colors: toJsonValue(product.colors),
          sizes: toJsonValue(product.sizes),
          variants: toJsonValue(product.variants || []),
        },
      });
      console.log(`✅ More product created: ${productRecord.name} (${productRecord.sku})`);
    } catch (error) {
      console.error(`❌ Error creating more product ${product.sku}:`, error.message);
    }
  }

  // Create VIP Plan
  const vipPlan = await prisma.vIPPlan.upsert({
    where: { id: 'vip-monthly' },
    update: {},
    create: {
      id: 'vip-monthly',
      name: 'Monthly VIP',
      price: 29.99,
      duration_days: 30,
      benefits: toJsonValue([
        'Free shipping',
        '10% discount on all products',
        'Early access to new products',
        'Priority support',
      ]),
      is_active: true,
    },
  }).catch(() => {
    return prisma.vIPPlan.create({
      data: {
        id: 'vip-monthly',
        name: 'Monthly VIP',
        price: 29.99,
        duration_days: 30,
        benefits: toJsonValue([
          'Free shipping',
          '10% discount on all products',
          'Early access to new products',
          'Priority support',
        ]),
        is_active: true,
      },
    });
  });

  console.log('✅ VIP Plan created:', vipPlan.name);

  // Create Lifetime VIP Plan
  const lifetimeVipPlan = await prisma.vIPPlan.upsert({
    where: { id: 'vip-lifetime' },
    update: {},
    create: {
      id: 'vip-lifetime',
      name: 'Lifetime VIP',
      price: 50.00,
      duration_days: 9999,
      benefits: toJsonValue([
        'Free shipping forever',
        '15% discount on all products',
        'Early access to all new products',
        'Priority support',
        'Exclusive products access',
      ]),
      is_active: true,
    },
  }).catch(() => {
    return prisma.vIPPlan.create({
      data: {
        id: 'vip-lifetime',
        name: 'Lifetime VIP',
        price: 50.00,
        duration_days: 9999,
        benefits: toJsonValue([
          'Free shipping forever',
          '15% discount on all products',
          'Early access to all new products',
          'Priority support',
          'Exclusive products access',
        ]),
        is_active: true,
      },
    });
  });

  console.log('✅ Lifetime VIP Plan created:', lifetimeVipPlan.name);

  // Create notification templates
  const templates = [
    {
      id: 'order-confirmed',
      name: 'Order Confirmed',
      trigger_status: 'confirmed',
      message_template: '✅ Deine Bestellung wurde bestätigt!\n\nWir bearbeiten deine Anfrage und melden uns bald bei dir.\n\nBestellung: #{order_id}\nGesamtsumme: {total}€\n\n🌟 Nebula Supply',
      is_active: true,
    },
    {
      id: 'order-shipped',
      name: 'Order Shipped',
      trigger_status: 'shipped',
      message_template: '🚚 Deine Bestellung wurde versandt!\n\nDein Paket ist unterwegs zu dir.\n\nBestellung: #{order_id}\n\n🌟 Nebula Supply',
      is_active: true,
    },
    {
      id: 'order-completed',
      name: 'Order Completed',
      trigger_status: 'completed',
      message_template: '🎉 Bestellung abgeschlossen!\n\nVielen Dank für deinen Einkauf bei Nebula Supply!\n\nBestellung: #{order_id}\n\n🌟 Nebula Supply',
      is_active: true,
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { id: template.id },
      update: {
        message_template: template.message_template,
        is_active: template.is_active,
      },
      create: template,
    }).catch(() => {
      return prisma.notificationTemplate.create({ data: template });
    });
    console.log(`✅ Notification template created: ${template.name}`);
  }

  console.log('🎉 Database seed completed!');
  console.log(`📊 Summary:`);
  console.log(`   - ${departmentsData.length} Departments`);
  console.log(`   - ${categoriesData.length} Categories`);
  console.log(`   - ${brandsData.length} Brands`);
  console.log(`   - ${productsData.length + additionalProducts.length + moreProducts.length} Products`);
  console.log(`   - 2 VIP Plans`);
  console.log(`   - ${templates.length} Notification Templates`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
