import React from 'react';

export const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
);

export const ProductCardSkeleton = () => {
    return (
        <div className="flex flex-col h-full bg-[#0E1015]/50 rounded-2xl overflow-hidden border border-white/5">
            {/* Image Area - Aspect 4:5 */}
            <div className="relative aspect-[4/5] w-full bg-white/5">
                <Shimmer />
                <div className="absolute top-3 left-3 w-12 h-5 rounded bg-white/5" />
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5" />
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow gap-3">
                <div className="h-5 w-3/4 bg-white/5 rounded relative overflow-hidden">
                    <Shimmer />
                </div>
                <div className="h-4 w-1/4 bg-white/5 rounded relative overflow-hidden" />

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="h-6 w-20 bg-white/5 rounded relative overflow-hidden">
                        <Shimmer />
                    </div>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-white/5" />
                        <div className="w-3 h-3 rounded-full bg-white/5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CategoryTileSkeleton = () => {
    return (
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#0E1015]/50 border border-white/5">
            <Shimmer />
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="space-y-2">
                    <div className="h-6 w-1/2 bg-white/5 rounded" />
                    <div className="h-4 w-1/3 bg-white/5 rounded" />
                </div>
            </div>
        </div>
    );
};
