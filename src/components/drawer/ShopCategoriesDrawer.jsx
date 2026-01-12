import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function ShopCategoriesDrawer({ isOpen, onClose, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const categories = [
    { 
      id: 'sneaker', 
      label: 'SNEAKER', 
      icon: '👟',
      gradient: 'from-blue-500 to-cyan-500',
      children: [
        { id: 'nike', label: 'NIKE', children: ['AirMax 95', 'AirMax DN', 'SHOX TL', 'AIR FORCE', 'Dunk SB', 'Cortez', 'Blazer'] },
        { id: 'airjordan', label: 'AIR JORDAN', children: ['AIR JORDAN 1 HIGH', 'AIR JORDAN 1 LOW', 'AIR JORDAN 3', 'AIR JORDAN 4', 'AIR JORDAN 5', 'AIR JORDAN 6', 'AIR JORDAN 11', 'AIR JORDAN 13'] },
        { id: 'adidas', label: 'ADIDAS', children: ['Yeezy Boost 350', 'Yeezy Boost 700', 'Ultraboost', 'Superstar', 'Stan Smith'] },
        { id: 'newbalance', label: 'NEW BALANCE', children: ['550', '574', '990', '2002R', '1906R'] }
      ]
    },
    { 
      id: 'kleidung', 
      label: 'KLEIDUNG', 
      icon: '👕',
      gradient: 'from-purple-500 to-pink-500',
      children: [
        { id: 'tshirts', label: 'T-SHIRTS', children: ['Oversize', 'Slim Fit', 'Regular', 'Vintage'] },
        { id: 'hoodies', label: 'HOODIES & SWEATER', children: ['Hoodies', 'Zip Hoodies', 'Crewneck', 'Sweatshirts'] },
        { id: 'jacken', label: 'JACKEN', children: ['Bomber', 'Denim', 'Puffer', 'Windbreaker'] },
        { id: 'hosen', label: 'HOSEN', children: ['Jeans', 'Jogger', 'Cargo', 'Shorts'] }
      ]
    },
    { 
      id: 'taschen', 
      label: 'TASCHEN', 
      icon: '👜',
      gradient: 'from-amber-500 to-orange-500',
      children: [
        { id: 'rucksaecke', label: 'RUCKSÄCKE', children: ['Backpacks', 'Mini Backpacks', 'Laptop Bags'] },
        { id: 'umhaenge', label: 'UMHÄNGETASCHEN', children: ['Crossbody', 'Messenger', 'Shoulder Bags'] },
        { id: 'luxus', label: 'LUXUS TASCHEN', children: ['Designer', 'Clutch', 'Tote Bags'] }
      ]
    },
    { 
      id: 'muetzen', 
      label: 'MÜTZEN & CAPS', 
      icon: '🧢',
      gradient: 'from-green-500 to-emerald-500',
      children: [
        { id: 'caps', label: 'CAPS', children: ['Baseball Caps', 'Snapbacks', 'Dad Hats', '5-Panel'] },
        { id: 'beanies', label: 'BEANIES', children: ['Classic', 'Slouchy', 'Cuffed'] }
      ]
    },
    { 
      id: 'geldboersen', 
      label: 'GELDBÖRSEN', 
      icon: '💰',
      gradient: 'from-yellow-500 to-amber-500',
      children: [
        { id: 'herren', label: 'HERREN', children: ['Bifold', 'Trifold', 'Kartenhalter', 'Geldbörsen'] },
        { id: 'damen', label: 'DAMEN', children: ['Clutch Wallets', 'Zip Around', 'Kartenhalter'] }
      ]
    },
    { 
      id: 'guertel', 
      label: 'GÜRTEL', 
      icon: '⭕',
      gradient: 'from-red-500 to-pink-500',
      children: [
        { id: 'designer', label: 'DESIGNER', children: ['Gucci', 'Louis Vuitton', 'Hermès', 'Versace'] },
        { id: 'casual', label: 'CASUAL', children: ['Canvas', 'Leder', 'Textil'] }
      ]
    },
    { 
      id: 'highheels', 
      label: 'HIGH HEELS', 
      icon: '👠',
      gradient: 'from-pink-500 to-rose-500',
      children: [
        { id: 'pumps', label: 'PUMPS', children: ['Classic Pumps', 'Pointed Toe', 'Peep Toe'] },
        { id: 'stiefel', label: 'STIEFEL', children: ['Ankle Boots', 'Knee High', 'Thigh High'] },
        { id: 'sandalen', label: 'SANDALEN', children: ['Heeled Sandals', 'Strappy', 'Platform'] }
      ]
    }
  ];

  const filteredCategories = categories.filter(cat => 
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubcategoryClick = (categoryId, subcategory) => {
    onClose();
    window.location.href = `/Products?category=${categoryId}&subcategory=${encodeURIComponent(subcategory)}`;
  };

  const quickChips = [
    { id: 'sneaker', label: 'Sneaker', icon: '👟' },
    { id: 'kleidung', label: 'Kleidung', icon: '👕' },
    { id: 'taschen', label: 'Taschen', icon: '👜' },
    { id: 'jordan', label: 'Air Jordan', icon: '🏀' },
    { id: 'nike', label: 'Nike', icon: '✓' },
    { id: 'neu', label: 'Neu', icon: '✨' }
  ];

  const handleChipClick = (chipId) => {
    setActiveChip(chipId);
    const cat = categories.find(c => c.id === chipId);
    if (cat) {
      setSelectedCategory(cat);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[70]"
          />

          {/* Premium Sheet Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[85%] md:w-[520px] z-[61] overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.98), rgba(5, 5, 8, 0.98))',
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(50px)',
              borderLeft: '1px solid rgba(214, 178, 94, 0.25)',
              boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Premium Header */}
            <div className="relative px-5 py-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      filter: [
                        'drop-shadow(0 0 12px rgba(214, 178, 94, 0.4))',
                        'drop-shadow(0 0 20px rgba(214, 178, 94, 0.6))',
                        'drop-shadow(0 0 12px rgba(214, 178, 94, 0.4))',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-9 h-9 rounded-xl bg-white/5 backdrop-blur-sm border border-gold/20 flex items-center justify-center p-1.5"
                  >
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                      alt="Shop"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <h2 className="text-2xl font-black text-gradient-gold">Kategorien</h2>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <X className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.92)' }} />
                </motion.button>
              </div>

              {/* Premium Search Bar */}
              {!selectedCategory && (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gold z-10" strokeWidth={2.5} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Kategorie oder Marke suchen…"
                      className="w-full h-14 md:h-16 pl-14 pr-14 rounded-2xl text-white placeholder:text-zinc-500 font-bold text-base md:text-lg transition-all focus:outline-none focus:ring-2 focus:ring-gold/40"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(214, 178, 94, 0.2)',
                        boxShadow: 'inset 0 2px 12px rgba(0, 0, 0, 0.3)'
                      }}
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(255, 255, 255, 0.12)' }}
                      >
                        <X className="w-4 h-4 text-white" />
                      </motion.button>
                    )}
                  </div>

                  {/* Quick Chips */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {quickChips.map((chip) => (
                      <motion.button
                        key={chip.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChipClick(chip.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap font-bold text-sm transition-all flex-shrink-0"
                        style={{
                          background: activeChip === chip.id 
                            ? 'rgba(214, 178, 94, 0.15)' 
                            : 'rgba(255, 255, 255, 0.06)',
                          border: activeChip === chip.id 
                            ? '1px solid rgba(214, 178, 94, 0.4)' 
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          color: activeChip === chip.id ? 'var(--gold)' : 'rgba(255, 255, 255, 0.85)'
                        }}
                      >
                        <span className="text-base">{chip.icon}</span>
                        <span>{chip.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {!selectedCategory ? (
                  /* Main Categories */
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 space-y-3"
                  >
                    {filteredCategories.map((cat, index) => (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        whileHover={{ x: 6, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedCategory(cat)}
                        className="w-full min-h-[92px] p-6 rounded-2xl transition-all flex items-center justify-between group relative overflow-hidden"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(214, 178, 94, 0.2)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-[0.12] transition-opacity`} />
                        
                        <div className="flex items-center gap-5 relative z-10">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-3xl shadow-xl`}>
                            <span className="drop-shadow-lg">{cat.icon}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-black text-xl md:text-2xl mb-1.5 group-hover:text-gold2 transition-colors tracking-tight" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
                              {cat.label}
                            </div>
                            <div className="text-sm md:text-base font-bold" style={{ color: 'rgba(214, 178, 94, 0.85)' }}>
                              {cat.children.length} Kategorien
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-6 h-6 text-gold group-hover:text-gold2 transition-colors relative z-10" strokeWidth={2.5} />
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  /* Subcategories */
                  <motion.div
                    key="sub"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col h-full"
                  >
                    {/* Back Button & Title */}
                    <div className="px-5 py-5 border-b border-white/10">
                      <motion.button
                        whileHover={{ x: -4 }}
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-gold hover:text-gold2 font-black mb-4 text-base"
                      >
                        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                        Kategorien
                      </motion.button>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-2xl shadow-lg">
                          {selectedCategory.icon}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-gradient-gold">{selectedCategory.label}</h3>
                      </div>
                    </div>

                    {/* Subcategory List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                      {selectedCategory.children.map((sub, index) => (
                        typeof sub === 'string' ? (
                          <motion.button
                            key={sub}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ x: 8, scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleSubcategoryClick(selectedCategory.id, sub)}
                            className="w-full min-h-[64px] p-5 glass-panel-hover rounded-2xl text-left group"
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(214, 178, 94, 0.15)'
                            }}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r ${selectedCategory.gradient} opacity-0 group-hover:opacity-[0.15] transition-opacity rounded-2xl`} />
                            <span className="relative font-black text-white text-lg group-hover:text-gold2 transition-colors">{sub}</span>
                          </motion.button>
                        ) : (
                          <div key={sub.id}>
                            <div className="text-sm md:text-base font-black uppercase tracking-widest mb-4 mt-6 px-2" style={{ color: 'rgba(214, 178, 94, 0.9)' }}>
                              {sub.label}
                            </div>
                            {sub.children.map((item, i) => (
                              <motion.button
                                key={item}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                whileHover={{ x: 6, scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleSubcategoryClick(selectedCategory.id, item)}
                                className="w-full min-h-[68px] p-5 mb-2 rounded-xl text-left group relative overflow-hidden"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  backdropFilter: 'blur(16px)',
                                  border: '1px solid rgba(214, 178, 94, 0.15)'
                                }}
                              >
                                <div className={`absolute inset-0 bg-gradient-to-r ${selectedCategory.gradient} opacity-0 group-hover:opacity-[0.1] transition-opacity`} />
                                <span className="relative font-black text-lg md:text-xl group-hover:text-gold2 transition-colors tracking-tight" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
                                  {item}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        )
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}