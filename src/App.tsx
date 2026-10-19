import { useState, useEffect, useCallback } from 'react';
import { Home, List, Plus, Settings, Download, Upload } from 'lucide-react';
import { EquipmentModel, Variant, StockMovement } from './types';
import { getModels, addModel, updateModel, deleteModel, addVariant, updateVariant, deleteVariant, adjustStock, getStats, getMovements, addMovement, saveModels } from './utils/storage';
import Dashboard from './components/Dashboard';
import ModelList from './components/ModelList';
import ModelForm from './components/ModelForm';
import ModelDetail from './components/ModelDetail';
import VariantForm from './components/VariantForm';
import VariantDetail from './components/VariantDetail';
import MovementsList from './components/MovementsList';
import AlertsList from './components/AlertsList';

type View = 'dashboard' | 'list' | 'add-model' | 'edit-model' | 'model-detail' | 'add-variant' | 'edit-variant' | 'variant-detail' | 'movements' | 'alerts';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<EquipmentModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [stats, setStats] = useState(getStats());
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const refreshData = useCallback(() => {
    setModels(getModels());
    setStats(getStats());
    setMovements(getMovements());
  }, []);

  const handleSaveModel = (model: EquipmentModel) => {
    if (view === 'edit-model') {
      setModels(updateModel(model.id, model));
    } else {
      setModels(addModel(model));
    }
    refreshData();
    setView('list');
  };

  const handleDeleteModel = (id: string) => {
    setModels(deleteModel(id));
    refreshData();
    setSelectedModel(null);
    setView('list');
  };

  const handleSaveVariant = (variant: Variant) => {
    if (!selectedModel) return;
    if (view === 'edit-variant') {
      setModels(updateVariant(selectedModel.id, variant.id, variant));
    } else {
      setModels(addVariant(selectedModel.id, variant));
    }
    // Update selected model
    const updatedModels = getModels();
    const updatedModel = updatedModels.find(m => m.id === selectedModel.id);
    if (updatedModel) setSelectedModel(updatedModel);
    refreshData();
    setView('model-detail');
  };

  const handleDeleteVariant = (variantId: string) => {
    if (!selectedModel) return;
    setModels(deleteVariant(selectedModel.id, variantId));
    const updatedModels = getModels();
    const updatedModel = updatedModels.find(m => m.id === selectedModel.id);
    if (updatedModel) setSelectedModel(updatedModel);
    refreshData();
    setView('model-detail');
  };

  const handleAdjustStock = (variant: Variant, delta: number, reason: string) => {
    if (!selectedModel) return;
    setModels(adjustStock(selectedModel.id, variant.id, delta));
    
    // Record movement
    const movement: StockMovement = {
      id: crypto.randomUUID(),
      variantId: variant.id,
      modelId: selectedModel.id,
      type: delta > 0 ? 'in' : 'out',
      quantity: Math.abs(delta),
      reason,
      responsible: '',
      date: new Date().toISOString(),
      notes: '',
    };
    addMovement(movement);
    
    // Update selected model and variant
    const updatedModels = getModels();
    const updatedModel = updatedModels.find(m => m.id === selectedModel.id);
    if (updatedModel) {
      setSelectedModel(updatedModel);
      const updatedVariant = updatedModel.variants.find(v => v.id === variant.id);
      if (updatedVariant) setSelectedVariant(updatedVariant);
    }
    refreshData();
  };

  const handleSelectModel = (model: EquipmentModel) => {
    setSelectedModel(model);
    setView('model-detail');
  };

  const handleSelectVariant = (variant: Variant) => {
    setSelectedVariant(variant);
    setView('variant-detail');
  };

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstallPrompt(null);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ models: getModels(), movements: getMovements() }, null, 2);
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
            if (data.models && Array.isArray(data.models)) {
              if (confirm(`¿Importar ${data.models.length} modelos? Esto reemplazará los datos actuales.`)) {
                saveModels(data.models);
                if (data.movements) {
                  localStorage.setItem('inventario_pro_movements', JSON.stringify(data.movements));
                }
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

  const handleNavigate = (section: string) => {
    switch (section) {
      case 'add-model': setView('add-model'); break;
      case 'list': setView('list'); break;
      case 'movements': setView('movements'); break;
      case 'alerts': setView('alerts'); break;
      case 'stock-in':
      case 'stock-out':
        setView('list');
        break;
      default: setView('dashboard');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard stats={stats} onNavigate={handleNavigate} />;
      case 'list':
        return <ModelList models={models} onSelect={handleSelectModel} onAdd={() => setView('add-model')} />;
      case 'add-model':
        return <ModelForm onSave={handleSaveModel} onCancel={() => setView('list')} />;
      case 'edit-model':
        return selectedModel ? <ModelForm model={selectedModel} onSave={handleSaveModel} onCancel={() => setView('model-detail')} /> : null;
      case 'model-detail':
        return selectedModel ? (
          <ModelDetail model={selectedModel}
            onEdit={() => setView('edit-model')}
            onDelete={() => handleDeleteModel(selectedModel.id)}
            onBack={() => setView('list')}
            onAddVariant={() => setView('add-variant')}
            onSelectVariant={handleSelectVariant}
            onAdjustStock={(v) => { setSelectedVariant(v); setView('variant-detail'); }}
          />
        ) : null;
      case 'add-variant':
        return selectedModel ? <VariantForm model={selectedModel} onSave={handleSaveVariant} onCancel={() => setView('model-detail')} /> : null;
      case 'edit-variant':
        return selectedModel && selectedVariant ? (
          <VariantForm model={selectedModel} variant={selectedVariant} onSave={handleSaveVariant} onCancel={() => setView('variant-detail')} />
        ) : null;
      case 'variant-detail':
        return selectedModel && selectedVariant ? (
          <VariantDetail variant={selectedVariant} model={selectedModel}
            onEdit={() => setView('edit-variant')}
            onDelete={() => handleDeleteVariant(selectedVariant.id)}
            onBack={() => setView('model-detail')}
            onAdjustStock={(delta, reason) => handleAdjustStock(selectedVariant, delta, reason)}
          />
        ) : null;
      case 'movements':
        return <MovementsList movements={movements} models={models} onBack={() => setView('dashboard')} />;
      case 'alerts':
        return <AlertsList models={models} onBack={() => setView('dashboard')} onSelectModel={handleSelectModel} />;
      default:
        return null;
    }
  };

  const showNav = !['add-model', 'edit-model', 'add-variant', 'edit-variant'].includes(view);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 max-w-lg mx-auto relative">
      <div className={showNav ? 'pb-24 pb-safe' : 'pb-safe'}>
        {(view === 'dashboard' || view === 'list') && (
          <div className="sticky top-0 z-40 bg-blue-700 text-white pt-safe">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h1 className="text-lg font-bold">
                  {view === 'dashboard' ? '📊 Dashboard' : '📋 Inventario'}
                </h1>
                <p className="text-xs text-blue-200">
                  {view === 'dashboard' ? 'Resumen general' : `${models.length} modelos registrados`}
                </p>
              </div>
              {view === 'list' && (
                <button onClick={() => setView('add-model')}
                  className="bg-white text-blue-700 px-4 py-2.5 rounded-xl text-sm font-semibold active:bg-blue-50 flex items-center gap-1 tap-target transition-colors">
                  <Plus size={16} /> Nuevo
                </button>
              )}
            </div>
          </div>
        )}
        <div className="px-4 pt-4">{renderView()}</div>
      </div>

      {/* Install PWA Banner */}
      {installPrompt && view === 'dashboard' && (
        <div className="fixed left-4 right-4 max-w-lg mx-auto bg-blue-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-3 z-50 pwa-install-prompt">
          <span className="text-xl">📲</span>
          <div className="flex-1">
            <p className="text-sm font-medium">Instalar App</p>
            <p className="text-xs text-blue-200">Accede rápido desde tu pantalla de inicio</p>
          </div>
          <button onClick={handleInstall} className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[44px]">Instalar</button>
          <button onClick={() => setInstallPrompt(null)} className="text-blue-200 p-2 min-h-[44px] min-w-[44px]">✕</button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-safe space-y-4 animate-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">⚙️ Ajustes</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 p-2">✕</button>
            </div>
            <div className="space-y-3">
              <button onClick={() => { handleExport(); setShowSettings(false); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl active:bg-gray-100">
                <Download size={22} className="text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Exportar Datos</p>
                  <p className="text-xs text-gray-500">Descargar inventario completo en JSON</p>
                </div>
              </button>
              <button onClick={() => { handleImport(); setShowSettings(false); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl active:bg-gray-100">
                <Upload size={22} className="text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Importar Datos</p>
                  <p className="text-xs text-gray-500">Cargar inventario desde archivo JSON</p>
                </div>
              </button>
            </div>
            <div className="border-t pt-4">
              <p className="text-center text-xs text-gray-400">InventarioPro v2.0 • PWA</p>
              <p className="text-center text-xs text-gray-400 mt-1">Gestión avanzada de equipos y stock</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-200 z-40 ios-blur bottom-safe">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2 pb-safe">
            <NavButton icon={<Home size={22} />} label="Inicio" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavButton icon={<List size={22} />} label="Modelos" active={view === 'list' || view === 'model-detail' || view === 'variant-detail'} onClick={() => setView('list')} />
            <button onClick={() => setView('add-model')} className="flex flex-col items-center -mt-5 tap-target">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-300 active:bg-blue-700 transition-colors">
                <Plus size={28} className="text-white" />
              </div>
              <span className="text-[10px] text-blue-600 font-medium mt-0.5">Nuevo</span>
            </button>
            <NavButton icon={<span className="text-lg">📋</span>} label="Movimientos" active={view === 'movements'} onClick={() => setView('movements')} />
            <NavButton icon={<Settings size={22} />} label="Ajustes" active={showSettings} onClick={() => setShowSettings(!showSettings)} />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${active ? 'text-blue-600' : 'text-gray-400'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
