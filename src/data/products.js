export const products = [
    {
        id: 'demo-1',
        name: 'Moze Breeze Two - Wavy Black',
        description: 'Die Moze Breeze Two ist die Shisha des Jahres. Mit ihrem einzigartigen Ausblas-System und dem hochwertigen Design setzt sie neue Maßstäbe.',
        price: 149.90,
        cover_image: '/images/products/moze-breeze-two.png',
        tags: ['Bestseller', 'Premium', 'Shisha'],
        in_stock: true,
        stock: 15,
        sku: 'MOZE-BRZ-BLK',
        department_id: 'shishas',
        category_id: 'shishas',
        brand_id: 'moze',
        min_order_quantity: 1,
        colors: [
            {
                id: 'c1',
                name: 'Wavy Black',
                hex: '#111111',
                thumbnail: '/images/products/moze-breeze-two.png',
                images: ['/images/products/moze-breeze-two.png']
            }
        ]
    },
    {
        id: 'product-2',
        name: 'Elfbar 600 - Premium Selection',
        description: 'Der Klassiker neu definiert. Intensiver Geschmack, perfektes Zugverhalten und bis zu 600 Züge. Wähle deinen Favoriten.',
        price: 7.90,
        cover_image: '/images/products/elfbar-watermelon.png',
        tags: ['Bestseller', 'Configurable', 'Vape'],
        in_stock: true,
        stock: 500,
        sku: 'ELF-600-VAR',
        department_id: 'vapes',
        category_id: 'disposables',
        brand_id: 'elfbar',
        min_order_quantity: 1,
        colors: [
            {
                id: 'c1',
                name: 'Watermelon Luxury',
                hex: '#EF5350',
                thumbnail: '/images/products/elfbar-watermelon.png',
                images: ['/images/products/elfbar-watermelon.png']
            },
            {
                id: 'c2',
                name: 'Blue Razz Diamond',
                hex: '#42A5F5',
                // Using watermelon as placeholder for other colors until we generate them or user adds them
                thumbnail: '/images/products/elfbar-watermelon.png',
                images: ['/images/products/elfbar-watermelon.png']
            },
            {
                id: 'c3',
                name: 'Grape (Classic)',
                hex: '#AB47BC',
                thumbnail: '/images/products/elfbar-watermelon.png',
                images: ['/images/products/elfbar-watermelon.png']
            }
        ]
    },
    {
        id: 'demo-3',
        name: 'Nameless - Black Nana',
        description: 'Die Legende unter den Traube-Minze Tabaken. Ein Muss für jeden Shisha-Liebhaber. Perfekter Schnitt und enorme Rauchentwicklung.',
        price: 17.90,
        cover_image: '/images/products/tobacco-black-nana.png',
        tags: ['Legendary', 'Bestseller', 'Tabak'],
        in_stock: true,
        stock: 100,
        sku: 'NAM-BLK-NANA',
        department_id: 'tabak',
        category_id: 'shisha-tabak',
        brand_id: 'nameless',
        min_order_quantity: 1,
        colors: [{ id: 't1', name: '200g Dose', hex: '#222', thumbnail: '/images/products/tobacco-black-nana.png' }]
    },
    {
        id: 'demo-4',
        name: 'Vyro Spectre - Carbon Red',
        description: 'Kompakt, innovativ und mit einem einzigartigen Blow-Off System. Die perfekte Travel-Shisha mit Carbon-Elementen.',
        price: 119.90,
        cover_image: '/images/products/vyro-spectre.png',
        tags: ['Innovation', 'Premium', 'Shisha'],
        in_stock: true,
        stock: 8,
        sku: 'VYRO-SPC-RED',
        department_id: 'shishas',
        category_id: 'travel-shishas',
        brand_id: 'vyro',
        min_order_quantity: 1,
        colors: [{ id: 's1', name: 'Carbon Red', hex: '#B71C1C', thumbnail: '/images/products/vyro-spectre.png' }]
    },
    {
        id: 'demo-5',
        name: 'OCB Slim Premium Box (50 Stk)',
        description: 'Der Headshop Klassiker im Bulk-Pack. 50 Heftchen Premium Papers für den täglichen Bedarf.',
        price: 25.00,
        cover_image: '/images/products/ocb-box.png',
        tags: ['Bulk', 'Deal', 'Zubehör'],
        in_stock: true,
        stock: 200,
        sku: 'OCB-BOX',
        department_id: 'zubehoer',
        category_id: 'papers',
        brand_id: 'ocb',
        min_order_quantity: 1
    },
    {
        id: 'demo-6',
        name: '187 Strassenbande - Hamburg',
        description: 'Ein wilder Beerenmix, der so legendär ist wie die Stadt selbst. Fruchtig, süß und intensiv.',
        price: 9.90,
        cover_image: '/images/products/vape-187-hamburg.png',
        tags: ['Hype', 'Vape'],
        in_stock: true,
        stock: 50,
        sku: '187-HH',
        department_id: 'vapes',
        category_id: 'disposables',
        brand_id: '187-strassenbande',
        min_order_quantity: 1,
        colors: [{ id: 'v1', name: 'Hamburg (Berry)', hex: '#9C27B0', thumbnail: '/images/products/vape-187-hamburg.png' }]
    }
];
