import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Variant, Specs, EquipmentModel } from '../types';
import { generateSKU, generateInventoryCode, getVariantStatus } from '../utils/inventory';

interface VariantFormProps {
  model: EquipmentModel;
  variant?: Variant;
  onSave: (variant: Variant) => void;
  onCancel: () => void;
}

export default function VariantForm({ model, variant, onSave, onCancel }: VariantFormProps) {
  const [name, setName] = useState(variant?.name || '');
  const [sku, setSku] = useState(variant?.sku || generateSKU(model.type, model.brand));
  const [inventoryCode, setInventoryCode] = useState(variant?.inventoryCode || generateInventoryCode(model.type));
  const [price, setPrice] = useState(variant?.price?.toString() || '');
  const [cost, setCost] = useState(variant?.cost?.toString() || '');
  const [stock, setStock] = useState(variant?.stock?.toString() || '0');
  const [minStock, setMinStock] = useState(variant?.minStock?.toString() || '5');
  const [location, setLocation] = useState(variant?.location || '');
  const [notes, setNotes] = useState(variant?.notes || '');
  const [serialNumbers, setSerialNumbers] = useState(variant?.serialNumbers?.join('\n') || '');
  const [specs, setSpecs] = useState<Specs>(variant?.specs || { ...model.baseSpecs });
  const [showSpecs, setShowSpecs] = useState(!variant);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stockNum = parseInt(stock) || 0;
    const minStockNum = parseInt(minStock) || 5;
    const now = new Date().toISOString();
    const item: Variant = {
      id: variant?.id || crypto.randomUUID(),
      modelId: model.id,
      name,
      sku: sku.toUpperCase(),
      inventoryCode: inventoryCode.toUpperCase(),
      specs,
      price: parseFloat(price) || 0,
      cost: parseFloat(cost) || 0,
      stock: stockNum,
      minStock: minStockNum,
      status: getVariantStatus(stockNum, minStockNum),
      serialNumbers: serialNumbers.split('\n').map(s => s.trim()).filter(Boolean),
      location,
      notes,
      createdAt: variant?.createdAt || now,
      updatedAt: now,
    };
    onSave(item);
  };

  const updateSpec = (key: keyof Specs, value: string) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onCancel} className="p-2 -ml-2 active:bg-blue-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">{variant ? 'Editar Versión' : 'Nueva Versión'}</h1>
          <div className="w-10" />
        </div>
        <div className="px-4 pb-3">
          <p className="text-xs text-blue-200">{model.brand} {model.model}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Name & Codes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-700">Identificación</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre de la versión *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Core i7 / 16GB / 512GB SSD" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">SKU</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cód. Inventario</label>
              <input type="text" value={inventoryCode} onChange={(e) => setInventoryCode(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-700">💰 Precio y Stock</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio Venta *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required
                  className="w-full border border-gray-300 rounded-xl pl-7 pr-3 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Costo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl pl-7 pr-3 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Stock Actual *</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Stock Mínimo</label>
              <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                placeholder="5" />
            </div>
          </div>
          {price && cost && parseFloat(price) > 0 && parseFloat(cost) > 0 && (
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-700">
                Margen: <strong>{Math.round(((parseFloat(price) - parseFloat(cost)) / parseFloat(cost)) * 100)}%</strong>
                {' '}({((parseFloat(price) - parseFloat(cost))).toFixed(2)} por unidad)
              </p>
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button type="button" onClick={() => setShowSpecs(!showSpecs)}
            className="w-full flex items-center justify-between p-4">
            <span className="font-medium text-gray-700">📋 Especificaciones de esta versión</span>
            <span className={`transform transition-transform ${showSpecs ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showSpecs && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              <SpecField label="Procesador" value={specs.processor || ''} onChange={(v) => updateSpec('processor', v)} placeholder="Intel Core i7-1365U" />
              <div className="grid grid-cols-2 gap-3">
                <SpecField label="RAM" value={specs.ram || ''} onChange={(v) => updateSpec('ram', v)} placeholder="16 GB" />
                <SpecField label="Almacenamiento" value={specs.storage || ''} onChange={(v) => updateSpec('storage', v)} placeholder="512 GB" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo Disco</label>
                <select value={specs.storageType || ''} onChange={(e) => updateSpec('storageType', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white">
                  <option value="">Seleccionar...</option>
                  <option value="SSD">SSD</option><option value="NVMe">NVMe</option>
                  <option value="HDD">HDD</option><option value="eMMC">eMMC</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SpecField label="Pantalla" value={specs.screen || ''} onChange={(v) => updateSpec('screen', v)} placeholder='14"' />
                <SpecField label="Resolución" value={specs.resolution || ''} onChange={(v) => updateSpec('resolution', v)} placeholder="FHD" />
              </div>
              <SpecField label="Gráficos" value={specs.graphics || ''} onChange={(v) => updateSpec('graphics', v)} placeholder="Intel Iris Xe" />
              <SpecField label="Sistema Operativo" value={specs.os || ''} onChange={(v) => updateSpec('os', v)} placeholder="Windows 11 Pro" />
              <SpecField label="Color" value={specs.color || ''} onChange={(v) => updateSpec('color', v)} placeholder="Negro" />
              <SpecField label="Extras" value={specs.extra || ''} onChange={(v) => updateSpec('extra', v)} placeholder="Backlight, fingerprint..." />
            </div>
          )}
        </div>

        {/* Location & Serials */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-700">📍 Ubicación y Series</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ubicación</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Almacén A, Estante 3" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Números de Serie (uno por línea)</label>
            <textarea value={serialNumbers} onChange={(e) => setSerialNumbers(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="SN001&#10;SN002&#10;SN003" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Observaciones..." />
          </div>
        </div>

        <button type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 active:bg-blue-700 shadow-lg shadow-blue-200">
          <Save size={22} />
          {variant ? 'Guardar Cambios' : 'Crear Versión'}
        </button>
      </form>
    </div>
  );
}

function SpecField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder} />
    </div>
  );
}
