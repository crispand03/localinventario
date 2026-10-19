import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Wand2 } from 'lucide-react';
import { Equipment, EquipmentType, EquipmentStatus } from '../types';
import { generateInventoryCode, getTypeLabel } from '../utils/inventory';
import CameraCapture from './CameraCapture';

interface EquipmentFormProps {
  equipment?: Equipment;
  onSave: (equipment: Equipment) => void;
  onCancel: () => void;
}

export default function EquipmentForm({ equipment, onSave, onCancel }: EquipmentFormProps) {
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
  const [inventoryCode, setInventoryCode] = useState(equipment?.inventoryCode || '');

  useEffect(() => {
    if (!equipment) {
      setInventoryCode(generateInventoryCode(type));
    }
  }, [type, equipment]);

  const regenerateCode = () => {
    setInventoryCode(generateInventoryCode(type));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const item: Equipment = {
      id: equipment?.id || crypto.randomUUID(),
      inventoryCode,
      type,
      brand,
      model,
      serialNumber,
      status,
      assignedTo,
      location,
      purchaseDate,
      warrantyEnd,
      notes,
      photo,
      createdAt: equipment?.createdAt || now,
      updatedAt: now,
    };
    
    onSave(item);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onCancel} className="p-2 -ml-2 active:bg-blue-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">
            {equipment ? 'Editar Equipo' : 'Nuevo Equipo'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-5">
        {/* Photo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">Foto del Equipo</label>
          <CameraCapture onCapture={setPhoto} currentPhoto={photo} />
        </div>

        {/* Inventory Code */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Código de Inventario</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inventoryCode}
              onChange={(e) => setInventoryCode(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: LAP-2401-0001"
            />
            <button
              type="button"
              onClick={regenerateCode}
              className="px-3 py-3 bg-blue-100 text-blue-700 rounded-xl active:bg-blue-200"
              title="Regenerar código"
            >
              <Wand2 size={20} />
            </button>
          </div>
        </div>

        {/* Type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Equipo</label>
          <div className="grid grid-cols-3 gap-2">
            {(['laptop', 'aio', 'monitor', 'desktop', 'tablet', 'other'] as EquipmentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-3 px-2 rounded-xl text-xs font-medium border-2 transition-all ${
                  type === t
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
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
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Dell, HP, Lenovo"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Modelo *</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Latitude 5520"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Número de Serie</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: SN123456789"
            />
          </div>
        </div>

        {/* Status & Assignment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-medium text-gray-700">Estado y Asignación</h3>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="available">Disponible</option>
              <option value="assigned">Asignado</option>
              <option value="maintenance">En Mantenimiento</option>
              <option value="retired">Retirado</option>
            </select>
          </div>

          {status === 'assigned' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Asignado a</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del empleado"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Ubicación</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Oficina 201, Piso 3"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-medium text-gray-700">Fechas</h3>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Fecha de Compra</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Fin de Garantía</label>
            <input
              type="date"
              value={warrantyEnd}
              onChange={(e) => setWarrantyEnd(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Observaciones adicionales..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 active:bg-blue-700 shadow-lg shadow-blue-200"
        >
          <Save size={22} />
          {equipment ? 'Guardar Cambios' : 'Registrar Equipo'}
        </button>
      </form>
    </div>
  );
}
