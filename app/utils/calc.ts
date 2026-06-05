import { ITReceiptData, TenancyData, GeneralReceiptData, LineItem, VatRate } from "../types";

// ── IT INVOICE CALC ──────────────────────────────────────────────
export const lineExcl = (item: LineItem): number =>
  (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
export const lineVat  = (item: LineItem): number => lineExcl(item) * (item.vatRate / 100);

export type VatGroup = { rate: VatRate; base: number; vat: number };

export const calcVatGroups = (items: LineItem[]): VatGroup[] => {
  const map = new Map<VatRate, VatGroup>();
  for (const item of items) {
    if (!map.has(item.vatRate)) map.set(item.vatRate, { rate: item.vatRate, base: 0, vat: 0 });
    const g = map.get(item.vatRate)!;
    g.base += lineExcl(item); g.vat += lineVat(item);
  }
  return Array.from(map.values()).sort((a, b) => b.rate - a.rate);
};

export const calcITTotals = (data: ITReceiptData) => {
  const subtotalExcl  = data.items.reduce((s, i) => s + lineExcl(i), 0);
  const discountAmt   = data.discountType === "percent"
    ? subtotalExcl * ((parseFloat(data.discount) || 0) / 100)
    : (parseFloat(data.discount) || 0);
  const afterDiscount = subtotalExcl - discountAmt;
  const vatGroups     = (data.vatScheme === "standard" || data.vatScheme === "eu_vat")
    ? calcVatGroups(data.items) : [];
  const totalVat      = vatGroups.reduce((s, g) => s + g.vat, 0);
  return { subtotalExcl, discount: discountAmt, afterDiscount, vatGroups, totalVat, totalIncl: afterDiscount + totalVat };
};

// ── GENERAL RECEIPT CALC ──────────────────────────────────────────
export const calcGeneralReceiptTotals = (d: GeneralReceiptData) => {
  const subtotal = d.items.reduce((s, i) => s + (parseFloat(i.quantity)||0) * (parseFloat(i.rate)||0), 0);
  const discountAmt = d.discountType === "percent"
    ? subtotal * ((parseFloat(d.discount)||0) / 100)
    : (parseFloat(d.discount)||0);
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = d.showTax ? afterDiscount * ((parseFloat(d.taxRate)||0) / 100) : 0;
  return { subtotal, discount: discountAmt, afterDiscount, tax: taxAmt, total: afterDiscount + taxAmt };
};

// ── TENANCY CALC ─────────────────────────────────────────────────
export const calcTenancyTotal = (d: TenancyData): number =>
  [d.rentAmount, d.lateFee, d.parkingFee, d.utilitiesAmount, d.maintenanceFee, d.depositAmount, d.otherFee]
    .reduce((s, v) => s + (parseFloat(v) || 0), 0) - (parseFloat(d.discount) || 0);

// ── FORMATTING ────────────────────────────────────────────────────
export const fmtDate = (d: string, locale = "en-GB") =>
  d ? new Date(d + "T12:00:00").toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }) : "—";

export const fmtDateShort = (d: string) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }) : "—";

export const fmtMoney = (n: number, sym = "€") => `${sym}${n.toFixed(2)}`;

export const calcDueDate = (issueDate: string, termDays: string): string => {
  if (!issueDate) return "";
  const d = new Date(issueDate + "T12:00:00");
  d.setDate(d.getDate() + (parseInt(termDays) || 30));
  return d.toISOString().split("T")[0];
};
