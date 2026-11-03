import { ArrowLeft, FileText, Share2, Trash2, Download, MessageCircle } from 'lucide-react';
import { Sale } from '../types';
import { formatCurrency } from '../utils/inventory';
import { generateSalePDF, getWhatsAppShareUrl } from '../utils/pdf';

interface SaleDetailProps {
  sale: Sale;
  onBack: () => void;
  onDelete: () => void;
}

export default function SaleDetail({ sale, onBack, onDelete }: SaleDetailProps) {
  const handleDownloadPDF = () => {
    const doc = generateSalePDF(sale);
    const filename = `${sale.documentType}_${sale.documentNumber}.pdf`;
    doc.save(filename);
  };

  const handleShareWhatsApp = () => {
    const url = getWhatsAppShareUrl(sale);
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    const customerName = sale.documentType === 'factura' 
      ? sale.customer.companyName 
      : sale.documentType === 'boleta'
      ? `${sale.customer.firstName} ${sale.customer.lastName}`.trim()
      : 'Consumidor Final';
    
    const text = `${sale.documentType.toUpperCase()} ${sale.documentNumber}\nCliente: ${customerName}\nTotal: ${formatCurrency(sale.total)}\nFecha: ${new Date(sale.date).toLocaleDateString('es-PE')}`;
    
    if (navigator.share) {
      try { await navigator.share({ title: sale.documentNumber, text }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Información copiada');
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar la venta ${sale.documentNumber}?`)) onDelete();
  };

  const paymentLabels: Record<string, string> = {
    efectivo: '💵 Efectivo', tarjeta: '💳 Tarjeta', transferencia: '🏦 Transferencia',
    yape: '📱 Yape', plin: '📲 Plin', credito: '📝 Crédito'
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 pb-24 pb-safe">
      <div className="sticky top-0 z-40 bg-blue-700 text-white pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-2 -ml-2 active:bg-blue-800 rounded-lg tap-target flex items-center justify-center">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold truncate px-2">Detalle de Venta</h1>
          <button onClick={handleShare} className="p-2 -mr-2 active:bg-blue-800 rounded-lg tap-target flex items-center justify-center">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Document Header */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {sale.documentType === 'factura' ? '📄' : sale.documentType === 'boleta' ? '🧾' : '📋'}
                </span>
                <div>
                  <p className="text-xs text-gray-500 uppercase">{sale.documentType}</p>
                  <p className="text-xl font-bold font-mono text-blue-700">{sale.documentNumber}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(sale.total)}</p>
              <p className="text-xs text-gray-500">{paymentLabels[sale.paymentMethod]}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(sale.date).toLocaleString('es-PE', { 
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        </div>

        {/* Customer */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">👤 Cliente</h3>
          {sale.documentType === 'factura' && (
            <div className="space-y-1">
              <p className="text-sm"><span className="text-gray-500">Razón Social:</span> <strong>{sale.customer.companyName}</strong></p>
              <p className="text-sm"><span className="text-gray-500">RUC:</span> <strong>{sale.customer.ruc}</strong></p>
              {sale.customer.address && <p className="text-sm"><span className="text-gray-500">Dirección:</span> {sale.customer.address}</p>}
            </div>
          )}
          {sale.documentType === 'boleta' && (
            <div className="space-y-1">
              <p className="text-sm"><span className="text-gray-500">Cliente:</span> <strong>{sale.customer.firstName} {sale.customer.lastName}</strong></p>
              <p className="text-sm"><span className="text-gray-500">DNI:</span> <strong>{sale.customer.dni}</strong></p>
              {sale.customer.address && <p className="text-sm"><span className="text-gray-500">Dirección:</span> {sale.customer.address}</p>}
            </div>
          )}
          {sale.documentType === 'recibo' && (
            <p className="text-sm text-gray-600">Consumidor Final</p>
          )}
          {sale.customer.phone && <p className="text-sm mt-2"><span className="text-gray-500">Tel:</span> {sale.customer.phone}</p>}
          {sale.customer.email && <p className="text-sm"><span className="text-gray-500">Email:</span> {sale.customer.email}</p>}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">📦 Productos</h3>
          <div className="space-y-2">
            {sale.items.map((item, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.modelName}</p>
                    <p className="text-xs text-gray-500">{item.variantName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(item.subtotal)}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                  </div>
                </div>
                {item.discount > 0 && (
                  <p className="text-xs text-green-600 mt-1">Descuento: {item.discount}%</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IGV (18%):</span>
              <span className="font-medium">{formatCurrency(sale.igv)}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-800">TOTAL:</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-green-700 pt-1">
              <span>Ganancia:</span>
              <span className="font-semibold">{formatCurrency(sale.profit)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-1">📝 Observaciones</h3>
            <p className="text-sm text-gray-600">{sale.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-medium active:bg-blue-700 tap-target transition-colors">
            <Download size={18} /> PDF
          </button>
          <button onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-medium active:bg-green-700 tap-target transition-colors">
            <MessageCircle size={18} /> WhatsApp
          </button>
        </div>

        <button onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 py-3 rounded-xl font-medium active:bg-red-200 tap-target transition-colors">
          <Trash2 size={18} /> Eliminar Venta
        </button>
      </div>
    </div>
  );
}
