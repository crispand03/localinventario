import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { EquipmentModel, EquipmentType, Specs } from '../types';
import { getTypeLabel } from '../utils/inventory';
import CameraCapture from './CameraCapture';

interface ModelFormProps {
  model?: EquipmentModel;
  onSave: (model: EquipmentModel) => void;
  onCancel: () => void;
}

const emptySpecs: Specs = {
  processor: '', ram: '', storage: '', storageType: '', screen: '',
  resolution: '', graphics: '', os: '', connectivity: '', ports: '',
  battery: '', weight: '', dimensions: '', color: '', extra: '',
};

export default function ModelForm({ model, onSave, onCancel }: ModelFormProps) {
  const [type, setType] = useState<EquipmentType>(model?.type || 'laptop');
  const [brand, setBrand] = useState(model?.brand || '');
  const [modelName, setModelName] = useState(model?.model || '');
  const [category, setCategory] = useState(model?.category || '');
  const [description, setDescription] = useState(model?.description || '');
  const [photo, setPhoto] = useState(model?.photo || '');
  const [specs, setSpecs] = useState<Specs>(model?.baseSpecs || { ...emptySpecs });
  const [showSpecs, setShowSpecs] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const item: EquipmentModel = {
      id: model?.id || crypto.randomUUID(),
      type,
      brand,
      model: modelName,
      category,
      description,
      photo,
      baseSpecs: specs,
      variants: model?.variants || [],
      createdAt: model?.createdAt || now,
      updatedAt: now,
    };
    onSave(item);
  };

  const updateSpec = (key: keyof Specs, value: string) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onCancel} className="p-2 -ml-2 active:bg-blue-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">{model ? 'Editar Modelo' : 'Nuevo Modelo'}</h1>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Photo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">Foto del Producto</label>
          <CameraCapture onCapture={setPhoto} currentPhoto={photo} />
        </div>

        {/* Type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Equipo</label>
          <div className="grid grid-cols-4 gap-2">
            {(['laptop', 'aio', 'monitor', 'desktop', 'tablet', 'printer', 'phone', 'other'] as EquipmentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2.5 px-1 rounded-xl text-[11px] font-medium border-2 transition-all ${
                  type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {getTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-medium text-gray-700">Información Básica</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Marca *</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Dell, HP, Lenovo, Samsung" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Modelo *</label>
            <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Latitude 5540, ThinkPad X1" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoría</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Empresarial, Gaming, Básico" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Descripción general del producto..." />
          </div>
        </div>

        {/* Specs Toggle */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSpecs(!showSpecs)}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-medium text-gray-700">📋 Especificaciones Técnicas Base</span>
            <span className={`transform transition-transform ${showSpecs ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showSpecs && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              <SpecInput label="Procesador" value={specs.processor || ''} onChange={(v) => updateSpec('processor', v)} placeholder="Intel Core i7-1365U" />
              <div className="grid grid-cols-2 gap-3">
                <SpecInput label="RAM" value={specs.ram || ''} onChange={(v) => updateSpec('ram', v)} placeholder="16 GB DDR5" />
                <SpecInput label="Almacenamiento" value={specs.storage || ''} onChange={(v) => updateSpec('storage', v)} placeholder="512 GB" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo de Almacenamiento</label>
                <select value={specs.storageType || ''} onChange={(e) => updateSpec('storageType', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white">
                  <option value="">Seleccionar...</option>
                  <option value="SSD">SSD</option>
                  <option value="NVMe">NVMe</option>
                  <option value="HDD">HDD</option>
                  <option value="eMMC">eMMC</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SpecInput label="Pantalla" value={specs.screen || ''} onChange={(v) => updateSpec('screen', v)} placeholder='14"' />
                <SpecInput label="Resolución" value={specs.resolution || ''} onChange={(v) => updateSpec('resolution', v)} placeholder="1920x1080" />
              </div>
              <SpecInput label="Gráficos" value={specs.graphics || ''} onChange={(v) => updateSpec('graphics', v)} placeholder="Intel Iris Xe" />
              <SpecInput label="Sistema Operativo" value={specs.os || ''} onChange={(v) => updateSpec('os', v)} placeholder="Windows 11 Pro" />
              <SpecInput label="Conectividad" value={specs.connectivity || ''} onChange={(v) => updateSpec('connectivity', v)} placeholder="WiFi 6E, Bluetooth 5.3" />
              <SpecInput label="Puertos" value={specs.ports || ''} onChange={(v) => updateSpec('ports', v)} placeholder="2x USB-C, 1x HDMI" />
              <div className="grid grid-cols-2 gap-3">
                <SpecInput label="Batería" value={specs.battery || ''} onChange={(v) => updateSpec('battery', v)} placeholder="52 Wh" />
                <SpecInput label="Peso" value={specs.weight || ''} onChange={(v) => updateSpec('weight', v)} placeholder="1.4 kg" />
              </div>
              <SpecInput label="Color" value={specs.color || ''} onChange={(v) => updateSpec('color', v)} placeholder="Negro / Plata" />
              <SpecInput label="Otras" value={specs.extra || ''} onChange={(v) => updateSpec('extra', v)} placeholder="Teclado retroiluminado, huella..." />
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 active:bg-blue-700 shadow-lg shadow-blue-200">
          <Save size={22} />
          {model ? 'Guardar Cambios' : 'Crear Modelo'}
        </button>
      </form>
    </div>
  );
}

function SpecInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder} />
    </div>
  );
}
