import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '@/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ImageUpload({
    value,
    onChange,
    className,
    multiple = false,
    maxFiles = 5
}) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedUrls = [];

        try {
            // Upload files sequentially to ensure order or handle errors individually
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Validate
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} ist kein Bild`);
                    continue;
                }

                if (file.size > 5 * 1024 * 1024) { // 5MB
                    toast.error(`${file.name} ist zu groß (Max 5MB)`);
                    continue;
                }

                try {
                    const { file_url } = await api.integrations.uploadFile({ file });
                    // Ensure we get a full URL if it's relative
                    const fullUrl = file_url.startsWith('http')
                        ? file_url
                        : `${api.API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${file_url}`;

                    uploadedUrls.push(fullUrl);
                } catch (err) {
                    console.error('Upload failed for file:', file.name, err);
                    toast.error(`Upload fehlgeschlagen für ${file.name}`);
                }
            }

            if (uploadedUrls.length > 0) {
                if (multiple) {
                    onChange([...(value || []), ...uploadedUrls]);
                } else {
                    onChange(uploadedUrls[0]);
                }
                toast.success(`${uploadedUrls.length} Bild(er) hochgeladen`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload Fehler');
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const removeImage = (indexToRemove) => {
        if (multiple) {
            onChange(value.filter((_, index) => index !== indexToRemove));
        } else {
            onChange('');
        }
    };

    const openFileDialog = () => {
        inputRef.current?.click();
    };

    // Render Logic

    // Single Image Mode
    if (!multiple) {
        return (
            <div className={cn("w-full", className)}>
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />

                {value ? (
                    <div className="relative group rounded-xl overflow-hidden border-2 border-zinc-700 bg-zinc-900 aspect-video">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={openFileDialog}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                                title="Change Image"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => removeImage(0)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full backdrop-blur-sm transition-colors"
                                title="Remove Image"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "relative rounded-xl border-2 border-dashed transition-all aspect-video flex flex-col items-center justify-center cursor-pointer",
                            dragActive
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={openFileDialog}
                    >
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        ) : (
                            <>
                                <div className="p-4 rounded-full bg-zinc-800 mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-purple-400" />
                                </div>
                                <p className="text-sm font-bold text-zinc-300">
                                    Bild hierher ziehen
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    oder klicken zum Hochladen
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Multiple Images Mode
    return (
        <div className={cn("w-full space-y-4", className)}>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleChange}
            />

            {/* Upload Zone */}
            <div
                className={cn(
                    "relative rounded-xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center cursor-pointer",
                    dragActive
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
            >
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                        <p className="text-sm text-zinc-400">Wird hochgeladen...</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 rounded-full bg-zinc-800 mb-3">
                            <Upload className="w-6 h-6 text-zinc-400" />
                        </div>
                        <p className="text-sm font-bold text-zinc-300">
                            Bilder hierher ziehen
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            JPG, PNG, WebP (Max 5MB)
                        </p>
                    </>
                )}
            </div>

            {/* Grid of uploaded images */}
            {value && value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {value.map((url, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 aspect-square">
                            <img
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
