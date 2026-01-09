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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center glow-effect">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Admin Dashboard
            </h1>
            <p className="text-zinc-400 text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Willkommen zurück, <span className="text-purple-400 font-semibold">{user.full_name}</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {adminSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Link key={section.title} to={createPageUrl(section.link)}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative overflow-hidden glass border border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {section.count}
                    </span>
                  </div>
                  <h3 className="text-white font-bold mb-1 text-lg">{section.title}</h3>
                  <p className="text-zinc-400 text-sm">{section.description}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={createPageUrl('AdminProducts') + '?action=new'}>
            <Button className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-lg">
              <Plus className="w-5 h-5 mr-2" />
              Neues Produkt
            </Button>
          </Link>
          <Link to={createPageUrl('AdminCategories') + '?action=new'}>
            <Button className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 text-lg">
              <Plus className="w-5 h-5 mr-2" />
              Neue Kategorie
            </Button>
          </Link>
          <Link to={createPageUrl('AdminBrands') + '?action=new'}>
            <Button className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 text-lg">
              <Plus className="w-5 h-5 mr-2" />
              Neue Marke
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}