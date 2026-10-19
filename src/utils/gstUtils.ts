import { Voucher, LineItem, LedgerAccount } from '../types';

export const INDIAN_STATES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh'
};

export interface HsnSacItem {
  code: string;
  description: string;
  type: 'HSN' | 'SAC';
  defaultRate: number;
}

export const COMMON_HSN_SAC: HsnSacItem[] = [
  { code: '998311', description: 'Auditing and Accounting Services', type: 'SAC', defaultRate: 18 },
  { code: '998313', description: 'IT Infrastructure & Software Development', type: 'SAC', defaultRate: 18 },
  { code: '998312', description: 'Tax Advisory & Legal Compliance Services', type: 'SAC', defaultRate: 18 },
  { code: '84713010', description: 'Portable Computers / Laptops', type: 'HSN', defaultRate: 18 },
  { code: '85171300', description: 'Smartphones & Mobile Handsets', type: 'HSN', defaultRate: 18 },
  { code: '996331', description: 'Restaurant & Catering Services', type: 'SAC', defaultRate: 5 },
  { code: '997212', description: 'Commercial Property Rental Services', type: 'SAC', defaultRate: 18 },
  { code: '30049099', description: 'Medicaments & Pharmaceuticals', type: 'HSN', defaultRate: 12 },
  { code: '996511', description: 'Goods Transport Agency (GTA) Services', type: 'SAC', defaultRate: 5 },
  { code: '87032391', description: 'Motor Vehicles / Cars', type: 'HSN', defaultRate: 28 },
  { code: '998319', description: 'Other Professional & Technical Services', type: 'SAC', defaultRate: 18 }
];

export function validateGSTIN(gstin: string): { isValid: boolean; stateCode: string; stateName: string; pan: string; error?: string } {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const cleanGstin = gstin.trim().toUpperCase();

  if (!cleanGstin) {
    return { isValid: false, stateCode: '', stateName: '', pan: '', error: 'GSTIN is empty' };
  }

  if (cleanGstin.length !== 15) {
    return { isValid: false, stateCode: '', stateName: '', pan: '', error: 'GSTIN must be exactly 15 characters' };
  }

  const isValid = gstinRegex.test(cleanGstin);
  const stateCode = cleanGstin.substring(0, 2);
  const stateName = INDIAN_STATES[stateCode] || 'Unknown State';
  const pan = cleanGstin.substring(2, 12);

  if (!INDIAN_STATES[stateCode]) {
    return { isValid: false, stateCode, stateName, pan, error: `Invalid state code '${stateCode}' in GSTIN` };
  }

  return {
    isValid,
    stateCode,
    stateName,
    pan,
    error: isValid ? undefined : 'Format invalid. Expected e.g. 27AABCU9603R1ZM'
  };
}

export function calculateLineGst(
  taxableValue: number,
  gstRate: number,
  supplierStateCode: string,
  posStateCode: string,
  cessRate: number = 0
): {
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  cessRate: number;
  cessAmount: number;
  isInterState: boolean;
  totalAmount: number;
} {
  const isInterState = supplierStateCode !== posStateCode;
  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstRate = gstRate;
    igstAmount = (taxableValue * igstRate) / 100;
  } else {
    cgstRate = gstRate / 2;
    cgstAmount = (taxableValue * cgstRate) / 100;
    sgstRate = gstRate / 2;
    sgstAmount = (taxableValue * sgstRate) / 100;
  }

  const cessAmount = (taxableValue * cessRate) / 100;
  const totalAmount = taxableValue + cgstAmount + sgstAmount + igstAmount + cessAmount;

  return {
    cgstRate,
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstRate,
    sgstAmount: Number(sgstAmount.toFixed(2)),
    igstRate,
    igstAmount: Number(igstAmount.toFixed(2)),
    cessRate,
    cessAmount: Number(cessAmount.toFixed(2)),
    isInterState,
    totalAmount: Number(totalAmount.toFixed(2))
  };
}

export function generateIRN(gstin: string, voucherNo: string, date: string): string {
  const str = `${gstin}-${voucherNo}-${date}-NIC-E-INVOICE`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hexPart = Math.abs(hash).toString(16).padStart(8, '0');
  const dummy64 = `${hexPart}e8f231b490ac78120d5e112439810a9f1c7d2e4b3a19e88d120a11f592d${hexPart.substring(0, 4)}`;
  return dummy64.substring(0, 64);
}

/**
 * Builds Tally Prime 7.0 Compliant XML for Vouchers
 */
