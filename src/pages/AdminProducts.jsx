import React, { useState } from 'react';
import { api } from '@/api';
import { ResourceTable } from '@/components/admin/ui/ResourceTable';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Tag, Archive } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminProducts() {
  const navigate = useNavigate();
  const location = useLocation(); // To detect navigation adjustments
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // --- Actions ---
  const handleEdit = (product) => {
    navigate(`/AdminProductEditor?id=${product.id}`);
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Produkt "${product.name}" wirklich löschen?`)) {
      try {
        await api.entities.Product.delete(product.id);
        toast.success('Produkt gelöscht');
        // Reload or update list (ResourceTable handles its own state, so reload is easiest for now)
        window.location.reload();
      } catch (error) {
        console.error(error);
        toast.error('Fehler beim Löschen');
      }
    }
  };

  // --- Resource Config ---
  const columns = [
    {
      key: 'name',
      label: 'Produkt',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
            {row.cover_image ? (
              <img src={row.cover_image} alt={val} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <Tag className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">{val}</span>
            <span className="text-xs text-zinc-500">{row.sku}</span>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Preis',
      sortable: true,
      type: 'currency',
      className: 'font-mono'
    },
    {
      key: 'stock',
      label: 'Lager',
      sortable: true,
      render: (val, row) => (
        <div className={`flex items-center gap-2 ${val <= 5 ? 'text-red-400' : 'text-zinc-300'}`}>
          <Archive className="w-4 h-4" />
          <span>{val}</span>
          {!row.in_stock && <span className="text-xs bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded">Out</span>}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Erstellt',
      sortable: true,
      type: 'date',
      className: 'text-zinc-500 text-sm'
    }
  ];

  const actions = [
    {
      label: 'Bearbeiten',
      icon: Pencil,
      onClick: handleEdit
    },
    {
      label: 'Löschen',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDelete
    }
  ];

  return (
    <div className="min-h-screen bg-black p-6 md:p-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <ResourceTable
          title="Produkte"
          key={location.key} // Force remount on navigation back
          resource="Product"
          columns={columns}
          actions={actions}
          headerActions={
            <Button
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
              onClick={() => navigate('/AdminProductEditor')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Neues Produkt
            </Button>
          }
        />
      </div>
    </div>
  );
}