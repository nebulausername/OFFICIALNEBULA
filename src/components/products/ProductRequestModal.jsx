import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Upload, CheckCircle2, Package } from 'lucide-react';
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

export default function ProductRequestModal({ product, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    productName: product?.name || '',
    productId: product?.sku || '',
    brand: '',
    size: '',
    color: '',
    budget: '',
    message: '',
    email: '',
    phone: ''
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (product && isOpen) {
      setFormData(prev => ({
        ...prev,
        productName: product.name || '',
        productId: product.sku || ''
      }));
    }
  }, [product, isOpen]);

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
      
      // Create request with all data
      const requestData = {
        user_id: user.id,
        username: user.full_name,
        note: `Produktanfrage:\n\nProdukt: ${formData.productName}\nProdukt-ID: ${formData.productId}\nMarke: ${formData.brand}\nGröße: ${formData.size}\nFarbe: ${formData.color}\nBudget: ${formData.budget}€\n\nNachricht:\n${formData.message}${uploadedImage ? `\n\nBild: ${uploadedImage}` : ''}`,
        status: 'pending',
        total_sum: parseFloat(formData.budget) || 0,
        contact_info: {
          name: user.full_name,
          email: formData.email || user.email,
          phone: formData.phone
        }
      };

      await api.entities.Request.create(requestData);

      // Send email notification
      try {
        await api.integrations.sendEmail({
          to: user.email,
          subject: 'Deine Produktanfrage wurde erhalten',
          body: `Hallo ${user.full_name},\n\nwir haben deine Anfrage erhalten und werden uns schnellstmöglich bei dir melden.\n\nDetails:\n${formData.productName} (${formData.productId})\n\nViele Grüße,\nDein Nebula Supply Team`
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          productName: '',
          productId: '',
          brand: '',
          size: '',
          color: '',
          budget: '',
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
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
                <h3 className="text-3xl font-black text-white mb-3">Anfrage gesendet!</h3>
                <p className="text-zinc-400 text-lg">Wir melden uns schnellstmöglich bei dir.</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                      <Package className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">Produkt anfragen</h2>
                      <p className="text-zinc-400 text-sm mt-1">Wir helfen dir, das perfekte Produkt zu finden</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Pre-filled Product Info */}
                  {product && (
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                      <Label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Produkt</Label>
                      <div className="flex items-center gap-3">
                        {product.cover_image && (
                          <img src={product.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-white font-bold">{product.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs border-zinc-700 text-zinc-400">
                            {product.sku}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brand */}
                    <div>
                      <Label htmlFor="brand" className="text-zinc-300 font-semibold mb-2">Marke</Label>
                      <Input
                        id="brand"
                        placeholder="z.B. Nike, Jordan, Supreme..."
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500"
                      />
                    </div>

                    {/* Size */}
                    <div>
                      <Label htmlFor="size" className="text-zinc-300 font-semibold mb-2">Größe *</Label>
                      <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                          <SelectValue placeholder="Wähle eine Größe" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color */}
                    <div>
                      <Label htmlFor="color" className="text-zinc-300 font-semibold mb-2">Farbe (optional)</Label>
                      <Input
                        id="color"
                        placeholder="z.B. Schwarz, Rot, Weiß..."
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500"
                      />
                    </div>

                    {/* Budget */}
                    <div>
                      <Label htmlFor="budget" className="text-zinc-300 font-semibold mb-2">Budget (optional)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="z.B. 150"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-zinc-300 font-semibold mb-2">Deine Nachricht</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder="Teile uns weitere Details mit..."
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
                    <Label className="text-zinc-300 font-semibold mb-2">Bild hochladen (optional)</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer group"
                      >
                        {uploadedImage ? (
                          <div className="relative">
                            <img src={uploadedImage} alt="Uploaded" className="w-32 h-32 object-cover rounded-lg" />
                            <Badge className="absolute -top-2 -right-2 bg-green-500">✓</Badge>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-zinc-600 group-hover:text-purple-400 mb-2 transition-colors" />
                            <p className="text-zinc-400 text-sm text-center">
                              Klicke hier oder ziehe ein Bild hierher
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.size}
                    className="w-full h-14 text-lg font-black bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-[1.02] transition-transform"
                  >
                    {isSubmitting ? 'Wird gesendet...' : 'Anfrage absenden'}
                  </Button>

                  <p className="text-xs text-zinc-500 text-center">
                    Wir melden uns innerhalb von 24 Stunden bei dir
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}