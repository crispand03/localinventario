import { InventoryStats, EquipmentType } from '../types';
import { getTypeLabel, getTypeIcon, formatCurrency, formatNumber } from '../utils/inventory';
import { AlertTriangle, Package, TrendingUp, DollarSign, BarChart3, Clock, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import IPhoneHelp from './IPhoneHelp';
import { useIsIOS } from '../hooks/useDevice';

interface DashboardProps {
  stats: InventoryStats;
  onNavigate: (section: string) => void;
}

export default function Dashboard({ stats, onNavigate }: DashboardProps) {
  const [showHelp, setShowHelp] = useState(false);
  const { isIOS } = useIsIOS();

  return (
    <div className="space-y-5">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold">InventarioPro</h2>
            <p className="text-blue-100 text-sm mt-0.5">Gestión inteligente de equipos</p>
          </div>
          <div className="flex items-center gap-2">
            {isIOS && (
              <button 
                onClick={() => setShowHelp(true)}
                className="p-2 bg-white/20 rounded-lg active:bg-white/30 transition-colors"
                title="Ayuda para iPhone"
              >
                <HelpCircle size={20} />
              </button>
            )}
            <div className="text-4xl">📊</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.totalModels}</p>
            <p className="text-[10px] text-blue-100">Modelos</p>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{formatNumber(stats.totalStock)}</p>
            <p className="text-[10px] text-blue-100">Unidades</p>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
            <p className="text-[10px] text-blue-100">Valor Total</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-800 text-sm">Alertas de Stock</h3>
          </div>
          <div className="flex gap-3">
            {stats.lowStockCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs text-amber-700">{stats.lowStockCount} stock bajo</span>
              </div>
            )}
            {stats.outOfStockCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-amber-700">{stats.outOfStockCount} sin stock</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="mt-2 text-xs text-amber-700 font-medium underline"
          >
            Ver detalles →
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<Package size={18} className="text-blue-600" />}
          label="Variantes"
          value={stats.totalVariants.toString()}
          bgColor="bg-blue-50"
        />
        <MetricCard
          icon={<TrendingUp size={18} className="text-green-600" />}
          label="Valor Inventario"
          value={formatCurrency(stats.totalValue)}
          bgColor="bg-green-50"
        />
        <MetricCard
          icon={<DollarSign size={18} className="text-purple-600" />}
          label="Costo Total"
          value={formatCurrency(stats.totalCost)}
          bgColor="bg-purple-50"
        />
        <MetricCard
          icon={<BarChart3 size={18} className="text-orange-600" />}
          label="Margen"
          value={stats.totalCost > 0 ? `${Math.round(((stats.totalValue - stats.totalCost) / stats.totalCost) * 100)}%` : '0%'}
          bgColor="bg-orange-50"
        />
      </div>

      {/* By Type */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-600" />
          Por Categoría
        </h3>
        <div className="space-y-2.5">
          {(Object.entries(stats.byType) as [EquipmentType, { models: number; stock: number; value: number }][])
            .filter(([, data]) => data.models > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([type, data]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-lg w-7">{getTypeIcon(type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-medium text-gray-700 truncate">{getTypeLabel(type)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{data.stock} uds</span>
                      <span className="text-xs font-semibold text-gray-800">{formatCurrency(data.value)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${stats.totalValue > 0 ? (data.value / stats.totalValue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          {Object.values(stats.byType).every(v => v.models === 0) && (
            <p className="text-center text-gray-400 text-sm py-4">No hay modelos registrados</p>
          )}
        </div>
      </div>

      {/* Recent Movements */}
      {stats.recentMovements.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            Movimientos Recientes
          </h3>
          <div className="space-y-2">
            {stats.recentMovements.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  m.type === 'in' ? 'bg-green-100 text-green-700' :
                  m.type === 'out' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {m.type === 'in' ? '↓' : m.type === 'out' ? '↑' : '↔'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.reason}</p>
                  <p className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString('es')}</p>
                </div>
                <span className={`text-sm font-bold ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.type === 'in' ? '+' : '-'}{m.quantity}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('movements')}
            className="w-full mt-3 text-center text-sm text-blue-600 font-medium py-2"
          >
            Ver todos los movimientos →
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Acciones Rápidas</h3>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction emoji="➕" label="Nuevo Modelo" color="bg-blue-50" textColor="text-blue-700" onClick={() => onNavigate('add-model')} />
          <QuickAction emoji="🛒" label="Nueva Venta" color="bg-green-50" textColor="text-green-700" onClick={() => onNavigate('sales')} />
          <QuickAction emoji="📋" label="Inventario" color="bg-purple-50" textColor="text-purple-700" onClick={() => onNavigate('list')} />
          <QuickAction emoji="📥" label="Entrada Stock" color="bg-cyan-50" textColor="text-cyan-700" onClick={() => onNavigate('stock-in')} />
          <QuickAction emoji="🔄" label="Movimientos" color="bg-orange-50" textColor="text-orange-700" onClick={() => onNavigate('movements')} />
          <QuickAction emoji="⚠️" label="Alertas" color="bg-amber-50" textColor="text-amber-700" onClick={() => onNavigate('alerts')} />
        </div>
      </div>

      {/* iPhone Help Modal */}
      <IPhoneHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

function MetricCard({ icon, label, value, bgColor }: { icon: React.ReactNode; label: string; value: string; bgColor: string }) {
  return (
    <div className={`${bgColor} rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}

function QuickAction({ emoji, label, color, textColor, onClick }: { emoji: string; label: string; color: string; textColor: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3.5 ${color} rounded-xl active:opacity-80 transition-opacity tap-target`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className={`text-xs font-medium ${textColor}`}>{label}</span>
    </button>
  );
}
