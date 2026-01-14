import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle, Clock, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function StatusChip({ status }) {
  const { t } = useI18n();
  
  const configs = {
    open: {
      label: t('support.status.open'),
      icon: Circle,
      className: 'bg-blue-500/15 text-blue-400 border-blue-400/30'
    },
    in_progress: {
      label: t('support.status.inProgress'),
      icon: Clock,
      className: 'bg-purple-500/15 text-purple-400 border-purple-400/30'
    },
    waiting: {
      label: t('support.status.waitingForYou'),
      icon: Hourglass,
      className: 'bg-amber-500/15 text-amber-400 border-amber-400/30'
    },
    solved: {
      label: t('support.status.solved'),
      icon: CheckCircle,
      className: 'bg-green-500/15 text-green-400 border-green-400/30'
    },
    closed: {
      label: t('support.status.closed'),
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