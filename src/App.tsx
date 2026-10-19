import { useState, useEffect, useCallback } from 'react';
import { Home, List, Plus, Settings, Download, Upload } from 'lucide-react';
import { Equipment } from './types';
import { getEquipment, addEquipment, updateEquipment, deleteEquipment, getStats, saveEquipment } from './utils/storage';
import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import EquipmentForm from './components/EquipmentForm';
import EquipmentDetail from './components/EquipmentDetail';

type View = 'dashboard' | 'list' | 'add' | 'edit' | 'detail';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [stats, setStats] = useState(getStats());
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [initialFilter, setInitialFilter] = useState<string>('');

  const handleExport = () => {
    const data = JSON.stringify(getEquipment(), null, 2);
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
                saveEquipment(data);
                refreshData();
                alert('Datos importados correctamente');
              }
            } else {
              alert('Formato de archivo inválido');
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

  useEffect(() => {
    setEquipment(getEquipment());
    setStats(getStats());
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const refreshData = useCallback(() => {
    setEquipment(getEquipment());
    setStats(getStats());
  }, []);

  const handleSave = (item: Equipment) => {
    if (view === 'edit') {
      const updated = updateEquipment(item.id, item);
      setEquipment(updated);
    } else {
      const updated = addEquipment(item);
      setEquipment(updated);
    }
    setStats(getStats());
    setView('list');
  };

  const handleDelete = (id: string) => {
    const updated = deleteEquipment(id);
    setEquipment(updated);
    setStats(getStats());
    setSelectedEquipment(null);
    setView('list');
  };

  const handleSelectEquipment = (item: Equipment) => {
    setSelectedEquipment(item);
    setView('detail');
  };

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  const handleNavigate = (section: string) => {
    switch (section) {
      case 'add':
        setView('add');
        break;
      case 'list':
        setInitialFilter('');
        setView('list');
        break;
      case 'list-available':
        setInitialFilter('available');
        setView('list');
        break;
      case 'list-assigned':
        setInitialFilter('assigned');
        setView('list');
        break;
      default:
        setView('dashboard');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard stats={stats} onNavigate={handleNavigate} />;
      case 'list':
        return (
          <EquipmentList
            equipment={equipment}
            onSelect={handleSelectEquipment}
            onAdd={() => setView('add')}
            initialStatusFilter={initialFilter}
          />
        );
      case 'add':
        return (
          <EquipmentForm
            onSave={handleSave}
            onCancel={() => setView('list')}
          />
        );
      case 'edit':
        return selectedEquipment ? (
          <EquipmentForm
            equipment={selectedEquipment}
            onSave={handleSave}
            onCancel={() => setView('detail')}
          />
        ) : null;
      case 'detail':
        return selectedEquipment ? (
          <EquipmentDetail
            equipment={selectedEquipment}
            onEdit={() => setView('edit')}
            onDelete={() => handleDelete(selectedEquipment.id)}
            onBack={() => setView('list')}
          />
        ) : null;
      default:
        return null;
    }
  };

  const showNav = view !== 'add' && view !== 'edit';

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      {/* Main Content */}
      <div className={`${showNav ? 'pb-20' : ''}`}>
        {/* Page Header for Dashboard/List */}
        {(view === 'dashboard' || view === 'list') && (
          <div className="sticky top-0 z-40 bg-blue-700 text-white">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <h1 className="text-lg font-bold">
                  {view === 'dashboard' ? '📊 Dashboard' : '📋 Inventario'}
                </h1>
                <p className="text-xs text-blue-200">
                  {view === 'dashboard' ? 'Resumen general' : `${equipment.length} equipos registrados`}
                </p>
              </div>
              {view === 'list' && (
                <button
                  onClick={() => setView('add')}
                  className="bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold active:bg-blue-50 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Nuevo
                </button>
              )}
            </div>
          </div>
        )}

        <div className="px-4 pt-4">
          {renderView()}
        </div>
      </div>

      {/* Install PWA Banner */}
      {installPrompt && view === 'dashboard' && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto bg-blue-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
          <span className="text-xl">📲</span>
          <div className="flex-1">
            <p className="text-sm font-medium">Instalar App</p>
            <p className="text-xs text-blue-200">Accede rápido desde tu pantalla de inicio</p>
          </div>
          <button
            onClick={handleInstall}
            className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            Instalar
          </button>
          <button
            onClick={() => setInstallPrompt(null)}
            className="text-blue-200 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-4 animate-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">⚙️ Ajustes</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 p-2">✕</button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => { handleExport(); setShowSettings(false); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl active:bg-gray-100"
              >
                <Download size={22} className="text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Exportar Datos</p>
                  <p className="text-xs text-gray-500">Descargar inventario en JSON</p>
                </div>
              </button>
              
              <button
                onClick={() => { handleImport(); setShowSettings(false); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl active:bg-gray-100"
              >
                <Upload size={22} className="text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Importar Datos</p>
                  <p className="text-xs text-gray-500">Cargar inventario desde JSON</p>
                </div>
              </button>
            </div>

            <div className="border-t pt-4">
              <p className="text-center text-xs text-gray-400">InventarioPro v1.0 • PWA</p>
              <p className="text-center text-xs text-gray-400 mt-1">Gestión de equipos de cómputo</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2">
            <NavButton
              icon={<Home size={22} />}
              label="Inicio"
              active={view === 'dashboard'}
              onClick={() => setView('dashboard')}
            />
            <NavButton
              icon={<List size={22} />}
              label="Inventario"
              active={view === 'list' || view === 'detail'}
              onClick={() => setView('list')}
            />
            <button
              onClick={() => setView('add')}
              className="flex flex-col items-center -mt-6"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-300 active:bg-blue-700">
                <Plus size={28} className="text-white" />
              </div>
              <span className="text-[10px] text-blue-600 font-medium mt-1">Agregar</span>
            </button>
            <NavButton
              icon={<Settings size={22} />}
              label="Ajustes"
              active={showSettings}
              onClick={() => setShowSettings(!showSettings)}
            />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${
        active ? 'text-blue-600' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
