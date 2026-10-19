import React, { useState } from 'react';
import { BankTransaction, CompanyDetails, LedgerAccount, ExpenseRule } from '../types';
import { generateBrsReportPDF } from '../utils/pdfGenerator';
import {
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Zap,
  Download,
  Filter,
  Plus
} from 'lucide-react';

interface BankSyncProps {
  company: CompanyDetails;
  bankTransactions: BankTransaction[];
  ledgers: LedgerAccount[];
  expenseRules: ExpenseRule[];
  onSyncFeeds: () => void;
  isSyncing: boolean;
  onPostBankTxToLedger: (txId: string) => void;
}

export const BankSync: React.FC<BankSyncProps> = ({
  company,
  bankTransactions,
  ledgers,
  expenseRules,
  onSyncFeeds,
  isSyncing,
  onPostBankTxToLedger
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredTxs = bankTransactions.filter((tx) => {
    if (filterStatus === 'All') return true;
    return tx.status === filterStatus;
  });

  const handleDownloadBrs = () => {
    generateBrsReportPDF(bankTransactions, company);
  };

  const totalWithdrawals = bankTransactions.reduce((acc, tx) => acc + (tx.withdrawal || 0), 0);
  const totalDeposits = bankTransactions.reduce((acc, tx) => acc + (tx.deposit || 0), 0);
  const unreconciledCount = bankTransactions.filter((tx) => tx.status === 'Unreconciled').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Bank Synchronization & Automated Expense Matching
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed sync for {company.bankName} ({company.accountNumber}). Automated rule categorization for Tally entries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSyncFeeds}
            disabled={isSyncing}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Fetching Bank API...' : 'Sync Bank Feeds'}
          </button>

          <button
            onClick={handleDownloadBrs}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download BRS PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-xs">
          <span className="text-slate-400 font-semibold uppercase">Total Bank Credits (Deposits)</span>
          <div className="text-lg font-extrabold text-emerald-400 mt-1">₹{totalDeposits.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-xs">
          <span className="text-slate-400 font-semibold uppercase">Total Bank Debits (Withdrawals)</span>
          <div className="text-lg font-extrabold text-rose-400 mt-1">₹{totalWithdrawals.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-xs">
          <span className="text-slate-400 font-semibold uppercase">Unreconciled Feeds</span>
          <div className={`text-lg font-extrabold mt-1 ${unreconciledCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {unreconciledCount} transactions
          </div>
        </div>
      </div>

      {/* Expense Rule Matchers Bar */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Automated Expense Matching Rules Active
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {expenseRules.map((r) => (
            <span key={r.id} className="px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-medium">
              <strong className="text-amber-300">"{r.keyword}"</strong> &rarr; <span className="text-blue-400">{r.targetLedger}</span> ({r.gstRate}% GST)
            </span>
          ))}
        </div>
      </div>

      {/* Main Bank Statement Grid */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-400" />
            Bank Statement Feeds & Reconciliation
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-medium focus:outline-none"
            >
              <option value="All">All Transactions</option>
              <option value="Unreconciled">Unreconciled Only</option>
              <option value="Matched">Matched / Reconciled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Bank Narration</th>
                <th className="py-2.5 px-3">Ref / Cheque #</th>
                <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                <th className="py-2.5 px-3">Suggested Tally Ledger</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {filteredTxs.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-700/40 transition">
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono">{tx.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200 max-w-xs truncate">{tx.narration}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{tx.chequeRefNo}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                    {tx.withdrawal ? `₹${tx.withdrawal.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                    {tx.deposit ? `₹${tx.deposit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-indigo-300 font-medium">{tx.suggestedLedger}</span>
                    {tx.matchConfidence && (
                      <span className="ml-1 text-[10px] text-emerald-400 font-mono">({tx.matchConfidence}% match)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        tx.status === 'Matched'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {tx.status === 'Unreconciled' ? (
                      <button
                        onClick={() => onPostBankTxToLedger(tx.id)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition cursor-pointer"
                      >
                        Post to Tally
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-bold">✓ Reconciled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
