import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Search, ChevronRight, MessageSquarePlus } from 'lucide-react';
import { useI18n, SUPPORTED_LOCALES } from './I18nProvider';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import LanguageRequestModal from './LanguageRequestModal';

// Language chip component
function LanguageChip({ locale, config, isActive, onClick, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(locale)}
      className={`rounded-xl flex flex-col items-center justify-center transition-all ${sizeClasses[size]}`}
      style={{
        background: isActive 
          ? 'rgba(214, 178, 94, 0.15)' 
          : 'rgba(255, 255, 255, 0.04)',
        border: isActive 
          ? '1.5px solid rgba(214, 178, 94, 0.5)' 
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isActive 
          ? '0 0 20px rgba(214, 178, 94, 0.2)' 
          : 'none',
        minWidth: size === 'sm' ? '60px' : '72px'
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{config.flag}</span>
        <span 
          className="text-sm font-bold uppercase"
          style={{ color: isActive ? '#F2D27C' : 'rgba(255, 255, 255, 0.9)' }}
        >
          {locale}
        </span>
        {isActive && <Check className="w-3.5 h-3.5" style={{ color: '#D6B25E' }} />}
      </div>
      <span 
        className="text-xs mt-0.5"
        style={{ color: isActive ? 'rgba(242, 215, 124, 0.8)' : 'rgba(255, 255, 255, 0.5)' }}
      >
        {config.nativeName}
      </span>
      {config.isRTL && (
        <span 
          className="text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded"
          style={{ 
            background: 'rgba(139, 92, 246, 0.2)', 
            color: '#A78BFA',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}
        >
          RTL
        </span>
      )}
    </motion.button>
  );
}

// Main Language Switcher for drawers/sidebars
export function LanguageSwitcherPanel({ onLanguageChange }) {
  const { locale, setLocale, t, unsupportedCandidate } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleLocaleChange = (newLocale) => {
    setLocale(newLocale);
    onLanguageChange?.(newLocale);
  };

  const filteredLocales = Object.entries(SUPPORTED_LOCALES).filter(([code, config]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return code.includes(query) || 
           config.name.toLowerCase().includes(query) || 
           config.nativeName.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
          <Globe className="w-5 h-5" style={{ color: '#D6B25E' }} />
          {t('language.title')}
        </h3>
      </div>

      {/* Search */}
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
        />
        <Input
          type="text"
          placeholder={t('language.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF'
          }}
        />
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-4 gap-2">
        {filteredLocales.map(([code, config]) => (
          <LanguageChip
            key={code}
            locale={code}
            config={config}
            isActive={locale === code}
            onClick={handleLocaleChange}
            size="sm"
          />
        ))}
      </div>

      {/* Request Language Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.08))',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139, 92, 246, 0.2)' }}
          >
            <MessageSquarePlus className="w-5 h-5" style={{ color: '#A78BFA' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm" style={{ color: '#FFFFFF' }}>
              {t('language.missing')}
            </h4>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {t('language.missingSubtitle')}
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#A78BFA'
              }}
            >
              {t('language.request')}
              <ChevronRight className="w-3 h-3 inline-block ms-1 rtl:rotate-180" />
            </button>
          </div>
        </div>
        
        {unsupportedCandidate && (
          <div 
            className="mt-3 px-3 py-2 rounded-lg text-xs"
            style={{ 
              background: 'rgba(251, 191, 36, 0.1)', 
              border: '1px solid rgba(251, 191, 36, 0.2)',
              color: 'rgba(251, 191, 36, 0.9)'
            }}
          >
            Detected: <strong>{unsupportedCandidate.toUpperCase()}</strong> (not available yet)
          </div>
        )}
      </motion.div>

      {/* Request Modal */}
      <LanguageRequestModal 
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        suggestedLanguage={unsupportedCandidate}
      />
    </div>
  );
}

// Compact Header Popover Switcher
export function LanguageSwitcherPopover() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleLocaleChange = (newLocale) => {
    setLocale(newLocale);
    setOpen(false);
  };

  const currentConfig = SUPPORTED_LOCALES[locale];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Globe className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            <span className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {currentConfig?.flag} {locale.toUpperCase()}
            </span>
          </motion.button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4" 
          align="end"
          style={{
            background: 'rgba(15, 15, 20, 0.98)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: '#FFFFFF' }}>
            {t('language.select')}
          </h3>
          
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(SUPPORTED_LOCALES).map(([code, config]) => (
              <LanguageChip
                key={code}
                locale={code}
                config={config}
                isActive={locale === code}
                onClick={handleLocaleChange}
                size="sm"
              />
            ))}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              setShowRequestModal(true);
            }}
            className="w-full mt-3 px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/5"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.6)'
            }}
          >
            <MessageSquarePlus className="w-4 h-4" />
            {t('language.missing')}
          </button>
        </PopoverContent>
      </Popover>

      <LanguageRequestModal 
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </>
  );
}

export default LanguageSwitcherPanel;