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
        className="rounded-2xl p-5 md:p-6 mb-8 border"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          borderColor: 'rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {/* Location */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(251, 191, 36, 0.05))',
              border: '1px solid rgba(251, 191, 36, 0.25)'
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.15))' }}
            >
              <MapPin className="w-6 h-6" style={{ color: '#fbbf24' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(251, 191, 36, 0.8)' }}>Versand aus</div>
              <div className="text-lg font-black flex items-center gap-2" style={{ color: '#fff' }}>
                🇨🇳 China
              </div>
            </div>
          </motion.div>

          {/* ETA */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.05))',
              border: '1px solid rgba(139, 92, 246, 0.25)'
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.15))' }}
            >
              <Clock className="w-6 h-6" style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(167, 139, 250, 0.8)' }}>Lieferzeit</div>
              <div className="text-lg font-black" style={{ color: '#fff' }}>{getEtaText()}</div>
            </div>
          </motion.div>

          {/* Shipping Info */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.05))',
              border: '1px solid rgba(34, 197, 94, 0.25)'
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.15))' }}
            >
              <Truck className="w-6 h-6" style={{ color: '#4ade80' }} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(74, 222, 128, 0.8)' }}>Versand</div>
              <div className="text-lg font-black" style={{ color: '#4ade80' }}>
                Kostenlos ✓
              </div>
            </div>
          </motion.div>
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