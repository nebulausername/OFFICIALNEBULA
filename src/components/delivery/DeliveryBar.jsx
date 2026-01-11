import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationPickerModal from './LocationPickerModal';

export default function DeliveryBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  useEffect(() => {
    loadDeliveryLocation();
  }, []);

  const loadDeliveryLocation = () => {
    const saved = localStorage.getItem('delivery_location');
    if (saved) {
      setDeliveryLocation(JSON.parse(saved));
    } else {
      setDeliveryLocation({
        city: 'Berlin',
        country: 'DE',
        eta_min: 1,
        eta_max: 3,
        free_shipping_threshold: 200
      });
    }
  };

  const handleLocationUpdate = (location) => {
    setDeliveryLocation(location);
    localStorage.setItem('delivery_location', JSON.stringify(location));
    setIsModalOpen(false);
  };

  if (!deliveryLocation) return null;

  const getEtaText = () => {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + deliveryLocation.eta_min);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + deliveryLocation.eta_max);
    
    return `${days[startDate.getDay()]}–${days[endDate.getDay()]} (${deliveryLocation.eta_min}–${deliveryLocation.eta_max} Werktage)`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[var(--radius-md)] p-3 md:p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          {/* Location */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-left focus-ring rounded-lg px-2 py-1 -mx-2 hover:bg-[var(--glass-hover)] smooth-transition"
          >
            <MapPin className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[hsl(var(--text-muted))] font-medium">Lieferung nach</div>
              <div className="text-sm font-bold text-[hsl(var(--text))] truncate">{deliveryLocation.city}</div>
            </div>
          </button>

          <div className="hidden md:block w-px h-8 bg-[hsl(var(--border))]" />

          {/* ETA */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[hsl(var(--accent2))] flex-shrink-0" />
            <div>
              <div className="text-xs text-[hsl(var(--text-muted))] font-medium">Lieferzeit</div>
              <div className="text-sm font-bold text-[hsl(var(--text))]">{getEtaText()}</div>
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-[hsl(var(--border))]" />

          {/* Shipping Info */}
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" />
            <div>
              <div className="text-xs text-[hsl(var(--text-muted))] font-medium">Versand</div>
              <div className="text-sm font-bold text-[hsl(var(--text))]">
                Gratis ab {deliveryLocation.free_shipping_threshold}€
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleLocationUpdate}
        currentLocation={deliveryLocation}
      />
    </>
  );
}