import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'from-blue-500 to-cyan-500',
  loading = false,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (loading) {
      setDisplayValue(0);
      return;
    }

    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
      : value || 0;

    if (numericValue === 0) {
      setDisplayValue(0);
      return;
    }

    setIsAnimating(true);
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, numericValue);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(numericValue);
        setIsAnimating(false);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, loading]);

  const formatValue = (val) => {
    if (typeof value === 'string' && value.includes('€')) {
      return `${val.toFixed(2)}€`;
    }
    if (typeof value === 'string' && value.includes('%')) {
      return `${val.toFixed(1)}%`;
    }
    return Math.round(val).toLocaleString('de-DE');
  };

  const isPositiveTrend = trend === 'up' || (trendValue && parseFloat(trendValue) > 0);

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse" />
          <div className="h-10 w-10 bg-zinc-700 rounded-lg animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-zinc-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all relative overflow-hidden group"
    >
      {/* Gradient Background on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">{title}</h3>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shadow-lg`}
          >
            {Icon && <Icon className="w-6 h-6 text-white" />}
          </motion.div>
        </div>

        <div className="mb-3">
          <motion.div
            key={displayValue}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-black text-white"
          >
            {typeof value === 'string' && !value.match(/^\d+$/)
              ? value
              : formatValue(displayValue)}
          </motion.div>
        </div>

        {trend && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span
              className={`text-sm font-bold ${
                isPositiveTrend ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trendValue || trend}
            </span>
            <span className="text-xs text-zinc-500">vs. letzter Monat</span>
          </motion.div>
        )}
      </div>

      {/* Animated Glow Effect */}
      {isAnimating && (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}

