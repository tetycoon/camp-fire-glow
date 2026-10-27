import React from "react";
import { calculateGstBreakdown, calculateInclusiveGstBreakdown } from "../../lib/gstUtils";

interface GstPriceBreakdownProps {
  baseAmount: number;
  inclusive?: boolean;
  claimGst?: boolean;
  onClaimGstChange?: (claimed: boolean) => void;
  gstin?: string;
  onGstinChange?: (gstin: string) => void;
  companyName?: string;
  onCompanyNameChange?: (companyName: string) => void;
  theme?: "dark" | "light";
  label?: string;
}

export const GstPriceBreakdown: React.FC<GstPriceBreakdownProps> = ({
  baseAmount,
  inclusive = false,
  theme = "light",
  label = "Session Fee",
}) => {
  const breakdown = inclusive
    ? calculateInclusiveGstBreakdown(baseAmount)
    : calculateGstBreakdown(baseAmount);
  const { baseAmount: displayBase, gstAmount, totalAmount } = breakdown;
  const isDark = theme === "dark";

  return (
    <div className="space-y-2.5 text-left">
      {/* Price + 18% GST Breakdown Box */}
      <div
        className={`rounded-xl p-3 border text-xs space-y-1.5 ${
          isDark
            ? "bg-emerald-500/5 border-emerald-500/20 text-white/90"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={isDark ? "text-white/60" : "text-slate-500"}>{label} (Base):</span>
          <span className="font-mono font-semibold">
            ₹{inclusive ? displayBase.toFixed(2) : displayBase.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={isDark ? "text-white/60" : "text-slate-500"}>
            {inclusive ? "GST (18% Included):" : "GST (18%):"}
          </span>
          <span className="font-mono font-semibold">
            {inclusive ? `₹${gstAmount.toFixed(2)}` : `+ ₹${gstAmount.toLocaleString("en-IN")}`}
          </span>
        </div>
        <div
          className={`flex items-center justify-between pt-1.5 border-t font-bold text-sm ${
            isDark ? "border-white/10 text-emerald-400" : "border-slate-200 text-slate-900"
          }`}
        >
          <span>Total Payable (Incl. GST):</span>
          <span className="font-mono text-base font-black">
            ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GstPriceBreakdown;
