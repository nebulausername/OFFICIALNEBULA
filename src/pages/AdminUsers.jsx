import React from 'react';
import { api } from '@/api';
import { ResourceTable } from '@/components/admin/ui/ResourceTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Shield, User as UserIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {

  // --- Actions ---
  const handleToggleVIP = async (user) => {
    try {
      await api.entities.User.update(user.id, { is_vip: !user.is_vip });
      toast.success(`VIP Status für ${user.full_name} geändert`);
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Fehler beim Ändern des VIP Status');
    }
  };

  // --- Config ---
  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
            {val ? val.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">{val || 'Unbekannt'}</span>
            <span className="text-xs text-zinc-500">{row.username || '-'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rolle',
      sortable: true,
      render: (val) => (
        <Badge variant="outline" className={val === 'admin' ? 'border-red-500 text-red-500' : 'border-zinc-700 text-zinc-400'}>
          {val === 'admin' && <Shield className="w-3 h-3 mr-1" />}
          {val}
        </Badge>
      )
    },
    {
      key: 'is_vip',
      label: 'VIP',
      sortable: true,
      render: (val) => val ? (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-500/10">
          <Crown className="w-3 h-3 mr-1" /> VIP
        </Badge>
      ) : <span className="text-zinc-600">-</span>
    },
    {
      key: 'created_at',
      label: 'Registriert',
      sortable: true,
      type: 'date',
      className: 'text-zinc-500 text-sm'
    }
  ];

  const actions = [
    {
      label: 'VIP Toggle',
      icon: Crown,
      onClick: handleToggleVIP
    }
  ];

  return (
    <div className="min-h-screen bg-black p-6 md:p-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <ResourceTable
          title="User Verwaltung"
          resource="User"
          columns={columns}
          actions={actions}
          initialSort="-created_at"
        />
      </div>
    </div>
  );
}
