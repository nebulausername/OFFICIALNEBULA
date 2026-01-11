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
        className="glass-panel rounded-[var(--radius-lg)] p-4 md:p-5 mb-8 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          {/* Location */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-zinc-400 font-semibold">Versand aus</div>
              <div className="text-base font-black text-white flex items-center gap-2">
                🇨🇳 China
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />

          {/* ETA */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold">Lieferzeit</div>
              <div className="text-base font-black text-white">{getEtaText()}</div>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />

          {/* Shipping Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold">Versand</div>
              <div className="text-base font-black text-green-400">
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