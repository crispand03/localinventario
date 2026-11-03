import { Equipment, InventoryStats, EquipmentType, Sale } from '../types';

const STORAGE_KEY = 'inventario_pro_equipment';
const SALES_KEY = 'inventario_pro_sales';
const DEVICE_ID_KEY = 'inventario_pro_device_id';

// Generar ID único para este dispositivo
function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// Equipment CRUD
export function getEquipment(): Equipment[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEquipment(equipment: Equipment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
  // Notificar a otras pestañas
  window.dispatchEvent(new CustomEvent('inventory-updated'));
}

export function addEquipment(item: Equipment): Equipment[] {
  const equipment = getEquipment();
  equipment.push(item);
  saveEquipment(equipment);
  return equipment;
}

export function updateEquipment(id: string, updates: Partial<Equipment>): Equipment[] {
  const equipment = getEquipment();
  const index = equipment.findIndex(e => e.id === id);
  if (index !== -1) {
    equipment[index] = { ...equipment[index], ...updates, updatedAt: new Date().toISOString() };
    saveEquipment(equipment);
  }
  return equipment;
}

export function deleteEquipment(id: string): Equipment[] {
  const equipment = getEquipment().filter(e => e.id !== id);
  saveEquipment(equipment);
  return equipment;
}

export function getStats(): InventoryStats {
  const equipment = getEquipment();
  const stats: InventoryStats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    assigned: equipment.filter(e => e.status === 'assigned').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    retired: equipment.filter(e => e.status === 'retired').length,
    byType: {
      laptop: equipment.filter(e => e.type === 'laptop').length,
      aio: equipment.filter(e => e.type === 'aio').length,
      monitor: equipment.filter(e => e.type === 'monitor').length,
      desktop: equipment.filter(e => e.type === 'desktop').length,
      tablet: equipment.filter(e => e.type === 'tablet').length,
      printer: equipment.filter(e => e.type === 'printer').length,
      phone: equipment.filter(e => e.type === 'phone').length,
      other: equipment.filter(e => e.type === 'other').length,
    }
  };
  return stats;
}

// Sales CRUD
export function getSales(): Sale[] {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSales(sales: Sale[]): void {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  window.dispatchEvent(new CustomEvent('sales-updated'));
}

export function addSale(sale: Sale): Sale[] {
  const sales = getSales();
  sales.unshift(sale);
  saveSales(sales);
  return sales;
}

export function deleteSale(id: string): Sale[] {
  const sales = getSales().filter(s => s.id !== id);
  saveSales(sales);
  return sales;
}

// Sync functions
export function exportData(): string {
  const data = {
    equipment: getEquipment(),
    sales: getSales(),
    timestamp: Date.now(),
    deviceId: getDeviceId()
  };
  return btoa(JSON.stringify(data));
}

export function importData(encoded: string): boolean {
  try {
    const data = JSON.parse(atob(encoded));
    if (data.equipment && Array.isArray(data.equipment)) {
      saveEquipment(data.equipment);
      if (data.sales && Array.isArray(data.sales)) {
        saveSales(data.sales);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

export function exportToFile(): void {
  const data = {
    equipment: getEquipment(),
    sales: getSales(),
    timestamp: Date.now(),
    deviceId: getDeviceId()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventario_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.equipment && Array.isArray(data.equipment)) {
          saveEquipment(data.equipment);
          if (data.sales && Array.isArray(data.sales)) {
            saveSales(data.sales);
          }
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error('Error reading file:', error);
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
}
