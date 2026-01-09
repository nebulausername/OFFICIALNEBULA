import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  ShoppingBag, 
  Tag, 
  Star,
  Plus,
  Settings,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    requests: 0,
    categories: 0,
    brands: 0
  });

  useEffect(() => {
    checkAdmin();
    loadStats();
  }, []);

  const checkAdmin = async () => {
    try {
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setUser(userData);
    } catch (error) {
      window.location.href = createPageUrl('Home');
    }
  };

  const loadStats = async () => {
    try {
      const [products, requests, categories, brands] = await Promise.all([
        base44.entities.Product.list(),
        base44.entities.Request.list(),
        base44.entities.Category.list(),
        base44.entities.Brand.list()
      ]);

      setStats({
        products: products.length,
        requests: requests.length,
        categories: categories.length,
        brands: brands.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Lädt...</div>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'Produkte',
      icon: Package,
      count: stats.products,
      description: 'Produkte verwalten',
      color: 'from-purple-500 to-pink-500',
      link: 'AdminProducts'
    },
    {
      title: 'Anfragen',
      icon: ShoppingBag,
      count: stats.requests,
      description: 'Kundenanfragen bearbeiten',
      color: 'from-blue-500 to-cyan-500',
      link: 'AdminRequests'
    },
    {
      title: 'Kategorien',
      icon: Tag,
      count: stats.categories,
      description: 'Kategorien & Departments',
      color: 'from-green-500 to-emerald-500',
      link: 'AdminCategories'
    },
    {
      title: 'Marken',
      icon: Star,
      count: stats.brands,
      description: 'Marken verwalten',
      color: 'from-orange-500 to-red-500',
      link: 'AdminBrands'
    }
  ];

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 md:mb-16 text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 blur-3xl -z-10" />
          
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 glow-effect shadow-2xl shadow-red-500/50 relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <Settings className="w-10 h-10 md:w-14 md:h-14 text-white relative z-10" />
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 px-4">
            <span className="bg-gradient-to-r from-red-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-zinc-300 text-base sm:text-lg md:text-xl flex flex-wrap items-center justify-center gap-2 px-4">
            <Sparkles className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>Willkommen zurück, <span className="font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">{user.full_name}</span></span>
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} to={createPageUrl(section.link)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl md:rounded-3xl p-5 md:p-8 cursor-pointer hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/30 transition-all"
                >
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                    animate={{ 
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col gap-4 mb-4">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all`}
                      >
                        <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                      </motion.div>
                      <motion.span 
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        className="text-4xl md:text-5xl font-black bg-gradient-to-br from-red-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
                      >
                        {section.count}
                      </motion.span>
                    </div>
                    <h3 className="text-zinc-100 font-black mb-2 text-base md:text-lg group-hover:text-white transition-colors">{section.title}</h3>
                    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">{section.description}</p>
                  </div>

                  <motion.div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${section.color.includes('purple') ? '#a855f7' : section.color.includes('blue') ? '#3b82f6' : section.color.includes('green') ? '#10b981' : '#f97316'}, transparent)`
                    }}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-3xl p-6 md:p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-pink-500/5 to-purple-500/5" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent">
                Schnellzugriff
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <Link to={createPageUrl('AdminProducts') + '?action=new'}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden"
                >
                  <Button className="w-full h-16 md:h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:shadow-2xl hover:shadow-purple-500/50 text-base md:text-lg font-black rounded-2xl transition-all relative overflow-hidden animate-gradient">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <Plus className="w-6 h-6 mr-2 relative z-10" />
                    <span className="relative z-10">Neues Produkt</span>
                  </Button>
                </motion.div>
              </Link>
              
              <Link to={createPageUrl('AdminCategories') + '?action=new'}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Button className="w-full h-16 md:h-20 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 hover:shadow-2xl hover:shadow-green-500/50 text-base md:text-lg font-black rounded-2xl transition-all animate-gradient">
                    <Plus className="w-6 h-6 mr-2" />
                    Neue Kategorie
                  </Button>
                </motion.div>
              </Link>
              
              <Link to={createPageUrl('AdminBrands') + '?action=new'}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Button className="w-full h-16 md:h-20 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 hover:shadow-2xl hover:shadow-red-500/50 text-base md:text-lg font-black rounded-2xl transition-all animate-gradient">
                    <Plus className="w-6 h-6 mr-2" />
                    Neue Marke
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}