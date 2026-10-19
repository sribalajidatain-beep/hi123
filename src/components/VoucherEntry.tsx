import React, { useState, useEffect } from 'react';
import { Voucher, VoucherType, LineItem, CompanyDetails, LedgerAccount } from '../types';
import { validateGSTIN, calculateLineGst, COMMON_HSN_SAC, INDIAN_STATES, generateIRN } from '../utils/gstUtils';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Calculator,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface VoucherEntryProps {
  company: CompanyDetails;
  ledgers: LedgerAccount[];
  onSaveVoucher: (voucher: Voucher) => void;
}

export const VoucherEntry: React.FC<VoucherEntryProps> = ({
  company,
  ledgers,
  onSaveVoucher
}) => {
  const [voucherType, setVoucherType] = useState<VoucherType>('Sales');
  const [voucherNumber, setVoucherNumber] = useState(`SAL/26-27/00${Math.floor(Math.random() * 90 + 10)}`);
  const [date, setDate] = useState('2026-07-28');

  const [partyName, setPartyName] = useState('Reliance Industries Ltd');
  const [partyGstin, setPartyGstin] = useState('27AABCR1234A1Z1');
  const [partyStateCode, setPartyStateCode] = useState('27');
  const [placeOfSupply, setPlaceOfSupply] = useState('27-Maharashtra');

  const [reverseCharge, setReverseCharge] = useState(false);
  const [narration, setNarration] = useState('Being professional advisory & GST compliance retainer fees charged.');

  // Line Items
  const [items, setItems] = useState<LineItem[]>([
    {
      id: 'item-1',
      description: 'GST Audit & Annual Return filing advisory',
      hsnSac: '998311',
      qty: 1,
      unit: 'Job',
      rate: 50000,
      taxableValue: 50000,
      gstRate: 18,
      cgstRate: 9,
      cgstAmount: 4500,
      sgstRate: 9,
      sgstAmount: 4500,
      igstRate: 0,
      igstAmount: 0,
      totalAmount: 59000
    }
  ]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto update voucher prefix on type change
  useEffect(() => {
    const randomNo = Math.floor(Math.random() * 900 + 100);
    if (voucherType === 'Sales') setVoucherNumber(`SAL/26-27/${randomNo}`);
    else if (voucherType === 'Purchase') setVoucherNumber(`PUR/26-27/${randomNo}`);
    else if (voucherType === 'Credit Note') setVoucherNumber(`CN/26-27/${randomNo}`);
    else if (voucherType === 'Debit Note') setVoucherNumber(`DN/26-27/${randomNo}`);
    else if (voucherType === 'Payment') setVoucherNumber(`PAY/26-27/${randomNo}`);
    else setVoucherNumber(`RCP/26-27/${randomNo}`);
  }, [voucherType]);

  // Handle party GSTIN input and detect state code
  const handlePartyGstinChange = (val: string) => {
    setPartyGstin(val);
    const res = validateGSTIN(val);
    if (res.isValid) {
      setPartyStateCode(res.stateCode);
      setPlaceOfSupply(`${res.stateCode}-${res.stateName}`);
    }
  };

  // Recalculate line items whenever state or item params change
  const recalculateItems = (currentItems: LineItem[], supplierState: string, posState: string) => {
    return currentItems.map((item) => {
      const taxableValue = item.qty * item.rate;
      const gstCalc = calculateLineGst(taxableValue, item.gstRate, supplierState, posState, item.cessRate || 0);

      return {
        ...item,
        taxableValue,
        cgstRate: gstCalc.cgstRate,
        cgstAmount: gstCalc.cgstAmount,
        sgstRate: gstCalc.sgstRate,
        sgstAmount: gstCalc.sgstAmount,
        igstRate: gstCalc.igstRate,
        igstAmount: gstCalc.igstAmount,
        cessAmount: gstCalc.cessAmount,
        totalAmount: gstCalc.totalAmount
      };
    });
  };

  const handlePosChange = (newPos: string) => {
    setPlaceOfSupply(newPos);
    const posState = newPos.substring(0, 2);
    setItems((prev) => recalculateItems(prev, company.stateCode, posState));
  };

  const posStateCode = placeOfSupply.substring(0, 2);
  const isInterState = company.stateCode !== posStateCode;

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'hsnSac') {
      const matchedHsn = COMMON_HSN_SAC.find((h) => h.code === value);
      if (matchedHsn) {
        item.gstRate = matchedHsn.defaultRate;
        item.description = item.description || matchedHsn.description;
      }
    }

    const taxableValue = item.qty * item.rate;
    const gstCalc = calculateLineGst(taxableValue, item.gstRate, company.stateCode, posStateCode, item.cessRate || 0);

    updated[index] = {
      ...item,
      taxableValue,
      cgstRate: gstCalc.cgstRate,
      cgstAmount: gstCalc.cgstAmount,
      sgstRate: gstCalc.sgstRate,
      sgstAmount: gstCalc.sgstAmount,
      igstRate: gstCalc.igstRate,
      igstAmount: gstCalc.igstAmount,
      cessAmount: gstCalc.cessAmount,
      totalAmount: gstCalc.totalAmount
    };

    setItems(updated);
  };

  const addItemRow = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      hsnSac: '998311',
      qty: 1,
      unit: 'Job',
      rate: 10000,
      taxableValue: 10000,
      gstRate: 18,
      cgstRate: isInterState ? 0 : 9,
      cgstAmount: isInterState ? 0 : 900,
      sgstRate: isInterState ? 0 : 9,
      sgstAmount: isInterState ? 0 : 900,
      igstRate: isInterState ? 18 : 0,
      igstAmount: isInterState ? 1800 : 0,
      totalAmount: 11800
    };
    setItems([...items, newItem]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Totals
  const subtotal = items.reduce((acc, i) => acc + i.taxableValue, 0);
  const cgstTotal = items.reduce((acc, i) => acc + i.cgstAmount, 0);
  const sgstTotal = items.reduce((acc, i) => acc + i.sgstAmount, 0);
  const igstTotal = items.reduce((acc, i) => acc + i.igstAmount, 0);
  const cessTotal = items.reduce((acc, i) => acc + i.cessAmount, 0);
  const rawGrandTotal = subtotal + cgstTotal + sgstTotal + igstTotal + cessTotal;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const partyStateName = INDIAN_STATES[partyStateCode] || 'Maharashtra';

    const newVoucher: Voucher = {
      id: `vch-${Date.now()}`,
      voucherNumber,
      date,
      voucherType,
      partyName,
      partyGstin,
      partyState: partyStateName,
      partyStateCode,
      placeOfSupply,
      isInterState,
      reverseCharge,
      eInvoiceIrn: generateIRN(company.gstin, voucherNumber, date),
      eWayBillNo: grandTotal > 50000 ? `241${Math.floor(100000000 + Math.random() * 900000000)}` : undefined,
      items,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      cessTotal,
      roundOff,
      grandTotal,
      narration,
      status: 'Posted to Tally',
      createdDate: new Date().toISOString()
    };

    onSaveVoucher(newVoucher);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-sm max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            Tally Prime 7.0 Voucher Entry
          </h2>
          <p className="text-xs text-slate-400">Classify Sales, Purchase, Credit Notes with auto Intra/Inter State GST logic</p>
        </div>

        {/* Voucher Type Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 overflow-x-auto">
          {(['Sales', 'Purchase', 'Credit Note', 'Debit Note', 'Payment', 'Receipt'] as VoucherType[]).map((vt) => (
            <button
              key={vt}
              type="button"
              onClick={() => setVoucherType(vt)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                voucherType === vt
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {vt}
            </button>
          ))}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Voucher <strong>{voucherNumber}</strong> successfully created and queued for Tally Prime 7.0 XML Export!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Header Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Voucher Number</label>
            <input
              type="text"
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
              required
              className="w-full px-3 py-2 font-mono bg-slate-900 border border-slate-700 rounded-lg text-blue-400 font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Party / Counterparty Ledger</label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Party Name"
              required
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Party GSTIN (15 Digits)</label>
            <input
              type="text"
              value={partyGstin}
              onChange={(e) => handlePartyGstinChange(e.target.value)}
              placeholder="e.g. 27AABCR1234A1Z1"
              className="w-full px-3 py-2 font-mono bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold uppercase focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tax Jurisdiction & POS Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 text-xs items-center">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Place of Supply (POS)</label>
            <select
              value={placeOfSupply}
              onChange={(e) => handlePosChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {Object.entries(INDIAN_STATES).map(([code, name]) => (
                <option key={code} value={`${code}-${name}`}>
                  {code} - {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="rcmCheck"
              checked={reverseCharge}
              onChange={(e) => setReverseCharge(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="rcmCheck" className="text-slate-300 font-medium cursor-pointer">
              Reverse Charge Mechanism (RCM) Applicable
            </label>
          </div>

          <div className="text-right">
            <span className="text-slate-400 font-medium">GST Supply Classification: </span>
            <span
              className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[11px] ${
                isInterState
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isInterState ? 'Inter-State (IGST Only)' : 'Intra-State (CGST + SGST)'}
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-400" />
              Itemized Taxable Supplies & HSN Breakdown
            </h3>
            <button
              type="button"
              onClick={addItemRow}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-700 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 w-28">HSN / SAC</th>
                  <th className="py-2.5 px-3 w-16">Qty</th>
                  <th className="py-2.5 px-3 w-20">Unit</th>
                  <th className="py-2.5 px-3 w-24">Rate (₹)</th>
                  <th className="py-2.5 px-3 w-28">Taxable (₹)</th>
                  <th className="py-2.5 px-3 w-20">GST Rate %</th>
                  <th className="py-2.5 px-3 w-28">Tax Amount (₹)</th>
                  <th className="py-2.5 px-3 w-28">Total (₹)</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium bg-slate-900/30">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/50">
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="e.g. Audit Consultation Fees"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={item.hsnSac}
                        onChange={(e) => handleItemChange(idx, 'hsnSac', e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-amber-300 focus:outline-none focus:border-blue-500 text-[11px]"
                      >
                        {COMMON_HSN_SAC.map((h) => (
                          <option key={h.code} value={h.code}>
                            {h.code} ({h.defaultRate}%)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                        className="w-full px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-100">
                      ₹{item.taxableValue.toFixed(2)}
                    </td>
                    <td className="p-2">
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleItemChange(idx, 'gstRate', Number(e.target.value))}
                        className="w-full px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                      >
                        {[0, 5, 12, 18, 28].map((rate) => (
                          <option key={rate} value={rate}>
                            {rate}%
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 font-mono text-amber-300">
                      {isInterState ? (
                        <span>IGST: ₹{item.igstAmount.toFixed(2)}</span>
                      ) : (
                        <span>CGST+SGST: ₹{(item.cgstAmount + item.sgstAmount).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-2 font-mono font-extrabold text-emerald-400">
                      ₹{item.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-500 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-700/80">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Narration (Tally Voucher Entry Memo)</label>
            <textarea
              rows={3}
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Enter voucher narration..."
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Subtotal (Taxable Value):</span>
              <span className="font-mono font-bold text-slate-200">₹{subtotal.toFixed(2)}</span>
            </div>

            {isInterState ? (
              <div className="flex justify-between py-1 border-b border-slate-800 text-amber-300">
                <span>Integrated GST (IGST Total):</span>
                <span className="font-mono font-bold">₹{igstTotal.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between py-1 border-b border-slate-800 text-emerald-300">
                  <span>Central GST (CGST Total):</span>
                  <span className="font-mono font-bold">₹{cgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-emerald-300">
                  <span>State GST (SGST Total):</span>
                  <span className="font-mono font-bold">₹{sgstTotal.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>Round Off Adjustment:</span>
              <span className="font-mono">₹{roundOff.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-2 text-sm font-extrabold text-white border-t-2 border-slate-700 pt-2">
              <span className="text-blue-400">GRAND TOTAL PAYABLE:</span>
              <span className="font-mono text-emerald-400 text-base">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Save & Tag for Tally Prime 7.0 Export
          </button>
        </div>

      </form>

    </div>
  );
};
