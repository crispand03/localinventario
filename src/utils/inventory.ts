import { EquipmentType, VariantStatus, MovementType } from '../types';

const TYPE_PREFIXES: Record<EquipmentType, string> = {
  laptop: 'LAP',
  aio: 'AIO',
  monitor: 'MON',
  desktop: 'DSK',
  tablet: 'TAB',
  printer: 'PRT',
  phone: 'PHN',
  other: 'OTH',
};

export function generateSKU(type: EquipmentType, brand: string): string {
  const prefix = TYPE_PREFIXES[type];
  const brandCode = brand.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefix}-${brandCode}-${random}`;
}

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
    printer: 'Impresora',
    phone: 'Teléfono',
    other: 'Otro',
  };
  return labels[type];
}

export function getStatusLabel(status: VariantStatus): string {
  const labels: Record<VariantStatus, string> = {
    available: 'Disponible',
    low_stock: 'Stock Bajo',
    out_of_stock: 'Sin Stock',
    discontinued: 'Descontinuado',
  };
  return labels[status];
}

export function getStatusColor(status: VariantStatus): string {
  const colors: Record<VariantStatus, string> = {
    available: 'bg-green-100 text-green-800 border-green-200',
    low_stock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    out_of_stock: 'bg-red-100 text-red-800 border-red-200',
    discontinued: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status];
}

export function getMovementLabel(type: MovementType): string {
  const labels: Record<MovementType, string> = {
    in: 'Entrada',
    out: 'Salida',
    transfer: 'Transferencia',
    adjustment: 'Ajuste',
    return: 'Devolución',
  };
  return labels[type];
}

export function getMovementColor(type: MovementType): string {
  const colors: Record<MovementType, string> = {
    in: 'text-green-600 bg-green-50',
    out: 'text-red-600 bg-red-50',
    transfer: 'text-blue-600 bg-blue-50',
    adjustment: 'text-yellow-600 bg-yellow-50',
    return: 'text-purple-600 bg-purple-50',
  };
  return colors[type];
}

export function getTypeIcon(type: EquipmentType): string {
  const icons: Record<EquipmentType, string> = {
    laptop: '💻',
    aio: '🖥️',
    monitor: '🖵',
    desktop: '🖥️',
    tablet: '📱',
    printer: '🖨️',
    phone: '📞',
    other: '📦',
  };
  return icons[type];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num);
}

export function getVariantStatus(stock: number, minStock: number): VariantStatus {
  if (stock === 0) return 'out_of_stock';
  if (stock <= minStock) return 'low_stock';
  return 'available';
}
