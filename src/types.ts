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

// Ventas
export type DocumentType = 'factura' | 'boleta' | 'recibo';
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin' | 'credito';

export interface Customer {
  type: DocumentType;
  ruc?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface SaleItem {
  equipmentId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  documentNumber: string;
  documentType: DocumentType;
  customer: Customer;
  items: SaleItem[];
  subtotal: number;
  igv: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes: string;
  date: string;
  createdAt: string;
}
