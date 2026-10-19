import { CompanyDetails, LedgerAccount, Voucher, BankTransaction, Gstr2bItem, ExpenseRule, AuditLog } from '../types';

export const INITIAL_COMPANY: CompanyDetails = {
  name: 'Apex CA Consultancy & Financial Solutions Pvt Ltd',
  gstin: '27AABCA1234F1ZM',
  state: 'Maharashtra',
  stateCode: '27',
  pan: 'AABCA1234F',
  address: 'Suite 402, Pinnacle Towers, BKC Commercial Complex, Mumbai, Maharashtra - 400051',
  bankName: 'HDFC Bank Ltd',
  accountNumber: '50200088991122',
  ifscCode: 'HDFC0000240',
  branch: 'BKC Bandra East, Mumbai',
  financialYear: '2026-27'
};

export const INITIAL_LEDGERS: LedgerAccount[] = [
  { id: 'led-1', name: 'Sales Account', group: 'Sales Accounts', openingBalance: 0, currentBalance: 845000 },
  { id: 'led-2', name: 'Purchase Account', group: 'Purchase Accounts', openingBalance: 0, currentBalance: 420000 },
  { id: 'led-3', name: 'CGST Output', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 76050 },
  { id: 'led-4', name: 'SGST Output', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 76050 },
  { id: 'led-5', name: 'IGST Output', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 12600 },
  { id: 'led-6', name: 'CGST Input Credit', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 37800 },
  { id: 'led-7', name: 'SGST Input Credit', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 37800 },
  { id: 'led-8', name: 'IGST Input Credit', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 21600 },
  { id: 'led-9', name: 'HDFC Bank Current A/c', group: 'Bank Accounts', openingBalance: 1250000, currentBalance: 1895000 },
  { id: 'led-10', name: 'Reliance Industries Ltd', group: 'Sundry Debtors', openingBalance: 0, currentBalance: 295000, gstin: '27AABCR1234A1Z1', state: 'Maharashtra' },
  { id: 'led-11', name: 'Infosys Technologies Pvt Ltd', group: 'Sundry Debtors', openingBalance: 0, currentBalance: 118000, gstin: '29AABCI5678B1Z2', state: 'Karnataka' },
  { id: 'led-12', name: 'Tata Consultancy Services', group: 'Sundry Creditors', openingBalance: 0, currentBalance: 88500, gstin: '27AABCT9988C1Z3', state: 'Maharashtra' },
  { id: 'led-13', name: 'Dell India Pvt Ltd', group: 'Sundry Creditors', openingBalance: 0, currentBalance: 141600, gstin: '07AABCD1122E1Z5', state: 'Delhi' },
  { id: 'led-14', name: 'Staff Welfare & Office Expenses', group: 'Indirect Expenses', openingBalance: 0, currentBalance: 45000 },
  { id: 'led-15', name: 'Software & Cloud Subscriptions', group: 'Indirect Expenses', openingBalance: 0, currentBalance: 62000 }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vch-101',
    voucherNumber: 'SAL/26-27/001',
    date: '2026-07-05',
    voucherType: 'Sales',
    partyName: 'Reliance Industries Ltd',
    partyGstin: '27AABCR1234A1Z1',
    partyState: 'Maharashtra',
    partyStateCode: '27',
    placeOfSupply: '27-Maharashtra',
    isInterState: false,
    reverseCharge: false,
    eInvoiceIrn: 'a9d283e1c94b7023d81f524a87c129e4b6d3a2e1098f7c6543210ab987654321',
    eWayBillNo: '241098765432',
    items: [
      {
        id: 'itm-1',
        description: 'GST Compliance & Audit Consultation Services',
        hsnSac: '998311',
        qty: 1,
        unit: 'Job',
        rate: 250000,
        taxableValue: 250000,
        gstRate: 18,
        cgstRate: 9,
        cgstAmount: 22500,
        sgstRate: 9,
        sgstAmount: 22500,
        igstRate: 0,
        igstAmount: 0,
        totalAmount: 295000
      }
    ],
    subtotal: 250000,
    cgstTotal: 22500,
    sgstTotal: 22500,
    igstTotal: 0,
    cessTotal: 0,
    roundOff: 0,
    grandTotal: 295000,
    narration: 'Being professional advisory & GST compliance retainer fees charged.',
    status: 'Posted to Tally',
    createdDate: '2026-07-05T10:30:00Z'
  },
  {
    id: 'vch-102',
    voucherNumber: 'SAL/26-27/002',
    date: '2026-07-12',
    voucherType: 'Sales',
    partyName: 'Infosys Technologies Pvt Ltd',
    partyGstin: '29AABCI5678B1Z2',
    partyState: 'Karnataka',
    partyStateCode: '29',
    placeOfSupply: '29-Karnataka',
    isInterState: true,
    reverseCharge: false,
    eInvoiceIrn: 'b7c194a2d83e1c94b7023d81f524a87c129e4b6d3a2e1098f7c6543210ab9876',
    items: [
      {
        id: 'itm-2',
        description: 'Tally Prime Custom Module & API Integration Advisory',
        hsnSac: '998313',
        qty: 1,
        unit: 'Job',
        rate: 100000,
        taxableValue: 100000,
        gstRate: 18,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: 18,
        igstAmount: 18000,
        totalAmount: 118000
      }
    ],
    subtotal: 100000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 18000,
    cessTotal: 0,
    roundOff: 0,
    grandTotal: 118000,
    narration: 'Inter-state software consulting supply to Bengaluru office.',
    status: 'Posted to Tally',
    createdDate: '2026-07-12T14:15:00Z'
  },
  {
    id: 'vch-103',
    voucherNumber: 'PUR/26-27/045',
    date: '2026-07-18',
    voucherType: 'Purchase',
    partyName: 'Dell India Pvt Ltd',
    partyGstin: '07AABCD1122E1Z5',
    partyState: 'Delhi',
    partyStateCode: '07',
    placeOfSupply: '27-Maharashtra',
    isInterState: true,
    reverseCharge: false,
    items: [
      {
        id: 'itm-3',
        description: 'Dell Latitude Laptops for Audit Team',
        hsnSac: '84713010',
        qty: 2,
        unit: 'Nos',
        rate: 60000,
        taxableValue: 120000,
        gstRate: 18,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: 18,
        igstAmount: 21600,
        totalAmount: 141600
      }
    ],
    subtotal: 120000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 21600,
    cessTotal: 0,
    roundOff: 0,
    grandTotal: 141600,
    narration: 'Purchase of office laptops for CA staff.',
    status: 'Reconciled',
    createdDate: '2026-07-18T11:00:00Z'
  },
  {
    id: 'vch-104',
    voucherNumber: 'CN/26-27/003',
    date: '2026-07-22',
    voucherType: 'Credit Note',
    partyName: 'Reliance Industries Ltd',
    partyGstin: '27AABCR1234A1Z1',
    partyState: 'Maharashtra',
    partyStateCode: '27',
    placeOfSupply: '27-Maharashtra',
    isInterState: false,
    reverseCharge: false,
    items: [
      {
        id: 'itm-4',
        description: 'Fee adjustment discount on SAL/26-27/001',
        hsnSac: '998311',
        qty: 1,
        unit: 'Job',
        rate: 20000,
        taxableValue: 20000,
        gstRate: 18,
        cgstRate: 9,
        cgstAmount: 1800,
        sgstRate: 9,
        sgstAmount: 1800,
        igstRate: 0,
        igstAmount: 0,
        totalAmount: 23600
      }
    ],
    subtotal: 20000,
    cgstTotal: 1800,
    sgstTotal: 1800,
    igstTotal: 0,
    cessTotal: 0,
    roundOff: 0,
    grandTotal: 23600,
    narration: 'Credit Note issued towards retainer discount agreed in AGM.',
    status: 'Approved',
    createdDate: '2026-07-22T16:00:00Z'
  }
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'tx-201',
    date: '2026-07-06',
    narration: 'NEFT CR-RELANCE IND-27AABCR1234A1Z1-RET FEES',
    chequeRefNo: 'NEFT8899120',
    withdrawal: 0,
    deposit: 295000,
    balance: 1545000,
    suggestedLedger: 'Reliance Industries Ltd',
    suggestedVoucherType: 'Receipt',
    matchConfidence: 98,
    status: 'Matched',
    matchedVoucherId: 'vch-101'
  },
  {
    id: 'tx-202',
    date: '2026-07-14',
    narration: 'UPI-SWIGGY CORPORATE MEALS MUMBAI',
    chequeRefNo: 'UPI6622019',
    withdrawal: 3450,
    deposit: 0,
    balance: 1541550,
    suggestedLedger: 'Staff Welfare & Office Expenses',
    suggestedVoucherType: 'Payment',
    matchConfidence: 95,
    status: 'Unreconciled'
  },
  {
    id: 'tx-203',
    date: '2026-07-19',
    narration: 'RTGS DR-DELL INDIA PVT LTD INVOICE 07AABCD1122E1Z5',
    chequeRefNo: 'RTGS9988112',
    withdrawal: 141600,
    deposit: 0,
    balance: 1399950,
    suggestedLedger: 'Dell India Pvt Ltd',
    suggestedVoucherType: 'Payment',
    matchConfidence: 96,
    status: 'Matched',
    matchedVoucherId: 'vch-103'
  },
  {
    id: 'tx-204',
    date: '2026-07-25',
    narration: 'AWS CLOUD COMPUTING MUMBAI BILL JULY',
    chequeRefNo: 'POS4433211',
    withdrawal: 18500,
    deposit: 0,
    balance: 1381450,
    suggestedLedger: 'Software & Cloud Subscriptions',
    suggestedVoucherType: 'Payment',
    matchConfidence: 92,
    status: 'Unreconciled'
  }
];

