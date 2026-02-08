import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, RefreshCw, Sparkles, Camera, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

import FaceCaptureModal from './FaceCaptureModal';

export default function VerificationStatus({
  verificationStatus,
  verificationHandGesture,
  rejectionReason,
  verificationSubmittedAt,
  onRetry
}) {
  const navigate = useNavigate();

  if (verificationStatus === 'verified') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
              border: '3px solid rgba(16, 185, 129, 0.5)',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
            }}
          >
            <CheckCircle2 className="w-12 h-12" style={{ color: '#10B981' }} />
          </div>
        </motion.div>

        <h2
          className="text-3xl font-black mb-4"
          style={{ color: '#10B981' }}
        >
          Verifiziert! ✅
        </h2>

        <p
          className="text-lg mb-8 max-w-md mx-auto leading-relaxed"
          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
        >
          Deine Verifizierung wurde erfolgreich bestätigt. Du kannst jetzt den vollständigen Shop nutzen und Bestellungen aufgeben.
        </p>

        <Button
          onClick={() => navigate(createPageUrl('Products'))}
          className="h-14 px-8 rounded-xl font-bold text-lg"
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#FFFFFF',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Zum Shop
        </Button>
      </motion.div>
    );
  }

  if (verificationStatus === 'rejected') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
              border: '3px solid rgba(239, 68, 68, 0.5)',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)'
            }}
          >
            <XCircle className="w-12 h-12" style={{ color: '#EF4444' }} />
          </div>
        </motion.div>

        <h2
          className="text-3xl font-black mb-4"
          style={{ color: '#EF4444' }}
        >
          Verifizierung abgelehnt ❌
        </h2>

        {rejectionReason && (
          <div
            className="max-w-md mx-auto mb-8 p-6 rounded-2xl"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <p
              className="text-base mb-2 font-semibold"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Grund:
            </p>
            <p
              className="text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {rejectionReason}
            </p>
          </div>
        )}

        {onRetry && (
          <Button
            onClick={onRetry}
            className="h-14 px-8 rounded-xl font-bold text-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF'
            }}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Erneut versuchen
          </Button>
        )}
      </motion.div>
    );
  }

  // State for FaceCaptureModal
  const [showFaceCapture, setShowFaceCapture] = React.useState(false);

  // Determine if photo needs to be taken (pending status but no submission time recorded)
  // Or if we just want to allow retrying/updating the photo even whilst pending?
  // Let's assume: if pending AND no submittedAt, show camera button.
  // If pending AND submittedAt, show waiting screen.

  const needsPhoto = verificationStatus === 'pending' && !verificationSubmittedAt;

  if (needsPhoto) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(214, 178, 94, 0.2), rgba(245, 158, 11, 0.2))',
              border: '3px solid rgba(214, 178, 94, 0.5)',
              boxShadow: '0 0 40px rgba(214, 178, 94, 0.3)'
            }}
          >
            <Camera className="w-12 h-12" style={{ color: '#D6B25E' }} />
          </div>
        </motion.div>

        <h2
          className="text-3xl font-black mb-4"
          style={{ color: '#D6B25E' }}
        >
          Verifizierung erforderlich 📸
        </h2>

        <p
          className="text-lg mb-8 max-w-md mx-auto leading-relaxed"
          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
        >
          Bitte nimm ein kurzes Foto auf, um deine Identität zu bestätigen.
        </p>

        <Button
          onClick={() => setShowFaceCapture(true)}
          className="h-14 px-8 rounded-xl font-bold text-lg"
          style={{
            background: 'linear-gradient(135deg, #D6B25E, #B48E35)',
            color: '#000000',
            boxShadow: '0 0 30px rgba(214, 178, 94, 0.4)'
          }}
        >
          <Camera className="w-5 h-5 mr-2" />
          Foto aufnehmen
        </Button>

        <FaceCaptureModal
          open={showFaceCapture}
          onClose={() => setShowFaceCapture(false)}
        />
      </motion.div>
    );
  }

  // Pending status (Submitted)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-4"
    >
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="inline-block mb-6"
      >
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(214, 178, 94, 0.2), rgba(245, 158, 11, 0.2))',
            border: '3px solid rgba(214, 178, 94, 0.5)',
            boxShadow: '0 0 40px rgba(214, 178, 94, 0.3)'
          }}
        >
          <Clock className="w-12 h-12" style={{ color: '#D6B25E' }} />
        </div>
      </motion.div>

      <h2
        className="text-3xl font-black mb-6"
        style={{ color: '#D6B25E' }}
      >
        Warte auf Verifizierung ⏳
      </h2>

      {verificationHandGesture && (
        <motion.div
          className="mb-8 p-6 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(214, 178, 94, 0.15), rgba(214, 178, 94, 0.05))',
            border: '2px solid rgba(214, 178, 94, 0.3)',
            boxShadow: '0 8px 32px rgba(214, 178, 94, 0.2)'
          }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Hand className="w-6 h-6" style={{ color: '#D6B25E' }} />
            <p
              className="text-lg font-bold"
              style={{ color: 'rgba(255, 255, 255, 0.95)' }}
            >
              Dein Handzeichen:
            </p>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-4 text-center"
          >
            {verificationHandGesture}
          </motion.div>
          <div className="flex items-center justify-center gap-2 text-sm mt-4"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Foto erfolgreich übermittelt</span>
          </div>
        </motion.div>
      )}

      <div className="max-w-md mx-auto mb-8 p-6 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <p
          className="text-base leading-relaxed text-center"
          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
        >
          {verificationSubmittedAt
            ? `Eingereicht am: ${new Date(verificationSubmittedAt).toLocaleString()}`
            : 'Wir prüfen deine Verifizierung schnellstmöglich.'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full"
          style={{ background: '#D6B25E' }}
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 rounded-full"
          style={{ background: '#D6B25E' }}
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 rounded-full"
          style={{ background: '#D6B25E' }}
        />
      </div>
    </motion.div>
  );
}
