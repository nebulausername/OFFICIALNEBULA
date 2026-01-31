import React from 'react';
import CategoryCard from './CategoryCard';
import { motion } from 'framer-motion';

export default function BentoGrid({ departments, productCounts }) {
    // Helper to determine image (logic from old Home.jsx, moved here for cleaner code)
    const getDepartmentImage = (dept) => {
        const name = dept.name.toLowerCase();
        if (name.includes('shisha') || name.includes('hookah')) {
            return '/images/product-hookah.png';
        } else if (name.includes('vape') || name.includes('e-zigarette')) {
            return 'https://images.unsplash.com/photo-1536412597336-ade7b523ecfc?q=80&w=1587&auto=format&fit=crop';
        } else if (name.includes('tabak') || name.includes('tobacco')) {
            return 'https://cdn03.plentymarkets.com/b2nt0o88r126/frontend/Kategorien/Tabak-Kategoriebild.jpg';
        } else if (name.includes('kohle') || name.includes('coal')) {
            return 'https://cdn03.plentymarkets.com/b2nt0o88r126/frontend/Kategorien/Kohle-Kategoriebild.jpg';
        } else if (name.includes('zubehör') || name.includes('accessories')) {
            return 'https://images.unsplash.com/photo-1523293182086-7651a899d60f?q=80&w=2068&auto=format&fit=crop';
        }
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop';
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
                            featured={isLarge}
                            className="h-full"
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}
