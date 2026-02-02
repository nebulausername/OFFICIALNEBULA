import React from 'react';
import CategoryCard from './CategoryCard';
import { motion } from 'framer-motion';

export default function BentoGrid({ departments, productCounts, departmentImages, departmentProducts }) {
    // Helper to determine image (fallback logic)
    const getFallbackImage = (dept) => {
        const name = dept.name.toLowerCase();
        if (name.includes('shisha') || name.includes('hookah') || name.includes('pfeife')) {
            return 'https://images.unsplash.com/photo-1517156943265-4f3b8b10f546?q=80&w=2070&auto=format&fit=crop';
        } else if (name.includes('vape') || name.includes('dampf') || name.includes('e-zigarette')) {
            return 'https://images.unsplash.com/photo-1610444583167-b844c205739c?q=80&w=2070&auto=format&fit=crop';
        } else if (name.includes('tabak') || name.includes('tobacco')) {
            return 'https://images.unsplash.com/photo-1629731633512-680c4314da5e?q=80&w=2070&auto=format&fit=crop';
        } else if (name.includes('kohle') || name.includes('coal')) {
            return 'https://images.unsplash.com/photo-1622323758558-8d0090887e5b?q=80&w=2070&auto=format&fit=crop';
        } else if (name.includes('zubehör') || name.includes('accessories')) {
            return 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070&auto=format&fit=crop';
        }
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop';
    };

    const getDepartmentImage = (dept) => {
        // 1. Try real product image from props
        if (departmentImages && departmentImages[dept.id]) {
            return departmentImages[dept.id];
        }
        // 2. Fallback
        return getFallbackImage(dept);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
            {departments.map((dept, i) => {
                // Bento Logic: First item is large, changes based on index
                const isLarge = i === 0 || i === 5;
                const isWide = i === 3;

                let gridClass = "";
                if (isLarge) gridClass = "md:col-span-2 md:row-span-2";
                else if (isWide) gridClass = "md:col-span-2";
                else gridClass = "md:col-span-1";

                return (
                    <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className={`h-full ${gridClass}`}
                        onMouseMove={(e) => {
                            const { left, top } = e.currentTarget.getBoundingClientRect();
                            e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - left}px`);
                            e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - top}px`);
                        }}
                    >
                        <CategoryCard
                            department={dept}
                            index={i}
                            productCount={productCounts[dept.id] || 0}
                            image={getDepartmentImage(dept)}
                            products={departmentProducts ? departmentProducts[dept.id] : []}
                            featured={isLarge}
                            className="h-full"
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}
