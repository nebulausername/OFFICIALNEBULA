import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function TypewriterEffect({ words, className, cursorClassName }) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Speed settings
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const delayBetweenWords = 2000;

    useEffect(() => {
        const word = words[currentWordIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                setCurrentText(word.substring(0, currentText.length + 1));

                // Finished typing word
                if (currentText.length === word.length) {
                    setTimeout(() => setIsDeleting(true), delayBetweenWords);
                }
            } else {
                // Deleting
                setCurrentText(word.substring(0, currentText.length - 1));

                // Finished deleting
                if (currentText.length === 0) {
                    setIsDeleting(false);
                    setCurrentWordIndex((prev) => (prev + 1) % words.length);
                }
            }
        }, isDeleting ? deleteSpeed : typeSpeed);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentWordIndex, words]);

    return (
        <span className={cn("inline-flex items-center", className)}>
            {currentText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className={cn("inline-block w-[3px] h-[1em] bg-current ml-1 align-middle", cursorClassName)}
            />
        </span>
    );
}
