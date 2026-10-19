import { useState } from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { EquipmentModel, EquipmentType } from '../types';
import { getTypeLabel, getStatusColor, getStatusLabel, getTypeIcon, formatCurrency, formatNumber } from '../utils/inventory';

interface ModelListProps {
  models: EquipmentModel[];
  onSelect: (model: EquipmentModel) => void;
  onAdd: () => void;
  initialFilter?: string;
}

export default function ModelList({ models, onSelect, onAdd, initialFilter }: ModelListProps) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(!!initialFilter);
  const [typeFilter, setTypeFilter] = useState<string>(initialFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');

  const filtered = models.filter(m => {
    const matchesSearch = !search ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      m.model.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.variants.some(v =>
        v.sku.toLowerCase().includes(search.toLowerCase()) ||
        v.inventoryCode.toLowerCase().includes(search.toLowerCase()) ||
        v.specs.processor?.toLowerCase().includes(search.toLowerCase()) ||
        v.specs.ram?.toLowerCase().includes(search.toLowerCase())
      );
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || m.variants.some(v => v.status === statusFilter);
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
    if (sortBy === 'stock') {
      const aStock = a.variants.reduce((s, v) => s + v.stock, 0);
      const bStock = b.variants.reduce((s, v) => s + v.stock, 0);
      return bStock - aStock;
    }
    const aPrice = a.variants.length > 0 ? Math.min(...a.variants.map(v => v.price)) : 0;
    const bPrice = b.variants.length > 0 ? Math.min(...b.variants.map(v => v.price)) : 0;
    return bPrice - aPrice;
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar modelo, specs, SKU..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl border transition-colors ${showFilters ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
          <Filter size={20} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Tipo</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Chip label="Todos" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
              {(['laptop', 'aio', 'monitor', 'desktop', 'tablet', 'printer', 'phone', 'other'] as EquipmentType[]).map(t => (
                <Chip key={t} label={`${getTypeIcon(t)} ${getTypeLabel(t)}`} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Estado Stock</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Chip label="Todos" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
              <Chip label="✅ Disponible" active={statusFilter === 'available'} onClick={() => setStatusFilter('available')} />
              <Chip label="⚠️ Stock Bajo" active={statusFilter === 'low_stock'} onClick={() => setStatusFilter('low_stock')} />
              <Chip label="❌ Sin Stock" active={statusFilter === 'out_of_stock'} onClick={() => setStatusFilter('out_of_stock')} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Ordenar por</label>
            <div className="flex gap-1.5 mt-1">
              <Chip label="Nombre" active={sortBy === 'name'} onClick={() => setSortBy('name')} />
              <Chip label="Stock" active={sortBy === 'stock'} onClick={() => setSortBy('stock')} />
              <Chip label="Precio" active={sortBy === 'price'} onClick={() => setSortBy('price')} />
            </div>
          </div>
        </div>
      )}

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} modelo{filtered.length !== 1 ? 's' : ''}</p>
        {(typeFilter !== 'all' || statusFilter !== 'all') && (
          <button onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }} className="text-xs text-blue-600 font-medium">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-500 font-medium">No se encontraron modelos</p>
          <p className="text-gray-400 text-sm mt-1">{models.length === 0 ? 'Agrega tu primer modelo' : 'Intenta con otros filtros'}</p>
          {models.length === 0 && (
            <button onClick={onAdd} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium active:bg-blue-700">
              + Agregar Modelo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((m) => {
            const totalStock = m.variants.reduce((s, v) => s + v.stock, 0);
            const minPrice = m.variants.length > 0 ? Math.min(...m.variants.map(v => v.price)) : 0;
            const maxPrice = m.variants.length > 0 ? Math.max(...m.variants.map(v => v.price)) : 0;
            const hasLowStock = m.variants.some(v => v.status === 'low_stock');
            const hasOutOfStock = m.variants.some(v => v.status === 'out_of_stock');

            return (
              <button key={m.id} onClick={() => onSelect(m)}
                className="w-full bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100 active:bg-gray-50 transition-colors text-left">
                {m.photo ? (
                  <img src={m.photo} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
                    {getTypeIcon(m.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{m.brand} {m.model}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{getTypeLabel(m.type)}</span>
                    {m.category && <span className="text-xs text-gray-400">• {m.category}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      {m.variants.length} versión{m.variants.length !== 1 ? 'es' : ''}
                    </span>
                    <span className={`text-xs font-bold ${totalStock === 0 ? 'text-red-600' : hasLowStock ? 'text-amber-600' : 'text-green-600'}`}>
                      {formatNumber(totalStock)} en stock
                    </span>
                    {minPrice > 0 && (
                      <span className="text-xs font-semibold text-blue-600">
                        {minPrice === maxPrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
                      </span>
                    )}
                  </div>
                  {(hasLowStock || hasOutOfStock) && (
                    <div className="flex gap-1 mt-1">
                      {hasOutOfStock && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Sin stock</span>}
                      {hasLowStock && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">Stock bajo</span>}
                    </div>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <button onClick={onAdd}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-300 active:bg-blue-700 z-30">
        <Plus size={28} className="text-white" />
      </button>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
        active ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}>
      {label}
    </button>
  );
}
