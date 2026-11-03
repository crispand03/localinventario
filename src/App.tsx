import { useState, useEffect } from 'react';
import { Plus, Home, List, Settings, X, Camera, Upload, Save, Trash2, Edit, ArrowLeft, ShoppingCart, Download } from 'lucide-react';

// Types
type EquipmentType = 'laptop' | 'aio' | 'monitor' | 'desktop' | 'tablet' | 'printer' | 'phone' | 'other';
type EquipmentStatus = 'available' | 'assigned' | 'maintenance' | 'retired';

interface Equipment {
  id: string;
  inventoryCode: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  assignedTo: string;
  location: string;
  purchaseDate: string;
  warrantyEnd: string;
  notes: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
}

// Storage
const STORAGE_KEY = 'inventario_pro_equipment';

function getEquipment(): Equipment[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveEquipment(equipment: Equipment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
}

// Utils
function generateInventoryCode(type: EquipmentType): string {
  const prefixes: Record<EquipmentType, string> = {
    laptop: 'LAP', aio: 'AIO', monitor: 'MON', desktop: 'DSK',
    tablet: 'TAB', printer: 'PRT', phone: 'PHN', other: 'OTH',
  };
  const prefix = prefixes[type];
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
}

function getTypeLabel(type: EquipmentType): string {
  const labels: Record<EquipmentType, string> = {
    laptop: 'Laptop', aio: 'All-in-One', monitor: 'Monitor', desktop: 'Desktop',
    tablet: 'Tablet', printer: 'Impresora', phone: 'Teléfono', other: 'Otro',
  };
  return labels[type];
}

function getStatusLabel(status: EquipmentStatus): string {
  const labels: Record<EquipmentStatus, string> = {
    available: 'Disponible', assigned: 'Asignado', maintenance: 'Mantenimiento', retired: 'Retirado',
  };
  return labels[status];
}

function getStatusColor(status: EquipmentStatus): string {
  const colors: Record<EquipmentStatus, string> = {
    available: 'bg-green-100 text-green-800 border-green-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    retired: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status];
}

// Main App
export default function App() {
  const [view, setView] = useState<'dashboard' | 'list' | 'add' | 'edit'>('dashboard');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setEquipment(getEquipment());
  }, []);

  const handleSave = (item: Equipment) => {
    const existing = equipment.find(e => e.id === item.id);
    let updated: Equipment[];
    
    if (existing) {
      updated = equipment.map(e => e.id === item.id ? item : e);
    } else {
      updated = [...equipment, item];
    }
    
    setEquipment(updated);
    saveEquipment(updated);
    setView('list');
  };

  const handleDelete = (id: string) => {
    const updated = equipment.filter(e => e.id !== id);
    setEquipment(updated);
    saveEquipment(updated);
    setView('list');
  };

  const handleExport = () => {
    const data = JSON.stringify(equipment, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            if (Array.isArray(data)) {
              if (confirm(`¿Importar ${data.length} equipos? Esto reemplazará los datos actuales.`)) {
                setEquipment(data);
                saveEquipment(data);
                alert('Datos importados correctamente');
              }
            }
          } catch {
            alert('Error al leer el archivo');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'dashboard' && <Dashboard equipment={equipment} onNavigate={setView} />}
      {view === 'list' && <EquipmentList equipment={equipment} onSelect={(e) => { setSelectedEquipment(e); setView('edit'); }} onAdd={() => setView('add')} />}
      {view === 'add' && <EquipmentForm onSave={handleSave} onCancel={() => setView('list')} />}
      {view === 'edit' && selectedEquipment && <EquipmentForm equipment={selectedEquipment} onSave={handleSave} onCancel={() => setView('list')} onDelete={() => handleDelete(selectedEquipment.id)} />}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          <NavButton icon={<Home size={22} />} label="Inicio" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavButton icon={<List size={22} />} label="Inventario" active={view === 'list' || view === 'edit'} onClick={() => setView('list')} />
          <button onClick={() => setView('add')} className="flex flex-col items-center -mt-6">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <Plus size={28} className="text-white" />
            </div>
            <span className="text-[10px] text-blue-600 font-semibold mt-1">Nuevo</span>
          </button>
          <NavButton icon={<ShoppingCart size={22} />} label="Ventas" active={false} onClick={() => alert('Módulo de ventas próximamente')} />
          <NavButton icon={<Settings size={22} />} label="Ajustes" active={showSettings} onClick={() => setShowSettings(true)} />
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">⚙️ Ajustes</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <button onClick={() => { handleExport(); setShowSettings(false); }} className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Download size={22} className="text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Exportar Datos</p>
                  <p className="text-xs text-gray-500">Descargar inventario en JSON</p>
                </div>
              </button>
              <button onClick={() => { handleImport(); setShowSettings(false); }} className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Upload size={22} className="text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Importar Datos</p>
                  <p className="text-xs text-gray-500">Cargar desde archivo JSON</p>
                </div>
              </button>
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-center text-xs text-gray-400">InventarioPro v3.0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}

// Dashboard
function Dashboard({ equipment, onNavigate }: { equipment: Equipment[]; onNavigate: (view: 'dashboard' | 'list' | 'add' | 'edit') => void }) {
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    assigned: equipment.filter(e => e.status === 'assigned').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    retired: equipment.filter(e => e.status === 'retired').length,
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">InventarioPro</h2>
        <p className="text-blue-100 text-sm mt-1">Gestión de equipos</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs">Total</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.available}</p>
            <p className="text-xs">Disponibles</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.assigned}</p>
            <p className="text-xs">Asignados</p>
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
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar equipo..."
          className="w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl"
        />
      </div>

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
                  💻
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
