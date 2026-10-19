import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Settings2, RotateCcw } from 'lucide-react';
import { StockMovement, EquipmentModel } from '../types';
import { getMovementLabel, getMovementColor, formatCurrency } from '../utils/inventory';

interface MovementsListProps {
  movements: StockMovement[];
  models: EquipmentModel[];
  onBack: () => void;
}

export default function MovementsList({ movements, models, onBack }: MovementsListProps) {
  const getModelName = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model ? `${model.brand} ${model.model}` : 'Modelo eliminado';
  };

  const getVariantName = (variantId: string, modelId: string) => {
    const model = models.find(m => m.id === modelId);
    const variant = model?.variants.find(v => v.id === variantId);
    return variant?.name || 'Versión eliminada';
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowDownCircle size={18} className="text-green-600" />;
      case 'out': return <ArrowUpCircle size={18} className="text-red-600" />;
      case 'transfer': return <ArrowLeftRight size={18} className="text-blue-600" />;
      case 'adjustment': return <Settings2 size={18} className="text-yellow-600" />;
      case 'return': return <RotateCcw size={18} className="text-purple-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onBack} className="p-2 -ml-2 active:bg-blue-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Movimientos de Stock</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pt-4">
        {movements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">Sin movimientos registrados</p>
            <p className="text-gray-400 text-sm mt-1">Los ajustes de stock aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-2">
            {movements.map(m => (
              <div key={m.id} className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getMovementColor(m.type)}`}>
                    {getMovementIcon(m.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-800">{m.reason}</p>
                      <span className={`text-sm font-bold ${m.type === 'in' || m.type === 'return' ? 'text-green-600' : 'text-red-600'}`}>
                        {m.type === 'in' || m.type === 'return' ? '+' : '-'}{m.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{getModelName(m.modelId)}</p>
                    <p className="text-xs text-gray-400 truncate">{getVariantName(m.variantId, m.modelId)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getMovementColor(m.type)}`}>
                        {getMovementLabel(m.type)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(m.date).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {m.responsible && <span className="text-[10px] text-gray-400">• {m.responsible}</span>}
                    </div>
                    {m.notes && <p className="text-xs text-gray-500 mt-1 italic">{m.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
