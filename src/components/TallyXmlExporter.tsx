import React, { useState } from 'react';
import { Voucher, LedgerAccount, CompanyDetails } from '../types';
import { generateTallyPrime7Xml } from '../utils/gstUtils';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Building,
  CheckCircle2,
  ListFilter,
  HelpCircle
} from 'lucide-react';

interface TallyXmlExporterProps {
  company: CompanyDetails;
  vouchers: Voucher[];
  ledgers: LedgerAccount[];
}

export const TallyXmlExporter: React.FC<TallyXmlExporterProps> = ({
  company,
  vouchers,
  ledgers
}) => {
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const filteredVouchers = vouchers.filter((v) => {
    if (selectedVoucherType === 'All') return true;
    return v.voucherType === selectedVoucherType;
  });

  const xmlContent = generateTallyPrime7Xml(filteredVouchers, company.name);

  const handleDownloadXml = () => {
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TallyPrime7_Import_${company.name.substring(0, 10)}_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            Tally Prime 7.0 XML Import Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generates 100% schema-compliant XML vouchers with User Defined Fields (UDF), Place of Supply, IRN & GST Ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyXml}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied XML!' : 'Copy XML'}
          </button>

          <button
            onClick={handleDownloadXml}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            Download Tally XML File
          </button>
        </div>
      </div>

      {/* Filter & Live Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column 1/3: Filters & Migration Steps */}
        <div className="space-y-6">
          
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-200 border-b border-slate-700 pb-2">
              <ListFilter className="w-4 h-4 text-blue-400" /> Filter Export Vouchers
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Voucher Type</label>
              <select
                value={selectedVoucherType}
                onChange={(e) => setSelectedVoucherType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Vouchers ({vouchers.length})</option>
                <option value="Sales">Sales Invoices ({vouchers.filter(v => v.voucherType === 'Sales').length})</option>
                <option value="Purchase">Purchase Invoices ({vouchers.filter(v => v.voucherType === 'Purchase').length})</option>
                <option value="Credit Note">Credit Notes ({vouchers.filter(v => v.voucherType === 'Credit Note').length})</option>
                <option value="Debit Note">Debit Notes ({vouchers.filter(v => v.voucherType === 'Debit Note').length})</option>
              </select>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400"><span>Target Company:</span> <strong className="text-slate-200">{company.name}</strong></div>
              <div className="flex justify-between text-slate-400"><span>Tally Target Version:</span> <strong className="text-emerald-400">Prime 7.0</strong></div>
              <div className="flex justify-between text-slate-400"><span>Vouchers Included:</span> <strong className="text-amber-300">{filteredVouchers.length}</strong></div>
            </div>
          </div>

          {/* Tally Migration Guide Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <HelpCircle className="w-4 h-4" /> How to Import in Tally Prime 7.0
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
              <li>Open <strong>Tally Prime 7.0</strong> on your PC.</li>
              <li>Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono">Alt + O</kbd> (Import Menu).</li>
              <li>Select <strong>Data &gt; Vouchers</strong>.</li>
              <li>Browse and select the downloaded <code className="text-amber-300">.xml</code> file.</li>
              <li>Tally will automatically create missing ledgers & post all vouchers!</li>
            </ol>
          </div>

        </div>

        {/* Right Column 2/3: Live XML Code Inspector */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-inner flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>TallyPrime7_XML_Buffer.xml</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              {(xmlContent.length / 1024).toFixed(1)} KB
            </span>
          </div>

          <pre className="flex-1 overflow-auto font-mono text-[11px] text-emerald-400/90 leading-relaxed p-3 bg-slate-950 rounded-lg border border-slate-800 selection:bg-blue-600">
            <code>{xmlContent}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};
