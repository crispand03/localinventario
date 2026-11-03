export type EquipmentType = 'laptop' | 'aio' | 'monitor' | 'desktop' | 'tablet' | 'printer' | 'phone' | 'other';

export type EquipmentStatus = 'available' | 'assigned' | 'maintenance' | 'retired';

export interface Equipment {
  id: string;
  inventoryCode: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  status: EquipmentStatus;
  assignedTo: string;
  location: string;
  purchaseDate: string;
  warrantyEnd: string;
  notes: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
  retired: number;
  byType: Record<EquipmentType, number>;
}
