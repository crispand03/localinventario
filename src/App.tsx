import { useState, useEffect } from 'react';
import { Plus, Home, List, Settings, X, Camera, Upload, Save, Trash2, Edit, ArrowLeft, ShoppingCart, Download, QrCode, Copy, Check } from 'lucide-react';
import { Equipment, EquipmentType, EquipmentStatus, Sale, DocumentType, PaymentMethod, Customer, SaleItem } from './types';
import { getEquipment, saveEquipment, addEquipment, updateEquipment, deleteEquipment, getStats, getSales, addSale, deleteSale, exportData, importData, exportToFile, importFromFile } from './utils/storage';
import { generateInventoryCode, getTypeLabel, getStatusLabel, getStatusColor, getTypeIcon, formatCurrency, generateDocumentNumber } from './utils/inventory';

// Main App
export default function App() {
  const [view, setView] = useState<'dashboard' | 'list' | 'add' | 'edit' | 'sales' | 'add-sale' | 'sale-detail'>('dashboard');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSync, setShowSync] = useState(false);

  useEffect(() => {
    refreshData();
    
    // Listen for updates from other tabs
    const handleUpdate = () => refreshData();
    window.addEventListener('inventory-updated', handleUpdate);
    window.addEventListener('sales-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      window.removeEventListener('inventory-updated', handleUpdate);
      window.removeEventListener('sales-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const refreshData = () => {
    setEquipment(getEquipment());
    setSales(getSales());
  };

  const handleSaveEquipment = (item: Equipment) => {
    const existing = equipment.find(e => e.id === item.id);
    if (existing) {
      updateEquipment(item.id, item);
    } else {
      addEquipment(item);
    }
    refreshData();
    setView('list');
  };

  const handleDeleteEquipment = (id: string) => {
    deleteEquipment(id);
    refreshData();
    setView('list');
  };

  const handleSaveSale = (sale: Sale) => {
    addSale(sale);
    refreshData();
    setSelectedSale(sale);
    setView('sale-detail');
  };

  const handleDeleteSale = (id: string) => {
    deleteSale(id);
    refreshData();
    setView('sales');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'dashboard' && <Dashboard equipment={equipment} sales={sales} onNavigate={setView} />}
      {view === 'list' && <EquipmentList equipment={equipment} onSelect={(e) => { setSelectedEquipment(e); setView('edit'); }} onAdd={() => setView('add')} />}
      {view === 'add' && <EquipmentForm onSave={handleSaveEquipment} onCancel={() => setView('list')} />}
      {view === 'edit' && selectedEquipment && <EquipmentForm equipment={selectedEquipment} onSave={handleSaveEquipment} onCancel={() => setView('list')} onDelete={() => handleDeleteEquipment(selectedEquipment.id)} />}
      {view === 'sales' && <SalesList sales={sales} onSelect={(s) => { setSelectedSale(s); setView('sale-detail'); }} onAdd={() => setView('add-sale')} />}
      {view === 'add-sale' && <SaleForm equipment={equipment} onSave={handleSaveSale} onCancel={() => setView('sales')} />}
      {view === 'sale-detail' && selectedSale && <SaleDetail sale={selectedSale} onBack={() => setView('sales')} onDelete={() => handleDeleteSale(selectedSale.id)} />}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          <NavButton icon={<Home size={22} />} label="Inicio" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavButton icon={<List size={22} />} label="Inventario" active={view === 'list' || view === 'add' || view === 'edit'} onClick={() => setView('list')} />
          <button onClick={() => view === 'sales' ? setView('add-sale') : setView('add')} className="flex flex-col items-center -mt-6">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <Plus size={28} className="text-white" />
            </div>
            <span className="text-[10px] text-blue-600 font-semibold mt-1">Nuevo</span>
          </button>
          <NavButton icon={<ShoppingCart size={22} />} label="Ventas" active={view === 'sales' || view === 'add-sale' || view === 'sale-detail'} onClick={() => setView('sales')} />
          <NavButton icon={<Settings size={22} />} label="Ajustes" active={showSettings} onClick={() => setShowSettings(true)} />
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="⚙️ Ajustes">
          <div className="space-y-3">
            <button onClick={() => { exportToFile(); setShowSettings(false); }} className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
              <Download size={22} className="text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Exportar Datos</p>
                <p className="text-xs text-gray-500">Descargar inventario en JSON</p>
              </div>
            </button>
            <button onClick={async () => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const success = await importFromFile(file);
                  if (success) {
                    refreshData();
                    alert('Datos importados correctamente');
                    setShowSettings(false);
                  } else {
                    alert('Error al importar datos');
                  }
                }
              };
              input.click();
            }} className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
              <Upload size={22} className="text-green-600" />
              <div className="text-left">
                <p className="font-medium">Importar Datos</p>
                <p className="text-xs text-gray-500">Cargar desde archivo JSON</p>
              </div>
            </button>
            <button onClick={() => { setShowSettings(false); setShowSync(true); }} className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
              <QrCode size={22} className="text-purple-600" />
              <div className="text-left">
                <p className="font-medium">Sincronizar</p>
                <p className="text-xs text-gray-500">Compartir entre dispositivos</p>
              </div>
            </button>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-center text-xs text-gray-400">InventarioPro v3.0</p>
          </div>
        </Modal>
      )}

      {/* Sync Modal */}
      {showSync && <SyncModal isOpen={showSync} onClose={() => setShowSync(false)} onSyncComplete={refreshData} />}
    </div>
  );
}

