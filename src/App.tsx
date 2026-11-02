import { useState, useEffect, useCallback } from 'react';
import { Home, List, Plus, Settings, ShoppingCart } from 'lucide-react';
import { EquipmentModel, Variant, Sale } from './types';
import { getModels, addModel, updateModel, deleteModel, addVariant, updateVariant, deleteVariant, adjustStock, getStats, getMovements, addMovement, saveModels } from './utils/storage';
import { getSales, addSale, deleteSale, getSalesStats } from './utils/sales';
import { useIsMobile } from './hooks/useDevice';
import DesktopLayout from './components/DesktopLayout';
import Dashboard from './components/Dashboard';
import ModelList from './components/ModelList';
import ModelForm from './components/ModelForm';
import ModelDetail from './components/ModelDetail';
import VariantForm from './components/VariantForm';
import VariantDetail from './components/VariantDetail';
import MovementsList from './components/MovementsList';
import AlertsList from './components/AlertsList';
import SalesList from './components/SalesList';
import SaleForm from './components/SaleForm';
import SaleDetail from './components/SaleDetail';
import Modal from './components/Modal';

type MobileView = 'dashboard' | 'list' | 'add-model' | 'edit-model' | 'model-detail' | 'add-variant' | 'edit-variant' | 'variant-detail' | 'movements' | 'alerts' | 'sales' | 'add-sale' | 'sale-detail';
type DesktopSection = 'dashboard' | 'models' | 'sales' | 'movements' | 'alerts' | 'settings';

