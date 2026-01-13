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
        city: 'China',
        country: 'CN',
        eta_min: 8,
        eta_max: 17,
        free_shipping_threshold: 0
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
    return `${deliveryLocation.eta_min}–${deliveryLocation.eta_max} Tage`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[var(--radius-lg)] p-4 md:p-5 mb-8"
        style={{ boxShadow: 'var(--shadow-subtle)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          {/* Location */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(var(--gold-rgb), 0.15)' }}
            >
              <MapPin className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Versand aus</div>
              <div className="text-base font-black flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                🇨🇳 China
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-12" style={{ background: 'linear-gradient(180deg, transparent, var(--border), transparent)' }} />

          {/* ETA */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface2)' }}
            >
              <Clock className="w-5 h-5" style={{ color: 'var(--text)' }} />
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Lieferzeit</div>
              <div className="text-base font-black" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>{getEtaText()}</div>
            </div>
          </div>

          <div className="hidden md:block w-px h-12" style={{ background: 'linear-gradient(180deg, transparent, var(--border), transparent)' }} />

          {/* Shipping Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(100, 230, 150, 0.15)' }}
            >
              <Truck className="w-5 h-5 text-[rgba(100,230,150,0.85)]" />
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Versand</div>
              <div className="text-base font-black" style={{ color: '#4ade80' }}>
                Kostenloser Versand
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