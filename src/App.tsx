import React, { useState } from 'react';
import {
  INITIAL_COMPANY,
  INITIAL_LEDGERS,
  INITIAL_VOUCHERS,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_GSTR2B,
  INITIAL_EXPENSE_RULES,
  INITIAL_AUDIT_LOGS
} from './data/mockData';
import { Voucher, BankTransaction, AuditLog, CompanyDetails, LedgerAccount, Gstr2bItem, ExpenseRule } from './types';

import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { VoucherEntry } from './components/VoucherEntry';
import { AIStatementParser } from './components/AIStatementParser';
import { TallyXmlExporter } from './components/TallyXmlExporter';
import { BankSync } from './components/BankSync';
import { GstrReconciliation } from './components/GstrReconciliation';
import { PdfInvoiceStudio } from './components/PdfInvoiceStudio';
import { AuditTrail } from './components/AuditTrail';

export default function App() {
  const [company] = useState<CompanyDetails>(INITIAL_COMPANY);
  const [ledgers, setLedgers] = useState<LedgerAccount[]>(INITIAL_LEDGERS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [gstr2bItems] = useState<Gstr2bItem[]>(INITIAL_GSTR2B);
  const [expenseRules] = useState<ExpenseRule[]>(INITIAL_EXPENSE_RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedInvoiceVoucher, setSelectedInvoiceVoucher] = useState<Voucher | null>(null);

  const [isSyncingBank, setIsSyncingBank] = useState(false);

  // Handler: Add new voucher (from Entry or AI Parser)
  const handleSaveVoucher = (newVoucher: Voucher) => {
    setVouchers([newVoucher, ...vouchers]);

    // Record audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'CA Balaji (Senior Partner)',
      action: `Voucher Created (${newVoucher.voucherType})`,
      voucherId: newVoucher.id,
      details: `Created ${newVoucher.voucherType} ${newVoucher.voucherNumber} for ${newVoucher.partyName}. Grand Total: ₹${newVoucher.grandTotal}`,
      complianceCheckPassed: true
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Handler: Trigger Bank Sync
  const handleSyncBank = async () => {
    setIsSyncingBank(true);
    try {
      const res = await fetch('/api/bank-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccount: company.accountNumber })
      });
      const data = await res.json();
      if (data.success && data.newTransactions) {
        setBankTransactions([...data.newTransactions, ...bankTransactions]);

        const syncLog: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: 'HDFC Bank API Sync Agent',
          action: 'Real-Time Bank Feed Synchronized',
          details: `Fetched ${data.newTransactions.length} new bank feeds. Matched auto expense rules.`,
          complianceCheckPassed: true
        };
        setAuditLogs([syncLog, ...auditLogs]);
      }
    } catch (err) {
      console.error('Bank sync error:', err);
    } finally {
      setIsSyncingBank(false);
    }
  };

  // Handler: Post Bank transaction to Tally Ledger
  const handlePostBankTxToLedger = (txId: string) => {
    setBankTransactions(
      bankTransactions.map((tx) => {
        if (tx.id === txId) {
          return { ...tx, status: 'Matched' };
        }
        return tx;
      })
    );

    const matchLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'CA Balaji (Senior Partner)',
      action: 'Bank Feed Matched & Posted to Ledger',
      details: `Reconciled bank transaction ${txId} against suggested Tally ledger.`,
      complianceCheckPassed: true
    };
    setAuditLogs([matchLog, ...auditLogs]);
  };

  const handleOpenPdfStudioForVoucher = (v: Voucher) => {
    setSelectedInvoiceVoucher(v);
    setActiveTab('pdf-studio');
  };

  const unreconciledBankCount = bankTransactions.filter((tx) => tx.status === 'Unreconciled').length;
  const unreconciledGstrCount = gstr2bItems.filter((i) => i.matchStatus !== 'Matched').length;

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-slate-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-slate-950">
      
      {/* Header Bar */}
      <Header
        company={company}
        onExportXml={() => setActiveTab('tally-xml')}
        onSyncBank={handleSyncBank}
        isSyncingBank={isSyncingBank}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreconciledBankCount={unreconciledBankCount}
        unreconciledGstrCount={unreconciledGstrCount}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            company={company}
            vouchers={vouchers}
            bankTransactions={bankTransactions}
            gstr2bItems={gstr2bItems}
            onNavigateTab={setActiveTab}
            onOpenPdfStudio={handleOpenPdfStudioForVoucher}
          />
        )}

        {activeTab === 'vouchers' && (
          <VoucherEntry
            company={company}
            ledgers={ledgers}
            onSaveVoucher={handleSaveVoucher}
          />
        )}

        {activeTab === 'ocr-parser' && (
          <AIStatementParser
            onAddParsedVoucher={handleSaveVoucher}
            onAddParsedBankTx={(txs) => setBankTransactions([...txs, ...bankTransactions])}
          />
        )}

        {activeTab === 'tally-xml' && (
          <TallyXmlExporter
            company={company}
            vouchers={vouchers}
            ledgers={ledgers}
          />
        )}

        {activeTab === 'bank-sync' && (
          <BankSync
            company={company}
            bankTransactions={bankTransactions}
            ledgers={ledgers}
            expenseRules={expenseRules}
            onSyncFeeds={handleSyncBank}
            isSyncing={isSyncingBank}
            onPostBankTxToLedger={handlePostBankTxToLedger}
          />
        )}

        {activeTab === 'gstr-reconcile' && (
          <GstrReconciliation
            company={company}
            gstr2bItems={gstr2bItems}
          />
        )}

        {activeTab === 'pdf-studio' && (
          <PdfInvoiceStudio
            company={company}
            vouchers={vouchers}
            selectedVoucher={selectedInvoiceVoucher}
            onSelectVoucher={setSelectedInvoiceVoucher}
          />
        )}

        {activeTab === 'audit-trail' && (
          <AuditTrail
            company={company}
            auditLogs={auditLogs}
            ledgers={ledgers}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E2229] bg-[#0F1115] py-4 text-center text-xs text-slate-500">
        Tally Prime 7.0 GST Compliance & Automation Hub • Chartered Accountant Workspace • Integrated Gemini AI
      </footer>

    </div>
  );
}
