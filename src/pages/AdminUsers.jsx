import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import {
  Users,
  Crown,
  Search,
  UserPlus,
  Shield,
  ShoppingBag,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [vipFilter, setVipFilter] = useState('all');

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadUsers();
  }, []);

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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.admin.listUsers({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        is_vip: vipFilter !== 'all' ? vipFilter === 'true' : undefined,
      });
      setUsers(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter, vipFilter]);

  const handleToggleVIP = async (userId, currentVipStatus) => {
    try {
      await api.admin.toggleVIP(userId, { is_vip: !currentVipStatus });
      loadUsers();
    } catch (error) {
      console.error('Error toggling VIP:', error);
    }
  };

  const handleBulkVIP = async (isVip) => {
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          api.admin.toggleVIP(userId, { is_vip: isVip })
        )
      );
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error bulk VIP update:', error);
    }
  };

  const handleOpenHistory = async (user) => {
    setHistoryUser(user);
    setHistoryLoading(true);
    try {
      const orders = await api.entities.Request.filter({ user_id: user.id });
      // Sort by newest first
      orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistoryOrders(orders);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-gold to-gold2 rounded-2xl flex items-center justify-center"
        >
          <Users className="w-8 h-8 text-black" />
        </motion.div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(createPageUrl('Admin'))}
                className="text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                User Verwaltung
              </h1>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Neuer User
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Suche nach Name, Email oder Username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="Rolle" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vipFilter} onValueChange={setVipFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="VIP Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="true">VIP</SelectItem>
                <SelectItem value="false">Nicht VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 p-4 rounded-lg bg-zinc-900 border border-zinc-700"
            >
              <span className="text-white font-semibold">
                {selectedUsers.length} User ausgewählt
              </span>
              <Button
                size="sm"
                onClick={() => handleBulkVIP(true)}
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                VIP aktivieren
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkVIP(false)}
                className="border-zinc-600 text-white"
              >
                VIP deaktivieren
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedUsers([])}
                className="text-white"
              >
                Abbrechen
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-700 text-white text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-xl font-semibold">Keine User gefunden</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-white">{u.full_name || 'Unbekannt'}</div>
                      <div className="text-sm text-zinc-400">{u.email || 'Keine Email'}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, u.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter((id) => id !== u.id));
                      }
                    }}
                    className="w-5 h-5 rounded"
                  />
                </div>

                <div className="space-y-2 mb-4">
                  {u.role === 'admin' && (
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                      <Shield className="w-3 h-3 text-red-400" />
                      <span className="text-xs font-semibold text-red-400">Admin</span>
                    </div>
                  )}
                  {u.is_vip && (
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400">VIP</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => handleOpenHistory(u)}>
                    <ShoppingBag className="w-4 h-4" />
                    <span className="underline decoration-zinc-700 underline-offset-4">{u._count?.requests || 0} Orders</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{u._count?.tickets || 0} Tickets</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVIP(u.id, u.is_vip)}
                    className={`flex-1 border-zinc-600 ${u.is_vip
                      ? 'text-yellow-400 hover:bg-yellow-500/10'
                      : 'text-white hover:bg-zinc-800'
                      }`}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {u.is_vip ? 'VIP entfernen' : 'VIP aktivieren'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* History Dialog */}
      <Dialog open={!!historyUser} onOpenChange={(open) => !open && setHistoryUser(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              Bestellhistorie: {historyUser?.full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {historyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full bg-zinc-900" />
                <Skeleton className="h-12 w-full bg-zinc-900" />
                <Skeleton className="h-12 w-full bg-zinc-900" />
              </div>
            ) : historyOrders.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                Keine Bestellungen gefunden.
              </div>
            ) : (
              <div className="space-y-3">
                {historyOrders.map(order => (
                  <div key={order.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:bg-zinc-900 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-zinc-500">#{order.id.slice(0, 8)}</span>
                        <Badge variant="outline" className={`
                          ${order.status === 'completed' ? 'border-green-500 text-green-400' :
                            order.status === 'cancelled' ? 'border-red-500 text-red-400' :
                              'border-blue-500 text-blue-400'}
                        `}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-zinc-200">
                        {order.item_count || 1} Artikel • {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(order.total_amount || 0)}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {format(new Date(order.created_at), 'dd.MM.yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

