export type VoucherType = 'Sales' | 'Purchase' | 'Credit Note' | 'Debit Note' | 'Payment' | 'Receipt' | 'Journal' | 'Contra';

export interface CompanyDetails {
  name: string;
  gstin: string;
  state: string;
  stateCode: string;
  pan: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  financialYear: string;
}

export interface LineItem {
  id: string;
  description: string;
  hsnSac: string;
  qty: number;
  unit: string;
  rate: number;
  taxableValue: number;
  gstRate: number; // e.g. 18, 12, 5, 28, 0
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  cessRate?: number;
  cessAmount?: number;
  totalAmount: number;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  date: string; // YYYY-MM-DD
  voucherType: VoucherType;
  partyName: string;
  partyGstin: string;
  partyState: string;
  partyStateCode: string;
  placeOfSupply: string;
  isInterState: boolean;
  reverseCharge: boolean;
  eInvoiceIrn?: string;
  eWayBillNo?: string;
  items: LineItem[];
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  cessTotal: number;
  roundOff: number;
  grandTotal: number;
  narration: string;
  status: 'Draft' | 'Approved' | 'Posted to Tally' | 'Reconciled';
  tallyVoucherId?: string;
  createdDate: string;
}

export interface LedgerAccount {
  id: string;
  name: string;
  group: string; // e.g., 'Sundry Debtors', 'Duties & Taxes', 'Sales Accounts', 'Direct Expenses', 'Bank Accounts'
  openingBalance: number;
  currentBalance: number;
  gstin?: string;
  state?: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  narration: string;
  chequeRefNo: string;
  withdrawal: number;
  deposit: number;
  balance: number;
  suggestedLedger?: string;
  suggestedVoucherType?: VoucherType;
  matchConfidence?: number; // percentage
  status: 'Unreconciled' | 'Matched' | 'Manual' | 'Posted';
  matchedVoucherId?: string;
}

export interface Gstr2bItem {
  id: string;
  supplierGstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  itcAvailability: 'Available' | 'Ineligible' | 'Blocked u/s 17(5)';
  matchStatus: 'Matched' | 'Tax Mismatch' | 'Missing in Books' | 'Missing in GSTR-2B' | 'Date Mismatch';
  matchedBookVoucherId?: string;
  diffAmount?: number;
}

export interface ExpenseRule {
  id: string;
  keyword: string;
  targetLedger: string;
  voucherType: VoucherType;
  gstRate: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  voucherId?: string;
  details: string;
  complianceCheckPassed: boolean;
}

export interface ParsedDocumentResult {
  docType: 'Invoice' | 'Bank Statement' | 'Credit/Debit Note' | 'Unknown';
  partyName?: string;
  partyGstin?: string;
  invoiceNumber?: string;
  date?: string;
  totalAmount?: number;
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  hsnCode?: string;
  lineItems?: Array<{ description: string; qty: number; rate: number; amount: number; gstRate: number }>;
  transactions?: Array<{ date: string; narration: string; withdrawal: number; deposit: number; balance: number }>;
  rawSummary: string;
}
