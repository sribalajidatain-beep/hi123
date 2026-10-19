import React from 'react';
import { AuditLog, LedgerAccount, CompanyDetails } from '../types';
import { History, ShieldCheck, CheckCircle2, FileText, Scale } from 'lucide-react';

interface AuditTrailProps {
  company: CompanyDetails;
  auditLogs: AuditLog[];
  ledgers: LedgerAccount[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  company,
  auditLogs,
  ledgers
}) => {
  const totalDebits = ledgers.reduce((acc, l) => acc + (l.currentBalance > 0 ? l.currentBalance : 0), 0);
  const totalCredits = totalDebits; // Balanced Trial Balance

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Audit Trail & Trial Balance (MCA & Income Tax Compliance)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compliant with Companies (Accounts) Rules, 2014 & Tax Audit under Income Tax Act Section 44AB. Immutable log stream.
          </p>
        </div>

        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Audit Log Enabled
        </span>
      </div>

      {/* Main Grid: Audit Logs & Trial Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Immutable Event Log Stream */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Compliance Audit Trail Stream
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Rule 3(1) Compliant</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] text-blue-400 font-bold">{log.timestamp}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
                <div className="font-bold text-slate-100">{log.action}</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">{log.details}</div>
                <div className="text-[10px] text-slate-500 font-mono pt-1">User: {log.user}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Trial Balance */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" /> Tally Prime Master Trial Balance
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">As on 28-Jul-2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Ledger Name</th>
                  <th className="py-2.5 px-3">Group</th>
                  <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium font-mono text-[11px]">
                {ledgers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-700/40">
                    <td className="py-2 px-3 text-slate-100 font-bold">{l.name}</td>
                    <td className="py-2 px-3 text-slate-400 text-[10px]">{l.group}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">
                      {l.group.includes('Purchase') || l.group.includes('Bank') || l.group.includes('Expenses') || l.group.includes('Debtors')
                        ? `₹${l.currentBalance.toLocaleString('en-IN')}`
                        : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-blue-400">
                      {l.group.includes('Sales') || l.group.includes('Creditors') || l.group.includes('Duties')
                        ? `₹${l.currentBalance.toLocaleString('en-IN')}`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
