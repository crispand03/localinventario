import { useState } from 'react';
import { Search, Filter, X, Plus, FileText, Eye } from 'lucide-react';
import { Sale, DocumentType } from '../types';
import { formatCurrency } from '../utils/inventory';

interface SalesListProps {
  sales: Sale[];
  onSelect: (sale: Sale) => void;
  onAdd: () => void;
}

export default function SalesList({ sales, onSelect, onAdd }: SalesListProps) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [docFilter, setDocFilter] = useState<DocumentType | 'all'>('all');

  const filtered = sales.filter(s => {
    const matchesSearch = !search ||
      s.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.ruc?.includes(search) ||
      `${s.customer.firstName} ${s.customer.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.dni?.includes(search);
    const matchesDoc = docFilter === 'all' || s.documentType === docFilter;
    return matchesSearch && matchesDoc;
  });

  const totalRevenue = filtered.reduce((s, sale) => s + sale.total, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-green-100">Total Ventas</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-100">Comprobantes</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por N°, cliente, RUC/DNI..."
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
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <label className="text-xs font-medium text-gray-500 uppercase">Tipo Comprobante</label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <Chip label="Todos" active={docFilter === 'all'} onClick={() => setDocFilter('all')} />
            <Chip label="📄 Factura" active={docFilter === 'factura'} onClick={() => setDocFilter('factura')} />
            <Chip label="🧾 Boleta" active={docFilter === 'boleta'} onClick={() => setDocFilter('boleta')} />
            <Chip label="📋 Recibo" active={docFilter === 'recibo'} onClick={() => setDocFilter('recibo')} />
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-gray-500 font-medium">No hay ventas registradas</p>
          <p className="text-gray-400 text-sm mt-1">{sales.length === 0 ? 'Registra tu primera venta' : 'Intenta con otros filtros'}</p>
          {sales.length === 0 && (
            <button onClick={onAdd} className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-medium active:bg-green-700">
              + Nueva Venta
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sale => (
            <button key={sale.id} onClick={() => onSelect(sale)}
              className="w-full bg-white rounded-xl p-3 border border-gray-100 active:bg-gray-50 transition-colors text-left">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {sale.documentType === 'factura' ? '📄' : sale.documentType === 'boleta' ? '🧾' : '📋'}
                    </span>
                    <span className="font-mono text-sm font-bold text-blue-700">{sale.documentNumber}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-1 truncate">
                    {sale.documentType === 'factura' ? sale.customer.companyName :
                     sale.documentType === 'boleta' ? `${sale.customer.firstName} ${sale.customer.lastName}` :
                     'Consumidor Final'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' • '}{sale.items.length} producto{sale.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(sale.total)}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{sale.paymentMethod}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button onClick={onAdd}
        className="fixed bottom-28 bottom-safe right-4 w-14 h-14 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-300 active:bg-green-700 z-30 tap-target transition-transform active:scale-95">
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
