import React from 'react';
import { motion } from 'framer-motion';

const LoginBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-purple-900/20 blur-[120px]"
            />
            <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.15, 0.1] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gold/10 blur-[100px]"
            />
        </div>
    );
};

export default LoginBackground;
