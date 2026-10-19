import { InventoryStats } from '../types';
import { getTypeLabel, getTypeIcon } from '../utils/inventory';
import { EquipmentType } from '../types';

interface DashboardProps {
  stats: InventoryStats;
  onNavigate: (section: string) => void;
}

export default function Dashboard({ stats, onNavigate }: DashboardProps) {
  const totalActive = stats.available + stats.assigned + stats.maintenance;
  
  return (
    <div className="space-y-5">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">InventarioPro</h2>
        <p className="text-blue-100 text-sm mt-1">Gestión de equipos de cómputo</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/15 backdrop-blur rounded-xl p-3">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-blue-100">Total Equipos</p>
          </div>
          <div className="bg-white/15 backdrop-blur rounded-xl p-3">
            <p className="text-2xl font-bold">{stats.available}</p>
            <p className="text-xs text-blue-100">Disponibles</p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Estado de Equipos</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatusCard
            label="Disponibles"
            count={stats.available}
            total={stats.total}
            color="bg-green-500"
            bgColor="bg-green-50"
          />
          <StatusCard
            label="Asignados"
            count={stats.assigned}
            total={stats.total}
            color="bg-blue-500"
            bgColor="bg-blue-50"
          />
          <StatusCard
            label="Mantenimiento"
            count={stats.maintenance}
            total={stats.total}
            color="bg-yellow-500"
            bgColor="bg-yellow-50"
          />
          <StatusCard
            label="Retirados"
            count={stats.retired}
            total={stats.total}
            color="bg-gray-400"
            bgColor="bg-gray-50"
          />
        </div>
      </div>

      {/* By Type */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Por Tipo de Equipo</h3>
        <div className="space-y-3">
          {(Object.entries(stats.byType) as [EquipmentType, number][])
            .filter(([, count]) => count > 0)
            .map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xl w-8">{getTypeIcon(type)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{getTypeLabel(type)}</span>
                    <span className="text-sm font-bold text-gray-800">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${totalActive > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          {Object.values(stats.byType).every(v => v === 0) && (
            <p className="text-center text-gray-400 text-sm py-4">No hay equipos registrados</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('add')}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl active:bg-blue-100 transition-colors"
          >
            <span className="text-3xl">➕</span>
            <span className="text-xs font-medium text-blue-700">Agregar Equipo</span>
          </button>
          <button
            onClick={() => onNavigate('list')}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl active:bg-purple-100 transition-colors"
          >
            <span className="text-3xl">📋</span>
            <span className="text-xs font-medium text-purple-700">Ver Inventario</span>
          </button>
          <button
            onClick={() => onNavigate('list-available')}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl active:bg-green-100 transition-colors"
          >
            <span className="text-3xl">✅</span>
            <span className="text-xs font-medium text-green-700">Disponibles</span>
          </button>
          <button
            onClick={() => onNavigate('list-assigned')}
            className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl active:bg-orange-100 transition-colors"
          >
            <span className="text-3xl">👤</span>
            <span className="text-xs font-medium text-orange-700">Asignados</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, count, total, color, bgColor }: { label: string; count: number; total: number; color: string; bgColor: string }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className={`${bgColor} rounded-xl p-3`}>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
      <p className="text-xs text-gray-500">{percentage}%</p>
    </div>
  );
}