export default function App() {
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<MobileView>('dashboard');
  const [desktopSection, setDesktopSection] = useState<DesktopSection>('dashboard');
  const [desktopSubView, setDesktopSubView] = useState<string>('');
  
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<EquipmentModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [stats, setStats] = useState(getStats());
  const [salesStats, setSalesStats] = useState(getSalesStats());
  const [movements, setMovements] = useState(getMovements());
  const [sales, setSales] = useState<Sale[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { refreshData(); }, []);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const refreshData = useCallback(() => {
    setModels(getModels());
    setStats(getStats());
    setMovements(getMovements());
    setSales(getSales());
    setSalesStats(getSalesStats());
  }, []);

  // Model handlers
  const handleSaveModel = (model: EquipmentModel) => {
    if (isMobile && mobileView === 'edit-model') {
      setModels(updateModel(model.id, model));
    } else {
      setModels(addModel(model));
    }
    refreshData();
    if (isMobile) setMobileView('list');
    else setDesktopSubView('');
  };

  const handleDeleteModel = (id: string) => {
    setModels(deleteModel(id));
    refreshData();
    setSelectedModel(null);
    if (isMobile) setMobileView('list');
    else setDesktopSubView('');
  };

  // Variant handlers
  const handleSaveVariant = (variant: Variant) => {
    if (!selectedModel) return;
    const isEdit = (isMobile && mobileView === 'edit-variant') || (!isMobile && desktopSubView === 'edit-variant');
    if (isEdit) {
      setModels(updateVariant(selectedModel.id, variant.id, variant));
    } else {
      setModels(addVariant(selectedModel.id, variant));
    }
    const updatedModels = getModels();
    const updatedModel = updatedModels.find(m => m.id === selectedModel.id);
    if (updatedModel) setSelectedModel(updatedModel);
    refreshData();
    if (isMobile) setMobileView('model-detail');
    else setDesktopSubView('model-detail');
  };

  const handleDeleteVariant = (variantId: string) => {
    if (!selectedModel) return;
    setModels(deleteVariant(selectedModel.id, variantId));
    const updatedModels = getModels();
    const updatedModel = updatedModels.find(m => m.id === selectedModel.id);
    if (updatedModel) setSelectedModel(updatedModel);
    refreshData();
    if (isMobile) setMobileView('model-detail');
    else setDesktopSubView('model-detail');
  };

  const handleAdjustStock = (variant: Variant, delta: number, reason: string) => {
    if (!selectedModel) return;
    setModels(adjustStock(selectedModel.id, variant.id, delta));
    const movement = {
      id: crypto.randomUUID(), variantId: variant.id, modelId: selectedModel.id,
      type: (delta > 0 ? 'in' : 'out') as any, quantity: Math.abs(delta),
      reason, responsible: '', date: new Date().toISOString(), notes: '',
    };
    addMovement(movement);
    const updatedModels = getModels();
    const updatedModel = updatedModels.find(m => m.id === selectedModel.id);
    if (updatedModel) {
      setSelectedModel(updatedModel);
      const updatedVariant = updatedModel.variants.find(v => v.id === variant.id);
      if (updatedVariant) setSelectedVariant(updatedVariant);
    }
    refreshData();
  };

  // Sale handlers
  const handleSaveSale = (sale: Sale) => {
    // Update stock
    sale.items.forEach(item => {
      setModels(prev => {
        const updated = adjustStock(item.modelId, item.variantId, -item.quantity);
        return updated;
      });
    });
    refreshData();
    setSelectedSale(sale);
    if (isMobile) setMobileView('sale-detail');
    else setDesktopSubView('sale-detail');
  };

  const handleDeleteSale = (id: string) => {
    setSales(deleteSale(id));
    refreshData();
    setSelectedSale(null);
    if (isMobile) setMobileView('sales');
    else setDesktopSubView('');
  };

  // Navigation
  const handleMobileNavigate = (section: string) => {
    switch (section) {
      case 'add-model': setMobileView('add-model'); break;
      case 'list': setMobileView('list'); break;
      case 'movements': setMobileView('movements'); break;
      case 'alerts': setMobileView('alerts'); break;
      case 'sales': setMobileView('sales'); break;
      default: setMobileView('dashboard');
    }
  };

  const handleDesktopNavigate = (section: DesktopSection) => {
    setDesktopSection(section);
    setDesktopSubView('');
    setSelectedModel(null);
    setSelectedSale(null);
  };

  // Export/Import
  const handleExport = () => {
    const data = JSON.stringify({ 
      models: getModels(), 
      movements: getMovements(),
      sales: getSales()
    }, null, 2);
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
                if (data.movements) localStorage.setItem('inventario_pro_movements', JSON.stringify(data.movements));
                if (data.sales) localStorage.setItem('inventario_pro_sales', JSON.stringify(data.sales));
                refreshData();
                alert('Datos importados correctamente');
              }
            }
          } catch { alert('Error al leer el archivo'); }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstallPrompt(null);
    }
  };

  // Render Mobile View
  const renderMobileView = () => {
    switch (mobileView) {
      case 'dashboard': return <Dashboard stats={stats} onNavigate={handleMobileNavigate} />;
      case 'list': return <ModelList models={models} onSelect={(m) => { setSelectedModel(m); setMobileView('model-detail'); }} onAdd={() => setMobileView('add-model')} />;
      case 'add-model': return <ModelForm onSave={handleSaveModel} onCancel={() => setMobileView('list')} />;
      case 'edit-model': return selectedModel ? <ModelForm model={selectedModel} onSave={handleSaveModel} onCancel={() => setMobileView('model-detail')} /> : null;
      case 'model-detail': return selectedModel ? (
        <ModelDetail model={selectedModel}
          onEdit={() => setMobileView('edit-model')}
          onDelete={() => handleDeleteModel(selectedModel.id)}
          onBack={() => setMobileView('list')}
          onAddVariant={() => setMobileView('add-variant')}
          onSelectVariant={(v) => { setSelectedVariant(v); setMobileView('variant-detail'); }}
          onAdjustStock={(v) => { setSelectedVariant(v); setMobileView('variant-detail'); }}
        />
      ) : null;
      case 'add-variant': return selectedModel ? <VariantForm model={selectedModel} onSave={handleSaveVariant} onCancel={() => setMobileView('model-detail')} /> : null;
      case 'edit-variant': return selectedModel && selectedVariant ? (
        <VariantForm model={selectedModel} variant={selectedVariant} onSave={handleSaveVariant} onCancel={() => setMobileView('variant-detail')} />
      ) : null;
      case 'variant-detail': return selectedModel && selectedVariant ? (
        <VariantDetail variant={selectedVariant} model={selectedModel}
          onEdit={() => setMobileView('edit-variant')}
          onDelete={() => handleDeleteVariant(selectedVariant.id)}
          onBack={() => setMobileView('model-detail')}
          onAdjustStock={(delta, reason) => handleAdjustStock(selectedVariant, delta, reason)}
        />
      ) : null;
      case 'movements': return <MovementsList movements={movements} models={models} onBack={() => setMobileView('dashboard')} />;
      case 'alerts': return <AlertsList models={models} onBack={() => setMobileView('dashboard')} onSelectModel={(m) => { setSelectedModel(m); setMobileView('model-detail'); }} />;
      case 'sales': return <SalesList sales={sales} onSelect={(s) => { setSelectedSale(s); setMobileView('sale-detail'); }} onAdd={() => setMobileView('add-sale')} />;
      case 'add-sale': return <SaleForm models={models} onSave={handleSaveSale} onCancel={() => setMobileView('sales')} />;
      case 'sale-detail': return selectedSale ? (
        <SaleDetail sale={selectedSale} onBack={() => setMobileView('sales')} onDelete={() => handleDeleteSale(selectedSale.id)} />
      ) : null;
      default: return null;
    }
  };

  // Render Desktop View
  const renderDesktopView = () => {
    if (desktopSubView === 'add-model') return <ModelForm onSave={handleSaveModel} onCancel={() => setDesktopSubView('')} />;
    if (desktopSubView === 'edit-model' && selectedModel) return <ModelForm model={selectedModel} onSave={handleSaveModel} onCancel={() => setDesktopSubView('model-detail')} />;
    if (desktopSubView === 'model-detail' && selectedModel) return (
      <ModelDetail model={selectedModel}
        onEdit={() => setDesktopSubView('edit-model')}
        onDelete={() => handleDeleteModel(selectedModel.id)}
        onBack={() => setDesktopSubView('')}
        onAddVariant={() => setDesktopSubView('add-variant')}
        onSelectVariant={(v) => { setSelectedVariant(v); setDesktopSubView('variant-detail'); }}
        onAdjustStock={(v) => { setSelectedVariant(v); setDesktopSubView('variant-detail'); }}
      />
    );
    if (desktopSubView === 'add-variant' && selectedModel) return <VariantForm model={selectedModel} onSave={handleSaveVariant} onCancel={() => setDesktopSubView('model-detail')} />;
    if (desktopSubView === 'edit-variant' && selectedModel && selectedVariant) return (
      <VariantForm model={selectedModel} variant={selectedVariant} onSave={handleSaveVariant} onCancel={() => setDesktopSubView('variant-detail')} />
    );
    if (desktopSubView === 'variant-detail' && selectedModel && selectedVariant) return (
      <VariantDetail variant={selectedVariant} model={selectedModel}
        onEdit={() => setDesktopSubView('edit-variant')}
        onDelete={() => handleDeleteVariant(selectedVariant.id)}
        onBack={() => setDesktopSubView('model-detail')}
        onAdjustStock={(delta, reason) => handleAdjustStock(selectedVariant, delta, reason)}
      />
    );
    if (desktopSubView === 'add-sale') return <SaleForm models={models} onSave={handleSaveSale} onCancel={() => setDesktopSubView('')} />;
    if (desktopSubView === 'sale-detail' && selectedSale) return (
      <SaleDetail sale={selectedSale} onBack={() => setDesktopSubView('')} onDelete={() => handleDeleteSale(selectedSale.id)} />
    );

    switch (desktopSection) {
      case 'dashboard': return <Dashboard stats={stats} onNavigate={(s) => {
        if (s === 'add-model') setDesktopSubView('add-model');
        else if (s === 'list') { setDesktopSection('models'); setDesktopSubView(''); }
        else if (s === 'sales') { setDesktopSection('sales'); setDesktopSubView(''); }
        else if (s === 'movements') { setDesktopSection('movements'); setDesktopSubView(''); }
        else if (s === 'alerts') { setDesktopSection('alerts'); setDesktopSubView(''); }
      }} />;
      case 'models': return <ModelList models={models} onSelect={(m) => { setSelectedModel(m); setDesktopSubView('model-detail'); }} onAdd={() => setDesktopSubView('add-model')} />;
      case 'sales': return <SalesList sales={sales} onSelect={(s) => { setSelectedSale(s); setDesktopSubView('sale-detail'); }} onAdd={() => setDesktopSubView('add-sale')} />;
      case 'movements': return <MovementsList movements={movements} models={models} onBack={() => setDesktopSection('dashboard')} />;
      case 'alerts': return <AlertsList models={models} onBack={() => setDesktopSection('dashboard')} onSelectModel={(m) => { setSelectedModel(m); setDesktopSubView('model-detail'); }} />;
      case 'settings': return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">⚙️ Ajustes</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <button onClick={handleExport} className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
              <span className="text-2xl">📥</span>
              <div className="text-left">
                <p className="font-medium">Exportar Datos</p>
                <p className="text-xs text-gray-500">Descargar inventario completo en JSON</p>
              </div>
            </button>
            <button onClick={handleImport} className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
              <span className="text-2xl">📤</span>
              <div className="text-left">
                <p className="font-medium">Importar Datos</p>
                <p className="text-xs text-gray-500">Cargar inventario desde archivo JSON</p>
              </div>
            </button>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-center text-sm text-gray-500">InventarioPro v2.0</p>
            <p className="text-center text-xs text-gray-400 mt-1">Gestión de equipos, stock y ventas</p>
          </div>
        </div>
      );
      default: return null;
    }
  };

  // Mobile Layout
  if (isMobile) {
    const showNav = !['add-model', 'edit-model', 'add-variant', 'edit-variant', 'add-sale'].includes(mobileView);
    
    return (
      <div className="min-h-screen min-h-[100dvh] bg-gray-50 max-w-lg mx-auto relative">
        <div className={showNav ? 'pb-24 pb-safe' : 'pb-safe'}>
          {(mobileView === 'dashboard' || mobileView === 'list' || mobileView === 'sales') && (
            <div className="sticky top-0 z-40 bg-blue-700 text-white pt-safe">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <h1 className="text-lg font-bold">
                    {mobileView === 'dashboard' ? '📊 Dashboard' : mobileView === 'list' ? '📋 Modelos' : '🛒 Ventas'}
                  </h1>
                  <p className="text-xs text-blue-200">
                    {mobileView === 'dashboard' ? 'Resumen general' : 
                     mobileView === 'list' ? `${models.length} modelos` : `${sales.length} ventas`}
                  </p>
                </div>
                {(mobileView === 'list' || mobileView === 'sales') && (
                  <button onClick={() => setMobileView(mobileView === 'list' ? 'add-model' : 'add-sale')}
                    className="bg-white text-blue-700 px-4 py-2.5 rounded-xl text-sm font-semibold active:bg-blue-50 flex items-center gap-1 tap-target transition-colors">
                    <Plus size={16} /> Nuevo
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="px-4 pt-4">{renderMobileView()}</div>
        </div>

        {installPrompt && mobileView === 'dashboard' && (
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

        <Modal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="⚙️ Ajustes"
          size="sm"
        >
          <div className="space-y-3">
            <button onClick={() => { handleExport(); setShowSettings(false); }}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl active:bg-gray-100 hover:bg-gray-100 transition-colors">
              <span className="text-2xl">📥</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">Exportar Datos</p>
                <p className="text-xs text-gray-500">Descargar inventario completo en JSON</p>
              </div>
            </button>
            <button onClick={() => { handleImport(); setShowSettings(false); }}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl active:bg-gray-100 hover:bg-gray-100 transition-colors">
              <span className="text-2xl">📤</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">Importar Datos</p>
                <p className="text-xs text-gray-500">Cargar inventario desde archivo JSON</p>
              </div>
            </button>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-center text-xs text-gray-400">InventarioPro v2.0 • PWA</p>
          </div>
        </Modal>

        {showNav && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-200 z-40 ios-blur bottom-safe">
            <div className="max-w-lg mx-auto flex items-center justify-around py-2 pb-safe">
              <NavButton icon={<Home size={22} />} label="Inicio" active={mobileView === 'dashboard'} onClick={() => setMobileView('dashboard')} />
              <NavButton icon={<List size={22} />} label="Modelos" active={mobileView === 'list' || mobileView === 'model-detail' || mobileView === 'variant-detail'} onClick={() => setMobileView('list')} />
              <button onClick={() => setMobileView('sales')}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                  mobileView === 'sales' || mobileView === 'sale-detail' ? 'text-green-600' : 'text-gray-400'
                }`}>
                <ShoppingCart size={22} />
                <span className="text-[10px] font-medium">Ventas</span>
              </button>
              <button onClick={() => setMobileView(mobileView === 'sales' ? 'add-sale' : 'add-model')}
                className="flex flex-col items-center -mt-5 tap-target">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-300 active:bg-blue-700 transition-transform active:scale-95">
                  <Plus size={28} className="text-white" />
                </div>
                <span className="text-[10px] text-blue-600 font-medium mt-0.5">Nuevo</span>
              </button>
              <NavButton icon={<Settings size={22} />} label="Ajustes" active={showSettings} onClick={() => setShowSettings(!showSettings)} />
            </div>
          </nav>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <DesktopLayout
      currentSection={desktopSection}
      onNavigate={handleDesktopNavigate}
      onExport={handleExport}
      onImport={handleImport}
    >
      {renderDesktopView()}
    </DesktopLayout>
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
