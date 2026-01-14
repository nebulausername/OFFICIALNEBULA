import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Send, Loader2, Check, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from './I18nProvider';
import { toast } from 'sonner';

// Common languages for suggestions
const LANGUAGE_SUGGESTIONS = [
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
];

export default function LanguageRequestModal({ isOpen, onClose, suggestedLanguage }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    language: '',
    region: '',
    comment: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      loadUser();
      if (suggestedLanguage) {
        const found = LANGUAGE_SUGGESTIONS.find(l => l.code === suggestedLanguage);
        if (found) {
          setFormData(prev => ({ ...prev, language: found.name }));
        } else {
          setFormData(prev => ({ ...prev, language: suggestedLanguage }));
        }
      }
    }
  }, [isOpen, suggestedLanguage]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData?.email) {
        setFormData(prev => ({ ...prev, email: userData.email }));
      }
    } catch (e) {
      // Not logged in
    }
  };

  const handleSubmit = async () => {
    if (!formData.language.trim()) {
      toast.error('Bitte wähle eine Sprache');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await base44.entities.LanguageRequest.create({
        user_id: user?.id || null,
        email: formData.email || null,
        requested_language: formData.language,
        region: formData.region || null,
        comment: formData.comment || null,
        device_locale: navigator.language || null,
        page: window.location.pathname,
        is_vip: user?.vip === true,
        status: 'pending'
      });

      setSubmitted(true);
      toast.success(t('language.requestSuccess'));
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting language request:', error);
      toast.error(t('language.requestError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuggestions = searchQuery
    ? LANGUAGE_SUGGESTIONS.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.code.includes(searchQuery.toLowerCase())
      )
    : LANGUAGE_SUGGESTIONS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15, 15, 20, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                >
                  <Globe className="w-5 h-5" style={{ color: '#A78BFA' }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  {t('language.requestTitle')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
              >
                <X className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(52, 211, 153, 0.2)' }}
                  >
                    <Check className="w-8 h-8" style={{ color: '#34D399' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>
                    {t('language.requestSuccess')}
                  </h3>
                </motion.div>
              ) : (
                <>
                  {/* Language Search & Select */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {t('language.requestLanguage')} *
                    </label>
                    <Input
                      type="text"
                      placeholder="z.B. Polish, Nederlands, 中文..."
                      value={formData.language}
                      onChange={(e) => {
                        setFormData({ ...formData, language: e.target.value });
                        setSearchQuery(e.target.value);
                      }}
                      className="w-full h-12"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF'
                      }}
                    />
                    
                    {/* Suggestions */}
                    {searchQuery && filteredSuggestions.length > 0 && (
                      <div 
                        className="mt-2 max-h-32 overflow-y-auto rounded-xl"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {filteredSuggestions.slice(0, 5).map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setFormData({ ...formData, language: lang.name });
                              setSearchQuery('');
                            }}
                            className="w-full px-4 py-2 text-start text-sm flex items-center justify-between hover:bg-white/5 transition-colors"
                          >
                            <span style={{ color: '#FFFFFF' }}>{lang.name}</span>
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{lang.nativeName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {t('language.requestRegion')}
                    </label>
                    <Input
                      type="text"
                      placeholder="z.B. Brazil, Austria, Switzerland..."
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full h-11"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF'
                      }}
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {t('language.requestComment')}
                    </label>
                    <Textarea
                      placeholder="..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      rows={3}
                      className="w-full resize-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF'
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {t('language.requestEmail')}
                    </label>
                    <Input
                      type="email"
                      placeholder="deine@email.de"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-11"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF'
                      }}
                    />
                  </div>

                  {/* VIP Badge */}
                  {user?.vip && (
                    <div 
                      className="flex items-center gap-2 px-4 py-3 rounded-xl"
                      style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.3)'
                      }}
                    >
                      <Crown className="w-5 h-5" style={{ color: '#FBBF24' }} />
                      <span className="text-sm font-semibold" style={{ color: '#FBBF24' }}>
                        {t('vip.priority')} - Deine Anfrage wird priorisiert
                      </span>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.language.trim()}
                    className="w-full h-12 btn-gold font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 me-2 animate-spin" />
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 me-2" />
                        {t('language.requestSubmit')}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}