import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowLeft,
  Calendar,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminAnalytics() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [salesData, setSalesData] = useState([]);
  const [categoryRevenue, setCategoryRevenue] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadStats();
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      const [sales, categories, growth, products] = await Promise.all([
        api.admin.getSalesData(timeRange),
        api.admin.getCategoryRevenue(timeRange),
        api.admin.getUserGrowth(timeRange),
        api.admin.getTopProducts(10),
      ]);
      setSalesData(sales);
      setCategoryRevenue(categories);
      setUserGrowth(growth);
      setTopProducts(products);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const checkAdmin = async () => {
    try {
      const userData = await api.auth.me();
      if (userData.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(userData);
    } catch (error) {
      navigate(createPageUrl('Home'));
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-gold to-gold2 rounded-2xl flex items-center justify-center"
        >
          <TrendingUp className="w-8 h-8 text-black" />
        </motion.div>
      </div>
    );
  }

  const revenueData = [
    { name: 'Heute', value: stats.revenue.today },
    { name: 'Woche', value: stats.revenue.week },
    { name: 'Monat', value: stats.revenue.month },
    { name: 'Gesamt', value: stats.revenue.total },
  ];

  const overviewCards = [
    {
      title: 'Gesamtumsatz',
      value: `€${stats.revenue.total.toFixed(2)}`,
      icon: DollarSign,
      trend: '+12.5%',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Bestellungen',
      value: stats.overview.orders,
      icon: ShoppingBag,
      trend: '+8.2%',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Kunden',
      value: stats.overview.users,
      icon: Users,
      trend: '+15.3%',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Produkte',
      value: stats.overview.products,
      icon: Package,
      trend: '+5.1%',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('Admin'))}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Dashboard
            </Button>
            <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Analytics & Statistiken
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-white/70">
                      {card.title}
                    </CardTitle>
                    <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                    <div className="flex items-center text-xs text-green-400">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {card.trend}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="mb-8">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="revenue">Umsatz</TabsTrigger>
            <TabsTrigger value="orders">Bestellungen</TabsTrigger>
            <TabsTrigger value="products">Produkte</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="mt-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Umsatz-Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#D6B25E" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Bestellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-sm text-white/70 mb-1">Ausstehend</div>
                    <div className="text-2xl font-bold text-yellow-400">{stats.overview.pendingOrders}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-sm text-white/70 mb-1">Offene Tickets</div>
                    <div className="text-2xl font-bold text-blue-400">{stats.overview.openTickets}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-sm text-white/70 mb-1">VIP User</div>
                    <div className="text-2xl font-bold text-gold">{stats.overview.vipUsers}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Top Produkte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topProducts && stats.topProducts.length > 0 ? (
                    stats.topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold2 rounded-lg flex items-center justify-center font-bold text-black">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{product.name}</div>
                          <div className="text-sm text-white/70">SKU: {product.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gold">€{parseFloat(product.price).toFixed(2)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-white/70 py-8">Keine Top-Produkte verfügbar</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Orders */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Letzte Bestellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        Bestellung #{order.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-white/70">
                        {order.user?.full_name || 'Unbekannt'} • {new Date(order.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gold">€{parseFloat(order.total_sum).toFixed(2)}</div>
                      <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/70 py-8">Keine Bestellungen verfügbar</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

