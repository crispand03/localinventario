import { ArrowLeft, AlertTriangle, XCircle } from 'lucide-react';
import { EquipmentModel } from '../types';
import { getStatusColor, getStatusLabel, formatCurrency, getTypeIcon } from '../utils/inventory';

interface AlertsListProps {
  models: EquipmentModel[];
  onBack: () => void;
  onSelectModel: (model: EquipmentModel) => void;
}

export default function AlertsList({ models, onBack, onSelectModel }: AlertsListProps) {
  const lowStockVariants = models.flatMap(m =>
    m.variants.filter(v => v.status === 'low_stock').map(v => ({ ...v, model: m }))
  );
  const outOfStockVariants = models.flatMap(m =>
    m.variants.filter(v => v.status === 'out_of_stock').map(v => ({ ...v, model: m }))
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onBack} className="p-2 -ml-2 active:bg-blue-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">⚠️ Alertas de Stock</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <AlertTriangle size={20} className="mx-auto text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-700">{lowStockVariants.length}</p>
            <p className="text-xs text-amber-600">Stock Bajo</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <XCircle size={20} className="mx-auto text-red-600 mb-1" />
            <p className="text-2xl font-bold text-red-700">{outOfStockVariants.length}</p>
            <p className="text-xs text-red-600">Sin Stock</p>
          </div>
        </div>

        {/* Out of Stock */}
        {outOfStockVariants.length > 0 && (
          <div>
            <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
              <XCircle size={16} /> Sin Stock ({outOfStockVariants.length})
            </h3>
            <div className="space-y-2">
              {outOfStockVariants.map(v => (
                <button key={v.id} onClick={() => onSelectModel(v.model)}
                  className="w-full bg-white rounded-xl p-3 border border-red-100 text-left active:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(v.model.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{v.model.brand} {v.model.model}</p>
                      <p className="text-xs text-gray-500 truncate">{v.name}</p>
                      <p className="text-[10px] text-red-600 font-mono">{v.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{formatCurrency(v.price)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                        {getStatusLabel(v.status)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock */}
        {lowStockVariants.length > 0 && (
          <div>
            <h3 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Stock Bajo ({lowStockVariants.length})
            </h3>
            <div className="space-y-2">
              {lowStockVariants.map(v => (
                <button key={v.id} onClick={() => onSelectModel(v.model)}
                  className="w-full bg-white rounded-xl p-3 border border-amber-100 text-left active:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(v.model.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{v.model.brand} {v.model.model}</p>
                      <p className="text-xs text-gray-500 truncate">{v.name}</p>
                      <p className="text-xs text-amber-600 font-medium">
                        Stock: {v.stock} / Mín: {v.minStock}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{formatCurrency(v.price)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        {getStatusLabel(v.status)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {lowStockVariants.length === 0 && outOfStockVariants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500 font-medium">¡Todo en orden!</p>
            <p className="text-gray-400 text-sm mt-1">No hay alertas de stock</p>
          </div>
        )}
      </div>
    </div>
  );
}
