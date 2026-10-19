import React, { useState } from 'react';
import { Gstr2bItem, CompanyDetails } from '../types';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  Check,
  FileCheck,
  ShieldAlert,
  Info
} from 'lucide-react';

interface GstrReconciliationProps {
  company: CompanyDetails;
  gstr2bItems: Gstr2bItem[];
}

export const GstrReconciliation: React.FC<GstrReconciliationProps> = ({
  company,
  gstr2bItems
}) => {
  const [selectedItemForReminder, setSelectedItemForReminder] = useState<Gstr2bItem | null>(null);
  const [copiedReminder, setCopiedReminder] = useState(false);

  const matchedItems = gstr2bItems.filter((i) => i.matchStatus === 'Matched');
  const missingInBooks = gstr2bItems.filter((i) => i.matchStatus === 'Missing in Books');
  const taxMismatches = gstr2bItems.filter((i) => i.matchStatus === 'Tax Mismatch');

  const totalEligibleItc = gstr2bItems
    .filter((i) => i.itcAvailability === 'Available')
    .reduce((acc, i) => acc + i.cgst + i.sgst + i.igst, 0);

  const totalBlockedItc = gstr2bItems
    .filter((i) => i.itcAvailability !== 'Available')
    .reduce((acc, i) => acc + i.cgst + i.sgst + i.igst, 0);

  const generateSupplierReminderText = (item: Gstr2bItem) => {
    return `Dear ${item.supplierName} (GSTIN: ${item.supplierGstin}),

Greetings from ${company.name}.

During our monthly GSTR-2B reconciliation for ${company.financialYear}, we noticed that Invoice #${item.invoiceNumber} dated ${item.invoiceDate} (Value: ₹${item.invoiceValue.toLocaleString('en-IN')}) is currently missing / mismatched in your GSTR-1 return.

Kindly ensure this invoice is uploaded in your GSTR-1 before the 11th of this month so we can claim Input Tax Credit (ITC) as per Section 16(2)(aa) of the CGST Act, 2017.

Thank you,
Accounts & GST Compliance Team
${company.name}
GSTIN: ${company.gstin}`;
  };

  const handleCopyReminder = () => {
    if (!selectedItemForReminder) return;
    navigator.clipboard.writeText(generateSupplierReminderText(selectedItemForReminder));
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            GSTR-2B Auto-Reconciliation Engine (ITC Claim Safeguard)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Matches Purchase Register against GSTR-2B portal data to prevent ITC reversal under CGST Section 16(2)(aa).
          </p>
        </div>
      </div>

      {/* ITC Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 text-xs">
          <span className="text-slate-400 font-semibold uppercase">Total Eligible ITC Claimable</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            ₹{totalEligibleItc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Fully matched with GSTR-2B portal</p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 text-xs">
          <span className="text-slate-400 font-semibold uppercase">Ineligible / Blocked ITC u/s 17(5)</span>
          <div className="text-xl font-extrabold text-rose-400 mt-1">
            ₹{totalBlockedItc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Motor vehicles, food/catering, personal use</p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 text-xs">
          <span className="text-slate-400 font-semibold uppercase">GSTR-2B Matching Health</span>
          <div className="text-xl font-extrabold text-amber-300 mt-1">
            {matchedItems.length} / {gstr2bItems.length} Matched
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{missingInBooks.length} missing in purchase books</p>
        </div>
      </div>

      {/* GSTR-2B Table */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-400" />
            GSTR-2B vs Tally Purchase Book Reconciliation Stream
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Supplier GSTIN & Name</th>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Inv Date</th>
                <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Tax (₹)</th>
                <th className="py-2.5 px-3">ITC Status</th>
                <th className="py-2.5 px-3">Reconciliation Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {gstr2bItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/40 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-100">{item.supplierName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.supplierGstin}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-blue-400 font-bold">{item.invoiceNumber}</td>
                  <td className="py-2.5 px-3 font-mono">{item.invoiceDate}</td>
                  <td className="py-2.5 px-3 text-right font-mono">₹{item.taxableValue.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-bold">
                    ₹{(item.cgst + item.sgst + item.igst).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.itcAvailability === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.itcAvailability}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                        item.matchStatus === 'Matched'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.matchStatus === 'Matched' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {item.matchStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {item.matchStatus !== 'Matched' ? (
                      <button
                        onClick={() => setSelectedItemForReminder(item)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded transition cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Send className="w-3 h-3" /> Draft Notice
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px]">✓ Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Reminder Draft Modal */}
      {selectedItemForReminder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                Supplier Missing Invoice Reminder Notice
              </h3>
              <button
                onClick={() => setSelectedItemForReminder(null)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Send this auto-generated request to <strong>{selectedItemForReminder.supplierName}</strong> so they upload invoice #{selectedItemForReminder.invoiceNumber} in their GSTR-1.
            </p>

            <textarea
              rows={10}
              readOnly
              value={generateSupplierReminderText(selectedItemForReminder)}
              className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg text-amber-200/90 leading-relaxed focus:outline-none"
            />

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-500">CGST Section 16(2)(aa) Compliant</span>
              <button
                onClick={handleCopyReminder}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedReminder ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedReminder ? 'Copied to Clipboard!' : 'Copy Notice Text'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