// Navigation Button
function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Sync Modal
function SyncModal({ isOpen, onClose, onSyncComplete }: { isOpen: boolean; onClose: () => void; onSyncComplete: () => void }) {
  const [mode, setMode] = useState<'select' | 'export' | 'import'>('select');
  const [syncCode, setSyncCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const code = exportData();
    setSyncCode(code);
    setMode('export');
  };

  const handleImport = () => {
    if (!importCode.trim()) {
      alert('Por favor ingresa un código');
      return;
    }
    const success = importData(importCode.trim());
    if (success) {
      alert('Datos sincronizados correctamente');
      onSyncComplete();
      onClose();
    } else {
      alert('Código inválido');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔄 Sincronizar">
      {mode === 'select' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Comparte datos entre dispositivos</p>
          <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100">
            <QrCode size={24} className="text-blue-600" />
            <div className="text-left">
              <p className="font-medium">Exportar</p>
              <p className="text-xs text-blue-600">Generar código</p>
            </div>
          </button>
          <button onClick={() => setMode('import')} className="w-full flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100">
            <Download size={24} className="text-green-600" />
            <div className="text-left">
              <p className="font-medium">Importar</p>
              <p className="text-xs text-green-600">Ingresar código</p>
            </div>
          </button>
        </div>
      )}
      {mode === 'export' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Copia este código y pégalo en otro dispositivo:</p>
          <textarea value={syncCode} readOnly className="w-full h-32 p-3 text-xs font-mono bg-gray-50 border rounded-lg resize-none" />
          <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {copied ? <><Check size={16} /> ¡Copiado!</> : <><Copy size={16} /> Copiar</>}
          </button>
          <button onClick={() => setMode('select')} className="w-full py-2 bg-gray-200 rounded-lg">Volver</button>
        </div>
      )}
      {mode === 'import' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Pega el código del otro dispositivo:</p>
          <textarea value={importCode} onChange={(e) => setImportCode(e.target.value)} placeholder="Pega el código aquí..." className="w-full h-32 p-3 text-sm font-mono bg-gray-50 border rounded-lg resize-none" />
          <button onClick={handleImport} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Importar</button>
          <button onClick={() => setMode('select')} className="w-full py-2 bg-gray-200 rounded-lg">Volver</button>
        </div>
      )}
    </Modal>
  );
}

// Dashboard
function Dashboard({ equipment, sales, onNavigate }: { equipment: Equipment[]; sales: Sale[]; onNavigate: (view: any) => void }) {
  const stats = getStats();
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">InventarioPro</h2>
        <p className="text-blue-100 text-sm mt-1">Gestión de equipos y ventas</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs">Equipos</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{sales.length}</p>
            <p className="text-xs">Ventas</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{formatCurrency(totalSales)}</p>
            <p className="text-xs">Total</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-md">
        <h3 className="font-semibold text-gray-900 mb-3">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('add')} className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100">
            <Plus size={24} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Nuevo Equipo</span>
          </button>
          <button onClick={() => onNavigate('list')} className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100">
            <List size={24} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Ver Inventario</span>
          </button>
          <button onClick={() => onNavigate('add-sale')} className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100">
            <ShoppingCart size={24} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">Nueva Venta</span>
          </button>
          <button onClick={() => onNavigate('sales')} className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100">
            <Download size={24} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Ver Ventas</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Equipment List
