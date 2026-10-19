import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Share2, Minus, Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Variant, EquipmentModel } from '../types';
import { getStatusLabel, getStatusColor, formatCurrency, getMovementLabel } from '../utils/inventory';

interface VariantDetailProps {
  variant: Variant;
  model: EquipmentModel;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onAdjustStock: (delta: number, reason: string) => void;
}

export default function VariantDetail({ variant, model, onEdit, onDelete, onBack, onAdjustStock }: VariantDetailProps) {
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockDelta, setStockDelta] = useState('');
  const [stockReason, setStockReason] = useState('');
  const [showQR, setShowQR] = useState(false);

  const margin = variant.cost > 0 ? ((variant.price - variant.cost) / variant.cost) * 100 : 0;
  const totalValue = variant.stock * variant.price;

  const handleStockSubmit = () => {
    const delta = parseInt(stockDelta);
    if (isNaN(delta) || delta === 0) return;
    if (!stockReason.trim()) { alert('Ingresa un motivo'); return; }
    onAdjustStock(delta, stockReason);
    setShowStockModal(false);
    setStockDelta('');
    setStockReason('');
  };

  const handleShare = async () => {
    const specsText = Object.entries(variant.specs).filter(([,v]) => v).map(([k,v]) => `${k}: ${v}`).join(', ');
    const text = `📋 ${model.brand} ${model.model}\n🏷️ ${variant.name}\n🔖 SKU: ${variant.sku}\n💰 Precio: ${formatCurrency(variant.price)}\n📦 Stock: ${variant.stock} unidades\n📍 ${variant.location || 'N/A'}\n📊 ${specsText}`;
    if (navigator.share) {
      try { await navigator.share({ title: variant.sku, text }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Información copiada');
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar la versión "${variant.name}"?`)) onDelete();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onBack} className="p-2 -ml-2 active:bg-blue-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold truncate px-2">Detalle Versión</h1>
          <button onClick={handleShare} className="p-2 -mr-2 active:bg-blue-800 rounded-lg">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">{model.brand} {model.model}</p>
          <h2 className="text-lg font-bold text-gray-800 mt-1">{variant.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(variant.status)}`}>
              {getStatusLabel(variant.status)}
            </span>
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <div><span className="text-gray-500">SKU:</span> <span className="font-mono font-medium">{variant.sku}</span></div>
            <div><span className="text-gray-500">Inv:</span> <span className="font-mono font-medium">{variant.inventoryCode}</span></div>
          </div>
        </div>

        {/* Stock & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-500">Stock</p>
            <p className={`text-2xl font-bold ${variant.stock === 0 ? 'text-red-600' : variant.stock <= variant.minStock ? 'text-amber-600' : 'text-green-600'}`}>
              {variant.stock}
            </p>
            <p className="text-[10px] text-gray-400">Mín: {variant.minStock}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-500">Precio</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(variant.price)}</p>
            <p className="text-[10px] text-gray-400">Costo: {formatCurrency(variant.cost)}</p>
          </div>
        </div>

        {/* Value */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-green-700">Valor en Inventario</p>
              <p className="text-lg font-bold text-green-800">{formatCurrency(totalValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-700">Margen</p>
              <p className="text-lg font-bold text-green-800">{margin.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Adjust Stock Button */}
        <button onClick={() => setShowStockModal(true)}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 active:bg-blue-700">
          <Plus size={18} /> Ajustar Stock
        </button>

        {/* Specs */}
        {Object.entries(variant.specs).filter(([,v]) => v).length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Especificaciones</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(variant.specs).filter(([,v]) => v).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 uppercase">{getSpecLabel(key)}</p>
                  <p className="text-xs font-medium text-gray-800">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {variant.location && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-1">📍 Ubicación</h3>
            <p className="text-sm text-gray-600">{variant.location}</p>
          </div>
        )}

        {/* Serial Numbers */}
        {variant.serialNumbers.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">🔢 Números de Serie ({variant.serialNumbers.length})</h3>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {variant.serialNumbers.map((sn, i) => (
                <p key={i} className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">{sn}</p>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {variant.notes && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-1">📝 Notas</h3>
            <p className="text-sm text-gray-600">{variant.notes}</p>
          </div>
        )}

        {/* QR */}
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <button onClick={() => setShowQR(!showQR)} className="w-full flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">📱 Código QR</h3>
            <span className={`transform transition-transform ${showQR ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showQR && (
            <div className="mt-3">
              <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-xl">
                <QRCodeSVG value={JSON.stringify({
                  code: variant.inventoryCode, sku: variant.sku,
                  model: `${model.brand} ${model.model}`, variant: variant.name,
                  price: variant.price, stock: variant.stock
                })} size={180} level="M" />
              </div>
              <p className="text-xs text-gray-500 mt-2">{variant.inventoryCode}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-medium active:bg-blue-700">
            <Edit size={18} /> Editar
          </button>
          <button onClick={handleDelete}
            className="flex items-center justify-center gap-2 bg-red-100 text-red-700 px-5 py-3.5 rounded-xl font-medium active:bg-red-200">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowStockModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800">± Ajustar Stock</h2>
            <p className="text-sm text-gray-500">Stock actual: <strong>{variant.stock}</strong> unidades</p>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cantidad (+ entrada / - salida)</label>
              <input type="number" value={stockDelta} onChange={(e) => setStockDelta(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-bold text-center focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 5 o -3" />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setStockDelta((parseInt(stockDelta || '0') + 1).toString())}
                  className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center justify-center gap-1">
                  <Plus size={16} /> Entrada
                </button>
                <button type="button" onClick={() => setStockDelta((parseInt(stockDelta || '0') - 1).toString())}
                  className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg font-medium flex items-center justify-center gap-1">
                  <Minus size={16} /> Salida
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Motivo *</label>
              <select value={stockReason} onChange={(e) => setStockReason(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar motivo...</option>
                <option value="Compra/Recepción">Compra/Recepción</option>
                <option value="Venta">Venta</option>
                <option value="Asignación a empleado">Asignación a empleado</option>
                <option value="Devolución">Devolución</option>
                <option value="Ajuste de inventario">Ajuste de inventario</option>
                <option value="Daño/Pérdida">Daño/Pérdida</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {stockDelta && (
              <div className={`p-3 rounded-xl ${parseInt(stockDelta) > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm font-medium ${parseInt(stockDelta) > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  Nuevo stock: {Math.max(0, variant.stock + parseInt(stockDelta))} unidades
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowStockModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancelar</button>
              <button onClick={handleStockSubmit}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium active:bg-blue-700">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSpecLabel(key: string): string {
  const labels: Record<string, string> = {
    processor: 'Procesador', ram: 'RAM', storage: 'Almacenamiento', storageType: 'Tipo Disco',
    screen: 'Pantalla', resolution: 'Resolución', graphics: 'Gráficos', os: 'Sistema Op.',
    connectivity: 'Conectividad', ports: 'Puertos', battery: 'Batería', weight: 'Peso',
    dimensions: 'Dimensiones', color: 'Color', extra: 'Extras',
  };
  return labels[key] || key;
}
