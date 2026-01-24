import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Departments
  const departments = [
    { name: 'Herren', slug: 'men', sort_order: 1 },
    { name: 'Damen', slug: 'women', sort_order: 2 },
    { name: 'Unisex', slug: 'unisex', sort_order: 3 },
    { name: 'Accessories', slug: 'accessories', sort_order: 4 },
  ];

  console.log('Creating Departments...');
  for (const dept of departments) {
    const existing = await prisma.department.findFirst({ where: { slug: dept.slug } });
    if (!existing) {
      await prisma.department.create({ data: dept });
    }
  }

  // 2. Brands
  const brands = [
    { name: 'Jordan', slug: 'jordan', sort_order: 1 },
    { name: 'Nike', slug: 'nike', sort_order: 2 },
    { name: 'Adidas', slug: 'adidas', sort_order: 3 },
    { name: 'Supreme', slug: 'supreme', sort_order: 4 },
    { name: 'Nebula', slug: 'nebula', sort_order: 5 },
  ];

  console.log('Creating Brands...');
  for (const brand of brands) {
    const existing = await prisma.brand.findFirst({ where: { slug: brand.slug } });
    if (!existing) {
      await prisma.brand.create({ data: brand });
    }
  }

  // 3. Categories (Product Types)
  const categories = [
    { name: 'Schuhe', slug: 'shoes', sort_order: 1 },
    { name: 'T-Shirts', slug: 't-shirts', sort_order: 2 },
    { name: 'Hoodies', slug: 'hoodies', sort_order: 3 },
    { name: 'Hosen', slug: 'pants', sort_order: 4 },
    { name: 'Caps', slug: 'caps', sort_order: 5 },
  ];

  console.log('Creating Categories...');
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }

  // Fetch IDs for relations
  const departmentMap = {};
  const brandMap = {};
  const categoryMap = {};

  const allDepts = await prisma.department.findMany();
  allDepts.forEach(d => departmentMap[d.slug] = d.id);

  const allBrands = await prisma.brand.findMany();
  allBrands.forEach(b => brandMap[b.slug] = b.id);

  const allCats = await prisma.category.findMany();
  allCats.forEach(c => categoryMap[c.slug] = c.id);

  // 4. Products
  const products = [
    {
      sku: 'JD-1-CHI',
      name: 'Jordan 1 Retro High OG "Chicago"',
      description: 'Der Klassiker schlechthin. Der Air Jordan 1 Retro High OG "Chicago" kommt im ikonischen rot-weiß-schwarzen Colorway.',
      price: 189.99,
      stock: 25,
      department_id: departmentMap['men'],
      brand_id: brandMap['jordan'],
      category_id: categoryMap['shoes'],
      cover_image: 'https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Chicago-Lost-and-Found-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&fm=webp&auto=compress&q=90&dpr=2',
      tags: ['Bestseller', 'New'],
      variants: [
        { size: '42', color: 'Chicago', stock: 5 },
        { size: '43', color: 'Chicago', stock: 10 },
        { size: '44', color: 'Chicago', stock: 10 },
      ]
    },
    {
      sku: 'JD-4-BLK',
      name: 'Jordan 4 Retro "Black Cat"',
      description: 'All Black Everything. Der Jordan 4 Black Cat ist zurück und stealthy wie eh und je.',
      price: 219.99,
      stock: 15,
      department_id: departmentMap['men'],
      brand_id: brandMap['jordan'],
      category_id: categoryMap['shoes'],
      cover_image: 'https://images.stockx.com/images/Air-Jordan-4-Retro-Black-Cat-2020-Product.jpg?fit=fill&bg=FFFFFF&w=700&h=500&fm=webp&auto=compress&q=90&dpr=2',
      tags: ['Limited'],
      variants: [
        { size: '42', color: 'Black', stock: 5 },
        { size: '43', color: 'Black', stock: 5 },
        { size: '44', color: 'Black', stock: 5 },
      ]
    },
    {
      sku: 'SUP-BOX-BLK',
      name: 'Supreme Box Logo Hoodie',
      description: 'Das ikonische Box Logo. Schwerer Baumwoll-Mix für maximalen Komfort und Style.',
      price: 149.99,
      stock: 80,
      department_id: departmentMap['unisex'],
      brand_id: brandMap['supreme'],
      category_id: categoryMap['hoodies'],
      cover_image: 'https://images.stockx.com/images/Supreme-Box-Logo-Hooded-Sweatshirt-Black-FW23.jpg?fit=fill&bg=FFFFFF&w=700&h=500&fm=webp&auto=compress&q=90&dpr=2',
      tags: ['Hype'],
      variants: [
        { size: 'M', color: 'Black', stock: 20 },
        { size: 'L', color: 'Black', stock: 30 },
        { size: 'XL', color: 'Black', stock: 30 },
      ]
    },
    {
      sku: 'NK-TEE-ESS',
      name: 'Nike Sportswear Essential Tee',
      description: 'Dein neues Lieblingsshirt für jeden Tag. Weiche Baumwolle und klassischer Schnitt.',
      price: 29.99,
      stock: 100,
      department_id: departmentMap['unisex'],
      brand_id: brandMap['nike'],
      category_id: categoryMap['t-shirts'],
      cover_image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/572c6999-0749-43c2-8419-4822760df722/sportswear-t-shirt-fur-herren-V5Tj90.png',
      tags: ['Basic'],
      variants: [
        { size: 'S', color: 'White', stock: 20 },
        { size: 'M', color: 'White', stock: 40 },
        { size: 'L', color: 'White', stock: 40 },
      ]
    }
  ];

  console.log('Seeding Products...');
  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!existing) {
      await prisma.product.create({ data: product });
      console.log(`Created product: ${product.name}`);
    } else {
      console.log(`Product already exists: ${product.name}`);
    }
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
