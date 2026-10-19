import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  Sparkles,
  FileCode,
  Building2,
  Scale,
  FileText,
  History
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'vouchers'
  | 'ocr-parser'
  | 'tally-xml'
  | 'bank-sync'
  | 'gstr-reconcile'
  | 'pdf-studio'
  | 'audit-trail';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unreconciledBankCount: number;
  unreconciledGstrCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unreconciledBankCount,
  unreconciledGstrCount
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vouchers', label: 'Voucher Entry', icon: FilePlus2 },
    { id: 'ocr-parser', label: 'AI Document & Bank OCR', icon: Sparkles, badge: 'Gemini AI' },
    { id: 'tally-xml', label: 'Tally 7.0 XML & Ledgers', icon: FileCode },
    { id: 'bank-sync', label: 'Bank Sync & BRS', icon: Building2, count: unreconciledBankCount },
    { id: 'gstr-reconcile', label: 'GSTR-2B Reconciliation', icon: Scale, count: unreconciledGstrCount },
    { id: 'pdf-studio', label: 'Client PDF Invoices', icon: FileText },
    { id: 'audit-trail', label: 'Audit Trail & Trial Bal', icon: History }
  ];

  return (
    <div className="bg-[#0F1115]/95 backdrop-blur border-b border-[#1E2229]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#16191E]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-[#D4AF37]'}`} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                        : 'bg-amber-500/10 text-[#D4AF37] border-[#D4AF37]/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-slate-950 text-[#D4AF37]'
                        : 'bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
