import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, Mail, Phone, RefreshCw, Search, UserPlus } from "lucide-react";
import { fetchLandingLeads, landingLeadsToCsv, type LandingLead } from "../../lib/landingLeadService";

interface LandingLeadsPanelProps {
  endpoint: string;
  token: string;
  onCountChange?: (count: number) => void;
}

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value || "—";
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
};

const isToday = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  return !isNaN(date.getTime()) && date.toDateString() === now.toDateString();
};

const LandingLeadsPanel: React.FC<LandingLeadsPanelProps> = ({ endpoint, token, onCountChange }) => {
  const [leads, setLeads] = useState<LandingLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadLeads = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchLandingLeads(endpoint, token);
      setLeads(data);
      onCountChange?.(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load landing leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, token]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(l =>
      [l.name, l.phone, l.email, l.utmSource, l.utmCampaign].some(v => String(v || "").toLowerCase().includes(q))
    );
  }, [leads, search]);

  const stats = useMemo(() => ({
    total: leads.length,
    today: leads.filter(l => isToday(l.timestamp)).length,
    withEmail: leads.filter(l => l.email).length,
  }), [leads]);

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const blob = new Blob([landingLeadsToCsv(filteredLeads)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ai_masterclass_landing_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Landing Leads", value: stats.total, hint: "Popup submissions", color: "text-blue-400" },
          { label: "Today", value: stats.today, hint: "Submitted today", color: "text-emerald-400" },
          { label: "With Email", value: stats.withEmail, hint: "Optional email provided", color: "text-purple-400" },
        ].map(card => (
          <div key={card.label} className="bg-[#0b101b] border border-white/[0.08] rounded-2xl p-5">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${card.color}`}>{card.label}</p>
            <h3 className="text-3xl font-extrabold mt-3 font-display tracking-tight text-white">{card.value}</h3>
            <p className="text-[10px] text-white/40 mt-1">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="bg-white/5 border border-white/5 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">AI Masterclass Landing Gate Leads</h3>
            </div>
            <p className="text-xs text-white/50 mt-1">Captured from the popup at course.techtycoon.in/ai_masterclass (sheet tab: Landing_Leads)</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, phone, email..."
                className="w-full sm:w-64 bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50"
              />
            </div>
            <button
              onClick={loadLeads}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/80 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV ({filteredLeads.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="m-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-300">Could not load landing leads</h4>
              <p className="text-xs text-red-200/70 mt-0.5">
                {error} Make sure the latest AI Masterclass Apps Script (with the <code className="bg-black/30 px-1 rounded font-mono">getLandingLeads</code> action) is deployed.
              </p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/20 text-white/50 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3 font-bold">Submitted (IST)</th>
                <th className="px-6 py-3 font-bold">Name</th>
                <th className="px-6 py-3 font-bold">Phone</th>
                <th className="px-6 py-3 font-bold">Email</th>
                <th className="px-6 py-3 font-bold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map(lead => (
                <tr key={lead.leadId || `${lead.timestamp}-${lead.phone}`} className="hover:bg-white/[0.03]">
                  <td className="px-6 py-3 text-white/60 whitespace-nowrap">{formatDateTime(lead.timestamp)}</td>
                  <td className="px-6 py-3 font-semibold text-white">{lead.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 text-emerald-300 hover:underline">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </a>
                  </td>
                  <td className="px-6 py-3">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 text-blue-300 hover:underline">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-white/60 whitespace-nowrap">
                    {[lead.utmSource, lead.utmCampaign].filter(Boolean).join(" / ") ||
                      (lead.gclid ? "Google Ads" : lead.fbclid ? "Meta Ads" : "Direct")}
                  </td>
                </tr>
              ))}
              {!loading && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    {leads.length === 0 ? "No landing leads yet." : "No leads match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LandingLeadsPanel;
