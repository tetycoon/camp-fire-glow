import React, { useState } from "react";
import {
  calculateGstBreakdown,
  calculateInclusiveGstBreakdown,
  isValidGstin,
  INDIAN_GST_STATE_CODES,
  GSTIN_REGEX
} from "../../lib/gstUtils";
import { Building2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export interface GstPriceBreakdownProps {
  baseAmount: number;
  inclusive?: boolean;
  claimGst?: boolean;
  onClaimGstChange?: (claimed: boolean) => void;
  gstin?: string;
  onGstinChange?: (gstin: string) => void;
  companyName?: string;
  onCompanyNameChange?: (companyName: string) => void;
  gstError?: string;
  theme?: "dark" | "light";
  label?: string;
  showCompanyGst?: boolean;
}

export const GstPriceBreakdown: React.FC<GstPriceBreakdownProps> = ({
  baseAmount,
  inclusive = false,
  claimGst,
  onClaimGstChange,
  gstin = "",
  onGstinChange,
  companyName = "",
  onCompanyNameChange,
  gstError,
  theme = "light",
  label = "Session Fee",
  showCompanyGst = true,
}) => {
  const [internalClaim, setInternalClaim] = useState(false);
  const [internalGstin, setInternalGstin] = useState("");
  const [internalCompany, setInternalCompany] = useState("");

  const isClaiming = claimGst !== undefined ? claimGst : internalClaim;
  const currentGstin = gstin !== undefined ? gstin : internalGstin;
  const currentCompany = companyName !== undefined ? companyName : internalCompany;

  const breakdown = inclusive
    ? calculateInclusiveGstBreakdown(baseAmount)
    : calculateGstBreakdown(baseAmount);
  const { baseAmount: displayBase, gstAmount, totalAmount } = breakdown;
  const isDark = theme === "dark";

  const handleToggleClaim = (checked: boolean) => {
    if (onClaimGstChange) onClaimGstChange(checked);
    setInternalClaim(checked);
  };

  const handleGstInputChange = (val: string) => {
    const cleanUpper = val.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
    if (onGstinChange) onGstinChange(cleanUpper);
    setInternalGstin(cleanUpper);
  };

  const handleCompanyInputChange = (val: string) => {
    if (onCompanyNameChange) onCompanyNameChange(val);
    setInternalCompany(val);
  };

  const stateCode = currentGstin.length >= 2 ? currentGstin.substring(0, 2) : "";
  const detectedState = stateCode ? INDIAN_GST_STATE_CODES[stateCode] : null;
  const isGstinFormatValid = GSTIN_REGEX.test(currentGstin);

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

      {/* Optional Client GST Number Input Card */}
      {showCompanyGst && (
      <div
        className={`rounded-xl border transition-all text-xs overflow-hidden ${
          isDark
            ? "bg-slate-900/60 border-slate-700/80 text-white"
            : "bg-slate-50/80 border-slate-200 text-slate-800"
        }`}
      >
        <label
          className={`flex items-center justify-between p-2.5 cursor-pointer select-none transition-colors ${
            isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100/70"
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isClaiming}
              onChange={(e) => handleToggleClaim(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
            />
            <span className="font-bold text-[11px] flex items-center gap-1.5">
              <Building2 className={`w-3.5 h-3.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              <span>Add Company GST Number</span>
              <span className={`text-[9.5px] font-normal px-1.5 py-0.2 rounded ${
                isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200/80 text-slate-600"
              }`}>
                Optional • For ITC
              </span>
            </span>
          </div>
          <span className={isDark ? "text-slate-400" : "text-slate-500"}>
            {isClaiming ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </label>

        {isClaiming && (
          <div
            className={`p-3 border-t space-y-2.5 transition-all ${
              isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200/80 bg-white"
            }`}
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
                GSTIN (Client GST Number)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentGstin}
                  onChange={(e) => handleGstInputChange(e.target.value)}
                  placeholder="e.g. 33AAAAA0000A1Z5 (15 Digits)"
                  maxLength={15}
                  className={`w-full font-mono uppercase tracking-wider text-xs px-2.5 py-2 rounded-lg border outline-none transition-all ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600"
                  } ${
                    currentGstin && isGstinFormatValid
                      ? "border-emerald-500 focus:border-emerald-500"
                      : currentGstin && currentGstin.length === 15
                      ? "border-rose-500 focus:border-rose-500"
                      : ""
                  }`}
                />
                {currentGstin && isGstinFormatValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Validation helper feedback */}
              {currentGstin && isGstinFormatValid && (
                <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <span>✓ Verified GSTIN Format</span>
                  {detectedState && <span>• State: {detectedState}</span>}
                </p>
              )}
              {currentGstin && currentGstin.length > 0 && currentGstin.length < 15 && (
                <p className={`text-[10px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Enter {15 - currentGstin.length} more character{15 - currentGstin.length > 1 ? "s" : ""}
                </p>
              )}
              {currentGstin && currentGstin.length === 15 && !isGstinFormatValid && (
                <p className="text-[10px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Invalid format. Must be 15 alphanumeric characters (e.g. 33AAAAA0000A1Z5)</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
                Registered Business / Legal Entity Name
              </label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => handleCompanyInputChange(e.target.value)}
                placeholder="e.g. Acme Technologies Pvt Ltd"
                className={`w-full text-xs px-2.5 py-2 rounded-lg border outline-none transition-all ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600"
                }`}
              />
            </div>

            {gstError && (
              <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {gstError}
              </p>
            )}

            <p className={`text-[9.5px] leading-tight ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              ℹ️ Your GST Tax Invoice will be issued with this GSTIN, enabling your business to claim Input Tax Credit (ITC).
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default GstPriceBreakdown;
