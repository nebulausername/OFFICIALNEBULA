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
import { motion } from 'framer-motion';

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
            {/* Toolbar - Modern Glass */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl">
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-amber-400 transition-colors w-4 h-4" />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-10 bg-black/40 border-white/10 focus:border-amber-500/50 rounded-xl h-10 transition-all"
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
                        <Button key={idx} variant="outline" className="border-white/10 bg-black/20 text-zinc-300 hover:text-white hover:bg-white/5 hover:border-amber-500/30">
                            <Filter className="w-4 h-4 mr-2" />
                            {filter.label}
                        </Button>
                    ))}
                    <Button variant="outline" className="border-white/10 bg-black/20 text-zinc-300 hover:text-white hover:bg-white/5">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Table - Premium Layout */}
            <div className="rounded-2xl border border-white/5 overflow-hidden bg-zinc-900/30 backdrop-blur-md shadow-inner">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-black/40 text-zinc-400 uppercase font-bold text-xs border-b border-white/5">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className="px-6 py-4 cursor-pointer hover:text-amber-400 transition-colors"
                                        onClick={() => col.sortable && handleSort(col.accessorKey)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {col.header}
                                            {col.sortable && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-right">Optionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentData.length > 0 ? (
                                currentData.map((row, rIdx) => (
                                    <motion.tr
                                        key={row.id || rIdx}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: rIdx * 0.03 }}
                                        className="group hover:bg-white/[0.02] transition-colors"
                                    >
                                        {columns.map((col, cIdx) => (
                                            <td key={cIdx} className="px-6 py-4 text-zinc-300 font-medium group-hover:text-zinc-100 transition-colors">
                                                {col.cell ? col.cell(row) : row[col.accessorKey]}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg">
                                                        <span className="sr-only">Menü öffnen</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl">
                                                    <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    {actions.map((action, aIdx) => (
                                                        <DropdownMenuItem
                                                            key={aIdx}
                                                            onClick={() => action.onClick(row)}
                                                            className="hover:bg-zinc-900 cursor-pointer focus:bg-zinc-900 focus:text-amber-400 transition-colors"
                                                        >
                                                            {action.icon && <action.icon className="w-4 h-4 mr-2 opacity-70" />}
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
                                    <td colSpan={columns.length + 1} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-zinc-500">
                                            <Search className="w-10 h-10 opacity-20" />
                                            <p>Keine Einträge gefunden</p>
                                        </div>
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
                    <span className="text-zinc-300 font-bold">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> von <span className="text-zinc-300 font-bold">{filteredData.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-amber-500/50 disabled:opacity-30 rounded-lg transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-sm font-bold text-zinc-300 min-w-[3rem] text-center">
                        {currentPage} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-amber-500/50 disabled:opacity-30 rounded-lg transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
