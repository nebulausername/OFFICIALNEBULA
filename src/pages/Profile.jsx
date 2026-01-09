import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || ''
      });
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      toast({
        title: '✨ Gespeichert!',
        description: 'Dein Profil wurde aktualisiert'
      });
      await loadUser();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: 'Fehler',
        description: 'Profil konnte nicht gespeichert werden',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 animate-gradient" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center glow-effect">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mein Profil
              </h1>
              <p className="text-zinc-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Verwalte deine Account-Informationen
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Email (Read-only) */}
          <div>
            <Label className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              E-Mail-Adresse
            </Label>
            <Input
              value={user.email}
              disabled
              className="bg-zinc-900/50 border-zinc-700 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-500 mt-1">E-Mail kann nicht geändert werden</p>
          </div>

          {/* Full Name */}
          <div>
            <Label className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Vollständiger Name
            </Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Dein Name"
              className="h-12 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Role Badge */}
          <div>
            <Label className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" />
              Rolle
            </Label>
            <div className="px-4 py-3 glass border border-zinc-800 rounded-lg">
              {user.role === 'admin' ? (
                <span className="text-purple-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full" />
                  Administrator
                </span>
              ) : (
                <span className="text-zinc-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-zinc-400 rounded-full" />
                  Benutzer
                </span>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="neon-button w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wird gespeichert...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Änderungen speichern
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 p-6 glass border border-zinc-800 rounded-xl"
      >
        <h3 className="font-bold mb-3 text-zinc-300">Account-Informationen</h3>
        <div className="space-y-2 text-sm text-zinc-400">
          <div className="flex justify-between">
            <span>Erstellt am:</span>
            <span className="text-zinc-300">{new Date(user.created_date).toLocaleDateString('de-DE')}</span>
          </div>
          <div className="flex justify-between">
            <span>User ID:</span>
            <span className="font-mono text-xs text-zinc-300">{user.id}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}