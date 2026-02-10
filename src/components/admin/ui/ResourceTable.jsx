import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { motion } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    MoreHorizontal,
    ArrowUpDown,
    Plus,
    Filter
} from 'lucide-react';

/**
 * @typedef {Object} ColumnConfig
 * @property {string} key - Data key
 * @property {string} label - Header label
 * @property {boolean} [sortable] - Enable backend sorting
 * @property {function(any, Object): React.ReactNode} [render] - Custom renderer
 * @property {string} [className] - Cell class
 */

/**
 * @typedef {Object} ActionConfig
 * @property {string} label
 * @property {Object} icon - Lucide Icon
 * @property {'default'|'outline'|'destructive'|'ghost'} [variant]
 * @property {function(Object): void} onClick
 * @property {boolean} [showInRow] - Show as button instead of dropdown
 */

export function ResourceTable({
    resource, // e.g. 'Product', 'User'
    columns,
    actions = [],
    title,
    initialSort = '-created_at',
    searchKeys = ['id'], // Suggestion for UI placeholder
    pageSize = 10,
    headerActions = null, // React Node (e.g. "Add User" button)
    onRowClick = null
}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Query State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [sort, setSort] = useState(initialSort);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch Data
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!api.entities[resource]) {
                throw new Error(`Resource '${resource}' not found in API`);
            }

            const params = {
                page,
                limit: pageSize,
                sort,
                search: debouncedSearch || undefined
            };

            const response = await api.entities[resource].list(params);

            // Normalize Response (Handle Array vs Paginator)
            // Expecting { data: [], total: ..., totalPages: ... } from backend wrapper
            // But api.entities.list might return { data: [], total: ... } based on my update
            // or just Array if backend returns array.

            let list = [];
            let total = 0;
            let pages = 1;

            if (response.data && Array.isArray(response.data)) {
                list = response.data;
                total = response.total || list.length;
                pages = response.totalPages || Math.ceil(total / pageSize);
            } else if (Array.isArray(response)) {
                // Fallback if update didn't work as expected or backend returns plain array
                list = response;
                total = list.length;
                pages = 1;
            } else if (response.total !== undefined && Array.isArray(response.data)) {
                // My entities.js update returns { data: ..., total: ... } for array response?
                // Wait, entities.js list method returns { data: ..., total: ... } if array
                list = response.data;
                total = response.total;
                pages = Math.ceil(total / pageSize);
            }

            setData(list);
            setTotalItems(total);
            setTotalPages(pages || 1);

        } catch (err) {
            console.error('ResourceTable Load Error:', err);
            setError('Fehler beim Laden der Daten.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [resource, page, sort, debouncedSearch]);

    // Handlers
    const handleSort = (key) => {
        if (sort === key) {
            setSort(`-${key}`);
        } else if (sort === `-${key}`) {
            setSort(initialSort); // Reset
        } else {
            setSort(key);
        }
    };

    const getSortIcon = (key) => {
        if (sort === key) return <ArrowUpDown className="w-4 h-4 ml-1 rotate-180" />;
        if (sort === `-${key}`) return <ArrowUpDown className="w-4 h-4 ml-1" />;
        return <ArrowUpDown className="w-4 h-4 ml-1 opacity-20" />;
    };

    return (
        <div className="space-y-4">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    {title && <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">{title}</h2>}
                    <div className="text-zinc-400 text-sm">
                        {loading ? 'Laden...' : `${totalItems} Einträge`}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Suche..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-zinc-900 border-zinc-700 hover:border-zinc-600 focus:border-zinc-500 transition-colors"
                        />
                    </div>
                    {/* Potential Filter Slot */}
                    {headerActions}
                </div>
            </div>

            {/* Content */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900 border-b border-zinc-800">
                        <TableRow className="hover:bg-zinc-900/50 border-zinc-800">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className={`text-zinc-400 ${col.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''} ${col.className || ''}`}
                                    onClick={() => col.sortable && handleSort(col.key)}
                                >
                                    <div className="flex items-center">
                                        {col.label}
                                        {col.sortable && getSortIcon(col.key)}
                                    </div>
                                </TableHead>
                            ))}
                            {actions.length > 0 && <TableHead className="w-[50px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            // Loading Skeleton
                            [...Array(pageSize)].map((_, i) => (
                                <TableRow key={i} className="border-zinc-800">
                                    {columns.map((col, j) => (
                                        <TableCell key={j}><Skeleton className="h-6 w-full bg-zinc-800" /></TableCell>
                                    ))}
                                    {actions.length > 0 && <TableCell><Skeleton className="h-8 w-8 rounded-full bg-zinc-800" /></TableCell>}
                                </TableRow>
                            ))
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actions.length ? 1 : 0)} className="h-32 text-center text-red-400">
                                    {error}
                                    <Button variant="link" onClick={loadData} className="ml-2 text-white underline">Erneut versuchen</Button>
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actions.length ? 1 : 0)} className="h-32 text-center text-zinc-500">
                                    Keine Daten gefunden.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, i) => (
                                <motion.tr
                                    key={row.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                    className="border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((col) => (
                                        <TableCell key={`${row.id}-${col.key}`} className={`text-zinc-300 ${col.className || ''}`}>
                                            {col.render ? col.render(row[col.key], row) : (
                                                col.type === 'currency' ?
                                                    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(row[col.key]) :
                                                    col.type === 'date' ?
                                                        (row[col.key] ? new Date(row[col.key]).toLocaleDateString('de-DE') : '-') :
                                                        col.type === 'boolean' ?
                                                            (row[col.key] ? 'Ja' : 'Nein') :
                                                            row[col.key]
                                            )}
                                        </TableCell>
                                    ))}

                                    {/* Actions */}
                                    {actions.length > 0 && (
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                                        <span className="sr-only">Menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                                                    {actions.map((action, idx) => (
                                                        <DropdownMenuItem
                                                            key={idx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                action.onClick(row);
                                                            }}
                                                            className={`cursor-pointer focus:bg-zinc-800 ${action.variant === 'destructive' ? 'text-red-400 focus:text-red-400' : ''}`}
                                                        >
                                                            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                                                            {action.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </motion.tr>
                            ))
                        )}
                    </TableBody >
                </Table >
            </div >

            {/* Pagination */}
            < div className="flex items-center justify-between px-2" >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="text-zinc-400 hover:text-white disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Zurück
                </Button>
                <div className="text-zinc-500 text-sm">
                    Seite {page} von {totalPages}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="text-zinc-400 hover:text-white disabled:opacity-50"
                >
                    Weiter
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div >
        </div >
    );
}
