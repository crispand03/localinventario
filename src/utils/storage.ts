import { Equipment, InventoryStats, EquipmentType } from '../types';

const STORAGE_KEY = 'inventario_pro_equipment';

export function getEquipment(): Equipment[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEquipment(equipment: Equipment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
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
