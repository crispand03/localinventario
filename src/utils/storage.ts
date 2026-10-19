import { EquipmentModel, InventoryStats, StockMovement, Variant, EquipmentType } from '../types';

const MODELS_KEY = 'inventario_pro_models';
const MOVEMENTS_KEY = 'inventario_pro_movements';

// Models
export function getModels(): EquipmentModel[] {
  const data = localStorage.getItem(MODELS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveModels(models: EquipmentModel[]): void {
  localStorage.setItem(MODELS_KEY, JSON.stringify(models));
}

export function addModel(model: EquipmentModel): EquipmentModel[] {
  const models = getModels();
  models.push(model);
  saveModels(models);
  return models;
}

export function updateModel(id: string, updates: Partial<EquipmentModel>): EquipmentModel[] {
  const models = getModels();
  const idx = models.findIndex(m => m.id === id);
  if (idx !== -1) {
    models[idx] = { ...models[idx], ...updates, updatedAt: new Date().toISOString() };
    saveModels(models);
  }
  return models;
}

export function deleteModel(id: string): EquipmentModel[] {
  const models = getModels().filter(m => m.id !== id);
  saveModels(models);
  return models;
}

// Variants
export function addVariant(modelId: string, variant: Variant): EquipmentModel[] {
  const models = getModels();
  const idx = models.findIndex(m => m.id === modelId);
  if (idx !== -1) {
    models[idx].variants.push(variant);
    models[idx].updatedAt = new Date().toISOString();
    saveModels(models);
  }
  return models;
}

export function updateVariant(modelId: string, variantId: string, updates: Partial<Variant>): EquipmentModel[] {
  const models = getModels();
  const mIdx = models.findIndex(m => m.id === modelId);
  if (mIdx !== -1) {
    const vIdx = models[mIdx].variants.findIndex(v => v.id === variantId);
    if (vIdx !== -1) {
      models[mIdx].variants[vIdx] = { ...models[mIdx].variants[vIdx], ...updates, updatedAt: new Date().toISOString() };
      models[mIdx].updatedAt = new Date().toISOString();
      saveModels(models);
    }
  }
  return models;
}

export function deleteVariant(modelId: string, variantId: string): EquipmentModel[] {
  const models = getModels();
  const mIdx = models.findIndex(m => m.id === modelId);
  if (mIdx !== -1) {
    models[mIdx].variants = models[mIdx].variants.filter(v => v.id !== variantId);
    models[mIdx].updatedAt = new Date().toISOString();
    saveModels(models);
  }
  return models;
}

export function adjustStock(modelId: string, variantId: string, delta: number): EquipmentModel[] {
  const models = getModels();
  const mIdx = models.findIndex(m => m.id === modelId);
  if (mIdx !== -1) {
    const vIdx = models[mIdx].variants.findIndex(v => v.id === variantId);
    if (vIdx !== -1) {
      const newStock = Math.max(0, models[mIdx].variants[vIdx].stock + delta);
      models[mIdx].variants[vIdx].stock = newStock;
      models[mIdx].variants[vIdx].updatedAt = new Date().toISOString();
      // Auto-update status
      if (newStock === 0) models[mIdx].variants[vIdx].status = 'out_of_stock';
      else if (newStock <= models[mIdx].variants[vIdx].minStock) models[mIdx].variants[vIdx].status = 'low_stock';
      else models[mIdx].variants[vIdx].status = 'available';
      saveModels(models);
    }
  }
  return models;
}

// Movements
export function getMovements(): StockMovement[] {
  const data = localStorage.getItem(MOVEMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addMovement(movement: StockMovement): StockMovement[] {
  const movements = getMovements();
  movements.unshift(movement);
  if (movements.length > 500) movements.length = 500;
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  return movements;
}

// Stats
export function getStats(): InventoryStats {
  const models = getModels();
  const movements = getMovements();
  
  let totalStock = 0;
  let totalValue = 0;
  let totalCost = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  
  const byType: Record<EquipmentType, { models: number; stock: number; value: number }> = {
    laptop: { models: 0, stock: 0, value: 0 },
    aio: { models: 0, stock: 0, value: 0 },
    monitor: { models: 0, stock: 0, value: 0 },
    desktop: { models: 0, stock: 0, value: 0 },
    tablet: { models: 0, stock: 0, value: 0 },
    printer: { models: 0, stock: 0, value: 0 },
    phone: { models: 0, stock: 0, value: 0 },
    other: { models: 0, stock: 0, value: 0 },
  };
  
  models.forEach(m => {
    byType[m.type].models++;
    m.variants.forEach(v => {
      totalStock += v.stock;
      totalValue += v.stock * v.price;
      totalCost += v.stock * v.cost;
      byType[m.type].stock += v.stock;
      byType[m.type].value += v.stock * v.price;
      if (v.status === 'low_stock') lowStockCount++;
      if (v.status === 'out_of_stock') outOfStockCount++;
    });
  });
  
  return {
    totalModels: models.length,
    totalVariants: models.reduce((acc, m) => acc + m.variants.length, 0),
    totalStock,
    totalValue,
    totalCost,
    lowStockCount,
    outOfStockCount,
    byType,
    recentMovements: movements.slice(0, 10),
  };
}

// Search
export function searchModels(query: string, typeFilter?: string): EquipmentModel[] {
  let models = getModels();
  if (query) {
    const q = query.toLowerCase();
    models = models.filter(m =>
      m.brand.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.variants.some(v => 
        v.sku.toLowerCase().includes(q) ||
        v.inventoryCode.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        v.specs.processor?.toLowerCase().includes(q) ||
        v.specs.ram?.toLowerCase().includes(q)
      )
    );
  }
  if (typeFilter && typeFilter !== 'all') {
    models = models.filter(m => m.type === typeFilter);
  }
  return models;
}
