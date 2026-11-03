import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale } from '../types';
import { formatCurrency } from './inventory';

const COMPANY = {
  name: 'InventarioPro S.A.C.',
  ruc: '20123456789',
  address: 'Av. Principal 123, Lima, Perú',
  phone: '+51 999 888 777',
  email: 'ventas@inventariopro.com',
};

export function generateSalePDF(sale: Sale): jsPDF {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // Header - Company info
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY.name, margin, 15);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUC: ${COMPANY.ruc}`, margin, 22);
  doc.text(COMPANY.address, margin, 27);
  doc.text(`Tel: ${COMPANY.phone} | ${COMPANY.email}`, margin, 32);

  // Document type box (right side)
  const docTypeLabel = sale.documentType.toUpperCase();
  const boxX = pageWidth - 70;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(boxX, 5, 55, 25, 2, 2, 'F');
  
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(docTypeLabel, boxX + 27.5, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(sale.documentNumber, boxX + 27.5, 24, { align: 'center' });

  y = 45;

  // Customer info
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', margin + 4, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  if (sale.documentType === 'factura') {
    doc.text(`Razón Social: ${sale.customer.companyName || '-'}`, margin + 4, y + 13);
    doc.text(`RUC: ${sale.customer.ruc || '-'}`, margin + 4, y + 19);
    doc.text(`Dirección: ${sale.customer.address || '-'}`, margin + 4, y + 25);
  } else if (sale.documentType === 'boleta') {
    doc.text(`Cliente: ${sale.customer.firstName || ''} ${sale.customer.lastName || ''}`.trim() || '-', margin + 4, y + 13);
    doc.text(`DNI: ${sale.customer.dni || '-'}`, margin + 4, y + 19);
    doc.text(`Dirección: ${sale.customer.address || '-'}`, margin + 4, y + 25);
  } else {
    doc.text('Cliente: Consumidor Final', margin + 4, y + 13);
    doc.text('Tipo: Recibo de Ingreso', margin + 4, y + 19);
  }
  
  if (sale.customer.phone) {
    doc.text(`Tel: ${sale.customer.phone}`, pageWidth - margin - 60, y + 13);
  }
  if (sale.customer.email) {
    doc.text(`Email: ${sale.customer.email}`, pageWidth - margin - 60, y + 19);
  }

  y += 35;

  // Sale info line
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date(sale.date).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  doc.text(`Fecha de emisión: ${dateStr}`, margin, y);
  
  const paymentLabels: Record<string, string> = {
    efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia',
    yape: 'Yape', plin: 'Plin', credito: 'Crédito'
  };
  doc.text(`Pago: ${paymentLabels[sale.paymentMethod] || sale.paymentMethod}`, pageWidth / 2, y);

  y += 8;

  // Items table
  const tableData = sale.items.map((item, idx) => [
    (idx + 1).toString(),
    item.sku,
    `${item.modelName}\n${item.variantName}`,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    item.discount > 0 ? `${item.discount}%` : '-',
    formatCurrency(item.subtotal),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'SKU', 'Descripción', 'Cant.', 'P. Unit.', 'Desc.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {},
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 5;

  // Totals (right side)
  const totalsX = pageWidth - 80;
  const totalsWidth = 65;
  
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(totalsX, y, totalsWidth, 38, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  doc.text('Subtotal:', totalsX + 5, y + 8);
  doc.text(formatCurrency(sale.subtotal), totalsX + totalsWidth - 5, y + 8, { align: 'right' });
  
  doc.text('IGV (18%):', totalsX + 5, y + 16);
  doc.text(formatCurrency(sale.igv), totalsX + totalsWidth - 5, y + 16, { align: 'right' });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX + 5, y + 20, totalsX + totalsWidth - 5, y + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.text('TOTAL:', totalsX + 5, y + 30);
  doc.text(formatCurrency(sale.total), totalsX + totalsWidth - 5, y + 30, { align: 'right' });

  y += 45;

  // Amount in words
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const amountInWords = numberToWords(Math.floor(sale.total));
  const cents = Math.round((sale.total - Math.floor(sale.total)) * 100);
  doc.text(`Son: ${amountInWords} con ${cents.toString().padStart(2, '0')}/100 SOLES`, margin, y);

  y += 10;

  // Notes
  if (sale.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', margin, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    const splitNotes = doc.splitTextToSize(sale.notes, pageWidth - margin * 2);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 4 + 5;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Gracias por su compra', pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text(`${COMPANY.name} - ${COMPANY.ruc}`, pageWidth / 2, footerY + 10, { align: 'center' });
  doc.text(`Generado el ${new Date().toLocaleString('es-PE')}`, pageWidth / 2, footerY + 15, { align: 'center' });

  return doc;
}

function numberToWords(num: number): string {
  if (num === 0) return 'CERO';
  
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 30) return n === 20 ? 'VEINTE' : `VEINTI${units[n - 20]}`;
    if (n < 100) {
      const t = tens[Math.floor(n / 10)];
      const u = units[n % 10];
      return u ? `${t} Y ${u}` : t;
    }
    if (n === 100) return 'CIEN';
    if (n < 1000) {
      const h = hundreds[Math.floor(n / 100)];
      const rest = n % 100;
      return rest ? `${h} ${convertGroup(rest)}` : h;
    }
    return '';
  }

  const millions = Math.floor(num / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const rest = num % 1000;

  let result = '';
  if (millions > 0) {
    result += millions === 1 ? 'UN MILLÓN ' : `${convertGroup(millions)} MILLONES `;
  }
  if (thousands > 0) {
    result += thousands === 1 ? 'MIL ' : `${convertGroup(thousands)} MIL `;
  }
  if (rest > 0) {
    result += convertGroup(rest);
  }

  return result.trim() || 'CERO';
}

export function getWhatsAppShareUrl(sale: Sale): string {
  const customerName = sale.documentType === 'factura' 
    ? sale.customer.companyName 
    : sale.documentType === 'boleta'
    ? `${sale.customer.firstName} ${sale.customer.lastName}`.trim()
    : 'Cliente';
  
  const text = `Hola ${customerName}, adjunto su ${sale.documentType} ${sale.documentNumber} por un total de ${formatCurrency(sale.total)}. ¡Gracias por su compra!`;
  const phone = sale.customer.phone?.replace(/\D/g, '') || '';
  const fullPhone = phone.startsWith('51') ? phone : phone ? `51${phone}` : '';
  
  if (fullPhone) {
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
