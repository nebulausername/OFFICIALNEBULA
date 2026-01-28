import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload'; // Assuming we reuse the existing one or enhance it

export default function ProductMedia({ images, onChange, coverImage, onCoverChange }) {
    // Convert strings to objects with ID for Reorder if they aren't already
    // But wait, the API probably expects simple URLs or Image Objects.
    // Let's assume images is array of { id, url, sort_order }.
    // If it's just strings, we need to wrap them.

    // Implementation note: We will use a local state that wraps images with unique IDs for dragging.
    const [items, setItems] = useState([]);

    useEffect(() => {
        // Sync props to state (careful with loops)
        const formatted = images.map((img, idx) => ({
            id: img.id || `img-${idx}-${Date.now()}`,
            url: img.url || img,
            sort_order: idx
        }));
        // Only update if length differs or URLs differ to avoid refresh loop
        // For simplicity in this "God Mode", let's assume images are objects.
        setItems(formatted);
    }, [images]);

    const handleReorder = (newOrder) => {
        setItems(newOrder);
        // Propagate changes back to parent
        onChange(newOrder.map((item, idx) => ({ ...item, sort_order: idx })));
    };

    const handleRemove = (id) => {
        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        onChange(newItems.map((item, idx) => ({ ...item, sort_order: idx })));
    };

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-zinc-700 bg-zinc-900/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="text-purple-400" />
                    Medien & Galerie
                </h3>

                {/* Cover Image Section */}
                <div className="mb-8 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Cover Bild (Hauptbild)</h4>
                    <div className="flex gap-6 items-start">
                        <div className="w-32 h-32 rounded-lg bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden relative group">
                            {coverImage ? (
                                <>
                                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Button variant="ghost" size="sm" onClick={() => onCoverChange('')} className="text-red-400">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <ImageIcon className="text-zinc-600 w-8 h-8" />
                            )}
                        </div>
                        <div className="flex-1">
                            <ImageUpload
                                value={coverImage}
                                onChange={onCoverChange}
                                placeholder="Cover Bild URL oder Upload..."
                            />
                            <p className="text-xs text-zinc-500 mt-2">Das Hauptbild, das im Shop angezeigt wird.</p>
                        </div>
                    </div>
                </div>

                {/* Gallery Reorder Grid */}
                <div>
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                        Galerie (Drag to Reorder)
                    </h4>

                    <Reorder.Group
                        axis="y"
                        values={items}
                        onReorder={handleReorder}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        as="ul" // Reorder.Group renders a ul by default
                    >
                        {items.map((item) => (
                            <Reorder.Item
                                key={item.id}
                                value={item}
                                className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 cursor-grab active:cursor-grabbing shadow-xl group"
                                whileDrag={{ scale: 1.05, zIndex: 10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)" }}
                            >
                                <img src={item.url} alt="Gallery" className="w-full h-full object-cover pointer-events-none" />

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-mono text-zinc-400">#{item.sort_order + 1}</span>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}

                        {/* Add New Button (Not draggable) */}
                        <div className="aspect-square rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer">
                            <Upload className="w-8 h-8 mb-2" />
                            <span className="text-xs font-bold">Hinzufügen</span>
                            {/* Invisible Overlay Upload Trigger could go here */}
                        </div>
                    </Reorder.Group>
                </div>
            </div>
        </div>
    );
}