export const INITIAL_GSTR2B: Gstr2bItem[] = [
  {
    id: 'g2b-1',
    supplierGstin: '07AABCD1122E1Z5',
    supplierName: 'Dell India Pvt Ltd',
    invoiceNumber: 'DEL/INV/9981',
    invoiceDate: '2026-07-18',
    invoiceValue: 141600,
    taxableValue: 120000,
    cgst: 0,
    sgst: 0,
    igst: 21600,
    itcAvailability: 'Available',
    matchStatus: 'Matched',
    matchedBookVoucherId: 'vch-103',
    diffAmount: 0
  },
  {
    id: 'g2b-2',
    supplierGstin: '27AABCT9988C1Z3',
    supplierName: 'Tata Consultancy Services',
    invoiceNumber: 'TCS/26-27/889',
    invoiceDate: '2026-07-20',
    invoiceValue: 88500,
    taxableValue: 75000,
    cgst: 6750,
    sgst: 6750,
    igst: 0,
    itcAvailability: 'Available',
    matchStatus: 'Missing in Books',
    diffAmount: 88500
  },
  {
    id: 'g2b-3',
    supplierGstin: '27AAACG0000A1Z9',
    supplierName: 'Goldman Sachs Corporate Car Rentals',
    invoiceNumber: 'GS/CAR/0112',
    invoiceDate: '2026-07-15',
    invoiceValue: 42000,
    taxableValue: 35600,
    cgst: 3200,
    sgst: 3200,
    igst: 0,
    itcAvailability: 'Blocked u/s 17(5)',
    matchStatus: 'Matched',
    diffAmount: 0
  }
];