function EquipmentList({ equipment, onSelect, onAdd }: { equipment: Equipment[]; onSelect: (e: Equipment) => void; onAdd: () => void }) {
  const [search, setSearch] = useState('');
  
  const filtered = equipment.filter(e => 
    !search || 
    e.brand.toLowerCase().includes(search.toLowerCase()) ||
    e.model.toLowerCase().includes(search.toLowerCase()) ||
    e.inventoryCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar equipo..."
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-500">No hay equipos</p>
          <button onClick={onAdd} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">
            + Agregar Equipo
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100 hover:bg-gray-50 text-left"
            >
              {item.photo ? (
                <img src={item.photo} alt="" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                  {getTypeIcon(item.type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-blue-600 font-semibold">{item.inventoryCode}</p>
                <p className="font-medium text-gray-800 truncate">{item.brand} {item.model}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Equipment Form
function EquipmentForm({ equipment, onSave, onCancel, onDelete }: { equipment?: Equipment; onSave: (e: Equipment) => void; onCancel: () => void; onDelete?: () => void }) {
  const [type, setType] = useState<EquipmentType>(equipment?.type || 'laptop');
  const [brand, setBrand] = useState(equipment?.brand || '');
  const [model, setModel] = useState(equipment?.model || '');
  const [serialNumber, setSerialNumber] = useState(equipment?.serialNumber || '');
  const [status, setStatus] = useState<EquipmentStatus>(equipment?.status || 'available');
  const [assignedTo, setAssignedTo] = useState(equipment?.assignedTo || '');
  const [location, setLocation] = useState(equipment?.location || '');
  const [purchaseDate, setPurchaseDate] = useState(equipment?.purchaseDate || '');
  const [warrantyEnd, setWarrantyEnd] = useState(equipment?.warrantyEnd || '');
  const [notes, setNotes] = useState(equipment?.notes || '');
  const [photo, setPhoto] = useState(equipment?.photo || '');
  const [inventoryCode] = useState(equipment?.inventoryCode || generateInventoryCode(type));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) {
      alert('Por favor completa marca y modelo');
      return;
    }

    const now = new Date().toISOString();
    const item: Equipment = {
      id: equipment?.id || crypto.randomUUID(),
      inventoryCode,
      type,
      brand: brand.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      status,
      assignedTo: assignedTo.trim(),
      location: location.trim(),
      purchaseDate,
      warrantyEnd,
      notes: notes.trim(),
      photo,
      createdAt: equipment?.createdAt || now,
      updatedAt: now,
    };

    onSave(item);
  };

  const handlePhotoCapture = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setPhoto(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onCancel} className="p-2 active:bg-blue-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">{equipment ? 'Editar' : 'Nuevo'} Equipo</h1>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">Foto</label>
          {photo ? (
            <div className="relative">
              <img src={photo} alt="" className="w-full h-48 object-cover rounded-xl" />
              <button type="button" onClick={() => setPhoto('')} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={handlePhotoCapture} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50">
              <Camera size={40} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Toma una foto</p>
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Código</label>
            <input type="text" value={inventoryCode} readOnly className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as EquipmentType)} className="w-full border border-gray-300 rounded-xl px-4 py-3">
              {(['laptop', 'aio', 'monitor', 'desktop', 'tablet', 'printer', 'phone', 'other'] as EquipmentType[]).map(t => (
                <option key={t} value={t}>{getTypeLabel(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Marca *</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Ej: Dell, HP" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Modelo *</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-3" placeholder="Ej: Latitude 5520" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Número de Serie</label>
            <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Estado</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as EquipmentStatus)} className="w-full border border-gray-300 rounded-xl px-4 py-3">
              <option value="available">Disponible</option>
              <option value="assigned">Asignado</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="retired">Retirado</option>
            </select>
          </div>
          {status === 'assigned' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Asignado a</label>
              <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3" />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ubicación</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none" />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-blue-700">
          <Save size={22} />
          Guardar
        </button>

        {onDelete && (
          <button type="button" onClick={onDelete} className="w-full bg-red-100 text-red-700 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-red-200">
            <Trash2 size={22} />
            Eliminar
          </button>
        )}
      </form>
    </div>
  );
}

// Sales List
function SalesList({ sales, onSelect, onAdd }: { sales: Sale[]; onSelect: (s: Sale) => void; onAdd: () => void }) {
  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Ventas</h2>
      
      {sales.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-gray-500">No hay ventas</p>
          <button onClick={onAdd} className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-medium">
            + Nueva Venta
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <button
              key={sale.id}
              onClick={() => onSelect(sale)}
              className="w-full bg-white rounded-xl p-4 border border-gray-100 hover:bg-gray-50 text-left"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm text-blue-600 font-semibold">{sale.documentNumber}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {sale.customer.type === 'factura' ? sale.customer.companyName : 
                     sale.customer.type === 'boleta' ? `${sale.customer.firstName} ${sale.customer.lastName}` : 
                     'Consumidor Final'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(sale.date).toLocaleDateString('es-PE')}</p>
                </div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(sale.total)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Sale Form
function SaleForm({ equipment, onSave, onCancel }: { equipment: Equipment[]; onSave: (sale: Sale) => void; onCancel: () => void }) {
  const [docType, setDocType] = useState<DocumentType>('boleta');
  const [customer, setCustomer] = useState<Customer>({ type: 'boleta' });
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState('');

  const addItem = (eq: Equipment) => {
    const existing = items.find(i => i.equipmentId === eq.id);
    if (existing) {
      setItems(items.map(i => i.equipmentId === eq.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice } : i));
    } else {
      setItems([...items, {
        equipmentId: eq.id,
        description: `${eq.brand} ${eq.model}`,
        quantity: 1,
        unitPrice: 0,
        subtotal: 0
      }]);
    }
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].subtotal = updated[index].quantity * updated[index].unitPrice;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    const sale: Sale = {
      id: crypto.randomUUID(),
      documentNumber: generateDocumentNumber(docType),
      documentType: docType,
      customer,
      items,
      subtotal,
      igv,
      total,
      paymentMethod,
      notes,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    onSave(sale);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-green-700 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onCancel} className="p-2 active:bg-green-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Nueva Venta</h1>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Comprobante</label>
          <div className="grid grid-cols-3 gap-2">
            {(['factura', 'boleta', 'recibo'] as DocumentType[]).map(t => (
              <button key={t} type="button" onClick={() => { setDocType(t); setCustomer({ ...customer, type: t }); }}
                className={`py-2 px-3 rounded-xl text-sm font-medium border-2 ${docType === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>
                {t === 'factura' ? 'Factura' : t === 'boleta' ? 'Boleta' : 'Recibo'}
              </button>
            ))}
          </div>
        </div>

        {docType !== 'recibo' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-medium text-gray-700">Datos del Cliente</h3>
            {docType === 'factura' ? (
              <>
                <input type="text" value={customer.ruc || ''} onChange={(e) => setCustomer({ ...customer, ruc: e.target.value })} placeholder="RUC" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
                <input type="text" value={customer.companyName || ''} onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })} placeholder="Razón Social" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
              </>
            ) : (
              <>
                <input type="text" value={customer.firstName || ''} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} placeholder="Nombres" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
                <input type="text" value={customer.lastName || ''} onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })} placeholder="Apellidos" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
                <input type="text" value={customer.dni || ''} onChange={(e) => setCustomer({ ...customer, dni: e.target.value })} placeholder="DNI" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
              </>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-700 mb-3">Productos</h3>
          <select onChange={(e) => { const eq = equipment.find(eq => eq.id === e.target.value); if (eq) addItem(eq); e.target.value = ''; }} className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3">
            <option value="">Seleccionar equipo...</option>
            {equipment.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.brand} {eq.model} - {eq.inventoryCode}</option>
            ))}
          </select>

          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-4">Sin productos</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-3">
                  <p className="text-sm font-medium">{item.description}</p>
                  <div className="flex gap-2 mt-2">
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="flex-1 border rounded-lg px-2 py-1" placeholder="Cant." />
                    <input type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="flex-1 border rounded-lg px-2 py-1" placeholder="Precio" />
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-600 px-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-right text-sm font-semibold mt-1">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <div className="space-y-1">
              <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>IGV (18%):</span><span>{formatCurrency(igv)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-1"><span>TOTAL:</span><span className="text-green-600">{formatCurrency(total)}</span></div>
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-green-700">
          <Save size={22} />
          Registrar Venta
        </button>
      </form>
    </div>
  );
}

// Sale Detail
function SaleDetail({ sale, onBack, onDelete }: { sale: Sale; onBack: () => void; onDelete: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-green-700 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-2 active:bg-green-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Detalle de Venta</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-mono text-lg text-green-600 font-bold">{sale.documentNumber}</p>
          <p className="text-sm text-gray-600 mt-1">{new Date(sale.date).toLocaleString('es-PE')}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Cliente</h3>
          {sale.documentType === 'factura' && (
            <>
              <p className="text-sm"><strong>RUC:</strong> {sale.customer.ruc}</p>
              <p className="text-sm"><strong>Razón Social:</strong> {sale.customer.companyName}</p>
            </>
          )}
          {sale.documentType === 'boleta' && (
            <>
              <p className="text-sm"><strong>Cliente:</strong> {sale.customer.firstName} {sale.customer.lastName}</p>
              <p className="text-sm"><strong>DNI:</strong> {sale.customer.dni}</p>
            </>
          )}
          {sale.documentType === 'recibo' && <p className="text-sm">Consumidor Final</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Productos</h3>
          <div className="space-y-2">
            {sale.items.map((item, idx) => (
              <div key={idx} className="border-b pb-2">
                <p className="text-sm font-medium">{item.description}</p>
                <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                <p className="text-sm font-semibold text-right">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="space-y-1">
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{formatCurrency(sale.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>IGV:</span><span>{formatCurrency(sale.igv)}</span></div>
            <div className="flex justify-between font-bold text-xl border-t pt-1"><span>TOTAL:</span><span className="text-green-600">{formatCurrency(sale.total)}</span></div>
          </div>
        </div>

        <button onClick={onDelete} className="w-full bg-red-100 text-red-700 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-red-200">
          <Trash2 size={22} />
          Eliminar Venta
        </button>
      </div>
    </div>
  );
}
