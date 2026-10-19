import React from 'react';
import { CompanyDetails } from '../types';
import { ShieldCheck, Building2, CheckCircle2, FileCode2, RefreshCw } from 'lucide-react';

interface HeaderProps {
  company: CompanyDetails;
  onExportXml: () => void;
  onSyncBank: () => void;
  isSyncingBank: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  onExportXml,
  onSyncBank,
  isSyncingBank
}) => {
  return (
    <header className="bg-[#0F1115] text-white border-b border-[#1E2229] sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-3">
          
          {/* CA Firm & Client Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-[#D4AF37] flex items-center justify-center shadow-lg shadow-amber-500/10 border border-amber-400/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                  Tally Prime 7.0 GST Compliance & Automation
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                  CA Audit Ready
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {company.name}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[#D4AF37] font-semibold">{company.gstin}</span>
                <span className="text-slate-600">•</span>
                <span>{company.state} ({company.stateCode})</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium">FY {company.financialYear}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onSyncBank}
              disabled={isSyncingBank}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0A0B0D] hover:bg-[#14171F] text-slate-200 border border-[#1E2229] hover:border-[#D4AF37]/40 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              title="Fetch Real-Time Bank Statement Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${isSyncingBank ? 'animate-spin' : ''}`} />
              {isSyncingBank ? 'Syncing Feeds...' : 'Bank Sync'}
            </button>

            <button
              onClick={onExportXml}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:from-amber-400 hover:to-amber-300 text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5 text-slate-950" />
              Export Tally 7.0 XML
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
