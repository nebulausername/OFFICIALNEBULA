import React, { useState } from 'react';
import { User, Save, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from './GlassCard';

export default function ProfileFormCard({ fullName, onSave, loading }) {
  const [name, setName] = useState(fullName || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setHasChanges(value !== fullName);
    
    if (value.length > 0 && value.length < 2) {
      setError('Mind. 2 Zeichen erforderlich');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.length < 2) return;
    await onSave(name);
    setHasChanges(false);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-purple-400" />
        </div>
        <h3 className="text-lg font-black text-white">Persönliche Daten</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label className="text-zinc-300 text-sm font-semibold mb-2 block">
            Name
          </Label>
          <Input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Dein Name"
            className="
              h-12 
              bg-white/[0.03] 
              border-white/[0.1] 
              text-white 
              placeholder:text-zinc-500
              focus:border-purple-400/60
              focus:ring-2
              focus:ring-purple-500/20
              rounded-xl
              font-medium
            "
          />
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-2 text-amber-400 text-xs font-medium"
              >
                <AlertCircle className="w-3 h-3" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="submit"
          disabled={!hasChanges || loading || error}
          className="
            w-full h-12 
            bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600
            hover:shadow-lg hover:shadow-purple-500/40
            disabled:opacity-40 disabled:cursor-not-allowed
            rounded-xl
            font-black
            text-base
            transition-all
          "
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
              />
              Speichern...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Änderungen speichern
            </>
          )}
        </Button>
      </form>
    </GlassCard>
  );
}