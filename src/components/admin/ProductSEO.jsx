import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';

export default function ProductSEO({ name, description, slug, onChange }) {
    // Mock domain
    const domain = 'nebulavapes.de';
    const url = `https://${domain}/product/${slug || 'produkt-name'}`;

    // Truncate for preview
    const metaTitle = name ? `${name} | Nebula Vapes` : 'Produkt Titel | Nebula Vapes';
    const metaDesc = description
        ? (description.length > 160 ? description.substring(0, 157) + '...' : description)
        : 'Kaufen Sie die besten Vapes bei Nebula. Premium Qualität, schnelle Lieferung.';

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-zinc-700 bg-zinc-900/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Search className="text-blue-400" />
                    SEO Vorschau (Google)
                </h3>

                {/* Google Preview Card */}
                <div className="bg-white p-4 rounded-xl mb-6 max-w-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500">
                            N
                        </div>
                        <div className="text-sm text-zinc-800">
                            <span className="font-bold">Nebula Vapes</span>
                            <span className="text-zinc-500 mx-1">›</span>
                            <span>product</span>
                            <span className="text-zinc-500 mx-1">›</span>
                            <span>{slug || '...'}</span>
                        </div>
                        <div className="ml-auto text-zinc-500">
                            <i className="fas fa-ellipsis-v"></i>
                        </div>
                    </div>
                    <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1 truncate block font-normal">
                        {metaTitle}
                    </h4>
                    <p className="text-sm text-[#4d5156] leading-relaxed">
                        {metaDesc}
                    </p>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    {/* We iterate on the parent state directly usually, but here we assume props */}
                    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                        <p className="text-sm text-zinc-400 mb-2">
                            Der Titel und die Beschreibung werden automatisch aus den Produktdaten generiert.
                            In Zukunft kannst du hier Custom Meta Tags setzen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
