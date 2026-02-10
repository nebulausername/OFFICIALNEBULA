import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const InvoiceTemplate = ({ order, user }) => {
    if (!order) return null;

    const formatDate = (date) => format(new Date(date), 'dd.MM.yyyy', { locale: de });
    const formatCurrency = (amount) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

    // Calculate tax (19% VAT assumed for Germany)
    const taxRate = 0.19;
    const netAmount = order.total_sum / (1 + taxRate);
    const taxAmount = order.total_sum - netAmount;

    return (
        <div className="invoice-container bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] relative font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">NEBULA SUPPLY</h1>
                    <p className="text-sm text-slate-500">Premium Vapes & Shishas</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest mb-1">Rechnung</h2>
                    <p className="text-sm text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="flex justify-between mb-12 gap-8">
                <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Rechnungsempfänger</h3>
                    <div className="text-sm text-slate-800 leading-relaxed">
                        <p className="font-bold">{user?.full_name || 'Gastbestellung'}</p>
                        <p>{order.contact_info?.street || 'Musterstraße 1'}</p>
                        <p>{order.contact_info?.zip} {order.contact_info?.city || 'Musterstadt'}</p>
                        <p>{order.contact_info?.country || 'Deutschland'}</p>
                        <p className="mt-2 text-slate-500">{user?.email}</p>
                    </div>
                </div>
                <div className="flex-1 text-right">
                    <div className="mb-4">
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">Rechnungsdatum</h3>
                        <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">Lieferdatum</h3>
                        <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">Zahlungsart</h3>
                        <p className="text-sm font-medium capitalize">{order.payment_method || 'Kreditkarte'}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8 text-sm">
                <thead>
                    <tr className="border-b-2 border-slate-800">
                        <th className="text-left py-3 font-bold text-slate-900">Position</th>
                        <th className="text-left py-3 font-bold text-slate-900">Artikelnummer</th>
                        <th className="text-right py-3 font-bold text-slate-900">Menge</th>
                        <th className="text-right py-3 font-bold text-slate-900">Einzelpreis</th>
                        <th className="text-right py-3 font-bold text-slate-900">Gesamt</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {(order.request_items || []).map((item, index) => (
                        <tr key={index}>
                            <td className="py-4 text-slate-800 font-medium">{item.name_snapshot}</td>
                            <td className="py-4 text-slate-500 font-mono text-xs">{item.sku_snapshot}</td>
                            <td className="py-4 text-right text-slate-800">{item.quantity_snapshot}</td>
                            <td className="py-4 text-right text-slate-800">{formatCurrency(item.price_snapshot)}</td>
                            <td className="py-4 text-right text-slate-800 font-bold">
                                {formatCurrency(item.price_snapshot * item.quantity_snapshot)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Netto</span>
                        <span>{formatCurrency(netAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>MwSt. (19%)</span>
                        <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-900 pt-2 mt-2">
                        <span>Gesamtbetrag</span>
                        <span>{formatCurrency(order.total_sum)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-8 right-8 text-xs text-slate-400 text-center border-t border-slate-100 pt-8">
                <p className="mb-1">Nebula Supply GmbH • Sternenstraße 42 • 10115 Berlin</p>
                <p>Geschäftsführer: Max Mustermann • HRB 123456 • USt-ID: DE123456789</p>
                <p className="mt-4 font-bold text-slate-300">Danke für deinen Einkauf bei Nebula Supply!</p>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          @page { margin: 0; }
          body { -webkit-print-color-adjust: exact; }
          .invoice-container { box-shadow: none; max-width: 100%; height: 100vh; }
        }
      `}</style>
        </div>
    );
};

export default InvoiceTemplate;
