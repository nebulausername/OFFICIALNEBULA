// Demo/Fallback Data for Offline Mode
// Used when the backend API is unavailable

export const DEMO_PRODUCTS = [
    {
        id: 'demo-1',
        sku: 'NEB-001',
        name: 'Nebula Premium T-Shirt',
        description: 'Premium Baumwolle T-Shirt mit Nebula Logo. Höchste Qualität für den anspruchsvollen Träger.',
        price: 49.90,
        currency: 'EUR',
        cover_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        gallery_images: [
            { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800' },
            { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800' }
        ],
        in_stock: true,
        product_type: 'clothing',
        tags: ['premium', 'limited'],
        lead_time_days: 3,
        min_order_quantity: 1,
        ship_from: 'Deutschland',
        category_id: 'demo-cat-1',
        brand_id: 'demo-brand-1',
        variants: [
            { name: 'S', in_stock: true },
            { name: 'M', in_stock: true },
            { name: 'L', in_stock: true },
            { name: 'XL', in_stock: false }
        ]
    },
    {
        id: 'demo-2',
        sku: 'NEB-002',
        name: 'Nebula Hoodie Black',
        description: 'Oversized Hoodie in Premium Qualität. 100% Bio-Baumwolle, perfekt für kalte Tage.',
        price: 89.90,
        currency: 'EUR',
        cover_image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        gallery_images: [
            { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800' }
        ],
        in_stock: true,
        product_type: 'clothing',
        tags: ['bestseller', 'new'],
        lead_time_days: 5,
        min_order_quantity: 1,
        ship_from: 'Deutschland',
        category_id: 'demo-cat-2',
        brand_id: 'demo-brand-1',
        variants: [
            { name: 'S', in_stock: true },
            { name: 'M', in_stock: true },
            { name: 'L', in_stock: true }
        ]
    },
    {
        id: 'demo-3',
        sku: 'NEB-003',
        name: 'Nebula Snapback Cap',
        description: 'Premium Snapback mit gesticktem Logo. One Size fits all.',
        price: 34.90,
        currency: 'EUR',
        cover_image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
        gallery_images: [
            { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800' }
        ],
        in_stock: true,
        product_type: 'accessory',
        tags: ['accessory'],
        lead_time_days: 2,
        min_order_quantity: 1,
        ship_from: 'Deutschland',
        category_id: 'demo-cat-3',
        brand_id: 'demo-brand-1',
        variants: []
    },
    {
        id: 'demo-4',
        sku: 'NEB-004',
        name: 'Nebula Jogger Pants',
        description: 'Bequeme Jogginghose mit Nebula Branding. Perfekt für Sport und Freizeit.',
        price: 69.90,
        currency: 'EUR',
        cover_image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800',
        gallery_images: [
            { url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800' }
        ],
        in_stock: true,
        product_type: 'clothing',
        tags: ['comfort', 'streetwear'],
        lead_time_days: 4,
        min_order_quantity: 1,
        ship_from: 'Deutschland',
        category_id: 'demo-cat-4',
        brand_id: 'demo-brand-1',
        variants: [
            { name: 'S', in_stock: true },
            { name: 'M', in_stock: true },
            { name: 'L', in_stock: false }
        ]
    }
];

export const DEMO_DEPARTMENTS = [
    { id: 'demo-dept-1', name: 'Streetwear', sort_order: 1 },
    { id: 'demo-dept-2', name: 'Accessories', sort_order: 2 },
    { id: 'demo-dept-3', name: 'Limited Edition', sort_order: 3 }
];

export const DEMO_CATEGORIES = [
    { id: 'demo-cat-1', name: 'T-Shirts', department_id: 'demo-dept-1' },
    { id: 'demo-cat-2', name: 'Hoodies', department_id: 'demo-dept-1' },
    { id: 'demo-cat-3', name: 'Caps', department_id: 'demo-dept-2' },
    { id: 'demo-cat-4', name: 'Pants', department_id: 'demo-dept-1' }
];

export const DEMO_BRANDS = [
    { id: 'demo-brand-1', name: 'Nebula', logo: null },
    { id: 'demo-brand-2', name: 'Nebula Premium', logo: null }
];

// Helper to get demo data by entity type
export const getDemoData = (entityName) => {
    const demoMap = {
        'product': DEMO_PRODUCTS,
        'department': DEMO_DEPARTMENTS,
        'category': DEMO_CATEGORIES,
        'brand': DEMO_BRANDS
    };
    return demoMap[entityName.toLowerCase()] || [];
};

// Get a single demo product by ID
export const getDemoProductById = (id) => {
    return DEMO_PRODUCTS.find(p => p.id === id) || null;
};
