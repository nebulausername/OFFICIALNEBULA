import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronRight, Sparkles, Star, Package, Shirt, Watch, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';

const categoryIcons = {
  'Schuhe': Package,
  'Kleidung': Shirt,
  'Accessoires': Watch,
  'Taschen': ShoppingBag,
  'default': Star
};

export default function ShopCategoriesDrawer({ isOpen, onClose, onBack, departments = [], categories = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  const drawerRef = useRef(null);

  const filteredCategories = categories.filter(cat => {
    if (searchQuery) {
      return cat.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (selectedDept) {
      return cat.department_id === selectedDept;
    }
    return true;
  });

  const getCategoryCount = (deptId) => {
    return categories.filter(c => c.department_id === deptId).length;
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedDept(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
          />

          {/* Drawer - Desktop: Right Side, Mobile: Bottom Sheet */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-50 flex flex-col"
            style={{
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border)'
            }}
          >
            {/* Header - Sticky */}
            <div className="flex-shrink-0 p-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              {/* Top Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-white/5"
                    >
                      <ChevronRight className="w-6 h-6 rotate-180" style={{ color: 'var(--text)' }} />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold2))' }}>
                    <Sparkles className="w-5 h-5" style={{ color: '#0B0D12' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>Kategorien</h2>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Durchsuche unser Sortiment</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted)' }} />
                <Input
                  type="text"
                  placeholder="Kategorie oder Marke suchen…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-12 text-base font-medium rounded-xl"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)'
                  }}
                />
              </div>

              {/* Department Chips - Horizontal Scroll */}
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollSnapType: 'x mandatory' }}>
                  <button
                    onClick={() => setSelectedDept(null)}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0"
                    style={{
                      scrollSnapAlign: 'start',
                      background: !selectedDept ? 'rgba(214, 178, 94, 0.15)' : 'var(--surface)',
                      border: !selectedDept ? '1px solid var(--gold)' : '1px solid var(--border)',
                      color: !selectedDept ? 'var(--gold)' : 'var(--text-secondary)'
                    }}
                  >
                    Alle
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDept(dept.id)}
                      className="px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0"
                      style={{
                        scrollSnapAlign: 'start',
                        background: selectedDept === dept.id ? 'rgba(214, 178, 94, 0.15)' : 'var(--surface)',
                        border: selectedDept === dept.id ? '1px solid var(--gold)' : '1px solid var(--border)',
                        color: selectedDept === dept.id ? 'var(--gold)' : 'var(--text-secondary)'
                      }}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
                {/* Fade edges */}
                <div className="absolute right-0 top-0 bottom-1 w-8 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} />
              </div>
            </div>

            {/* Categories List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                    <Search className="w-7 h-7" style={{ color: 'var(--muted)' }} />
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>Keine Kategorien gefunden</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Versuche einen anderen Suchbegriff</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Show Departments if no filter */}
                  {!selectedDept && !searchQuery && departments.map((dept) => {
                    const Icon = categoryIcons[dept.name] || categoryIcons.default;
                    const count = getCategoryCount(dept.id);

                    return (
                      <motion.button
                        key={dept.id}
                        whileHover={{ scale: 0.99 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedDept(dept.id)}
                        className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left"
                        style={{
                          background: 'var(--bg2)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, rgba(214, 178, 94, 0.15), rgba(214, 178, 94, 0.05))' }}>
                          <Icon className="w-6 h-6" style={{ color: 'var(--gold)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold truncate" style={{ color: 'var(--text)' }}>{dept.name}</h3>
                          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{count} Kategorien</p>
                        </div>
                        <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--muted)' }} />
                      </motion.button>
                    );
                  })}

                  {/* Show Categories if filtered */}
                  {(selectedDept || searchQuery) && filteredCategories.map((cat) => {
                    const Icon = categoryIcons[cat.name] || categoryIcons.default;

                    return (
                      <Link
                        key={cat.id}
                        to={createPageUrl('Products') + `?category=${cat.id}`}
                        onClick={handleClose}
                      >
                        <motion.div
                          whileHover={{ scale: 0.99 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all"
                          style={{
                            background: 'var(--bg2)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--surface)' }}>
                            <Icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold truncate" style={{ color: 'var(--text)' }}>{cat.name}</h3>
                          </div>
                          <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--muted)' }} />
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Link to={createPageUrl('Products')} onClick={handleClose}>
                <button
                  className="w-full h-14 rounded-xl font-bold text-base transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                    color: '#0B0D12',
                    boxShadow: '0 4px 20px rgba(214, 178, 94, 0.3)'
                  }}
                >
                  Alle Produkte anzeigen
                </button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}