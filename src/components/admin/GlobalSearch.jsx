import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Package,
    ShoppingBag,
    Search,
    Hash,
    ArrowRight
} from "lucide-react";
import { api } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        products: [],
        users: [],
        orders: []
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

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

    useEffect(() => {
        if (!query) {
            setResults({ products: [], users: [], orders: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const [products, users, orders] = await Promise.all([
                    api.entities.Product.filter({ search: query }, null, 5).catch(() => []),
                    api.admin.listUsers({ search: query }).catch(() => []),
                    api.entities.Request.filter({ search: query }, null, 5).catch(() => [])
                ]);

                setResults({
                    products: Array.isArray(products) ? products : (products.data || []),
                    users: Array.isArray(users) ? users : (users.data || []),
                    orders: Array.isArray(orders) ? orders : (orders.data || [])
                });
            } catch (error) {
                console.error("Search failed", error);
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

    if (!user || user.role !== 'admin') return null;

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Suche nach Produkten, Usern oder Bestellungen..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>

                {/* Navigation Shortcuts - Always visible if query is empty */}
                {!query && (
                    <CommandGroup heading="Quick Links">
                        <CommandItem onSelect={() => handleSelect(createPageUrl('Admin'))}>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect(createPageUrl('AdminProducts'))}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>Produkte verwalten</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect(createPageUrl('AdminRequests'))}>
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            <span>Bestellungen</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect(createPageUrl('AdminUsers'))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>User Verwaltung</span>
                        </CommandItem>
                    </CommandGroup>
                )}

                {/* Search Results */}
                {results.products.length > 0 && (
                    <CommandGroup heading="Produkte">
                        {results.products.slice(0, 5).map(product => (
                            <CommandItem key={product.id} onSelect={() => handleSelect(createPageUrl('AdminProductEditor') + `?id=${product.id}`)}>
                                <Package className="mr-2 h-4 w-4 opacity-70" />
                                <span className="font-medium">{product.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {results.users.length > 0 && (
                    <CommandGroup heading="User">
                        {results.users.slice(0, 5).map(user => (
                            <CommandItem key={user.id} onSelect={() => handleSelect(createPageUrl('AdminUsers') + `?search=${user.email}`)}>
                                <User className="mr-2 h-4 w-4 opacity-70" />
                                <span>{user.full_name || user.email}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{user.role}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {results.orders.length > 0 && (
                    <CommandGroup heading="Bestellungen">
                        {results.orders.slice(0, 5).map(order => (
                            <CommandItem key={order.id} onSelect={() => handleSelect(createPageUrl('AdminRequests') + `?highlight=${order.id}`)}>
                                <ShoppingBag className="mr-2 h-4 w-4 opacity-70" />
                                <span>Order #{order.id.slice(0, 8)}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{order.status}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
