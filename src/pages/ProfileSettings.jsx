import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, Shield, ArrowLeft, Save, Sparkles, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: '' });
  const { toast } = useToast();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('nebula-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({ full_name: userData.full_name || '' });
      const saved = localStorage.getItem('nebula-theme') || 'light';
      setTheme(saved);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: formData.full_name });
      toast({
        title: '✓ Gespeichert',
        description: 'Deine Änderungen wurden gespeichert'
      });
      await loadUser();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: 'Fehler',
        description: 'Änderungen konnten nicht gespeichert werden',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          <div className="h-32 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 md:pb-8 transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-gradient-to-br from-zinc-50 to-white'
        : 'bg-gradient-to-br from-zinc-950 to-zinc-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Back Button + Theme */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to={createPageUrl('Profile')}
            className={`inline-flex items-center gap-2 mb-0 transition-colors group ${
              theme === 'light'
                ? 'text-zinc-600 hover:text-zinc-900'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Zurück</span>
          </Link>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-3 rounded-lg transition-colors ${
              theme === 'light'
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                : 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400'
            }`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Konto Einstellungen
              </h1>
              <p className="text-zinc-400 flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Verwalte deine persönlichen Daten
              </p>
            </div>
          </div>
        </motion.div>

        {/* Editable Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-6 md:p-8 mb-6"
        >
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-zinc-100">
            <User className="w-5 h-5 text-purple-400" />
            Persönliche Daten
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-bold text-zinc-300 mb-2 block">Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Dein vollständiger Name"
                className="h-12 bg-zinc-900/50 border-2 border-zinc-700 focus:border-purple-500 transition-all rounded-xl"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-2xl hover:shadow-purple-500/50 font-bold rounded-xl transition-all"
              >
                {saving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Änderungen speichern
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Read-only Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="glass backdrop-blur border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 font-semibold">E-Mail</p>
                <p className="text-zinc-200 font-medium">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="glass backdrop-blur border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 font-semibold">Rolle</p>
                <p className="text-zinc-200 font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <div className="glass backdrop-blur border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 font-semibold">Mitglied seit</p>
                <p className="text-zinc-200 font-medium">
                  {user?.created_date ? new Date(user.created_date).toLocaleDateString('de-DE') : 'Unbekannt'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}