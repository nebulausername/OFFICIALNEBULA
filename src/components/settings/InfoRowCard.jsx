import React from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useToast } from '@/components/ui/use-toast';

export default function InfoRowCard({ icon: Icon, label, value, badge, copiable, iconColor = 'from-blue-500 to-cyan-500' }) {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast({ title: 'Kopiert!', description: `${label} wurde kopiert` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-11 h-11 bg-gradient-to-br ${iconColor} bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
              {label}
            </p>
            <div className="flex items-center gap-2">
              {badge ? (
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg text-purple-300 text-sm font-black">
                  {value}
                </span>
              ) : (
                <p className="text-white font-bold text-sm truncate">
                  {value}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {copiable && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="w-9 h-9 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl flex items-center justify-center transition-all flex-shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-zinc-400" />
            )}
          </motion.button>
        )}
      </div>
    </GlassCard>
  );
}