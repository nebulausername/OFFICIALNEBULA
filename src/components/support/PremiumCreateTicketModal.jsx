import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, X, FileText, Loader2, Check, Package, CreditCard, 
  Truck, RotateCcw, Wrench, Globe, HelpCircle, ChevronRight,
  Image as ImageIcon, ArrowLeft
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n/I18nProvider';
import { toast } from 'sonner';

const LANGUAGE_OPTIONS = [
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'other', name: 'Other', nativeName: 'Other' }
];

export default function PremiumCreateTicketModal({ isOpen, onClose, onSuccess, preselectedCategory = null }) {
  const { t, isRTL } = useI18n();
  const [step, setStep] = useState(1); // 1: category, 2: form, 3: success
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  
  const [formData, setFormData] = useState({
    category: preselectedCategory || '',
    subject: '',
    body: '',
    order_id: '',
    sku: '',
    // Language request fields
    requestedLanguage: '',
    customLanguage: '',
    scope: 'full_app'
  });
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (preselectedCategory) {
        setFormData(prev => ({ ...prev, category: preselectedCategory }));
        if (preselectedCategory === 'language_request') {
          setFormData(prev => ({
            ...prev,
            category: 'language_request',
            subject: t('support.languageRequest.title')
          }));
        }
        setStep(2);
      } else {
        setStep(1);
      }
    } else {
      // Reset on close
      setStep(1);
      setFormData({
        category: '',
        subject: '',
        body: '',
        order_id: '',
        sku: '',
        requestedLanguage: '',
        customLanguage: '',
        scope: 'full_app'
      });
      setAttachments([]);
      setCreatedTicket(null);
    }
  }, [isOpen, preselectedCategory]);

  const categories = [
    { value: 'order', label: t('support.category.order'), icon: Package, color: 'from-blue-500 to-cyan-500' },
    { value: 'delivery', label: t('support.category.delivery'), icon: Truck, color: 'from-green-500 to-emerald-500' },
    { value: 'return', label: t('support.category.return'), icon: RotateCcw, color: 'from-orange-500 to-red-500' },
    { value: 'product', label: t('support.category.product'), icon: Package, color: 'from-purple-500 to-pink-500' },
    { value: 'payment', label: t('support.category.payment'), icon: CreditCard, color: 'from-yellow-500 to-amber-500' },
    { value: 'technical', label: t('support.category.technical'), icon: Wrench, color: 'from-indigo-500 to-violet-500' },
    { value: 'language_request', label: t('support.category.languageRequest'), icon: Globe, color: 'from-pink-500 to-rose-500' },
    { value: 'other', label: t('support.category.other'), icon: HelpCircle, color: 'from-gray-500 to-zinc-500' }
  ];

  const handleCategorySelect = (cat) => {
    setFormData(prev => ({ 
      ...prev, 
      category: cat,
      subject: cat === 'language_request' ? t('support.languageRequest.title') : ''
    }));
    setStep(2);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAttachments(prev => [...prev, { 
          url: file_url, 
          name: file.name, 
          type: file.type,
          isImage: file.type.startsWith('image/')
        }]);
      } catch (error) {
        toast.error(t('support.chat.sendFailed'));
      }
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.subject || (!formData.body && formData.category !== 'language_request')) {
      toast.error(t('support.form.fillRequired'));
      return;
    }
    
    if (formData.category === 'language_request' && !formData.requestedLanguage) {
      toast.error(t('support.form.fillRequired'));
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Check limit
      const openTickets = await base44.entities.Ticket.filter({
        user_id: user.id,
        status: { $in: ['open', 'in_progress'] }
      });

      if (openTickets.length >= 2 && !user.is_vip) {
        toast.error(t('support.limitReached'));
        onClose();
        onSuccess?.('LIMIT_REACHED');
        return;
      }

      // Build message body
      let messageBody = formData.body;
      if (formData.category === 'language_request') {
        const langName = formData.requestedLanguage === 'other' 
          ? formData.customLanguage 
          : LANGUAGE_OPTIONS.find(l => l.code === formData.requestedLanguage)?.name || formData.requestedLanguage;
        
        messageBody = `**${t('support.languageRequest.whichLanguage')}:** ${langName}\n` +
          `**${t('support.languageRequest.scope')}:** ${formData.scope === 'shop' ? t('support.languageRequest.scopeShop') : t('support.languageRequest.scopeFullApp')}\n\n` +
          (formData.body ? `**${t('support.languageRequest.reason')}:** ${formData.body}` : '');
      }

      // Create ticket
      const ticket = await base44.entities.Ticket.create({
        user_id: user.id,
        subject: formData.subject,
        category: formData.category,
        order_id: formData.order_id || null,
        status: 'open',
        priority: user.is_vip ? 'vip' : 'normal',
        last_message_at: new Date().toISOString(),
        unread_by_admin: true
      });

      // Create first message
      await base44.entities.TicketMessage.create({
        ticket_id: ticket.id,
        sender_id: user.id,
        sender_role: 'user',
        body: messageBody,
        attachments: attachments,
        read_by_admin: false
      });

      setCreatedTicket(ticket);
      setStep(3);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(t('support.chat.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const needsOrderField = ['order', 'delivery', 'return', 'payment'].includes(formData.category);
  const needsSkuField = ['product'].includes(formData.category);
  const isLanguageRequest = formData.category === 'language_request';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg p-0 overflow-hidden border-0 max-h-[90vh]"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.98), rgba(10, 10, 14, 0.98))',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5)'
        }}
      >
        <AnimatePresence mode="wait">
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <h2 className="text-2xl font-black text-white mb-2">{t('support.newTicket')}</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {t('support.form.category')}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={cat.value}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategorySelect(cat.value)}
                      className="p-4 rounded-xl text-start transition-all group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-white text-sm">{cat.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                  >
                    <ArrowLeft className={`w-5 h-5 text-white ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-white">{t('support.createTicket')}</h2>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      {categories.find(c => c.value === formData.category)?.label}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Language Request Special Fields */}
                {isLanguageRequest && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {t('support.languageRequest.whichLanguage')} *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setFormData({ ...formData, requestedLanguage: lang.code })}
                            className={`px-4 py-3 rounded-xl text-sm font-semibold text-start transition-all ${
                              formData.requestedLanguage === lang.code ? 'ring-2 ring-purple-500' : ''
                            }`}
                            style={{
                              background: formData.requestedLanguage === lang.code 
                                ? 'rgba(139, 92, 246, 0.2)' 
                                : 'rgba(255, 255, 255, 0.04)',
                              border: formData.requestedLanguage === lang.code
                                ? '1px solid rgba(139, 92, 246, 0.5)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                              color: '#FFFFFF'
                            }}
                          >
                            <span>{lang.nativeName}</span>
                            <span className="text-xs block" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {lang.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      
                      {formData.requestedLanguage === 'other' && (
                        <Input
                          value={formData.customLanguage}
                          onChange={(e) => setFormData({ ...formData, customLanguage: e.target.value })}
                          placeholder={t('support.languageRequest.otherLanguage')}
                          className="mt-3 h-12"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF'
                          }}
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {t('support.languageRequest.scope')}
                      </label>
                      <div className="flex gap-3">
                        {[
                          { value: 'shop', label: t('support.languageRequest.scopeShop') },
                          { value: 'full_app', label: t('support.languageRequest.scopeFullApp') }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setFormData({ ...formData, scope: opt.value })}
                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                              formData.scope === opt.value ? 'ring-2 ring-purple-500' : ''
                            }`}
                            style={{
                              background: formData.scope === opt.value 
                                ? 'rgba(139, 92, 246, 0.2)' 
                                : 'rgba(255, 255, 255, 0.04)',
                              border: formData.scope === opt.value
                                ? '1px solid rgba(139, 92, 246, 0.5)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                              color: '#FFFFFF'
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Subject (not for language request as it's auto-filled) */}
                {!isLanguageRequest && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {t('support.form.subject')} {t('support.form.required')}
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t('support.form.subjectPlaceholder')}
                      className="h-12"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF'
                      }}
                    />
                  </div>
                )}

                {/* Order Number (conditional) */}
                {needsOrderField && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {t('support.form.orderNumber')} {t('support.form.optional')}
                    </label>
                    <Input
                      value={formData.order_id}
                      onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                      placeholder={t('support.form.orderPlaceholder')}
                      className="h-11"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF'
                      }}
                    />
                  </div>
                )}

                {/* SKU (conditional) */}
                {needsSkuField && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {t('support.form.sku')} {t('support.form.optional')}
                    </label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="z.B. NS-12345"
                      className="h-11"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF'
                      }}
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {isLanguageRequest ? t('support.languageRequest.reason') : t('support.form.message')} {!isLanguageRequest && t('support.form.required')}
                  </label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder={t('support.form.messagePlaceholder')}
                    rows={4}
                    className="resize-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF'
                    }}
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {t('support.form.attachments')} {t('support.form.optional')}
                  </label>
                  <label 
                    className="flex items-center justify-center gap-2 h-20 rounded-xl cursor-pointer transition-all hover:border-purple-500/50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '2px dashed rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {t('support.form.uploadFiles')}
                        </span>
                      </>
                    )}
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
                  </label>
                  
                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {attachments.map((att, i) => (
                        <div 
                          key={i} 
                          className="relative group"
                        >
                          {att.isImage ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div 
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                            >
                              <FileText className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                              <span className="text-xs text-white truncate max-w-[100px]">{att.name}</span>
                            </div>
                          )}
                          <button 
                            type="button"
                            onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(239, 68, 68, 0.9)' }}
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-5 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 h-12"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || (!formData.subject && !isLanguageRequest) || (!formData.body && !isLanguageRequest) || (isLanguageRequest && !formData.requestedLanguage)}
                    className="flex-1 h-12 btn-gold font-black"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 me-2 animate-spin" />
                        {t('support.form.creating')}
                      </>
                    ) : (
                      <>
                        {t('support.createTicket')}
                        <ChevronRight className={`w-4 h-4 ms-1 ${isRTL ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && createdTicket && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(52, 211, 153, 0.15)' }}
              >
                <Check className="w-10 h-10" style={{ color: '#34D399' }} />
              </motion.div>
              
              <h2 className="text-2xl font-black text-white mb-2">
                {t('support.success.ticketCreated')}
              </h2>
              <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {t('support.success.weContactYou')}
              </p>
              
              <div 
                className="inline-block px-4 py-2 rounded-lg mb-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{t('support.success.ticketId')}:</span>
                <span className="ms-2 font-mono font-bold text-white">#{createdTicket.id.slice(0, 8)}</span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 h-12"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {t('common.close')}
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    onSuccess?.(createdTicket);
                  }}
                  className="flex-1 h-12 btn-gold font-black"
                >
                  {t('support.success.viewTicket')}
                  <ChevronRight className={`w-4 h-4 ms-1 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}