import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { ArrowLeft, User, Moon, Sun, Mail, Shield, Calendar, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import GlassCard from '../components/settings/GlassCard';
import ProfileFormCard from '../components/settings/ProfileFormCard';
import InfoRowCard from '../components/settings/InfoRowCard';
import WishlistCard from '../components/settings/WishlistCard';
import SupportCard from '../components/settings/SupportCard';
import NotificationsCard from '../components/settings/NotificationsCard';

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [theme, setTheme] = useState('dark');
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
    const savedTheme = localStorage.getItem('nebula-theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      toast({
        title: 'Fehler',
        description: 'Benutzerdaten konnten nicht geladen werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newName) => {
    setSaving(true);
    try {
      await api.auth.updateMe({ full_name: newName });
      setUser({ ...user, full_name: newName });
      toast({
        title: '✓ Gespeichert',
        description: 'Deine Änderungen wurden übernommen',
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: 'Fehler',
        description: 'Speichern fehlgeschlagen – bitte erneut versuchen',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('nebula-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50"
        >
          <User className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12] relative overflow-hidden">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
        }}
      />

      {/* Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sticky Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/[0.06]"
      >
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link
            to={createPageUrl('Profile')}
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">Zurück</span>
          </Link>

          <h2 className="absolute left-1/2 -translate-x-1/2 text-white font-black text-base">
            Konto
          </h2>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-10 h-10 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl flex items-center justify-center transition-all"
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-zinc-300" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-purple-500/40"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-2 leading-tight">
                Konto Einstellungen
              </h1>
              <p className="text-zinc-400 text-sm font-medium">
                Verwalte deine persönlichen Daten
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <AnimatePresence>
            {!hasChanges && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-green-400 text-sm font-semibold"
              >
                <Check className="w-4 h-4" />
                Gespeichert
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Form Card */}
        <div className="space-y-4 mb-8">
          <ProfileFormCard
            fullName={user?.full_name}
            onSave={handleSave}
            loading={saving}
          />
        </div>

        {/* Info Section */}
        <div className="space-y-4 mb-8">
          <InfoRowCard
            icon={Mail}
            label="E-Mail"
            value={user?.email || '-'}
            copiable
            iconColor="from-blue-500 to-cyan-500"
          />
          
          <InfoRowCard
            icon={Shield}
            label="Rolle"
            value={user?.role === 'admin' ? 'Admin' : 'Benutzer'}
            badge
            iconColor="from-purple-500 to-pink-500"
          />
          
          <InfoRowCard
            icon={Calendar}
            label="Mitglied seit"
            value={user?.created_date ? format(new Date(user.created_date), 'dd. MMMM yyyy', { locale: de }) : '-'}
            iconColor="from-green-500 to-emerald-500"
          />
        </div>

        {/* Features Section */}
        <div className="space-y-4 mb-8">
          <WishlistCard />
          <SupportCard unreadCount={0} />
        </div>

        {/* Notifications */}
        <NotificationsCard />
      </div>
    </div>
  );
}