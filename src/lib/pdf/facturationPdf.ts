import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export interface FacturationPdfData {
  clientName: string;
  service: string;
  buyingPrice: number;
  fees: number;
  tva: number;
  date: string;
  system: string;
  fromAirport?: string;
  toAirport?: string;
  numericId: number;
}

export interface PdfOptions {
  dateFrom?: Date;
  dateTo?: Date;
  systems: string[];
  agencyInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export const generateFacturationPdf = (data: FacturationPdfData[], options: PdfOptions) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor: [number, number, number] = [33, 150, 243]; // Ocean blue
  const textColor: [number, number, number] = [60, 60, 60];
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(options.agencyInfo.name, 14, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  let yPos = 35;
  
  if (options.agencyInfo.address) {
    doc.text(options.agencyInfo.address, 14, yPos);
    yPos += 5;
  }
  if (options.agencyInfo.phone) {
    doc.text(`Tél: ${options.agencyInfo.phone}`, 14, yPos);
    yPos += 5;
  }
  if (options.agencyInfo.email) {
    doc.text(`Email: ${options.agencyInfo.email}`, 14, yPos);
    yPos += 5;
  }
  
  // Invoice title
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FACTURE', 14, yPos + 15);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Date range and system info
  const dateInfo = options.dateFrom && options.dateTo 
    ? `Période: ${format(options.dateFrom, 'dd/MM/yyyy')} - ${format(options.dateTo, 'dd/MM/yyyy')}`
    : `Date: ${format(new Date(), 'dd/MM/yyyy')}`;
  
  const systemsInfo = `Systèmes: ${options.systems.join(', ')}`;
  
  doc.text(dateInfo, 14, yPos + 25);
  doc.text(systemsInfo, 14, yPos + 30);
  doc.text(`Date d'émission: ${format(new Date(), 'dd/MM/yyyy')}`, 140, yPos + 25);
  
  // Table data
  const tableData = data.map(item => [
    item.clientName,
    item.service,
    `${item.buyingPrice.toLocaleString()} DH`,
    `${item.fees.toLocaleString()} DH`,
    `${item.tva.toFixed(2)} DH`,
    `${(item.buyingPrice + item.fees).toLocaleString()} DH`,
    item.date,
    `#${item.numericId} (${item.system})`
  ]);
  
  // Totals
  const totalFees = data.reduce((sum, item) => sum + item.fees, 0);
  const totalTva = data.reduce((sum, item) => sum + item.tva, 0);
  const totalBuyingPrice = data.reduce((sum, item) => sum + item.buyingPrice, 0);
  const grandTotal = totalBuyingPrice + totalFees;
  
  // Table
  autoTable(doc, {
    head: [['Client', 'Service', 'Prix d\'achat', 'Frais', 'TVA (20%)', 'Total TTC', 'Date', 'Référence']],
    body: tableData,
    startY: yPos + 40,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Client
      1: { cellWidth: 25 }, // Service
      2: { cellWidth: 20 }, // Prix d'achat
      3: { cellWidth: 15 }, // Frais
      4: { cellWidth: 15 }, // TVA
      5: { cellWidth: 20 }, // Total TTC
      6: { cellWidth: 20 }, // Date
      7: { cellWidth: 30 }, // Référence
    },
    margin: { left: 14, right: 14 },
  });
  
  // Final Y after table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 40;
  
  // Summary box
  const summaryY = finalY + 10;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(120, summaryY, 75, 40);
  
  // Summary content
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('RÉCAPITULATIF:', 125, summaryY + 8);
  
  doc.setFontSize(9);
  doc.text(`Nombre de services: ${data.length}`, 125, summaryY + 15);
  doc.text(`Total frais: ${totalFees.toLocaleString()} DH`, 125, summaryY + 20);

  // Inverted order + style swap
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Total général: ${grandTotal.toLocaleString()} DH`, 125, summaryY + 25);

  doc.setFontSize(11); // bigger
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]); // highlighted
  doc.text(`TOTAL TVA: ${totalTva.toFixed(2)} DH`, 125, summaryY + 35);
  
  // Footer
  const footerY = Math.max(summaryY + 50, 250);
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Cette facture est générée automatiquement par le système de gestion interne de l'agence (HonorableERP).", 14, footerY);
  doc.text(`TVA calculée à 20% sur les frais de service uniquement.`, 14, footerY + 4);
  
  // Save the PDF
  const filename = `facture_${options.systems.join('_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
};