export const INITIAL_EXPENSE_RULES: ExpenseRule[] = [
  { id: 'rule-1', keyword: 'SWIGGY', targetLedger: 'Staff Welfare & Office Expenses', voucherType: 'Payment', gstRate: 5 },
  { id: 'rule-2', keyword: 'ZOMATO', targetLedger: 'Staff Welfare & Office Expenses', voucherType: 'Payment', gstRate: 5 },
  { id: 'rule-3', keyword: 'AWS', targetLedger: 'Software & Cloud Subscriptions', voucherType: 'Payment', gstRate: 18 },
  { id: 'rule-4', keyword: 'GOOGLE', targetLedger: 'Software & Cloud Subscriptions', voucherType: 'Payment', gstRate: 18 },
  { id: 'rule-5', keyword: 'MICROSOFT', targetLedger: 'Software & Cloud Subscriptions', voucherType: 'Payment', gstRate: 18 },
  { id: 'rule-6', keyword: 'BEST ELECTRICITY', targetLedger: 'Electricity & Utility Expenses', voucherType: 'Payment', gstRate: 0 }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-28 09:15:00',
    user: 'CA Balaji (Senior Partner)',
    action: 'Voucher Approved',
    voucherId: 'vch-101',
    details: 'Verified Sales Invoice SAL/26-27/001 with e-Invoice IRN & GSTIN checksum',
    complianceCheckPassed: true
  },
  {
    id: 'log-2',
    timestamp: '2026-07-28 09:30:00',
    user: 'Automated Rule Engine',
    action: 'Tally Prime 7.0 XML Export Generated',
    details: 'Exported 4 vouchers to Tally Prime XML structure with UDF tags',
    complianceCheckPassed: true
  }
];
