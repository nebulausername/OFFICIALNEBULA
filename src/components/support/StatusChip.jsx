import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function StatusChip({ status }) {
  const configs = {
    open: {
      label: 'Offen',
      icon: Circle,
      className: 'bg-blue-500/15 text-blue-400 border-blue-400/30'
    },
    in_progress: {
      label: 'In Bearbeitung',
      icon: Clock,
      className: 'bg-purple-500/15 text-purple-400 border-purple-400/30'
    },
    solved: {
      label: 'Gelöst',
      icon: CheckCircle,
      className: 'bg-green-500/15 text-green-400 border-green-400/30'
    },
    closed: {
      label: 'Geschlossen',
      icon: XCircle,
      className: 'bg-zinc-500/15 text-zinc-400 border-zinc-400/30'
    }
  };

  const config = configs[status] || configs.open;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} border font-semibold text-xs px-2.5 py-1 flex items-center gap-1.5 w-fit`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}