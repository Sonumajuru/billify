// ─── SHARED ───────────────────────────────────────────────────────
export type AppMode = "invoice" | "tenancy";

// ─── SAVED DOCUMENTS ──────────────────────────────────────────────
export interface SavedDoc {
  id: string;
  mode: AppMode;
  name: string;          // user-given name e.g. "Invoice #2024-003 — ACME"
  savedAt: string;       // ISO timestamp
  data: ITReceiptData | TenancyData;
}

// ─── SAVED TEMPLATES ──────────────────────────────────────────────
export interface SavedTemplate {
  id: string;
  mode: AppMode;
  name: string;
  createdAt: string;
  // Only design + provider/landlord identity fields — NOT client/project-specific
  template: Partial<ITReceiptData> | Partial<TenancyData>;
}

// ─── IT INVOICE TYPES ─────────────────────────────────────────────
export type DocType    = "invoice" | "quote" | "proforma" | "credit_note" | "receipt";
export type DocStatus  = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled" | "In Progress";
export type ITTemplateId = "terminal" | "clean" | "neon" | "blueprint" | "minimal" | "agency";
export type RateType   = "fixed" | "per_hour" | "per_day" | "milestone" | "per_month";
export type VatRate    = 21 | 9 | 0;
export type VatScheme  = "standard" | "reverse_charge" | "exempt" | "eu_vat";

export interface LineItem {
  id: string;
  description: string;
  category: string;
  quantity: string;
  unit: string;
  rate: string;
  rateType: RateType;
  vatRate: VatRate;
}

export interface ITReceiptData {
  logo: string;
  providerName: string; providerTitle: string; providerCompany: string;
  providerAddress: string; providerPostcode: string; providerCity: string;
  providerPhone: string; providerEmail: string; providerWebsite: string;
  kvkNumber: string; btwNumber: string; iban: string; bic: string; bankName: string;
  docType: DocType; docNumber: string; issueDate: string; dueDate: string;
  docStatus: DocStatus; currencySymbol: string; poNumber: string; referenceNumber: string;
  vatScheme: VatScheme;
  clientName: string; clientCompany: string; clientEmail: string; clientPhone: string;
  clientAddress: string; clientPostcode: string; clientCity: string;
  clientKvk: string; clientBtw: string; clientCountry: string;
  projectName: string; projectDescription: string; techStack: string;
  periodFrom: string; periodTo: string;
  items: LineItem[];
  discount: string; discountType: "percent" | "fixed";
  paymentTermDays: string; paymentMethod: string; paymentNotes: string;
  notes: string; terms: string; footer: string;
  showSignature: boolean; showWatermark: boolean; watermarkText: string;
  templateId: ITTemplateId; accentColor: string; bgColor: string; textColor: string;
}

// ─── TENANCY RECEIPT TYPES ────────────────────────────────────────
export type TenancyTemplateId = "executive" | "minimal" | "urban" | "official" | "boutique" | "simple";
export type PaymentStatus = "Paid" | "Partial" | "Pending" | "Overdue";

export interface TenancyData {
  logo: string;
  landlordName: string; landlordCompany: string; landlordAddress: string;
  landlordPhone: string; landlordEmail: string;
  receiptNumber: string; issueDate: string; paymentDate: string;
  paymentStatus: PaymentStatus; paymentMethod: string; currencySymbol: string;
  tenantName: string; tenantEmail: string; tenantPhone: string;
  propertyAddress: string; propertyUnit: string; propertyType: string;
  periodFrom: string; periodTo: string;
  rentAmount: string; lateFee: string; parkingFee: string;
  utilitiesAmount: string; utilitiesLabel: string;
  maintenanceFee: string; maintenanceLabel: string;
  depositAmount: string; otherFee: string; otherLabel: string; discount: string;
  notes: string; terms: string; footer: string;
  showSignature: boolean; showWatermark: boolean; watermarkText: string;
  templateId: TenancyTemplateId; accentColor: string; bgColor: string; textColor: string;
}
