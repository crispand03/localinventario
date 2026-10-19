import { ArrowLeft, Edit, Trash2, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Equipment } from '../types';
import { getTypeLabel, getStatusLabel, getStatusColor, getTypeIcon } from '../utils/inventory';

interface EquipmentDetailProps {
  equipment: Equipment;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function EquipmentDetail({ equipment, onEdit, onDelete, onBack }: EquipmentDetailProps) {
  const qrData = JSON.stringify({
    code: equipment.inventoryCode,
    type: equipment.type,
    brand: equipment.brand,
    model: equipment.model,
    serial: equipment.serialNumber,
  });

  const handleShare = async () => {
    const text = `📋 Equipo: ${equipment.brand} ${equipment.model}\n🔖 Código: ${equipment.inventoryCode}\n📊 Estado: ${getStatusLabel(equipment.status)}\n📍 Ubicación: ${equipment.location || 'N/A'}\n👤 Asignado a: ${equipment.assignedTo || 'N/A'}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: equipment.inventoryCode, text });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Información copiada al portapapeles');
    }
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este equipo? Esta acción no se puede deshacer.')) {
      onDelete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-blue-700 text-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onBack} className="p-2 -ml-2 active:bg-blue-800 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Detalle del Equipo</h1>
          <button onClick={handleShare} className="p-2 -mr-2 active:bg-blue-800 rounded-lg">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Photo */}
        {equipment.photo && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <img src={equipment.photo} alt={equipment.model} className="w-full h-56 object-cover" />
          </div>
        )}

        {/* Code & Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Código de Inventario</p>
              <p className="text-xl font-bold font-mono text-blue-700">{equipment.inventoryCode}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(equipment.status)}`}>
              {getStatusLabel(equipment.status)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon(equipment.type)}</span>
            <span className="text-sm text-gray-600">{getTypeLabel(equipment.type)}</span>
          </div>
        </div>

        {/* Equipment Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-800">Información del Equipo</h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Marca" value={equipment.brand} />
            <InfoItem label="Modelo" value={equipment.model} />
            <InfoItem label="No. Serie" value={equipment.serialNumber || 'N/A'} />
            <InfoItem label="Ubicación" value={equipment.location || 'N/A'} />
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-800">Asignación</h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Asignado a" value={equipment.assignedTo || 'Sin asignar'} />
            <InfoItem label="Fecha Compra" value={equipment.purchaseDate || 'N/A'} />
            <InfoItem label="Garantía hasta" value={equipment.warrantyEnd || 'N/A'} />
          </div>
        </div>

        {/* Notes */}
        {equipment.notes && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Notas</h3>
            <p className="text-gray-600 text-sm">{equipment.notes}</p>
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <h3 className="font-semibold text-gray-800 mb-3">Código QR</h3>
          <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-xl">
            <QRCodeSVG value={qrData} size={180} level="M" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Escanea para ver la información del equipo</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-medium active:bg-blue-700"
          >
            <Edit size={18} />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 bg-red-100 text-red-700 px-5 py-3.5 rounded-xl font-medium active:bg-red-200"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