export function generateTallyPrime7Xml(vouchers: Voucher[], companyName: string): string {
  const tallyDate = (dateStr: string) => dateStr.replace(/-/g, ''); // YYYYMMDD

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<TALLYMESSAGE xmlns:UDF="TallyUDF">\n`;
  xml += `  <HEADER>\n`;
  xml += `    <TALLYREQUEST>Import Data</TALLYREQUEST>\n`;
  xml += `    <TYPE>Vouchers</TYPE>\n`;
  xml += `    <COMPANY>${escapeXml(companyName)}</COMPANY>\n`;
  xml += `    <TALLYPRIMEVERSION>7.0</TALLYPRIMEVERSION>\n`;
  xml += `  </HEADER>\n`;
  xml += `  <BODY>\n`;
  xml += `    <IMPORTDATA>\n`;
  xml += `      <REQUESTDESC>\n`;
  xml += `        <REPORTNAME>Vouchers</REPORTNAME>\n`;
  xml += `      </REQUESTDESC>\n`;
  xml += `      <REQUESTDATA>\n`;

  vouchers.forEach((v) => {
    const formattedDate = tallyDate(v.date);
    const tallyVoucherTypeName = getTallyVoucherTypeName(v.voucherType);

    xml += `        <VOUCHER REMOTEID="${v.id}" VOUCHERTYPENAME="${escapeXml(tallyVoucherTypeName)}" ACTION="Create">\n`;
    xml += `          <DATE>${formattedDate}</DATE>\n`;
    xml += `          <VOUCHERTYPENAME>${escapeXml(tallyVoucherTypeName)}</VOUCHERTYPENAME>\n`;
    xml += `          <VOUCHERNUMBER>${escapeXml(v.voucherNumber)}</VOUCHERNUMBER>\n`;
    xml += `          <PARTYLEDGERNAME>${escapeXml(v.partyName)}</PARTYLEDGERNAME>\n`;
    xml += `          <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>\n`;
    xml += `          <PLACEOFSUPPLY>${escapeXml(v.placeOfSupply)}</PLACEOFSUPPLY>\n`;
    xml += `          <PARTYGSTIN>${escapeXml(v.partyGstin)}</PARTYGSTIN>\n`;
    xml += `          <GSTREGISTRATIONTYPE>Registered</GSTREGISTRATIONTYPE>\n`;
    if (v.eInvoiceIrn) {
      xml += `          <IRNNUMBER>${v.eInvoiceIrn}</IRNNUMBER>\n`;
    }

    // Party Ledger Entry (Debit for Sales/DebitNote, Credit for Purchase/CreditNote)
    const isDebitParty = v.voucherType === 'Sales' || v.voucherType === 'Debit Note' || v.voucherType === 'Payment';
    xml += `          <ALLLEDGERENTRIES.LIST>\n`;
    xml += `            <LEDGERNAME>${escapeXml(v.partyName)}</LEDGERNAME>\n`;
    xml += `            <ISDEEMEDPOSITIVE>${isDebitParty ? 'YES' : 'NO'}</ISDEEMEDPOSITIVE>\n`;
    xml += `            <AMOUNT>${isDebitParty ? -v.grandTotal : v.grandTotal}</AMOUNT>\n`;
    xml += `          </ALLLEDGERENTRIES.LIST>\n`;

    // Sales/Purchase Ledger Entries
    const mainLedger = v.voucherType === 'Sales' || v.voucherType === 'Credit Note' ? 'Sales Account' : 'Purchase Account';
    xml += `          <ALLLEDGERENTRIES.LIST>\n`;
    xml += `            <LEDGERNAME>${mainLedger}</LEDGERNAME>\n`;
    xml += `            <ISDEEMEDPOSITIVE>${isDebitParty ? 'NO' : 'YES'}</ISDEEMEDPOSITIVE>\n`;
    xml += `            <AMOUNT>${isDebitParty ? v.subtotal : -v.subtotal}</AMOUNT>\n`;
    xml += `          </ALLLEDGERENTRIES.LIST>\n`;

    // Tax Ledger Entries
    if (v.isInterState) {
      if (v.igstTotal > 0) {
        xml += `          <ALLLEDGERENTRIES.LIST>\n`;
        xml += `            <LEDGERNAME>IGST</LEDGERNAME>\n`;
        xml += `            <ISDEEMEDPOSITIVE>${isDebitParty ? 'NO' : 'YES'}</ISDEEMEDPOSITIVE>\n`;
        xml += `            <AMOUNT>${isDebitParty ? v.igstTotal : -v.igstTotal}</AMOUNT>\n`;
        xml += `          </ALLLEDGERENTRIES.LIST>\n`;
      }
    } else {
      if (v.cgstTotal > 0) {
        xml += `          <ALLLEDGERENTRIES.LIST>\n`;
        xml += `            <LEDGERNAME>CGST</LEDGERNAME>\n`;
        xml += `            <ISDEEMEDPOSITIVE>${isDebitParty ? 'NO' : 'YES'}</ISDEEMEDPOSITIVE>\n`;
        xml += `            <AMOUNT>${isDebitParty ? v.cgstTotal : -v.cgstTotal}</AMOUNT>\n`;
        xml += `          </ALLLEDGERENTRIES.LIST>\n`;
      }
      if (v.sgstTotal > 0) {
        xml += `          <ALLLEDGERENTRIES.LIST>\n`;
        xml += `            <LEDGERNAME>SGST</LEDGERNAME>\n`;
        xml += `            <ISDEEMEDPOSITIVE>${isDebitParty ? 'NO' : 'YES'}</ISDEEMEDPOSITIVE>\n`;
        xml += `            <AMOUNT>${isDebitParty ? v.sgstTotal : -v.sgstTotal}</AMOUNT>\n`;
        xml += `          </ALLLEDGERENTRIES.LIST>\n`;
      }
    }

    if (v.narration) {
      xml += `          <NARRATION>${escapeXml(v.narration)}</NARRATION>\n`;
    }

    xml += `        </VOUCHER>\n`;
  });

  xml += `      </REQUESTDATA>\n`;
  xml += `    </IMPORTDATA>\n`;
  xml += `  </BODY>\n`;
  xml += `</TALLYMESSAGE>`;

  return xml;
}

function getTallyVoucherTypeName(vt: string): string {
  switch (vt) {
    case 'Sales': return 'Sales';
    case 'Purchase': return 'Purchase';
    case 'Credit Note': return 'Credit Note';
    case 'Debit Note': return 'Debit Note';
    case 'Payment': return 'Payment';
    case 'Receipt': return 'Receipt';
    case 'Contra': return 'Contra';
    default: return 'Journal';
  }
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
