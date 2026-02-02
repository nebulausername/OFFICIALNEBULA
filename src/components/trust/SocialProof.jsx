import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin } from 'lucide-react';

const NAMES = ['Alex', 'Sarah', 'Michael', 'Lisa', 'Kevin', 'David', 'Julia', 'Tom'];
const CITIES = ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig'];
const PRODUCTS = [
    'Al Massiva Blaulicht',
    'Holster Ice Kaktuz',
    'Steamulation Ultimate',
    'Aeon Vyro One',
    '187 Hamburg Haze',
    'Moze Breeze Two',
    'O\'s Tobacco African Queen'
];

export default function SocialProof() {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Initial delay
        const initialTimeout = setTimeout(triggerNotification, 5000);

        // Recursive loop with random intervals
        function triggerNotification() {
            const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
            const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
            const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
            const minutesAgo = Math.floor(Math.random() * 5) + 1;

            setNotification({
                name: randomName,
                city: randomCity,
                product: randomProduct,
                time: `${minutesAgo} min`
            });

            // Hide after 4 seconds
            setTimeout(() => {
                setNotification(null);
                // Schedule next one in 10-20 seconds
                const nextDelay = Math.random() * 10000 + 10000;
                setTimeout(triggerNotification, nextDelay);
            }, 5000);
        }

        return () => clearTimeout(initialTimeout);
    }, []);

    return (
        <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, x: -50, y: 20 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9 }}
                        className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl shadow-black/50 flex items-center gap-4 max-w-sm pointer-events-auto"
                    >
                        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30 shrink-0">
                            <ShoppingBag className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">
                                <span className="font-bold text-gold">{notification.name}</span> aus {notification.city}
                            </p>
                            <p className="text-zinc-400 text-xs">
                                kauft gerade <span className="text-white">{notification.product}</span>
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> vor {notification.time}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
