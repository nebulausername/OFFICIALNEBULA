/**
 * InsForge API Layer
 * Replaces the existing Express backend with InsForge SDK calls
 */
import { insforge, db } from '../lib/insforge';

// ============================================
// PRODUCTS API
// ============================================
export const productApi = {
    /**
     * Get all products with optional filters
     */
    list: async (filters = {}, sort = null, limit = null) => {
        // Map legacy filters/sort to standard query
        let query = db.from('products').select(`
      *,
      category:categories(*),
      brand:brands(*),
      department:departments(*)
    `);

        if (filters.categoryId) {
            // Support array or single value
            if (Array.isArray(filters.categoryId)) {
                query = query.in('category_id', filters.categoryId);
            } else {
                query = query.eq('category_id', filters.categoryId);
            }
        }
        if (filters.departmentId) {
            query = query.eq('department_id', filters.departmentId);
        }
        if (filters.brandId) {
            if (Array.isArray(filters.brandId)) {
                query = query.in('brand_id', filters.brandId);
            } else {
                query = query.eq('brand_id', filters.brandId);
            }
        }
        if (filters.inStock !== undefined && filters.inStock !== null) {
            query = query.eq('in_stock', filters.inStock);
        }

        // Price Range
        if (filters.minPrice !== undefined) {
            query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            query = query.lte('price', filters.maxPrice);
        }

        // Pagination
        if (limit) {
            query = query.limit(Number(limit));
        }
        if (filters.offset) {
            query = query.range(filters.offset, filters.offset + (Number(limit) || 20) - 1);
        }

        // Sorting
        if (sort) {
            // "price_asc", "created_at_desc", etc.
            const [field, direction] = sort.split('_');
            query = query.order(field, { ascending: direction === 'asc' });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    /**
     * Alias for list with filters
     */
    filter: async (filters = {}, sort = null, limit = null) => {
        return await productApi.list(filters, sort, limit);
    },

    /**
     * Get single product by ID
     */
    get: async (id) => {
        const { data, error } = await db
            .from('products')
            .select(`
        *,
        category:categories(*),
        brand:brands(*),
        department:departments(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Legacy method support
    getAll: async (filters) => productApi.list(filters),
    getById: async (id) => productApi.get(id),

    /**
     * Get products by category slug
     */
    getByCategory: async (categorySlug) => {
        // First get category ID
        const { data: category } = await db
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

        if (!category) return [];

        const { data, error } = await db
            .from('products')
            .select('*, brand:brands(*)')
            .eq('category_id', category.id)
            .eq('in_stock', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Search products
     */
    search: async (query) => {
        const { data, error } = await db
            .from('products')
            .select('*, brand:brands(*), category:categories(*)')
            .ilike('name', `%${query}%`)
            .limit(20);

        if (error) throw error;
        return data;
    },

    /**
     * Get featured/highlighted products
     */
    getFeatured: async (limit = 8) => {
        const { data, error } = await db
            .from('products')
            .select('*, brand:brands(*)')
            .eq('in_stock', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    },
};

// ============================================
// CATEGORIES API
// ============================================
export const categoryApi = {
    getAll: async () => {
        const { data, error } = await db
            .from('categories')
            .select('*, department:departments(*)')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    },

    getBySlug: async (slug) => {
        const { data, error } = await db
            .from('categories')
            .select('*, department:departments(*)')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    },

    getByDepartment: async (departmentId) => {
        const { data, error } = await db
            .from('categories')
            .select('*')
            .eq('department_id', departmentId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    },
};

// ============================================
// DEPARTMENTS API
// ============================================
export const departmentApi = {
    getAll: async () => {
        const { data, error } = await db
            .from('departments')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    },

    getBySlug: async (slug) => {
        const { data, error } = await db
            .from('departments')
            .select('*, categories(*)')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    },
};

// ============================================
// BRANDS API
// ============================================
export const brandApi = {
    getAll: async () => {
        const { data, error } = await db
            .from('brands')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    },

    getBySlug: async (slug) => {
        const { data, error } = await db
            .from('brands')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    },
};

// ============================================
// CART API (requires authenticated user)
// ============================================
export const cartApi = {
    getItems: async (userId) => {
        const { data, error } = await db
            .from('cart_items')
            .select(`
        *,
        product:products(*, brand:brands(*))
      `)
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    addItem: async (userId, productId, quantity = 1, selectedOptions = null) => {
        const { data, error } = await db
            .from('cart_items')
            .upsert({
                user_id: userId,
                product_id: productId,
                quantity,
                selected_options: selectedOptions,
            })
            .select();

        if (error) throw error;
        return data;
    },

    updateQuantity: async (itemId, quantity) => {
        const { data, error } = await db
            .from('cart_items')
            .update({ quantity })
            .eq('id', itemId)
            .select();

        if (error) throw error;
        return data;
    },

    removeItem: async (itemId) => {
        const { error } = await db
            .from('cart_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
        return true;
    },

    clearCart: async (userId) => {
        const { error } = await db
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    },
};

// ============================================
// WISHLIST API
// ============================================
export const wishlistApi = {
    getItems: async (userId) => {
        const { data, error } = await db
            .from('wishlist_items')
            .select(`
        *,
        product:products(*, brand:brands(*))
      `)
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    addItem: async (userId, productId) => {
        const { data, error } = await db
            .from('wishlist_items')
            .insert({ user_id: userId, product_id: productId })
            .select();

        if (error) throw error;
        return data;
    },

    removeItem: async (userId, productId) => {
        const { error } = await db
            .from('wishlist_items')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) throw error;
        return true;
    },
};

export default {
    products: productApi,
    categories: categoryApi,
    departments: departmentApi,
    brands: brandApi,
    cart: cartApi,
    wishlist: wishlistApi,
};
