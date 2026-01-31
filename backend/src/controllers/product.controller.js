import prisma from '../config/database.js';

export const listProducts = async (req, res, next) => {
  try {
    const {
      category_id,
      brand_id,
      department_id,
      in_stock,
      search,
      sort = '-created_at',
      limit,
      page = 1,
      min_price,
      max_price,
      tags,
    } = req.query;

    const where = {};

    if (category_id) where.category_id = category_id;
    if (brand_id) where.brand_id = brand_id;
    if (department_id) where.department_id = department_id;
    if (in_stock !== undefined) where.in_stock = in_stock === 'true';

    // Price range filter
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price.gte = parseFloat(min_price);
      if (max_price) where.price.lte = parseFloat(max_price);
    }

    // Tags filter (array search in JSONB)
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        array_contains: tagArray,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = {};
    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }

    const take = limit ? parseInt(limit) : undefined;
    const skip = take ? (parseInt(page) - 1) * take : undefined;

    // Optimized query with select to reduce data transfer
    // Only include relations if needed (for list view, we can skip some)
    const includeRelations = !req.query.minimal || req.query.minimal !== 'true';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take,
        skip,
        select: includeRelations ? {
          id: true,
          sku: true,
          name: true,
          description: true,
          price: true,
          currency: true,
          in_stock: true,
          cover_image: true,
          product_type: true,
          tags: true,
          colors: true,
          sizes: true,
          created_at: true,
          updated_at: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true, logo_url: true },
          },
          department: {
            select: { id: true, name: true, slug: true },
          },
          product_images: {
            orderBy: { sort_order: 'asc' },
            take: 5,
            select: { id: true, url: true, sort_order: true },
          },
        } : {
          id: true,
          sku: true,
          name: true,
          price: true,
          in_stock: true,
          cover_image: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Return array directly if no pagination (no limit and page=1), or object with data property
    // This ensures consistent response format: array when no pagination, object when paginated
    if (!take && parseInt(page) === 1) {
      return res.json(products);
    }

    res.json({
      data: products,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: take ? Math.ceil(total / take) : 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        department: true,
        product_images: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    console.log('📝 Creating Product with data:', JSON.stringify(productData, null, 2));

    // Basic Validation Logging
    if (!productData.name || !productData.sku || !productData.price) {
      console.error('❌ Validation Failed: Missing required fields (name, sku, price)');
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true,
        brand: true,
        department: true,
      },
    });

    console.log('✅ Product Created Successfully:', product.id);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    // Send detailed prisma error if available
    if (error.code) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Meta:', error.meta);
    }
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        brand: true,
        department: true,
        product_images: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const images = await prisma.productImage.findMany({
      where: { product_id: id },
      orderBy: { sort_order: 'asc' },
    });

    res.json(images);
  } catch (error) {
    next(error);
  }
};

