import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

export default function DataTable({
    columns,
    data,
    searchKey = "name",
    searchPlaceholder = "Suchen...",
    onSearch,
    filters = [],
    actions = []
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const itemsPerPage = 10;

    // Search & Filter
    const filteredData = data.filter(item => {
        // Basic string search
        const matchesSearch = String(item[searchKey] || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }).sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-9 bg-zinc-950 border-zinc-800 focus:border-purple-500 rounded-lg"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                            onSearch?.(e.target.value);
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {filters.map((filter, idx) => (
                        <Button key={idx} variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900">
                            <Filter className="w-4 h-4 mr-2" />
                            {filter.label}
                        </Button>
                    ))}
                    <Button variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/30 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-medium border-b border-zinc-800">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                                        onClick={() => col.sortable && handleSort(col.accessorKey)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.header}
                                            {col.sortable && <ArrowUpDown className="w-3 h-3" />}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {currentData.length > 0 ? (
                                currentData.map((row, rIdx) => (
                                    <motion.tr
                                        key={row.id || rIdx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: rIdx * 0.05 }}
                                        className="hover:bg-zinc-900/50 transition-colors"
                                    >
                                        {columns.map((col, cIdx) => (
                                            <td key={cIdx} className="px-6 py-4 text-zinc-300">
                                                {col.cell ? col.cell(row) : row[col.accessorKey]}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                                        <span className="sr-only">Menü öffnen</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                                    <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                                    {actions.map((action, aIdx) => (
                                                        <DropdownMenuItem
                                                            key={aIdx}
                                                            onClick={() => action.onClick(row)}
                                                            className="hover:bg-zinc-900 cursor-pointer focus:bg-zinc-900 focus:text-white"
                                                        >
                                                            {action.icon && <action.icon className="w-4 h-4 mr-2 text-zinc-400" />}
                                                            {action.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-zinc-500">
                                        Keine Daten gefunden.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-zinc-500">
                    Zeige <span className="font-bold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> bis <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> von <span className="font-bold text-white">{filteredData.length}</span> Einträgen
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-sm font-bold text-zinc-300">
                        Seite {currentPage} von {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
