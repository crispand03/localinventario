export type EquipmentType = 'laptop' | 'aio' | 'monitor' | 'desktop' | 'tablet' | 'printer' | 'phone' | 'other';

export type VariantStatus = 'available' | 'low_stock' | 'out_of_stock' | 'discontinued';

export type MovementType = 'in' | 'out' | 'transfer' | 'adjustment' | 'return';

export interface Specs {
  processor?: string;
  ram?: string;
  storage?: string;
  storageType?: 'HDD' | 'SSD' | 'NVMe' | 'eMMC' | '';
  screen?: string;
  resolution?: string;
  graphics?: string;
  os?: string;
  connectivity?: string;
  ports?: string;
  battery?: string;
  weight?: string;
  dimensions?: string;
  color?: string;
  extra?: string;
}

export interface Variant {
  id: string;
  modelId: string;
  name: string;
  sku: string;
  inventoryCode: string;
  specs: Specs;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: VariantStatus;
  serialNumbers: string[];
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentModel {
  id: string;
  type: EquipmentType;
  brand: string;
  model: string;
  category: string;
  description: string;
  photo: string;
  baseSpecs: Specs;
  variants: Variant[];
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  variantId: string;
  modelId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  responsible: string;
  date: string;
  notes: string;
}

export interface InventoryStats {
  totalModels: number;
  totalVariants: number;
  totalStock: number;
  totalValue: number;
  totalCost: number;
  lowStockCount: number;
  outOfStockCount: number;
  byType: Record<EquipmentType, { models: number; stock: number; value: number }>;
  recentMovements: StockMovement[];
}

// Sales
export type DocumentType = 'factura' | 'boleta' | 'recibo';
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin' | 'credito';

export interface Customer {
  type: DocumentType;
  // Factura
  ruc?: string;
  companyName?: string;
  // Boleta
  firstName?: string;
  lastName?: string;
  dni?: string;
  // Common
  address?: string;
  email?: string;
  phone?: string;
}

export interface SaleItem {
  variantId: string;
  modelId: string;
  modelName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  documentNumber: string; // F001-000001, B001-000001, R001-000001
  documentType: DocumentType;
  customer: Customer;
  items: SaleItem[];
  subtotal: number;
  igv: number; // 18%
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: PaymentMethod;
  notes: string;
  date: string;
  createdAt: string;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  avgTicket: number;
  byDocumentType: Record<DocumentType, { count: number; total: number }>;
  recentSales: Sale[];
}
