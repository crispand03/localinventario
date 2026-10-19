import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { Equipment, EquipmentType } from '../types';
import { getTypeLabel, getStatusLabel, getStatusColor, getTypeIcon } from '../utils/inventory';

interface EquipmentListProps {
  equipment: Equipment[];
  onSelect: (equipment: Equipment) => void;
  onAdd: () => void;
  initialStatusFilter?: string;
}

export default function EquipmentList({ equipment, onSelect, onAdd, initialStatusFilter }: EquipmentListProps) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(!!initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'all');

  const filtered = equipment.filter(item => {
    const matchesSearch = !search || 
      item.inventoryCode.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar equipo..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl border transition-colors ${showFilters ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3 animate-in">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Tipo</label>
            <div className="flex flex-wrap gap-2 mt-1">
              <FilterChip label="Todos" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
              <FilterChip label="💻 Laptop" active={typeFilter === 'laptop'} onClick={() => setTypeFilter('laptop')} />
              <FilterChip label="🖥️ AIO" active={typeFilter === 'aio'} onClick={() => setTypeFilter('aio')} />
              <FilterChip label="🖵 Monitor" active={typeFilter === 'monitor'} onClick={() => setTypeFilter('monitor')} />
              <FilterChip label="🖥️ Desktop" active={typeFilter === 'desktop'} onClick={() => setTypeFilter('desktop')} />
              <FilterChip label="📱 Tablet" active={typeFilter === 'tablet'} onClick={() => setTypeFilter('tablet')} />
              <FilterChip label="📦 Otro" active={typeFilter === 'other'} onClick={() => setTypeFilter('other')} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Estado</label>
            <div className="flex flex-wrap gap-2 mt-1">
              <FilterChip label="Todos" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
              <FilterChip label="✅ Disponible" active={statusFilter === 'available'} onClick={() => setStatusFilter('available')} />
              <FilterChip label="👤 Asignado" active={statusFilter === 'assigned'} onClick={() => setStatusFilter('assigned')} />
              <FilterChip label="🔧 Mantenimiento" active={statusFilter === 'maintenance'} onClick={() => setStatusFilter('maintenance')} />
              <FilterChip label="📦 Retirado" active={statusFilter === 'retired'} onClick={() => setStatusFilter('retired')} />
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} equipo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        {(typeFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }}
            className="text-xs text-blue-600 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Equipment List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-500 font-medium">No se encontraron equipos</p>
          <p className="text-gray-400 text-sm mt-1">
            {equipment.length === 0 ? 'Agrega tu primer equipo' : 'Intenta con otros filtros'}
          </p>
          {equipment.length === 0 && (
            <button
              onClick={onAdd}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium active:bg-blue-700"
            >
              + Agregar Equipo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100 active:bg-gray-50 transition-colors text-left"
            >
              {item.photo ? (
                <img src={item.photo} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {getTypeIcon(item.type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-blue-600 font-semibold">{item.inventoryCode}</p>
                <p className="font-medium text-gray-800 truncate">{item.brand} {item.model}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <span className="text-xs text-gray-400">{getTypeLabel(item.type)}</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
