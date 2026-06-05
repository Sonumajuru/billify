"use client";
import React from "react";
import { GeneralReceiptData } from "../../types";
import { calcGeneralReceiptTotals } from "../../utils/calc";
import { fmtDate } from "../../utils/calc";
import { Lang, T, Tr } from "../../i18n";

interface Props {
  data: GeneralReceiptData;
  previewRef: React.RefObject<HTMLDivElement | null>;
  lang?: Lang;
}

const STATUS: Record<string, { bg: string; color: string }> = {
  Paid:    { bg: "#d1fae5", color: "#065f46" },
  Partial: { bg: "#fef3c7", color: "#92400e" },
  Pending: { bg: "#dbeafe", color: "#1e40af" },
  Overdue: { bg: "#fee2e2", color: "#991b1b" },
};

export default function ReceiptPreview({ data, previewRef, lang = "en" }: Props) {
  const tr = T[lang] as Tr;
  const totals = calcGeneralReceiptTotals(data);
  const sym = data.currencySymbol || "$";
  const fmt = (v: number) => `${sym}${v.toFixed(2)}`;
  const st = data.paymentStatus || "Paid";
  const statusBadge = STATUS[st] || STATUS.Paid;
  const tid = data.templateId;

  /* ─────────────────────── FRESH ─────────────────────────────── */
  if (tid === "fresh") {
    const bg = data.bgColor || "#ffffff";
    const ac = data.accentColor || "#3b82f6";
    const tx = data.textColor || "#111827";
    const muted = "#6b7280";
    const border = "#f3f4f6";

    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'DM Sans',sans-serif", borderRadius: 16, overflow: "hidden", position: "relative", border: "1px solid #e5e7eb" }}>
        {/* Top accent bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${ac}, ${ac}cc)` }} />

        <div style={{ padding: "36px 42px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              {data.logo
                ? <img src={data.logo} alt="" style={{ height: 48, objectFit: "contain", marginBottom: 12 }} />
                : data.sellerName && <div style={{ fontSize: 24, fontWeight: 900, color: ac, letterSpacing: -0.5, marginBottom: 8 }}>{data.sellerName.charAt(0)}</div>
              }
              <div style={{ fontSize: 18, fontWeight: 700, color: tx }}>{data.sellerName || data.sellerCompany || "—"}</div>
              {data.sellerCompany && data.sellerName && <div style={{ fontSize: 12, color: muted }}>{data.sellerCompany}</div>}
              {data.sellerAddress && <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.sellerAddress}</div>}
              {data.sellerPhone && <div style={{ fontSize: 12, color: muted }}>{data.sellerPhone}</div>}
              {data.sellerEmail && <div style={{ fontSize: 12, color: muted }}>{data.sellerEmail}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: ac, marginBottom: 6 }}>{tr.pDocReceipt}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: tx, fontFamily: "'DM Mono',monospace", letterSpacing: -1 }}>{data.receiptNumber || "RC-001"}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{fmtDate(data.issueDate)}</div>
              <div style={{ marginTop: 8, display: "inline-flex", padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color }}>{st}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#e5e7eb", marginBottom: 24 }} />

          {/* Buyer */}
          {data.buyerName && (
            <div style={{ marginBottom: 24, padding: "12px 16px", borderRadius: 10, background: "#f9fafb", border: "1px solid " + border }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 6 }}>{tr.pGrSoldTo}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: tx }}>{data.buyerName}</div>
              {data.buyerEmail && <div style={{ fontSize: 12, color: muted }}>{data.buyerEmail}</div>}
              {data.buyerPhone && <div style={{ fontSize: 12, color: muted }}>{data.buyerPhone}</div>}
              {data.buyerAddress && <div style={{ fontSize: 12, color: muted }}>{data.buyerAddress}</div>}
            </div>
          )}

          {/* Items table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${ac}` }}>
                <th style={{ textAlign: "left", padding: "6px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted }}>{tr.grItemDesc}</th>
                <th style={{ textAlign: "center", padding: "6px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, width: 48 }}>{tr.qty}</th>
                <th style={{ textAlign: "right", padding: "6px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, width: 80 }}>{tr.grPrice}</th>
                <th style={{ textAlign: "right", padding: "6px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted, width: 90 }}>{tr.pGrAmount}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.filter(i => i.description || parseFloat(i.rate) > 0).map((item, idx) => {
                const amount = (parseFloat(item.quantity)||0) * (parseFloat(item.rate)||0);
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid " + border }}>
                    <td style={{ padding: "10px 0", color: tx }}>{item.description || "—"}</td>
                    <td style={{ padding: "10px 0", textAlign: "center", color: muted }}>{item.quantity}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: muted, fontFamily: "'DM Mono',monospace" }}>{fmt(parseFloat(item.rate)||0)}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "'DM Mono',monospace", fontWeight: 600, color: tx }}>{fmt(amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <div style={{ minWidth: 200 }}>
              {totals.subtotal !== totals.afterDiscount && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, color: muted }}>
                    <span>{tr.pGrSubtotal}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace" }}>{fmt(totals.subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, color: "#dc2626" }}>
                    <span>Discount</span>
                    <span style={{ fontFamily: "'DM Mono',monospace" }}>−{fmt(totals.discount)}</span>
                  </div>
                </>
              )}
              {data.showTax && totals.tax > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, color: muted }}>
                  <span>{data.taxLabel || tr.pGrTax} ({data.taxRate}%)</span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }}>{fmt(totals.tax)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 6, borderTop: `2px solid ${tx}` }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: tx }}>{tr.pGrTotal}</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: ac, fontFamily: "'DM Mono',monospace" }}>{fmt(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div style={{ marginTop: 20, display: "flex", gap: 20, fontSize: 12, color: muted }}>
            {data.paymentMethod && <span><strong style={{ color: tx }}>{tr.pPaidVia}</strong> {data.paymentMethod}</span>}
            {data.paymentDate && <span><strong style={{ color: tx }}>{tr.pOn}</strong> {fmtDate(data.paymentDate)}</span>}
          </div>

          {data.notes && <div style={{ marginTop: 20, padding: "12px 16px", borderLeft: `3px solid ${ac}`, background: `${ac}0a`, borderRadius: "0 8px 8px 0", fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div>}

          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 32 }}>
              {[tr.pGrSeller, tr.grBuyerSection].map(s => (
                <div key={s}><div style={{ height: 1, background: "#e5e7eb", marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted }}>{s} {tr.pSignatureSuffix}</div></div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid " + border, textAlign: "center", fontSize: 11, color: muted }}>
            {data.footer || tr.pGrThankYou}
          </div>
        </div>

        {data.showWatermark && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.05, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>
        )}
      </div>
    );
  }

  /* ─────────────────────── DARK ──────────────────────────────── */
  if (tid === "dark") {
    const bg = data.bgColor || "#0f172a";
    const ac = data.accentColor || "#f59e0b";
    const tx = data.textColor || "#f1f5f9";
    const border = "rgba(255,255,255,0.08)";
    const muted = "rgba(241,245,249,0.45)";
    const cardBg = "rgba(255,255,255,0.04)";

    return (
      <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'DM Sans',sans-serif", borderRadius: 16, overflow: "hidden", position: "relative" }}>
        {/* Header block */}
        <div style={{ background: "rgba(0,0,0,0.3)", padding: "28px 36px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `1px solid ${border}` }}>
          <div>
            {data.logo
              ? <img src={data.logo} alt="" style={{ height: 44, objectFit: "contain", marginBottom: 10, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
              : null
            }
            <div style={{ fontSize: 18, fontWeight: 700, color: tx }}>{data.sellerName || data.sellerCompany || "—"}</div>
            {data.sellerCompany && data.sellerName && <div style={{ fontSize: 12, color: muted }}>{data.sellerCompany}</div>}
            {data.sellerAddress && <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.sellerAddress}</div>}
            {data.sellerEmail && <div style={{ fontSize: 12, color: muted }}>{data.sellerEmail}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: ac, marginBottom: 4 }}>{tr.pDocReceipt}</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "'DM Mono',monospace", color: tx }}>{data.receiptNumber || "RC-001"}</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{fmtDate(data.issueDate)}</div>
            <div style={{ marginTop: 8, display: "inline-flex", padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color }}>{st}</div>
          </div>
        </div>

        {/* Accent line */}
        <div style={{ height: 2, background: ac }} />

        <div style={{ padding: "28px 36px 32px" }}>
          {/* Seller / Buyer grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: ac, marginBottom: 8 }}>{tr.pFrom}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: tx }}>{data.sellerName || data.sellerCompany || "—"}</div>
              {data.sellerPhone && <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{data.sellerPhone}</div>}
            </div>
            {data.buyerName ? (
              <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: ac, marginBottom: 8 }}>{tr.pGrSoldTo}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: tx }}>{data.buyerName}</div>
                {data.buyerEmail && <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{data.buyerEmail}</div>}
                {data.buyerPhone && <div style={{ fontSize: 11, color: muted }}>{data.buyerPhone}</div>}
              </div>
            ) : (
              <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: ac, marginBottom: 8 }}>{tr.pGrPayment}</div>
                {data.paymentMethod && <div style={{ fontWeight: 600, fontSize: 13, color: tx }}>{data.paymentMethod}</div>}
                {data.paymentDate && <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{fmtDate(data.paymentDate)}</div>}
              </div>
            )}
          </div>

          {/* Items */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, padding: "0 0 8px", borderBottom: `1px solid ${border}`, gap: 8 }}>
              <span>{tr.grItemDesc}</span>
              <span style={{ textAlign: "center" }}>{tr.qty}</span>
              <span style={{ textAlign: "right" }}>{tr.pGrAmount}</span>
            </div>
            {data.items.filter(i => i.description || parseFloat(i.rate) > 0).map(item => {
              const amount = (parseFloat(item.quantity)||0) * (parseFloat(item.rate)||0);
              return (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px", padding: "10px 0", borderBottom: `1px solid ${border}`, fontSize: 13, gap: 8, alignItems: "center" }}>
                  <span style={{ color: tx }}>{item.description || "—"}</span>
                  <span style={{ textAlign: "center", color: muted }}>{item.quantity}</span>
                  <span style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", color: tx, fontWeight: 600 }}>{fmt(amount)}</span>
                </div>
              );
            })}
          </div>

          {/* Totals + summary */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16 }}>
            <div style={{ fontSize: 12, color: muted }}>
              {data.paymentMethod && data.buyerName && <div><strong style={{ color: muted }}>{tr.pPaidVia}</strong> {data.paymentMethod}</div>}
              {data.paymentDate && data.buyerName && <div><strong style={{ color: muted }}>{tr.pOn}</strong> {fmtDate(data.paymentDate)}</div>}
            </div>
            <div style={{ padding: "16px 20px", borderRadius: 12, background: `${ac}18`, border: `1px solid ${ac}30`, textAlign: "right" }}>
              {totals.discount > 0 && (
                <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>
                  <span>Discount: </span>
                  <span style={{ fontFamily: "'DM Mono',monospace", color: "#f87171" }}>−{fmt(totals.discount)}</span>
                </div>
              )}
              {data.showTax && totals.tax > 0 && (
                <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>
                  <span>{data.taxLabel || "Tax"}: </span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }}>{fmt(totals.tax)}</span>
                </div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: ac, marginBottom: 4 }}>{tr.pGrTotal}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: ac, fontFamily: "'DM Mono',monospace" }}>{fmt(totals.total)}</div>
            </div>
          </div>

          {data.notes && <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 10, border: `1px solid ${border}`, fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div>}

          {data.showSignature && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 28 }}>
              {[tr.pGrSeller, tr.grBuyerSection].map(s => (
                <div key={s}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted }}>{s} {tr.pSignatureSuffix}</div></div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 10, color: muted, textAlign: "center" }}>
            {data.footer || tr.pGrThankYou}
          </div>
        </div>

        {data.showWatermark && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.05, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>
        )}
      </div>
    );
  }

  /* ─────────────────────── WARM (default) ──────────────────────── */
  const bg = data.bgColor || "#fdf9f0";
  const ac = data.accentColor || "#c2410c";
  const tx = data.textColor || "#292524";
  const muted = "#78716c";
  const border = "#e7e5e4";

  return (
    <div ref={previewRef} style={{ background: bg, color: tx, fontFamily: "'DM Sans',sans-serif", borderRadius: 16, overflow: "hidden", position: "relative" }}>
      {/* Top warm bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${ac}, #ea580c)` }} />

      <div style={{ padding: "36px 42px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            {data.logo
              ? <img src={data.logo} alt="" style={{ height: 52, objectFit: "contain", marginBottom: 10 }} />
              : (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: ac, letterSpacing: -0.5 }}>{data.sellerName || data.sellerCompany || ""}</div>
                </div>
              )
            }
            {data.logo && <div style={{ fontSize: 18, fontWeight: 700, color: tx }}>{data.sellerName || data.sellerCompany || "—"}</div>}
            {data.sellerCompany && data.sellerName && <div style={{ fontSize: 12, color: muted }}>{data.sellerCompany}</div>}
            {data.sellerAddress && <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{data.sellerAddress}</div>}
            {data.sellerPhone && <div style={{ fontSize: 12, color: muted }}>{data.sellerPhone}</div>}
            {data.sellerEmail && <div style={{ fontSize: 12, color: muted }}>{data.sellerEmail}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: ac, fontFamily: "'Fraunces',serif", letterSpacing: -0.5 }}>{tr.pDocReceipt.charAt(0).toUpperCase() + tr.pDocReceipt.slice(1).toLowerCase()}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: muted, marginTop: 2 }}>{data.receiptNumber || "RC-001"}</div>
            <div style={{ fontSize: 12, color: muted }}>{fmtDate(data.issueDate)}</div>
            <div style={{ marginTop: 8, display: "inline-flex", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusBadge.bg, color: statusBadge.color }}>{st}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: border, marginBottom: 20 }} />

        {/* Buyer */}
        {data.buyerName && (
          <div style={{ marginBottom: 20, display: "flex", gap: 32 }}>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: `${ac}0a`, border: `1px solid ${ac}20`, flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 6 }}>{tr.pGrSoldTo}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: tx }}>{data.buyerName}</div>
              {data.buyerEmail && <div style={{ fontSize: 12, color: muted }}>{data.buyerEmail}</div>}
              {data.buyerPhone && <div style={{ fontSize: 12, color: muted }}>{data.buyerPhone}</div>}
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: `${ac}0a`, border: `1px solid ${ac}20`, flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: ac, marginBottom: 6 }}>{tr.pGrPayment}</div>
              {data.paymentMethod && <div style={{ fontWeight: 700, fontSize: 14, color: tx }}>{data.paymentMethod}</div>}
              {data.paymentDate && <div style={{ fontSize: 12, color: muted }}>{fmtDate(data.paymentDate)}</div>}
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 90px", gap: 8, padding: "6px 0", borderBottom: `2px solid ${ac}20`, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: muted }}>
            <span>{tr.grItemDesc}</span>
            <span style={{ textAlign: "center" }}>{tr.qty}</span>
            <span style={{ textAlign: "right" }}>{tr.grPrice}</span>
            <span style={{ textAlign: "right" }}>{tr.pGrTotal}</span>
          </div>
          {data.items.filter(i => i.description || parseFloat(i.rate) > 0).map(item => {
            const amount = (parseFloat(item.quantity)||0) * (parseFloat(item.rate)||0);
            return (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 90px", gap: 8, padding: "9px 0", borderBottom: `1px solid ${border}`, fontSize: 13, alignItems: "center" }}>
                <span style={{ color: tx }}>{item.description || "—"}</span>
                <span style={{ textAlign: "center", color: muted }}>{item.quantity}</span>
                <span style={{ textAlign: "right", color: muted, fontFamily: "'DM Mono',monospace" }}>{fmt(parseFloat(item.rate)||0)}</span>
                <span style={{ textAlign: "right", fontFamily: "'DM Mono',monospace", fontWeight: 600, color: tx }}>{fmt(amount)}</span>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <div style={{ minWidth: 200 }}>
            {totals.subtotal !== totals.afterDiscount && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: muted }}>
                  <span>{tr.pGrSubtotal}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }}>{fmt(totals.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: "#dc2626" }}>
                  <span>Discount</span>
                  <span style={{ fontFamily: "'DM Mono',monospace" }}>−{fmt(totals.discount)}</span>
                </div>
              </>
            )}
            {data.showTax && totals.tax > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: muted }}>
                <span>{data.taxLabel || "Tax"} ({data.taxRate}%)</span>
                <span style={{ fontFamily: "'DM Mono',monospace" }}>{fmt(totals.tax)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", marginTop: 8, borderRadius: 10, background: ac, color: "#fff" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{tr.pGrTotal}</span>
              <span style={{ fontSize: 26, fontWeight: 900, fontFamily: "'DM Mono',monospace" }}>{fmt(totals.total)}</span>
            </div>
          </div>
        </div>

        {!data.buyerName && (
          <div style={{ marginTop: 16, fontSize: 12, color: muted }}>
            {data.paymentMethod && <span><strong style={{ color: tx }}>{tr.pPaidVia}</strong> {data.paymentMethod}  </span>}
            {data.paymentDate && <span><strong style={{ color: tx }}>{tr.pOn}</strong> {fmtDate(data.paymentDate)}</span>}
          </div>
        )}

        {data.notes && <div style={{ marginTop: 20, padding: "12px 16px", borderLeft: `3px solid ${ac}`, background: `${ac}08`, borderRadius: "0 8px 8px 0", fontSize: 12, color: muted, lineHeight: 1.7 }}>{data.notes}</div>}

        {data.showSignature && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 28 }}>
            {["Seller", "Customer"].map(s => (
              <div key={s}><div style={{ height: 1, background: border, marginBottom: 6 }} /><div style={{ fontSize: 10, color: muted }}>{s} {tr.pSignatureSuffix}</div></div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${border}`, textAlign: "center", fontSize: 11, color: muted, fontStyle: "italic" }}>
          {data.footer || tr.pGrThankYou}
        </div>
      </div>

      {data.showWatermark && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-35deg)", fontSize: 80, fontWeight: 900, color: ac, opacity: 0.05, letterSpacing: "0.1em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{data.watermarkText}</div>
      )}
    </div>
  );
}
