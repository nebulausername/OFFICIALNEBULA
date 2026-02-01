import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Search,
    ShoppingBag,
    Tag,
    Layers,
    ArrowRight,
    Star
} from "lucide-react";
import { api } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';

export default function ShopCommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        products: [],
        categories: [],
        brands: []
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Search Logic
    useEffect(() => {
        if (!query) {
            setResults({ products: [], categories: [], brands: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                // Fetch safely - if ANY fail, others should still load (using .catch)
                const [products, categories, brands] = await Promise.all([
                    api.entities.Product.filter({ search: query }, null, 5).catch(() => []),
                    api.entities.Category.filter({ search: query }, null, 5).catch(() => []),
                    api.entities.Brand.filter({ search: query }, null, 5).catch(() => [])
                ]);

                setResults({
                    products: Array.isArray(products) ? products : (products?.data || []),
                    categories: Array.isArray(categories) ? categories : (categories?.data || []),
                    brands: Array.isArray(brands) ? brands : (brands?.data || [])
                });
            } catch (error) {
                console.error("Shop search failed", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (url) => {
        setOpen(false);
        navigate(url);
    };

    // If Admin, they use GlobalSearch instead
    if (user?.role === 'admin') return null;

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Suche nach Produkten, Marken oder Kategorien..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>

                {/* Quick Links for Empty State */}
                {!query && (
                    <CommandGroup heading="Vorschläge">
                        <CommandItem onSelect={() => handleSelect(createPageUrl('Shop'))}>
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            <span>Zum Shop</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect(createPageUrl('Profile'))}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            <span>Mein Profil</span>
                        </CommandItem>
                    </CommandGroup>
                )}

                {/* Products */}
                {results.products.length > 0 && (
                    <CommandGroup heading="Produkte">
                        {results.products.map(product => (
                            <CommandItem key={product.id} onSelect={() => handleSelect(createPageUrl('ProductDetails') + `?id=${product.id}`)}>
                                <Search className="mr-2 h-4 w-4 opacity-70" />
                                <span className="font-medium">{product.name}</span>
                                {product.is_new && <Star className="ml-2 h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {/* Categories */}
                {results.categories.length > 0 && (
                    <CommandGroup heading="Kategorien">
                        {results.categories.map(cat => (
                            <CommandItem key={cat.id} onSelect={() => handleSelect(createPageUrl('Shop') + `?category=${cat.id}`)}>
                                <Layers className="mr-2 h-4 w-4 opacity-70" />
                                <span>{cat.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {/* Brands */}
                {results.brands.length > 0 && (
                    <CommandGroup heading="Marken">
                        {results.brands.map(brand => (
                            <CommandItem key={brand.id} onSelect={() => handleSelect(createPageUrl('Shop') + `?brand=${brand.id}`)}>
                                <Tag className="mr-2 h-4 w-4 opacity-70" />
                                <span>{brand.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
