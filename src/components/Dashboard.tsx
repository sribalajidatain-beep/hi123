import React, { useState } from 'react';
import { Voucher, CompanyDetails, BankTransaction, Gstr2bItem } from '../types';
import { validateGSTIN } from '../utils/gstUtils';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Search,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  company: CompanyDetails;
  vouchers: Voucher[];
  bankTransactions: BankTransaction[];
  gstr2bItems: Gstr2bItem[];
  onNavigateTab: (tab: any) => void;
  onOpenPdfStudio: (voucher: Voucher) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  company,
  vouchers,
  bankTransactions,
  gstr2bItems,
  onNavigateTab,
  onOpenPdfStudio
}) => {
  // Quick GSTIN Validator Tool state
  const [testGstin, setTestGstin] = useState('27AABCS9982F1ZM');
  const [gstinResult, setGstinResult] = useState<any>(validateGSTIN('27AABCS9982F1ZM'));

  const handleTestGstin = (val: string) => {
    setTestGstin(val);
    setGstinResult(validateGSTIN(val));
  };

  // Tax calculations
  const salesVouchers = vouchers.filter((v) => v.voucherType === 'Sales');
  const purchaseVouchers = vouchers.filter((v) => v.voucherType === 'Purchase');
  const creditNotes = vouchers.filter((v) => v.voucherType === 'Credit Note');

  const grossSalesTaxable = salesVouchers.reduce((acc, v) => acc + v.subtotal, 0) - creditNotes.reduce((acc, v) => acc + v.subtotal, 0);
  const totalCgstOutput = salesVouchers.reduce((acc, v) => acc + v.cgstTotal, 0) - creditNotes.reduce((acc, v) => acc + v.cgstTotal, 0);
  const totalSgstOutput = salesVouchers.reduce((acc, v) => acc + v.sgstTotal, 0) - creditNotes.reduce((acc, v) => acc + v.sgstTotal, 0);
  const totalIgstOutput = salesVouchers.reduce((acc, v) => acc + v.igstTotal, 0) - creditNotes.reduce((acc, v) => acc + v.igstTotal, 0);
  const totalOutputGst = totalCgstOutput + totalSgstOutput + totalIgstOutput;

  const grossPurchaseTaxable = purchaseVouchers.reduce((acc, v) => acc + v.subtotal, 0);
  const totalCgstInput = purchaseVouchers.reduce((acc, v) => acc + v.cgstTotal, 0);
  const totalSgstInput = purchaseVouchers.reduce((acc, v) => acc + v.sgstTotal, 0);
  const totalIgstInput = purchaseVouchers.reduce((acc, v) => acc + v.igstTotal, 0);
  const totalInputItc = totalCgstInput + totalSgstInput + totalIgstInput;

  const netGstLiability = Math.max(0, totalOutputGst - totalInputItc);

  const bankUnreconciled = bankTransactions.filter((tx) => tx.status === 'Unreconciled').length;
  const gstrMismatches = gstr2bItems.filter((item) => item.matchStatus !== 'Matched').length;

  return (
    <div className="space-[#111827] space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sales & Output Tax */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Outward Supply (Sales)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-white">
              ₹ {grossSalesTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span>Output GST Collected: ₹ {totalOutputGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex text-[11px] text-slate-400 justify-between">
            <span>CGST: ₹{totalCgstOutput.toFixed(0)}</span>
            <span>SGST: ₹{totalSgstOutput.toFixed(0)}</span>
            <span>IGST: ₹{totalIgstOutput.toFixed(0)}</span>
          </div>
        </div>

        {/* Purchase & ITC Available */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inward Supply (ITC)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-white">
              ₹ {grossPurchaseTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-blue-400 mt-1 flex items-center gap-1 font-medium">
              <span>Input Tax Credit (ITC): ₹ {totalInputItc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex text-[11px] text-slate-400 justify-between">
            <span>CGST: ₹{totalCgstInput.toFixed(0)}</span>
            <span>SGST: ₹{totalSgstInput.toFixed(0)}</span>
            <span>IGST: ₹{totalIgstInput.toFixed(0)}</span>
          </div>
        </div>

        {/* Net GST Payable */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash GST Liability</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-extrabold text-amber-300">
              ₹ {netGstLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              <span>Payable via PMT-06 / GSTR-3B Cash Ledger</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">GSTR-3B Due: 20th Next Month</span>
            <span className="text-emerald-400 font-medium">Calculation Valid</span>
          </div>
        </div>

        {/* Bank & Reconciliation Status */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reconciliation Health</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Pending Bank Items:</span>
              <span className={`font-bold ${bankUnreconciled > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {bankUnreconciled} feeds
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">GSTR-2B Mismatches:</span>
              <span className={`font-bold ${gstrMismatches > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {gstrMismatches} invoices
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
            <button
              onClick={() => onNavigateTab('gstr-reconcile')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Reconcile Books <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Quick GSTIN Lookup & Voucher Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column 2/3: Voucher Ledger Stream */}
        <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-400" />
                Voucher Registry & Tally Prime Postings
              </h2>
              <p className="text-xs text-slate-400">Classified Sales, Purchases, Credit & Debit Notes ready for Tally 7.0 XML</p>
            </div>
            <button
              onClick={() => onNavigateTab('vouchers')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1 cursor-pointer"
            >
              + Create Voucher
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Party Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Taxable</th>
                  <th className="py-2.5 px-3">Grand Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 font-medium">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-700/30 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{v.voucherNumber}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{v.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {v.partyName}
                      <div className="text-[10px] text-slate-400 font-mono">{v.partyGstin}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          v.voucherType === 'Sales'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : v.voucherType === 'Purchase'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {v.voucherType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">₹{v.subtotal.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-100">₹{v.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                          v.status === 'Posted to Tally'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : v.status === 'Reconciled'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onOpenPdfStudio(v)}
                        className="px-2 py-1 text-[11px] font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition cursor-pointer"
                        title="Generate Tax Invoice PDF"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column 1/3: GSTIN Checksum Validator & Tally Health */}
        <div className="space-y-6">
          
          {/* Quick GSTIN Checksum Tool */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">GSTIN Validator & State Detector</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">Instant 15-digit Indian GSTIN checksum & jurisdiction check</p>

            <div className="space-y-3">
              <input
                type="text"
                value={testGstin}
                onChange={(e) => handleTestGstin(e.target.value)}
                placeholder="e.g. 27AABCS9982F1ZM"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-amber-300 focus:outline-none focus:border-blue-500 uppercase"
              />

              {gstinResult && (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    gstinResult.isValid
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {gstinResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Valid GSTIN Format
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> {gstinResult.error || 'Invalid GSTIN'}
                      </>
                    )}
                  </div>
                  {gstinResult.isValid && (
                    <div className="space-y-0.5 text-[11px] pt-1 text-slate-300">
                      <div><strong className="text-slate-400">Jurisdiction State:</strong> {gstinResult.stateName} (Code: {gstinResult.stateCode})</div>
                      <div><strong className="text-slate-400">PAN Extracted:</strong> <span className="font-mono text-amber-300">{gstinResult.pan}</span></div>
                      <div><strong className="text-slate-400">POS Rule:</strong> {gstinResult.stateCode === company.stateCode ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Accounting Assistant Feature Highlight */}
          <div className="bg-gradient-to-br from-indigo-900/60 to-slate-800 border border-indigo-500/30 rounded-xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">AI Statement & Invoice Parser</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Upload bank statement PDFs or vendor invoices. Gemini 3.6 Flash automatically extracts GSTINs, tax totals, and maps them to Tally Ledgers.
            </p>
            <button
              onClick={() => onNavigateTab('ocr-parser')}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Open AI Document Parser <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
