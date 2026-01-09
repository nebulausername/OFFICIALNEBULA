import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Star, Sparkles, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadDepartments();
    loadProducts();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await base44.entities.Department.list('sort_order');
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoadingDepts(false);
    }
  };

  const loadProducts = async () => {
    try {
      const prods = await base44.entities.Product.list('-created_date', 4);
      setProducts(prods);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-100 to-white">
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30">
                <Star className="w-8 h-8 md:w-10 md:h-10 text-white" fill="white" />
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight text-zinc-900">
              Premium Lifestyle
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Exklusiv für dich
              </span>
            </h1>

            <p className="text-base md:text-lg text-zinc-600 mb-8 max-w-xl mx-auto">
              Entdecke die neuesten Trends in Streetwear, Sneaker & Accessoires
            </p>

            <motion.div
              whileTap={{ scale: 0.97 }}
            >
              <Link to={createPageUrl('Products')}>
                <Button className="h-14 px-10 text-base font-black bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl hover:shadow-purple-500/40 rounded-xl text-white">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Jetzt shoppen
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2">
              Kategorien
            </h2>
            <p className="text-zinc-600">Entdecke unsere Produktwelten</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingDepts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-xl" />
              ))
            ) : (
              departments.map((dept, index) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="group"
                >
                  <Link
                    to={createPageUrl('Products') + `?department=${dept.id}`}
                    className="block bg-white border border-zinc-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square flex flex-col items-center justify-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-sm font-black text-center text-zinc-900 group-hover:text-purple-600 transition-colors">
                        {dept.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2">
                Neu eingetroffen
              </h2>
              <p className="text-zinc-600">Die neuesten Highlights</p>
            </div>
            <Link to={createPageUrl('Products')}>
              <Button variant="outline" className="hidden md:flex border-zinc-300 text-zinc-900 hover:border-purple-500 hover:text-purple-600 font-bold">
                Alle →
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {loadingProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="skeleton aspect-square rounded-xl" />
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-6 w-1/2 rounded" />
                </div>
              ))
            ) : (
              products.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to={createPageUrl('ProductDetail') + `?id=${product.id}`}
                    className="group block bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-square overflow-hidden bg-zinc-100">
                      {product.cover_image ? (
                        <img
                          src={product.cover_image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-zinc-300" />
                        </div>
                      )}
                      {product.in_stock ? (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md">
                          Verfügbar
                        </span>
                      ) : (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md">
                          Ausverkauft
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2 text-zinc-900 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="text-xl font-black text-zinc-900">
                        {product.price}€
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center">
            <Link to={createPageUrl('Products')}>
              <Button className="h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg text-base font-black rounded-xl text-white">
                Alle Produkte ansehen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}