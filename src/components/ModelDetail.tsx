import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, Share2, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { EquipmentModel, Variant } from '../types';
import { getTypeLabel, getStatusLabel, getStatusColor, getTypeIcon, formatCurrency, formatNumber } from '../utils/inventory';

interface ModelDetailProps {
  model: EquipmentModel;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onAddVariant: () => void;
  onSelectVariant: (variant: Variant) => void;
  onAdjustStock: (variant: Variant) => void;
}

export default function ModelDetail({ model, onEdit, onDelete, onBack, onAddVariant, onSelectVariant, onAdjustStock }: ModelDetailProps) {
  const [showQR, setShowQR] = useState(false);
  const totalStock = model.variants.reduce((s, v) => s + v.stock, 0);
  const totalValue = model.variants.reduce((s, v) => s + (v.stock * v.price), 0);
  const avgPrice = model.variants.length > 0 ? model.variants.reduce((s, v) => s + v.price, 0) / model.variants.length : 0;

  const handleShare = async () => {
    const text = `📋 ${model.brand} ${model.model}\n📊 ${model.variants.length} versiones | ${totalStock} unidades\n💰 Desde ${formatCurrency(Math.min(...model.variants.map(v => v.price) || [0]))}\n📍 Valor: ${formatCurrency(totalValue)}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${model.brand} ${model.model}`, text }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Información copiada');
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar "${model.brand} ${model.model}" y todas sus versiones?`)) onDelete();
  };

  const specsEntries = Object.entries(model.baseSpecs).filter(([, v]) => v);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 pb-24 pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-blue-700 text-white pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-2 -ml-2 active:bg-blue-800 rounded-lg tap-target flex items-center justify-center">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold truncate px-2">Detalle del Modelo</h1>
          <button onClick={handleShare} className="p-2 -mr-2 active:bg-blue-800 rounded-lg tap-target flex items-center justify-center">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Photo & Basic Info */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {model.photo && <img src={model.photo} alt={model.model} className="w-full h-48 object-cover" />}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(model.type)}</span>
                  <span className="text-xs text-gray-500 uppercase">{getTypeLabel(model.type)}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mt-1">{model.brand} {model.model}</h2>
                {model.category && <p className="text-sm text-gray-500">{model.category}</p>}
              </div>
            </div>
            {model.description && <p className="text-sm text-gray-600 mt-2">{model.description}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <Package size={16} className="mx-auto text-blue-600 mb-1" />
            <p className="text-lg font-bold text-gray-800">{totalStock}</p>
            <p className="text-[10px] text-gray-500">Unidades</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <DollarSign size={16} className="mx-auto text-green-600 mb-1" />
            <p className="text-sm font-bold text-gray-800">{formatCurrency(avgPrice)}</p>
            <p className="text-[10px] text-gray-500">Precio Prom.</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <span className="text-lg">💰</span>
            <p className="text-sm font-bold text-gray-800">{formatCurrency(totalValue)}</p>
            <p className="text-[10px] text-gray-500">Valor Total</p>
          </div>
        </div>

        {/* Specs */}
        {specsEntries.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>📋</span> Especificaciones Base
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {specsEntries.map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 uppercase">{getSpecLabel(key)}</p>
                  <p className="text-xs font-medium text-gray-800 truncate">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>🔄</span> Versiones / Variantes ({model.variants.length})
            </h3>
            <button onClick={onAddVariant}
              className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium active:bg-blue-200">
              <Plus size={14} /> Nueva
            </button>
          </div>

          {model.variants.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">Sin variantes</p>
              <button onClick={onAddVariant} className="mt-2 text-blue-600 text-sm font-medium">
                + Agregar primera versión
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {model.variants.map(v => (
                <div key={v.id} className="border border-gray-100 rounded-xl p-3 active:bg-gray-50">
                  <button onClick={() => onSelectVariant(v)} className="w-full text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{v.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{v.sku} • {v.inventoryCode}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(v.status)}`}>
                        {getStatusLabel(v.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(v.price)}</span>
                      <span className={`text-xs font-semibold ${v.stock === 0 ? 'text-red-600' : v.stock <= v.minStock ? 'text-amber-600' : 'text-green-600'}`}>
                        Stock: {v.stock}
                      </span>
                      {v.specs.processor && <span className="text-[10px] text-gray-500 truncate">{v.specs.processor}</span>}
                      {v.specs.ram && <span className="text-[10px] text-gray-500">{v.specs.ram}</span>}
                    </div>
                  </button>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50">
                    <button onClick={() => onAdjustStock(v)}
                      className="flex-1 text-xs text-blue-600 font-medium py-2.5 bg-blue-50 rounded-lg active:bg-blue-100 tap-target transition-colors">
                      ± Ajustar Stock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR */}
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <button onClick={() => setShowQR(!showQR)} className="w-full flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">📱 Código QR del Modelo</h3>
            <span className={`transform transition-transform ${showQR ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showQR && (
            <div className="mt-3">
              <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-xl">
                <QRCodeSVG value={JSON.stringify({ id: model.id, brand: model.brand, model: model.model, type: model.type })} size={180} level="M" />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-medium active:bg-blue-700 tap-target transition-colors">
            <Edit size={18} /> Editar
          </button>
          <button onClick={handleDelete}
            className="flex items-center justify-center gap-2 bg-red-100 text-red-700 px-5 py-3.5 rounded-xl font-medium active:bg-red-200 tap-target transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
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
