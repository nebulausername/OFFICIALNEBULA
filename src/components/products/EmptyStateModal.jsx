import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, CheckCircle2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/api';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EmptyStateModal({ isOpen, onClose, searchQuery }) {
  const [formData, setFormData] = useState({
    brand: '',
    product: searchQuery || '',
    category: '',
    size: '',
    message: '',
    email: '',
    phone: ''
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (searchQuery && isOpen) {
      setFormData(prev => ({ ...prev, product: searchQuery }));
    }
  }, [searchQuery, isOpen]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await api.integrations.uploadFile({ file });
      setUploadedImage(file_url);
      toast({
        title: 'Bild hochgeladen',
        description: 'Dein Bild wurde erfolgreich hochgeladen'
      });
    } catch (error) {
      toast({
        title: 'Upload fehlgeschlagen',
        description: 'Bitte versuche es erneut',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await api.auth.me();
      
      const requestData = {
        user_id: user.id,
        username: user.full_name,
        note: `Produktsuche - Kein Treffer:\n\nMarke: ${formData.brand}\nProdukt: ${formData.product}\nKategorie: ${formData.category}\nGröße: ${formData.size}\n\nNachricht:\n${formData.message}${uploadedImage ? `\n\nBild: ${uploadedImage}` : ''}`,
        status: 'pending',
        total_sum: 0,
        contact_info: {
          name: user.full_name,
          email: formData.email || user.email,
          phone: formData.phone
        }
      };

      await api.entities.Request.create(requestData);

      try {
        await api.integrations.sendEmail({
          to: user.email,
          subject: 'Wir suchen dein Produkt für dich',
          body: `Hallo ${user.full_name},\n\nwir haben deine Suchanfrage erhalten und suchen jetzt nach dem perfekten Produkt für dich.\n\nDeine Suche: ${formData.product}\n\nWir melden uns schnellstmöglich!\n\nViele Grüße,\nDein Nebula Supply Team`
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          brand: '',
          product: '',
          category: '',
          size: '',
          message: '',
          email: '',
          phone: ''
        });
        setUploadedImage(null);
      }, 2000);

    } catch (error) {
      console.error('Request submission failed:', error);
      toast({
        title: 'Fehler',
        description: 'Anfrage konnte nicht gesendet werden',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-2 border-zinc-800/50 p-0 rounded-2xl">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-3xl font-black text-white mb-3">Wir suchen für dich!</h3>
              <p className="text-zinc-400 text-lg">Unser Team findet das perfekte Produkt für dich.</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="relative p-8 pb-6 border-b border-zinc-800/50">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Was suchst du?</h2>
                    <p className="text-zinc-400 text-sm mt-1">Wir finden es für dich</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Brand */}
                  <div>
                    <Label htmlFor="brand" className="text-zinc-300 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-purple-400">1.</span> Welche Marke?
                    </Label>
                    <Input
                      id="brand"
                      placeholder="z.B. Nike, Jordan, Supreme..."
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500"
                    />
                  </div>

                  {/* Product */}
                  <div>
                    <Label htmlFor="product" className="text-zinc-300 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-purple-400">2.</span> Welches Produkt? *
                    </Label>
                    <Input
                      id="product"
                      placeholder="z.B. Air Jordan 1, Hoodie..."
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      required
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category" className="text-zinc-300 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-purple-400">3.</span> Kategorie
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectValue placeholder="Wähle eine Kategorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="Sneaker">Sneaker</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Vapes">Vapes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size */}
                  <div>
                    <Label htmlFor="size" className="text-zinc-300 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-purple-400">4.</span> Größe *
                    </Label>
                    <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectValue placeholder="Wähle eine Größe" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="text-zinc-300 font-semibold mb-2">Weitere Details (optional)</Label>
                  <Textarea
                    id="message"
                    rows={3}
                    placeholder="Farbe, Budget, besondere Wünsche..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-zinc-300 font-semibold mb-2">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="deine@email.de"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-zinc-300 font-semibold mb-2">Telefon (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+49 123 456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label className="text-zinc-300 font-semibold mb-2 flex items-center gap-2">
                    <span className="text-purple-400">5.</span> Bild hochladen (optional)
                  </Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="empty-state-image-upload"
                    />
                    <label
                      htmlFor="empty-state-image-upload"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer group"
                    >
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Uploaded" className="w-32 h-32 object-cover rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-zinc-600 group-hover:text-purple-400 mb-2 transition-colors" />
                          <p className="text-zinc-400 text-sm">Bild vom Produkt hochladen</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.product || !formData.size}
                  className="w-full h-14 text-lg font-black bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-[1.02] transition-transform"
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Anfrage absenden'}
                </Button>

                <p className="text-xs text-zinc-500 text-center">
                  Wir suchen das Produkt für dich und melden uns innerhalb von 24h
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}