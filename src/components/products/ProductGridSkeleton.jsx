import React from 'react';

const SkeletonPulse = ({ className }) => (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

export default function ProductGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                    {/* Image Aspect Ratio */}
                    <div className="aspect-square w-full relative overflow-hidden rounded-[2rem] bg-white/5">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3 px-2">
                        {/* Title */}
                        <SkeletonPulse className="h-6 w-3/4" />

                        {/* Price & Badge */}
                        <div className="flex justify-between items-center">
                            <SkeletonPulse className="h-5 w-20" />
                            <SkeletonPulse className="h-8 w-8 rounded-full" />
                        </div>

                        {/* Tags */}
                        <div className="flex gap-2">
                            <SkeletonPulse className="h-4 w-12 rounded-full" />
                            <SkeletonPulse className="h-4 w-16 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
