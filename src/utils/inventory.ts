import { EquipmentType, EquipmentStatus } from '../types';

export function generateInventoryCode(type: EquipmentType): string {
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

export function getTypeLabel(type: EquipmentType): string {
  const labels: Record<EquipmentType, string> = {
    laptop: 'Laptop', aio: 'All-in-One', monitor: 'Monitor', desktop: 'Desktop',
    tablet: 'Tablet', printer: 'Impresora', phone: 'Teléfono', other: 'Otro',
  };
  return labels[type];
}

export function getStatusLabel(status: EquipmentStatus): string {
  const labels: Record<EquipmentStatus, string> = {
    available: 'Disponible', assigned: 'Asignado', maintenance: 'Mantenimiento', retired: 'Retirado',
  };
  return labels[status];
}

export function getStatusColor(status: EquipmentStatus): string {
  const colors: Record<EquipmentStatus, string> = {
    available: 'bg-green-100 text-green-800 border-green-200',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    retired: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status];
}

export function getTypeIcon(type: EquipmentType): string {
  const icons: Record<EquipmentType, string> = {
    laptop: '💻', aio: '🖥️', monitor: '🖵', desktop: '🖥️',
    tablet: '📱', printer: '🖨️', phone: '📞', other: '📦',
  };
  return icons[type];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateDocumentNumber(type: 'factura' | 'boleta' | 'recibo'): string {
  const prefixes = { factura: 'F', boleta: 'B', recibo: 'R' };
  const prefix = prefixes[type];
  const series = '001';
  const number = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `${prefix}${series}-${number}`;
}
