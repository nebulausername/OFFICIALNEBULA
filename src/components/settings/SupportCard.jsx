import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import GlassCard from './GlassCard';

export default function SupportCard({ unreadCount = 0 }) {
  return (
    <Link to={createPageUrl('Help')}>
      <GlassCard hover className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <MessageCircle className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-zinc-900"
                >
                  {unreadCount}
                </motion.div>
              )}
            </motion.div>
            <div>
              <h3 className="text-white font-black text-base mb-1">Support</h3>
              <p className="text-zinc-400 text-sm font-medium">
                Tickets & Live Chat
              </p>
            </div>
          </div>
          <motion.div
            whileHover={{ x: 4 }}
            className="w-9 h-9 bg-white/[0.05] rounded-xl flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5 text-zinc-400" />
          </motion.div>
        </div>
      </GlassCard>
    </Link>
  );
}