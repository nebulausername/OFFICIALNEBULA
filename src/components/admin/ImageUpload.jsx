import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/api';

export default function ImageUpload({ value, onChange, className }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files[0]) {
            await handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;

        // Validate type
        if (!file.type.startsWith('image/')) {
            // TODO: Add toast error here
            console.error('Only images supported');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'products');

            // Assuming we have a general upload endpoint. 
            // If not, we might need to use the supabase client directly or a specific endpoint.
            // Based on previous context, user has backend/src/routes/upload.routes.js

            const response = await apiClient.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Note: axios/fetch typically handles boundary automatically if we pass FormData, 
                    // but our api wrapper might need care.
                }
            });

            // Adjust based on actual API response structure
            const url = response.url || response.data?.url;

            if (url) {
                onChange(url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={cn("relative group", className)}>
            <AnimatePresence mode="wait">
                {value ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-purple-500/30 bg-zinc-900/50"
                    >
                        <img
                            src={value}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={handleRemove}
                                className="rounded-full w-12 h-12"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "relative aspect-video w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                            isDragOver
                                ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
                                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-800",
                            uploading && "pointer-events-none opacity-80"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />

                        {uploading ? (
                            <div className="flex flex-col items-center gap-3 text-purple-400 animate-pulse">
                                <Loader2 className="w-10 h-10 animate-spin" />
                                <span className="font-bold text-sm">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-purple-500/50 group-hover:scale-110 transition-all">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-purple-400">Klicken</span> oder Bild hierhin ziehen
                                </div>
                                <div className="text-xs text-zinc-500">
                                    JPG, PNG, WEBP bis 5MB
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
