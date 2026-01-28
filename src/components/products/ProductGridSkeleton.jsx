import React from 'react';

const SkeletonPulse = ({ className }) => (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export default function ProductGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col rounded-2xl overflow-hidden border border-white/5 bg-[#09090b]"
                    style={{
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                >
                    {/* Image Aspect Ratio with Shimmer */}
                    <div className="aspect-square w-full relative overflow-hidden bg-zinc-900 border-b border-white/5">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        <div className="absolute top-3 end-3 w-16 h-8 rounded-full bg-white/5" />
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                        {/* Title lines */}
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 bg-white/5 rounded relative overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                            <div className="h-4 w-1/2 bg-white/5 rounded relative overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                        </div>

                        {/* Price & SKU */}
                        <div className="flex justify-between items-end pt-2">
                            <div className="h-8 w-24 bg-white/5 rounded-lg relative overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                            <div className="h-6 w-16 bg-white/5 rounded-md relative overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
