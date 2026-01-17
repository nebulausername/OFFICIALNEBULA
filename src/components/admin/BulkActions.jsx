import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Archive, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function BulkActions({ 
  selectedItems, 
  onBulkDelete, 
  onBulkUpdate,
  onBulkExport,
  itemName = 'Items'
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState(null);
  const { toast } = useToast();

  const handleBulkAction = async (actionType) => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Keine Auswahl',
        description: `Bitte wähle mindestens ein ${itemName} aus`,
        variant: 'destructive',
      });
      return;
    }

    setAction(actionType);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    try {
      switch (action) {
        case 'delete':
          await onBulkDelete(selectedItems);
          break;
        case 'update':
          await onBulkUpdate(selectedItems);
          break;
        case 'export':
          await onBulkExport(selectedItems);
          break;
        default:
          break;
      }
      setDialogOpen(false);
      setAction(null);
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        title: 'Fehler',
        description: 'Aktion fehlgeschlagen',
        variant: 'destructive',
      });
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-lg mb-4">
        <span className="text-sm text-white/70">
          {selectedItems.length} {itemName} ausgewählt
        </span>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('update')}
          >
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('export')}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportieren
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleBulkAction('delete')}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'delete' && `Wirklich ${selectedItems.length} ${itemName} löschen?`}
              {action === 'update' && `${selectedItems.length} ${itemName} bearbeiten`}
              {action === 'export' && `${selectedItems.length} ${itemName} exportieren`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {action === 'delete' && (
              <p className="text-sm text-white/70">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            )}
            {action === 'update' && (
              <p className="text-sm text-white/70">
                Bitte wähle die zu aktualisierenden Felder aus.
              </p>
            )}
            {action === 'export' && (
              <p className="text-sm text-white/70">
                Die ausgewählten {itemName} werden als CSV exportiert.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant={action === 'delete' ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              Bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

