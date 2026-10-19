import { EquipmentType } from '../types';

const TYPE_PREFIXES: Record<EquipmentType, string> = {
  laptop: 'LAP',
  aio: 'AIO',
  monitor: 'MON',
  desktop: 'DSK',
  tablet: 'TAB',
  other: 'OTH',
};

export function generateInventoryCode(type: EquipmentType): string {
  const prefix = TYPE_PREFIXES[type];
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
}

export function getTypeLabel(type: EquipmentType): string {
  const labels: Record<EquipmentType, string> = {
    laptop: 'Laptop',
    aio: 'All-in-One',
    monitor: 'Monitor/Pantalla',
    desktop: 'Desktop',
    tablet: 'Tablet',
    other: 'Otro',
  };
  return labels[type];
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Disponible',
    assigned: 'Asignado',
    maintenance: 'En Mantenimiento',
    retired: 'Retirado',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800 border-green-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    retired: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getTypeIcon(type: EquipmentType): string {
  const icons: Record<EquipmentType, string> = {
    laptop: '💻',
    aio: '🖥️',
    monitor: '🖵',
    desktop: '🖥️',
    tablet: '📱',
    other: '📦',
  };
  return icons[type];
}
