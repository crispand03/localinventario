import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react';
import { EquipmentModel, Variant, Sale, SaleItem, Customer, DocumentType, PaymentMethod } from '../types';
import { generateDocumentNumber, addSale } from '../utils/sales';
import { formatCurrency } from '../utils/inventory';
import Modal from './Modal';

interface SaleFormProps {
  models: EquipmentModel[];
  onSave: (sale: Sale) => void;
  onCancel: () => void;
}

export default function SaleForm({ models, onSave, onCancel }: SaleFormProps) {
  const [docType, setDocType] = useState<DocumentType>('boleta');
  const [customer, setCustomer] = useState<Customer>({ type: 'boleta' });
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<EquipmentModel | null>(null);

  const documentNumber = generateDocumentNumber(docType);

  useEffect(() => {
    setCustomer(prev => ({ ...prev, type: docType }));
  }, [docType]);

  const handleDocTypeChange = (type: DocumentType) => {
    setDocType(type);
    setCustomer({ type });
  };

  const addItem = (model: EquipmentModel, variant: Variant, quantity: number) => {
    const existing = items.find(i => i.variantId === variant.id);
    if (existing) {
      setItems(items.map(i => i.variantId === variant.id 
        ? { ...i, quantity: i.quantity + quantity, subtotal: (i.quantity + quantity) * i.unitPrice }
        : i
      ));
    } else {
      const newItem: SaleItem = {
        variantId: variant.id,
        modelId: model.id,
        modelName: `${model.brand} ${model.model}`,
        variantName: variant.name,
        sku: variant.sku,
        quantity,
        unitPrice: variant.price,
        unitCost: variant.cost,
        discount: 0,
        subtotal: quantity * variant.price,
      };
      setItems([...items, newItem]);
    }
    setShowProductPicker(false);
    setSelectedModel(null);
    setSearchQuery('');
  };

  const updateItem = (index: number, field: keyof SaleItem, value: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const qty = field === 'quantity' ? value : updated[index].quantity;
      const price = field === 'unitPrice' ? value : updated[index].unitPrice;
      const discount = field === 'discount' ? value : updated[index].discount;
      updated[index].subtotal = qty * price * (1 - discount / 100);
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  const totalCost = items.reduce((s, i) => s + (i.quantity * i.unitCost), 0);
  const profit = total - igv - totalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    const sale: Sale = {
      id: crypto.randomUUID(),
      documentNumber,
      documentType: docType,
      customer,
      items,
      subtotal,
      igv,
      total,
      totalCost,
      profit,
      paymentMethod,
      notes,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    addSale(sale);
    onSave(sale);
  };

  const filteredModels = models.filter(m => {
    const q = searchQuery.toLowerCase();
    return !q || m.brand.toLowerCase().includes(q) || m.model.toLowerCase().includes(q) ||
      m.variants.some(v => v.sku.toLowerCase().includes(q) || v.name.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 pb-24 pb-safe">
      <div className="sticky top-0 z-40 bg-blue-700 text-white pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onCancel} className="p-2 -ml-2 active:bg-blue-800 rounded-lg tap-target flex items-center justify-center">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Nueva Venta</h1>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Document Type */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Comprobante</label>
          <div className="grid grid-cols-3 gap-2">
            {(['factura', 'boleta', 'recibo'] as DocumentType[]).map(t => (
              <button key={t} type="button" onClick={() => handleDocTypeChange(t)}
                className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  docType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}>
                {t === 'factura' ? '📄 Factura' : t === 'boleta' ? '🧾 Boleta' : '📋 Recibo'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono">Número: {documentNumber}</p>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-medium text-gray-700">Datos del Cliente</h3>
          
          {docType === 'factura' && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">RUC *</label>
                <input type="text" value={customer.ruc || ''} maxLength={11}
                  onChange={(e) => setCustomer({ ...customer, ruc: e.target.value.replace(/\D/g, '') })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="20XXXXXXXXX" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Razón Social *</label>
                <input type="text" value={customer.companyName || ''}
                  onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Empresa S.A.C." required />
              </div>
            </>
          )}

          {docType === 'boleta' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombres *</label>
                  <input type="text" value={customer.firstName || ''}
                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Apellidos *</label>
                  <input type="text" value={customer.lastName || ''}
                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Pérez" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">DNI *</label>
                <input type="text" value={customer.dni || ''} maxLength={8}
                  onChange={(e) => setCustomer({ ...customer, dni: e.target.value.replace(/\D/g, '') })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="12345678" required />
              </div>
            </>
          )}

          {docType === 'recibo' && (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Cliente: <strong>Consumidor Final</strong></p>
              <p className="text-xs text-gray-500 mt-1">No se requieren datos del cliente</p>
            </div>
          )}

          {docType !== 'recibo' && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dirección</label>
                <input type="text" value={customer.address || ''}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Av. Principal 123" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
                  <input type="tel" value={customer.phone || ''}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="999888777" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input type="email" value={customer.email || ''}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="correo@ejemplo.com" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700">Productos ({items.length})</h3>
            <button type="button" onClick={() => setShowProductPicker(true)}
              className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium active:bg-blue-200 tap-target">
              <Plus size={16} /> Agregar
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">Sin productos</p>
              <button type="button" onClick={() => setShowProductPicker(true)}
                className="mt-2 text-blue-600 text-sm font-medium">+ Agregar primer producto</button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.modelName}</p>
                      <p className="text-xs text-gray-500 truncate">{item.variantName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>
                    </div>
                    <button type="button" onClick={() => removeItem(idx)}
                      className="p-2 text-red-600 active:bg-red-50 rounded-lg tap-target">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500">Cantidad</label>
                      <input type="number" min="1" value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Precio</label>
                      <input type="number" step="0.01" value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Desc %</label>
                      <input type="number" min="0" max="100" value={item.discount}
                        onChange={(e) => updateItem(idx, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                  </div>
                  <p className="text-right text-sm font-semibold text-blue-600">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {items.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IGV (18%):</span>
                <span className="font-medium">{formatCurrency(igv)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-800">TOTAL:</span>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-xs text-green-700 mt-2">
                <span>Ganancia estimada:</span>
                <span className="font-semibold">{formatCurrency(profit)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
          <div className="grid grid-cols-3 gap-2">
            {(['efectivo', 'tarjeta', 'transferencia', 'yape', 'plin', 'credito'] as PaymentMethod[]).map(m => (
              <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border-2 transition-all ${
                  paymentMethod === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}>
                {m === 'efectivo' ? '💵 Efectivo' : m === 'tarjeta' ? '💳 Tarjeta' : m === 'transferencia' ? '🏦 Transfer.' : 
                 m === 'yape' ? '📱 Yape' : m === 'plin' ? '📲 Plin' : '📝 Crédito'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Notas adicionales..." />
        </div>

        {/* Submit */}
        <button type="submit"
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 active:bg-green-700 shadow-lg shadow-green-200 tap-target transition-colors">
          <Save size={22} /> Registrar Venta
        </button>
      </form>

      {/* Product Picker Modal */}
      <Modal
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        title="Seleccionar Producto"
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {!selectedModel ? (
              filteredModels.map(m => (
                <button key={m.id} onClick={() => setSelectedModel(m)}
                  className="w-full bg-gray-50 rounded-xl p-3 text-left active:bg-gray-100 hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-gray-800">{m.brand} {m.model}</p>
                  <p className="text-xs text-gray-500">{m.variants.length} versiones disponibles</p>
                </button>
              ))
            ) : (
              <>
                <button onClick={() => setSelectedModel(null)}
                  className="text-blue-600 text-sm font-medium mb-2 hover:underline">← Volver a modelos</button>
                <p className="font-medium text-gray-800 mb-2">{selectedModel.brand} {selectedModel.model}</p>
                {selectedModel.variants.map(v => (
                  <div key={v.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{v.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{v.sku}</p>
                      <p className="text-sm font-bold text-blue-600 mt-1">{formatCurrency(v.price)}</p>
                      <p className="text-xs text-gray-500">Stock: {v.stock}</p>
                    </div>
                    {v.stock > 0 && (
                      <div className="flex gap-2">
                        <input type="number" min="1" max={v.stock} defaultValue="1" id={`qty-${v.id}`}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                        <button onClick={() => {
                          const qty = parseInt((document.getElementById(`qty-${v.id}`) as HTMLInputElement)?.value || '1');
                          addItem(selectedModel, v, qty);
                        }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium active:bg-blue-700 hover:bg-blue-700 transition-colors">
                          Agregar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
