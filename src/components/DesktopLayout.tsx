import { Home, List, Plus, Settings, ShoppingCart, FileText, AlertTriangle, TrendingUp, Download, Upload } from 'lucide-react';
import { useState } from 'react';

type DesktopSection = 'dashboard' | 'models' | 'sales' | 'movements' | 'alerts' | 'settings';

interface DesktopLayoutProps {
  currentSection: DesktopSection;
  onNavigate: (section: DesktopSection) => void;
  children: React.ReactNode;
  onExport: () => void;
  onImport: () => void;
}

export default function DesktopLayout({ currentSection, onNavigate, children, onExport, onImport }: DesktopLayoutProps) {
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'models', label: 'Modelos', icon: <List size={20} /> },
    { id: 'sales', label: 'Ventas', icon: <ShoppingCart size={20} /> },
    { id: 'movements', label: 'Movimientos', icon: <TrendingUp size={20} /> },
    { id: 'alerts', label: 'Alertas', icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-600">
          <h1 className="text-xl font-bold">📊 InventarioPro</h1>
          <p className="text-xs text-blue-200 mt-1">Gestión de equipos y ventas</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as DesktopSection)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                currentSection === item.id
                  ? 'bg-white/20 font-semibold'
                  : 'hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-600 space-y-2">
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left hover:bg-white/10 transition-colors"
          >
            <Settings size={18} />
            <span className="text-sm">Ajustes</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">⚙️ Ajustes</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 p-2">✕</button>
            </div>
            <div className="space-y-3">
              <button onClick={() => { onExport(); setShowSettings(false); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Download size={22} className="text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Exportar Datos</p>
                  <p className="text-xs text-gray-500">Descargar inventario completo</p>
                </div>
              </button>
              <button onClick={() => { onImport(); setShowSettings(false); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Upload size={22} className="text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Importar Datos</p>
                  <p className="text-xs text-gray-500">Cargar desde archivo JSON</p>
                </div>
              </button>
            </div>
            <div className="border-t pt-4">
              <p className="text-center text-xs text-gray-400">InventarioPro v2.0 • Desktop</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
