import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from './WishlistContext';
import { useToast } from '@/components/ui/use-toast';

export default function WishlistButton({ productId, size = 'md', variant = 'default' }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [pending, setPending] = useState(false);
  const { toast } = useToast();
  const isSaved = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (pending) return;
    
    setPending(true);
    const result = await toggleWishlist(productId);
    setPending(false);

    if (result.success) {
      toast({
        title: result.saved ? '❤️ Zur Merkliste hinzugefügt' : 'Von Merkliste entfernt',
        duration: 2000
      });
    } else {
      toast({
        title: 'Fehler',
        description: 'Aktion fehlgeschlagen',
        variant: 'destructive'
      });
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const variantClasses = {
    default: 'bg-white/90 hover:bg-white text-zinc-700 hover:text-red-500',
    ghost: 'bg-transparent hover:bg-white/10 text-white'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      disabled={pending}
      className={`${sizeClasses[size]} ${variantClasses[variant]} backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isSaved ? 'Von Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
    >
      <Heart 
        className={`${iconSizes[size]} transition-all ${isSaved ? 'fill-red-500 text-red-500' : ''}`}
      />
    </motion.button>
  );
}