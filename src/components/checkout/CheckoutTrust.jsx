import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

export default function CheckoutTrust() {
    return (
        <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex flex-col items-center text-center gap-2">
                <ShieldCheck className="text-emerald-500" size={24} />
                <span className="text-xs font-bold text-zinc-300">Sichere Zahlung</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex flex-col items-center text-center gap-2">
                <Truck className="text-blue-500" size={24} />
                <span className="text-xs font-bold text-zinc-300">Schneller Versand</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex flex-col items-center text-center gap-2">
                <RotateCcw className="text-purple-500" size={24} />
                <span className="text-xs font-bold text-zinc-300">30 Tage Rückgabe</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex flex-col items-center text-center gap-2">
                <Lock className="text-zinc-400" size={24} />
                <span className="text-xs font-bold text-zinc-300">SSL Verschlüsselt</span>
            </div>
        </div>
    );
}
