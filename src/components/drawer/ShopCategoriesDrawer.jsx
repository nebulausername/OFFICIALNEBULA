import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ShopCategoriesDrawer({ isOpen, onClose, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

          {/* Nested Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="fixed top-0 right-0 bottom-0 w-[92%] max-w-lg z-[70] overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.98), rgba(8, 8, 12, 0.98))',
              backdropFilter: 'blur(50px)',
              borderLeft: '2px solid rgba(214, 178, 94, 0.3)'
            }}
          >
            {/* Header */}
            <div className="relative p-5 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <motion.button
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="flex items-center gap-2 text-gold hover:text-gold2 transition-colors font-black"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Menü</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              <h2 className="text-3xl font-black text-gradient-gold mb-4">Kategorien</h2>

              {/* Search */}
              {!selectedCategory && (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold z-10" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Kategorie suchen..."
                    className="w-full h-12 pl-12 pr-4 glass-panel text-white placeholder:text-zinc-500 border-gold/20 rounded-xl font-bold"
                  />
                </div>
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
                        whileHover={{ x: 8, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedCategory(cat)}
                        className="w-full min-h-[84px] p-5 glass-panel-hover rounded-3xl transition-all flex items-center justify-between group"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '2px solid rgba(214, 178, 94, 0.2)'
                        }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-[0.2] transition-opacity rounded-3xl`} />
                        
                        <div className="flex items-center gap-5 relative z-10">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-3xl shadow-2xl`}>
                            <span className="drop-shadow-2xl">{cat.icon}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-black text-white text-xl mb-1 group-hover:text-gold2 transition-colors">{cat.label}</div>
                            <div className="text-sm font-bold text-gold">{cat.children.length} Kategorien</div>
                          </div>
                        </div>

                        <ChevronRight className="w-7 h-7 text-gold group-hover:text-gold2 transition-colors relative z-10" strokeWidth={3} />
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
                    <div className="px-4 py-4 border-b border-white/10">
                      <motion.button
                        whileHover={{ x: -4 }}
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-gold hover:text-gold2 font-black mb-3"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Zurück
                      </motion.button>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedCategory.icon}</span>
                        <h3 className="text-2xl font-black text-gradient-gold">{selectedCategory.label}</h3>
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
                            <div className="text-sm font-black uppercase tracking-widest mb-4 mt-6 px-2 text-gold2">{sub.label}</div>
                            {sub.children.map((item, i) => (
                              <motion.button
                                key={item}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                whileHover={{ x: 8, scale: 1.03 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleSubcategoryClick(selectedCategory.id, item)}
                                className="w-full min-h-[64px] p-5 mb-2 glass-panel-hover rounded-2xl text-left group"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid rgba(214, 178, 94, 0.15)'
                                }}
                              >
                                <div className={`absolute inset-0 bg-gradient-to-r ${selectedCategory.gradient} opacity-0 group-hover:opacity-[0.15] transition-opacity rounded-2xl`} />
                                <span className="relative font-black text-white text-lg group-hover:text-gold2 transition-colors">{item}</span>
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