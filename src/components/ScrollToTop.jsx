import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Scroll to Top Button
 * Appears when user scrolls down the page
 */
export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button when user scrolls down 400px
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 20 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 right-6 w-12 h-12 bg-zinc-900 border-2 border-zinc-800 rounded-full shadow-2xl flex items-center justify-center z-50 group hover:border-[#D6B25E] transition-colors"
                    title="Nach oben scrollen"
                >
                    <ArrowUp className="w-5 h-5 text-zinc-400 group-hover:text-[#D6B25E] transition-colors" />
                    <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D6B25E] to-[#F5D98B] opacity-0 group-hover:opacity-20 transition-opacity"
                        animate={{
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
