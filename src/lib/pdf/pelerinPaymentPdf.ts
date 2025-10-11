import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface PelerinPaymentData {
  payment_date: string;
  amount: number;
  isAdvance?: boolean;
}

export interface PelerinPdfOptions {
  pelerinName: string;
  pelerinAddress?: string;
  programTitle: string;
  programPrice: number;
  agencyInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export const generatePelerinPaymentPdf = (
  payments: PelerinPaymentData[],
  advancePayment: number,
  options: PelerinPdfOptions
) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor: [number, number, number] = [33, 150, 243]; // Ocean blue
  const textColor: [number, number, number] = [60, 60, 60];
  
  // Header - Agency Info
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
  
  // Document title
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('HISTORIQUE DES PAIEMENTS', 14, yPos + 15);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Pelerin info
  doc.text(`Pèlerin: ${options.pelerinName}`, 14, yPos + 25);
  if (options.pelerinAddress) {
    doc.text(`Adresse: ${options.pelerinAddress}`, 14, yPos + 30);
  }
  const programLineY = yPos + (options.pelerinAddress ? 35 : 30);
  doc.text(`Programme: ${options.programTitle}`, 14, programLineY);
  doc.text(`Prix du programme: ${options.programPrice.toLocaleString('fr-MA')} MAD`, 14, programLineY + 5);
  doc.text(`Date d'émission: ${format(new Date(), 'dd/MM/yyyy')}`, 140, yPos + 25);
  
  // Prepare table data
  const tableData: any[] = [];
  
  // Add advance payment if exists
  if (advancePayment > 0) {
    tableData.push([
      'Avance initiale',
      `${advancePayment.toLocaleString('fr-MA')} MAD`
    ]);
  }
  
  // Add other payments
  payments.forEach(payment => {
    tableData.push([
      format(new Date(payment.payment_date), "dd MMM yyyy à HH:mm", { locale: fr }),
      `${Number(payment.amount).toLocaleString('fr-MA')} MAD`
    ]);
  });
  
  // Calculate total
  const totalPaid = (payments.reduce((sum, payment) => sum + Number(payment.amount), 0)) + advancePayment;
  
  // Table
  autoTable(doc, {
    head: [['Date', 'Montant']],
    body: tableData,
    startY: yPos + (options.pelerinAddress ? 50 : 45),
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 100 }, // Date
      1: { cellWidth: 80, halign: 'right' }, // Montant
    },
    margin: { left: 14, right: 14 },
  });
  
  // Final Y after table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 40;
  
  // Summary box
  const summaryY = finalY + 10;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(120, summaryY, 75, 25);
  
  // Summary content
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('TOTAL PAYÉ:', 125, summaryY + 8);
  
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${totalPaid.toLocaleString('fr-MA')} MAD`, 125, summaryY + 18);
  
  // Footer
  const footerY = Math.max(summaryY + 40, 250);
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("Ce document est généré automatiquement par le système de gestion interne de l'agence (HonorableERP).", 14, footerY);
  
  // Save the PDF
  const filename = `paiements_${options.pelerinName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
};
