import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function NotificationsCard() {
  const [settings, setSettings] = useState({
    orders: true,
    drops: true,
    support: false
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notifications = [
    { key: 'orders', label: 'Bestellungen', desc: 'Bestätigungs-Updates' },
    { key: 'drops', label: 'Neue Drops', desc: 'Produktveröffentlichungen' },
    { key: 'support', label: 'Support Updates', desc: 'Ticket-Antworten' }
  ];

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-black text-base">Benachrichtigungen</h3>
          <p className="text-zinc-400 text-xs font-medium">In-App + optional E-Mail</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.key} className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor={notif.key} className="text-white font-semibold text-sm cursor-pointer">
                {notif.label}
              </Label>
              <p className="text-zinc-500 text-xs mt-0.5">{notif.desc}</p>
            </div>
            <Switch
              id={notif.key}
              checked={settings[notif.key]}
              onCheckedChange={() => toggleSetting(notif.key)}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}