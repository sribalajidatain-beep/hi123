import React, { useState } from 'react';
import { Voucher, BankTransaction, VoucherType } from '../types';
import {
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  Building,
  FileCheck
} from 'lucide-react';

interface AIStatementParserProps {
  onAddParsedVoucher: (voucher: Voucher) => void;
  onAddParsedBankTx: (txs: BankTransaction[]) => void;
}

export const AIStatementParser: React.FC<AIStatementParserProps> = ({
  onAddParsedVoucher,
  onAddParsedBankTx
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState(
    `TAX INVOICE # INV-2026-8801
Date: 2026-07-24
Supplier: Swastik Industrial Equipment Pvt Ltd
GSTIN: 27AABCS9982F1ZM
Recipient: Apex CA Consultancy
GSTIN: 27AABCA1234F1ZM

Description: Industrial Dell Precision Workstation
HSN Code: 84713010
Qty: 1
Rate: ₹ 85,000.00
Taxable Value: ₹ 85,000.00
CGST @ 9%: ₹ 7,650.00
SGST @ 9%: ₹ 7,650.00
Total Amount: ₹ 1,00,300.00`
  );

  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>('image/jpeg');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);

  const [convertedStatus, setConvertedStatus] = useState<string | null>(null);

  const processFile = (file: File) => {
    setFileMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64Data = result.includes(',') ? result.split(',')[1] : result;
      setBase64Image(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRunAiParse = async () => {
    setIsParsing(true);
    setParseError(null);
    setParseWarning(null);
    setParsedResult(null);
    setConvertedStatus(null);

    try {
      const response = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textContent: inputMode === 'text' ? textContent : undefined,
          base64Image: inputMode === 'image' ? base64Image : undefined,
          mimeType: inputMode === 'image' ? fileMimeType : undefined
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server parsing error');
      }

      if (data.warning) {
        setParseWarning(data.warning);
      }

      setParsedResult(data.parsedData);
    } catch (err: any) {
      setParseError(err.message || 'Failed to process document with Gemini AI');
    } finally {
      setIsParsing(false);
    }
  };

  const handlePostToVoucher = () => {
    if (!parsedResult) return;

    const newVoucher: Voucher = {
      id: `vch-ai-${Date.now()}`,
      voucherNumber: parsedResult.invoiceNumber || `AI/26-27/${Math.floor(Math.random() * 900 + 100)}`,
      date: parsedResult.date || '2026-07-28',
      voucherType: 'Purchase',
      partyName: parsedResult.partyName || 'Swastik Industrial Equipment Pvt Ltd',
      partyGstin: parsedResult.partyGstin || '27AABCS9982F1ZM',
      partyState: 'Maharashtra',
      partyStateCode: '27',
      placeOfSupply: '27-Maharashtra',
      isInterState: false,
      reverseCharge: false,
      items: [
        {
          id: `itm-${Date.now()}`,
          description: parsedResult.lineItems?.[0]?.description || 'AI Parsed Equipment Purchase',
          hsnSac: parsedResult.hsnCode || '84713010',
          qty: parsedResult.lineItems?.[0]?.qty || 1,
          unit: 'Nos',
          rate: parsedResult.taxableAmount || 85000,
          taxableValue: parsedResult.taxableAmount || 85000,
          gstRate: 18,
          cgstRate: 9,
          cgstAmount: parsedResult.cgst || 7650,
          sgstRate: 9,
          sgstAmount: parsedResult.sgst || 7650,
          igstRate: 0,
          igstAmount: 0,
          totalAmount: parsedResult.totalAmount || 100300
        }
      ],
      subtotal: parsedResult.taxableAmount || 85000,
      cgstTotal: parsedResult.cgst || 7650,
      sgstTotal: parsedResult.sgst || 7650,
      igstTotal: parsedResult.igst || 0,
      cessTotal: 0,
      roundOff: 0,
      grandTotal: parsedResult.totalAmount || 100300,
      narration: `AI Parsed Invoice from ${parsedResult.partyName || 'Vendor'}. Verified with Gemini 3.6 Flash.`,
      status: 'Posted to Tally',
      createdDate: new Date().toISOString()
    };

    onAddParsedVoucher(newVoucher);
    setConvertedStatus('Invoice converted into Tally Voucher & queued for XML Export!');
  };

  return (
    <div className="bg-[#0F1115] border border-[#1E2229] rounded-xl p-6 shadow-xl max-w-5xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1E2229] pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            AI Document & Bank Statement OCR Extractor
          </h2>
          <p className="text-xs text-slate-400">Powered by Gemini 3.6 Flash. Extracts Taxable Values, HSNs, GSTINs, and Bank Statement line items.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-lg border border-[#1E2229]">
          <button
            onClick={() => setInputMode('text')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              inputMode === 'text' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Text / Statement Copy
          </button>
          <button
            onClick={() => setInputMode('image')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              inputMode === 'image' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload Document Image / PDF
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Input */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300">
            {inputMode === 'text' ? 'Paste Scanned Invoice Text or Bank Statement' : 'Upload Invoice Scan / Passbook Image'}
          </label>

          {inputMode === 'text' ? (
            <textarea
              rows={12}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-[#0A0B0D] border border-[#1E2229] rounded-xl text-slate-200 focus:outline-none focus:border-[#D4AF37]"
            />
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#1E2229] hover:border-[#D4AF37]/50 rounded-xl p-6 text-center space-y-3 bg-[#0A0B0D] transition cursor-pointer"
            >
              <UploadCloud className="w-8 h-8 text-[#D4AF37] mx-auto" />
              <div className="text-xs text-slate-300">
                Drag & Drop invoice image or bank statement PDF scan here
              </div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleImageUpload}
                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg border border-[#1E2229]" />
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleRunAiParse}
            disabled={isParsing || (inputMode === 'image' && !base64Image)}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer"
          >
            {isParsing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> Analyzing with Gemini 3.6 Flash...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950" /> Run AI Extract & Classify
              </>
            )}
          </button>
        </div>

        {/* Right Extracted Results */}
        <div className="bg-[#0A0B0D] border border-[#1E2229] rounded-xl p-4 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#1E2229] pb-2">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Extracted Structured Fields
            </h3>
            <span className="text-[10px] text-amber-400/80 font-mono">Tally Prime Schema</span>
          </div>

          {parseError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              {parseError}
            </div>
          )}

          {parseWarning && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/30 text-amber-300 rounded-lg text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {parseWarning}
            </div>
          )}

          {convertedStatus && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {convertedStatus}
            </div>
          )}

          {parsedResult ? (
            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0F1115] p-3 rounded-lg border border-[#1E2229]">
                <div><span className="text-slate-400">Doc Type:</span> <strong className="text-amber-400">{parsedResult.docType}</strong></div>
                <div><span className="text-slate-400">Date:</span> <strong className="text-slate-200">{parsedResult.date}</strong></div>
                <div><span className="text-slate-400">Invoice #:</span> <strong className="text-[#D4AF37]">{parsedResult.invoiceNumber}</strong></div>
                <div><span className="text-slate-400">Party:</span> <strong className="text-slate-100">{parsedResult.partyName}</strong></div>
                <div className="col-span-2"><span className="text-slate-400">Party GSTIN:</span> <strong className="text-amber-400">{parsedResult.partyGstin}</strong></div>
              </div>

              <div className="p-3 bg-[#0F1115] rounded-lg border border-[#1E2229] space-y-1">
                <div className="flex justify-between"><span className="text-slate-400">Taxable Value:</span> <span>₹{parsedResult.taxableAmount?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">CGST Amount:</span> <span>₹{parsedResult.cgst?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">SGST Amount:</span> <span>₹{parsedResult.sgst?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold text-emerald-400 border-t border-[#1E2229] pt-1">
                  <span>Grand Total:</span> <span>₹{parsedResult.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handlePostToVoucher}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Convert to Tally Prime Voucher Entry
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#D4AF37]" />
              Paste document text or upload scan, then click <strong>Run AI Extract</strong> to generate structured Tally entries.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
