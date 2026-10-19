import { jsPDF } from 'jspdf';
import { Voucher, CompanyDetails, BankTransaction, Gstr2bItem } from '../types';

/**
 * Generates a GST Compliant Tax Invoice PDF for Clients
 */
export function generateTaxInvoicePDF(voucher: Voucher, company: CompanyDetails) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 12;

  // Header Box
  doc.setDrawColor(30, 58, 138); // Navy Blue
  doc.setFillColor(243, 244, 246);
  doc.rect(10, y, pageWidth - 20, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text('TAX INVOICE', pageWidth / 2, y + 8, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`(Issued under Rule 46 of Central Goods and Services Tax Rules, 2017)`, pageWidth / 2, y + 14, { align: 'center' });
  doc.text(`Original for Recipient`, pageWidth / 2, y + 19, { align: 'center' });

  y += 28;

  // Supplier & Customer Details Grid
  const colWidth = (pageWidth - 24) / 2;
  doc.setLineWidth(0.3);
  doc.setDrawColor(209, 213, 219);

  // Supplier Box
  doc.rect(10, y, colWidth, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(company.name.toUpperCase(), 13, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  const supplierAddressLines = doc.splitTextToSize(company.address, colWidth - 6);
  doc.text(supplierAddressLines, 13, y + 11);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${company.gstin}`, 13, y + 25);
  doc.text(`State: ${company.state} (Code: ${company.stateCode})`, 13, y + 30);
  doc.text(`PAN: ${company.pan}`, 13, y + 35);

  // Recipient Box
  doc.rect(14 + colWidth, y, colWidth, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('BILLED TO (RECIPIENT):', 17 + colWidth, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(voucher.partyName, 17 + colWidth, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`GSTIN / UIN: ${voucher.partyGstin || 'URP (Unregistered)'}`, 17 + colWidth, y + 18);
  doc.text(`State: ${voucher.partyState} (Code: ${voucher.partyStateCode})`, 17 + colWidth, y + 23);
  doc.text(`Place of Supply: ${voucher.placeOfSupply}`, 17 + colWidth, y + 28);
  doc.text(`Reverse Charge: ${voucher.reverseCharge ? 'YES' : 'NO'}`, 17 + colWidth, y + 33);

  y += 45;

  // Invoice Meta Info Line
  doc.setFillColor(239, 246, 255);
  doc.rect(10, y, pageWidth - 20, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text(`Invoice No: ${voucher.voucherNumber}`, 14, y + 7.5);
  doc.text(`Date: ${voucher.date}`, 80, y + 7.5);
  doc.text(`e-Invoice IRN: ${voucher.eInvoiceIrn ? voucher.eInvoiceIrn.substring(0, 20) + '...' : 'N/A'}`, 130, y + 7.5);

  y += 16;

  // Items Table Header
  doc.setFillColor(30, 58, 138);
  doc.rect(10, y, pageWidth - 20, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);

  doc.text('S.No', 12, y + 5.5);
  doc.text('Description of Goods/Services', 24, y + 5.5);
  doc.text('HSN/SAC', 85, y + 5.5);
  doc.text('Qty', 110, y + 5.5);
  doc.text('Rate (₹)', 128, y + 5.5);
  doc.text('Taxable (₹)', 152, y + 5.5);
  doc.text('Total (₹)', 182, y + 5.5);

  y += 8;

  // Items Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);

  voucher.items.forEach((item, idx) => {
    doc.text((idx + 1).toString(), 12, y + 5);
    doc.text(item.description.substring(0, 32), 24, y + 5);
    doc.text(item.hsnSac || '-', 85, y + 5);
    doc.text(`${item.qty} ${item.unit}`, 110, y + 5);
    doc.text(item.rate.toFixed(2), 128, y + 5);
    doc.text(item.taxableValue.toFixed(2), 152, y + 5);
    doc.text(item.totalAmount.toFixed(2), 182, y + 5);

    doc.setDrawColor(243, 244, 246);
    doc.line(10, y + 8, pageWidth - 10, y + 8);
    y += 9;
  });

  y += 4;

  // Tax Breakdown Table & Summary Box
  const summaryBoxX = pageWidth - 90;
  doc.setDrawColor(209, 213, 219);
  doc.rect(10, y, 92, 40);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('GST TAX BREAKDOWN SUMMARY', 13, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  if (voucher.isInterState) {
    doc.text(`IGST Amount: ₹ ${voucher.igstTotal.toFixed(2)}`, 13, y + 14);
    doc.text(`CGST / SGST: ₹ 0.00 (Inter-state Supply)`, 13, y + 20);
  } else {
    doc.text(`CGST Amount: ₹ ${voucher.cgstTotal.toFixed(2)}`, 13, y + 14);
    doc.text(`SGST Amount: ₹ ${voucher.sgstTotal.toFixed(2)}`, 13, y + 20);
  }
  doc.text(`Cess Amount: ₹ ${voucher.cessTotal.toFixed(2)}`, 13, y + 26);
  doc.text(`Total Tax Payable: ₹ ${(voucher.cgstTotal + voucher.sgstTotal + voucher.igstTotal + voucher.cessTotal).toFixed(2)}`, 13, y + 33);

  // Grand Total Box Right
  doc.rect(summaryBoxX, y, 80, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Subtotal Taxable:`, summaryBoxX + 4, y + 8);
  doc.text(`₹ ${voucher.subtotal.toFixed(2)}`, summaryBoxX + 76, y + 8, { align: 'right' });

  doc.text(`Total Tax:`, summaryBoxX + 4, y + 16);
  doc.text(`₹ ${(voucher.cgstTotal + voucher.sgstTotal + voucher.igstTotal + voucher.cessTotal).toFixed(2)}`, summaryBoxX + 76, y + 16, { align: 'right' });

  doc.text(`Round Off:`, summaryBoxX + 4, y + 24);
  doc.text(`₹ ${voucher.roundOff.toFixed(2)}`, summaryBoxX + 76, y + 24, { align: 'right' });

  doc.line(summaryBoxX, y + 28, pageWidth - 10, y + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text(`GRAND TOTAL:`, summaryBoxX + 4, y + 35);
  doc.text(`₹ ${voucher.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryBoxX + 76, y + 35, { align: 'right' });

  y += 46;

  // Bank & Sign Box
  doc.rect(10, y, 100, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text('BANK DETAILS FOR PAYMENT:', 13, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`Bank Name: ${company.bankName}`, 13, y + 12);
  doc.text(`A/C No: ${company.accountNumber}`, 13, y + 17);
  doc.text(`IFSC Code: ${company.ifscCode}`, 13, y + 22);
  doc.text(`Branch: ${company.branch}`, 13, y + 27);

  // Digital Sign Box
  doc.rect(115, y, pageWidth - 125, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text(`For ${company.name.toUpperCase()}`, pageWidth - 15, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text(`[Digitally Signed / Authorized Signatory]`, pageWidth - 15, y + 26, { align: 'right' });

  y += 36;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text('Generated via Chartered Accountant GST Automation Suite for Tally Prime 7.0', pageWidth / 2, y + 4, { align: 'center' });

  doc.save(`GST_Invoice_${voucher.voucherNumber.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`);
}

/**
 * Generates Bank Reconciliation Statement (BRS) PDF Report
 */
export function generateBrsReportPDF(transactions: BankTransaction[], company: CompanyDetails) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('BANK RECONCILIATION STATEMENT (BRS)', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Company: ${company.name} | Bank: ${company.bankName} (${company.accountNumber})`, pageWidth / 2, y, { align: 'center' });

  y += 12;

  // Table header
  doc.setFillColor(30, 58, 138);
  doc.rect(10, y, pageWidth - 20, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  doc.text('Date', 12, y + 5.5);
  doc.text('Narration', 35, y + 5.5);
  doc.text('Ref / Cheque', 95, y + 5.5);
  doc.text('Debit (₹)', 130, y + 5.5);
  doc.text('Credit (₹)', 155, y + 5.5);
  doc.text('Status', 180, y + 5.5);

  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);

  transactions.forEach((tx) => {
    doc.text(tx.date, 12, y + 4);
    doc.text(tx.narration.substring(0, 32), 35, y + 4);
    doc.text(tx.chequeRefNo || '-', 95, y + 4);
    doc.text(tx.withdrawal ? tx.withdrawal.toFixed(2) : '-', 130, y + 4);
    doc.text(tx.deposit ? tx.deposit.toFixed(2) : '-', 155, y + 4);
    doc.text(tx.status, 180, y + 4);

    y += 7;
    if (y > 270) {
      doc.addPage();
      y = 15;
    }
  });

  doc.save(`Bank_Reconciliation_Statement_${company.financialYear.replace('/', '-')}.pdf`);
}
