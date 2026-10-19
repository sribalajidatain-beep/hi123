import React, { useState } from 'react';
import { Voucher, CompanyDetails } from '../types';
import { generateTaxInvoicePDF } from '../utils/pdfGenerator';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Building,
  QrCode,
  ShieldCheck
} from 'lucide-react';

interface PdfInvoiceStudioProps {
  company: CompanyDetails;
  vouchers: Voucher[];
  selectedVoucher: Voucher | null;
  onSelectVoucher: (voucher: Voucher) => void;
}

export const PdfInvoiceStudio: React.FC<PdfInvoiceStudioProps> = ({
  company,
  vouchers,
  selectedVoucher,
  onSelectVoucher
}) => {
  const activeVoucher = selectedVoucher || vouchers[0];

  const handleDownloadPdf = () => {
    if (!activeVoucher) return;
    generateTaxInvoicePDF(activeVoucher, company);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Client-Ready GST Compliant Tax Invoice Generator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compliant with Rule 46 of CGST Rules 2017. Includes HSN/SAC summary, IRN details, and Bank Account Mandate.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Preview
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" /> Download Tax Invoice PDF
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column 1/4: Voucher Picker */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-200 border-b border-slate-700 pb-2">Select Voucher for Invoice PDF</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {vouchers.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelectVoucher(v)}
                className={`w-full text-left p-3 rounded-lg border transition cursor-pointer ${
                  activeVoucher?.id === v.id
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-700/40'
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span className="font-mono text-blue-400">{v.voucherNumber}</span>
                  <span>₹{v.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{v.partyName}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{v.date} • {v.voucherType}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column 3/4: High Fidelity Printable Invoice Canvas */}
        {activeVoucher ? (
          <div className="lg:col-span-3 bg-white text-slate-900 rounded-xl p-8 shadow-2xl border border-slate-200 print:p-0 print:border-none print:shadow-none space-y-6">
            
            {/* Header Box */}
            <div className="border-2 border-slate-900 p-4 text-center bg-slate-50">
              <h1 className="text-xl font-extrabold uppercase tracking-widest text-slate-900">TAX INVOICE</h1>
              <p className="text-[11px] text-slate-600 font-medium">Issued under Rule 46 of Central Goods and Services Tax Rules, 2017</p>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">Original for Recipient</span>
            </div>

            {/* Supplier & Customer Grid */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 text-xs font-sans">
              <div className="space-y-1">
                <h2 className="font-bold text-sm text-blue-900">{company.name.toUpperCase()}</h2>
                <p className="text-slate-600 leading-snug">{company.address}</p>
                <p><strong>GSTIN:</strong> <span className="font-mono font-bold text-slate-800">{company.gstin}</span></p>
                <p><strong>State:</strong> {company.state} (State Code: {company.stateCode})</p>
                <p><strong>PAN:</strong> {company.pan}</p>
              </div>

              <div className="space-y-1 border-l border-slate-300 pl-4">
                <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">BILLED TO (RECIPIENT):</h3>
                <h2 className="font-bold text-sm text-slate-900">{activeVoucher.partyName}</h2>
                <p><strong>GSTIN / UIN:</strong> <span className="font-mono font-bold">{activeVoucher.partyGstin || 'Unregistered (URP)'}</span></p>
                <p><strong>State:</strong> {activeVoucher.partyState} (Code: {activeVoucher.partyStateCode})</p>
                <p><strong>Place of Supply (POS):</strong> {activeVoucher.placeOfSupply}</p>
                <p><strong>Reverse Charge (RCM):</strong> {activeVoucher.reverseCharge ? 'YES' : 'NO'}</p>
              </div>
            </div>

            {/* Meta Info Bar */}
            <div className="bg-slate-100 p-3 rounded border border-slate-300 flex justify-between text-xs font-semibold text-slate-800">
              <div>Invoice No: <span className="font-mono text-blue-800 font-bold">{activeVoucher.voucherNumber}</span></div>
              <div>Date: <span className="font-mono">{activeVoucher.date}</span></div>
              <div>e-Invoice IRN: <span className="font-mono text-[10px]">{activeVoucher.eInvoiceIrn ? activeVoucher.eInvoiceIrn.substring(0, 24) + '...' : 'N/A'}</span></div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                  <tr>
                    <th className="p-2 border border-slate-800">S.N</th>
                    <th className="p-2 border border-slate-800">Description of Goods/Services</th>
                    <th className="p-2 border border-slate-800">HSN/SAC</th>
                    <th className="p-2 border border-slate-800 text-center">Qty</th>
                    <th className="p-2 border border-slate-800 text-right">Rate (₹)</th>
                    <th className="p-2 border border-slate-800 text-right">Taxable Value (₹)</th>
                    <th className="p-2 border border-slate-800 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
                  {activeVoucher.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2 border border-slate-300 font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-semibold">{item.description}</td>
                      <td className="p-2 border border-slate-300 font-mono text-slate-600">{item.hsnSac || '-'}</td>
                      <td className="p-2 border border-slate-300 text-center">{item.qty} {item.unit}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">₹{item.rate.toFixed(2)}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">₹{item.taxableValue.toFixed(2)}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold">₹{item.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tax Breakdown & Grand Total */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 p-3 bg-slate-50 space-y-1">
                <h4 className="font-bold text-blue-900 text-[11px]">GST TAX BREAKDOWN</h4>
                {activeVoucher.isInterState ? (
                  <p>Integrated GST (IGST Total): <strong className="font-mono">₹{activeVoucher.igstTotal.toFixed(2)}</strong></p>
                ) : (
                  <>
                    <p>Central GST (CGST Total): <strong className="font-mono">₹{activeVoucher.cgstTotal.toFixed(2)}</strong></p>
                    <p>State GST (SGST Total): <strong className="font-mono">₹{activeVoucher.sgstTotal.toFixed(2)}</strong></p>
                  </>
                )}
                <p>Cess Amount: <strong className="font-mono">₹{activeVoucher.cessTotal.toFixed(2)}</strong></p>
              </div>

              <div className="border border-slate-300 p-3 space-y-1 text-right">
                <div className="flex justify-between"><span>Subtotal Taxable:</span> <strong className="font-mono">₹{activeVoucher.subtotal.toFixed(2)}</strong></div>
                <div className="flex justify-between"><span>Total Tax Amount:</span> <strong className="font-mono">₹{(activeVoucher.cgstTotal + activeVoucher.sgstTotal + activeVoucher.igstTotal).toFixed(2)}</strong></div>
                <div className="flex justify-between"><span>Round Off:</span> <strong className="font-mono">₹{activeVoucher.roundOff.toFixed(2)}</strong></div>
                <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-sm font-extrabold text-blue-900">
                  <span>GRAND TOTAL:</span>
                  <span className="font-mono">₹{activeVoucher.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Bank Mandate & Sign Box */}
            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-3 pt-4">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">BANK DETAILS FOR REMITTANCE:</h4>
                <p>Bank Name: <strong>{company.bankName}</strong></p>
                <p>Account Number: <strong className="font-mono">{company.accountNumber}</strong></p>
                <p>IFSC Code: <strong className="font-mono">{company.ifscCode}</strong></p>
                <p>Branch: {company.branch}</p>
              </div>

              <div className="text-right flex flex-col justify-between">
                <div className="font-bold text-slate-900">For {company.name.toUpperCase()}</div>
                <div className="text-[10px] text-slate-500 italic">[Digitally Signed / Authorized Signatory]</div>
              </div>
            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
};
