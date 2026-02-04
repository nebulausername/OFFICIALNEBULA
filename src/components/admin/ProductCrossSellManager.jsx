import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Package } from 'lucide-react';
import { api } from '@/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProductCrossSellManager({ relatedProductIds = [], onChange, currentProductId }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load details for selected IDs
    useEffect(() => {
        const loadSelected = async () => {
            if (!relatedProductIds?.length) {
                setSelectedProducts([]);
                return;
            }
            try {
                // Fetch all products that are in the ID list
                // Note: Ideally we would have a specialized endpoint or ID filter
                // For now we might need to fetch individually or assume we can filter by IDs if backend supports it
                // Or just list all and filter client side (not scalable but works for MVP)
                const allProds = await api.entities.Product.list();
                const relevant = allProds.filter(p => relatedProductIds.includes(p.id));
                setSelectedProducts(relevant);
            } catch (e) {
                console.error('Error loading related products:', e);
            }
        };
        loadSelected();
    }, [relatedProductIds]);

    // Search products
    useEffect(() => {
        const search = async () => {
            if (!searchQuery || searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setLoading(true);
            try {
                const allProds = await api.entities.Product.list();
                const filtered = allProds.filter(p =>
                    p.id !== currentProductId &&
                    !relatedProductIds.includes(p.id) &&
                    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
                ).slice(0, 5);
                setSearchResults(filtered);
            } catch (e) {
                console.error('Search error:', e);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, currentProductId, relatedProductIds]);

    const handleAdd = (product) => {
        const newIds = [...(relatedProductIds || []), product.id];
        onChange(newIds);
        setSearchQuery(''); // Clear search
        // Optimistically update local state for immediate feedback
        setSelectedProducts([...selectedProducts, product]);
        toast.success(`${product.name} hinzugefügt`);
    };

    const handleRemove = (productId) => {
        const newIds = relatedProductIds.filter(id => id !== productId);
        onChange(newIds);
        // Optimistically update local state
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-400" />
                    Verknüpfte Produkte (Cross-Sell)
                </h3>
                <p className="text-sm text-zinc-500 mb-6">
                    Diese Produkte werden im "Quick View Modal" unter "Passt dazu" angezeigt.
                </p>

                {/* Selected List */}
                <div className="space-y-3 mb-8">
                    {selectedProducts.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-600 font-mono text-sm">
                            Keine Produkte verknüpft
                        </div>
                    ) : (
                        selectedProducts.map(prod => (
                            <div key={prod.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 group hover:border-zinc-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden">
                                        {prod.cover_image && (
                                            <img src={prod.cover_image} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-zinc-200">{prod.name}</p>
                                        <p className="text-xs text-zinc-500 font-mono">{prod.sku}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemove(prod.id)}
                                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                {/* Search & Add */}
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Produkt suchen (Name oder SKU)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-zinc-950 border-zinc-800 focus:border-purple-500/50"
                        />
                    </div>

                    {/* Typeahead Results */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50">
                            {searchResults.map(prod => (
                                <button
                                    key={prod.id}
                                    onClick={() => handleAdd(prod)}
                                    className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                                        {prod.cover_image ? (
                                            <img src={prod.cover_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-700" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-zinc-300 group-hover:text-white truncate">{prod.name}</p>
                                        <p className="text-xs text-zinc-500 truncate">{prod.sku}</p>
                                    </div>
                                    <Plus className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
