import { Sale, SalesStats, DocumentType } from '../types';

const SALES_KEY = 'inventario_pro_sales';
const COUNTERS_KEY = 'inventario_pro_doc_counters';

interface DocCounters {
  factura: number;
  boleta: number;
  recibo: number;
  series: {
    factura: string;
    boleta: string;
    recibo: string;
  };
}

function getCounters(): DocCounters {
  const data = localStorage.getItem(COUNTERS_KEY);
  if (data) return JSON.parse(data);
  return {
    factura: 0,
    boleta: 0,
    recibo: 0,
    series: { factura: 'F001', boleta: 'B001', recibo: 'R001' }
  };
}

function saveCounters(counters: DocCounters): void {
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
}

export function generateDocumentNumber(type: DocumentType): string {
  const counters = getCounters();
  const next = counters[type] + 1;
  const series = counters.series[type];
  const number = next.toString().padStart(6, '0');
  return `${series}-${number}`;
}

export function incrementCounter(type: DocumentType): void {
  const counters = getCounters();
  counters[type]++;
  saveCounters(counters);
}

export function getSales(): Sale[] {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSales(sales: Sale[]): void {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

export function addSale(sale: Sale): Sale[] {
  const sales = getSales();
  sales.unshift(sale);
  saveSales(sales);
  incrementCounter(sale.documentType);
  return sales;
}

export function deleteSale(id: string): Sale[] {
  const sales = getSales().filter(s => s.id !== id);
  saveSales(sales);
  return sales;
}

export function getSaleById(id: string): Sale | undefined {
  return getSales().find(s => s.id === id);
}

export function getSalesStats(): SalesStats {
  const sales = getSales();
  const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0);
  const totalProfit = sales.reduce((s, sale) => s + sale.profit, 0);

  const byDocumentType: Record<DocumentType, { count: number; total: number }> = {
    factura: { count: 0, total: 0 },
    boleta: { count: 0, total: 0 },
    recibo: { count: 0, total: 0 },
  };

  sales.forEach(s => {
    byDocumentType[s.documentType].count++;
    byDocumentType[s.documentType].total += s.total;
  });

  return {
    totalSales: sales.length,
    totalRevenue,
    totalProfit,
    avgTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
    byDocumentType,
    recentSales: sales.slice(0, 10),
  };
}

export function searchSales(query: string, docType?: DocumentType | 'all'): Sale[] {
  let sales = getSales();
  if (query) {
    const q = query.toLowerCase();
    sales = sales.filter(s =>
      s.documentNumber.toLowerCase().includes(q) ||
      s.customer.companyName?.toLowerCase().includes(q) ||
      s.customer.ruc?.includes(q) ||
      s.customer.firstName?.toLowerCase().includes(q) ||
      s.customer.lastName?.toLowerCase().includes(q) ||
      s.customer.dni?.includes(q)
    );
  }
  if (docType && docType !== 'all') {
    sales = sales.filter(s => s.documentType === docType);
  }
  return sales;
}
