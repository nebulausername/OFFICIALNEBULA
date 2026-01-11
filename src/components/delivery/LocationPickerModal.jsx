import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MapPin, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LocationPickerModal({ isOpen, onClose, onSave, currentLocation }) {
  const [formData, setFormData] = useState({
    city: '',
    country: 'DE',
    postal_code: ''
  });

  useEffect(() => {
    if (currentLocation) {
      setFormData({
        city: currentLocation.city || '',
        country: currentLocation.country || 'DE',
        postal_code: currentLocation.postal_code || ''
      });
    }
  }, [currentLocation]);

  const countries = [
    { code: 'DE', name: 'Deutschland', eta_min: 1, eta_max: 3, threshold: 200 },
    { code: 'AT', name: 'Österreich', eta_min: 2, eta_max: 4, threshold: 200 },
    { code: 'CH', name: 'Schweiz', eta_min: 3, eta_max: 5, threshold: 250 }
  ];

  const handleSave = () => {
    const selectedCountry = countries.find(c => c.code === formData.country);
    onSave({
      ...formData,
      eta_min: selectedCountry.eta_min,
      eta_max: selectedCountry.eta_max,
      free_shipping_threshold: selectedCountry.threshold
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-[var(--glass-border)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-heading flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[hsl(var(--accent))]" />
            Lieferort wählen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Country */}
          <div>
            <Label className="text-sm font-semibold text-[hsl(var(--text))] mb-2">Land</Label>
            <Select value={formData.country} onValueChange={(val) => setFormData({ ...formData, country: val })}>
              <SelectTrigger className="glass-panel border-[var(--glass-border)] h-12 focus-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel border-[var(--glass-border)]">
                {countries.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div>
            <Label className="text-sm font-semibold text-[hsl(var(--text))] mb-2">Stadt</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="z.B. Berlin"
              className="glass-panel border-[var(--glass-border)] h-12 focus-ring text-[hsl(var(--text))]"
            />
          </div>

          {/* Postal Code */}
          <div>
            <Label className="text-sm font-semibold text-[hsl(var(--text))] mb-2">PLZ (optional)</Label>
            <Input
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="z.B. 10115"
              className="glass-panel border-[var(--glass-border)] h-12 focus-ring text-[hsl(var(--text))]"
            />
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[var(--radius-md)] p-4 border-[hsl(var(--accent))]/20"
          >
            <div className="text-xs text-[hsl(var(--text-muted))] space-y-1">
              <p>📦 Lieferzeit variiert je nach Land</p>
              <p>✈️ Expressversand auf Anfrage verfügbar</p>
              <p>🆓 Gratis Versand ab Mindestbestellwert</p>
            </div>
          </motion.div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="btn-secondary"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.city}
            className="btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}