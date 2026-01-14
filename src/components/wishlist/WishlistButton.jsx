import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from './WishlistContext';
import { toast } from 'sonner';

export default function WishlistButton({ productId, size = 'md', variant = 'default', showToast = true }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [pending, setPending] = useState(false);
  const [animating, setAnimating] = useState(false);
  const isSaved = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (pending) return;
    
    // Trigger animation
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    
    setPending(true);
    const wasSaved = isSaved;
    const result = await toggleWishlist(productId);
    setPending(false);

    if (result.success && showToast) {
      if (result.saved) {
        toast.success('Zur Merkliste hinzugefügt', {
          description: 'Produkt wurde gespeichert',
          action: {
            label: 'Rückgängig',
            onClick: () => toggleWishlist(productId)
          },
          duration: 4000
        });
      } else {
        toast.success('Von Merkliste entfernt', {
          action: {
            label: 'Rückgängig',
            onClick: () => toggleWishlist(productId)
          },
          duration: 4000
        });
      }
    } else if (!result.success) {
      toast.error('Fehler beim Speichern', {
        description: 'Bitte erneut versuchen'
      });
    }
  };

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getButtonStyle = () => {
    if (isSaved) {
      return {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(214, 178, 94, 0.5)',
        boxShadow: '0 0 20px rgba(214, 178, 94, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)'
      };
    }
    if (variant === 'glass') {
      return {
        background: 'rgba(255, 255, 255, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
      };
    }
    if (variant === 'ghost') {
      return {
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      };
    }
    return {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    };
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      disabled={pending}
      className={`${sizeClasses[size]} relative rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{
        ...getButtonStyle(),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      aria-label={isSaved ? 'Von Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
    >
      {/* Pulse Effect on Toggle */}
      <AnimatePresence>
        {animating && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full"
            style={{ 
              background: isSaved 
                ? 'rgba(239, 68, 68, 0.5)' 
                : 'rgba(255, 255, 255, 0.3)'
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={animating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`${iconSizes[size]} transition-all`}
          style={{ 
            color: isSaved 
              ? '#D6B25E'
              : variant === 'glass' || variant === 'ghost'
                ? 'rgba(255, 255, 255, 0.95)' 
                : 'rgba(80, 80, 80, 0.9)',
            filter: isSaved ? 'drop-shadow(0 0 6px rgba(214, 178, 94, 0.6))' : 'none'
          }}
          fill={isSaved ? 'currentColor' : 'none'}
          strokeWidth={2.5}
        />
      </motion.div>
    </motion.button>
  );
}