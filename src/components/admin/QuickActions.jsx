import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import {
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  Settings,
  Package,
  Users,
  ShoppingBag,
  FileText,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const quickActions = [
  {
    id: 'create-product',
    label: 'Neues Produkt',
    icon: Plus,
    color: 'from-blue-500 to-cyan-500',
    link: 'AdminProducts',
    action: 'create',
    shortcut: 'Ctrl+P',
  },
  {
    id: 'bulk-import',
    label: 'Bulk Import',
    icon: Upload,
    color: 'from-purple-500 to-pink-500',
    action: 'import',
    shortcut: 'Ctrl+I',
  },
  {
    id: 'export-data',
    label: 'Daten Exportieren',
    icon: Download,
    color: 'from-green-500 to-emerald-500',
    action: 'export',
    shortcut: 'Ctrl+E',
  },
  {
    id: 'bulk-edit',
    label: 'Massenbearbeitung',
    icon: Edit,
    color: 'from-orange-500 to-red-500',
    action: 'bulk-edit',
    shortcut: 'Ctrl+B',
  },
];

export default function QuickActions({ onAction }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action) => {
    setIsOpen(false);
    if (onAction) {
      onAction(action);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const action = quickActions.find((a) => {
          const key = a.shortcut.split('+')[1];
          return e.key.toLowerCase() === key.toLowerCase();
        });
        if (action) {
          e.preventDefault();
          handleAction(action.action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 flex-wrap"
    >
      {/* Main Quick Actions */}
      {quickActions.slice(0, 3).map((action) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action.link ? (
              <Link to={createPageUrl(action.link)}>
                <Button
                  className={`bg-gradient-to-r ${action.color} text-white border-none shadow-lg hover:shadow-xl transition-all`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => handleAction(action.action)}
                className={`bg-gradient-to-r ${action.color} text-white border-none shadow-lg hover:shadow-xl transition-all`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            )}
          </motion.div>
        );
      })}

      {/* More Actions Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Mehr Aktionen
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-zinc-900 border-zinc-700 text-white min-w-[200px]"
          align="end"
        >
          {quickActions.slice(3).map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleAction(action.action)}
                className="text-white hover:bg-zinc-800 cursor-pointer"
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{action.label}</span>
                <span className="ml-auto text-xs text-zinc-400">{action.shortcut}</span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator className="bg-zinc-700" />
          <DropdownMenuItem
            onClick={() => handleAction('settings')}
            className="text-white hover:bg-zinc-800 cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span>Einstellungen</span>
          </DropdownMenuItem>
          <Link to={createPageUrl('AdminProducts')}>
            <DropdownMenuItem className="text-white hover:bg-zinc-800 cursor-pointer">
              <Package className="w-4 h-4 mr-2" />
              <span>Produkte verwalten</span>
            </DropdownMenuItem>
          </Link>
          <Link to={createPageUrl('AdminUsers')}>
            <DropdownMenuItem className="text-white hover:bg-zinc-800 cursor-pointer">
              <Users className="w-4 h-4 mr-2" />
              <span>User verwalten</span>
            </DropdownMenuItem>
          </Link>
          <Link to={createPageUrl('AdminOrders')}>
            <DropdownMenuItem className="text-white hover:bg-zinc-800 cursor-pointer">
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Bestellungen</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

