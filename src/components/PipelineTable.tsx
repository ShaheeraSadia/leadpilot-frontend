import React, { useMemo, useState } from "react";
import { Search, ArrowUpRight, Inbox } from "lucide-react";
import {
  DEMO_STATUS_LABELS,
  Lead,
  LeadStatus,
  LeadTier,
  formatUnixTimestamp,
} from "../types/lead";

interface PipelineTableProps {
  leads: Lead[];
  activeTier: "all" | LeadTier;
  onTierChange: (tier: "all" | LeadTier) => void;
  activeStatus?: "all" | LeadStatus;
  onStatusChange?: (status: "all" | LeadStatus) => void;
  onSelectLead: (lead: Lead) => void;
  onAddLeadClick?: () => void;
  isLoading: boolean;
  selectedLeadId?: number | null;
}

const TIER_TEXT_CLASSES: Record<LeadTier, string> = {
  hot: "text-emerald-700 font-semibold",
  warm: "text-amber-700 font-semibold",
  cold: "text-sky-700 font-semibold",
};

export default function PipelineTable({
  leads,
  activeTier,
  onTierChange,
  activeStatus: controlledStatus,
  onStatusChange,
  onSelectLead,
  onAddLeadClick,
  isLoading,
  selectedLeadId,
}: PipelineTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [internalStatus, setInternalStatus] = useState<"all" | LeadStatus>("all");

  const activeStatus = controlledStatus ?? internalStatus;
  const setActiveStatus = (nextStatus: "all" | LeadStatus) => {
    if (onStatusChange) {
      onStatusChange(nextStatus);
    } else {
      setInternalStatus(nextStatus);
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<"all" | LeadStatus, number> = {
      all: leads.length,
      new: 0,
      contacted: 0,
      won: 0,
      lost: 0,
    };
    for (const lead of leads) {
      counts[lead.status] = (counts[lead.status] ?? 0) + 1;
    }
    return counts;
  }, [leads]);

  const statusFilterOptions: Array<{
    value: "all" | LeadStatus;
    label: string;
  }> = [
    { value: "all", label: `All statuses (${statusCounts.all})` },
    { value: "new", label: `${DEMO_STATUS_LABELS.new} · new (${statusCounts.new})` },
    {
      value: "contacted",
      label: `${DEMO_STATUS_LABELS.contacted} · contacted (${statusCounts.contacted})`,
    },
    { value: "won", label: `${DEMO_STATUS_LABELS.won} (${statusCounts.won})` },
    { value: "lost", label: `${DEMO_STATUS_LABELS.lost} (${statusCounts.lost})` },
  ];

  // Client-side search and status filtering per LeadPilot API spec
  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus =
        activeStatus === "all" || lead.status === activeStatus;
      const matchesQuery =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [leads, activeStatus, searchQuery]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Leads Pipeline
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Sorted by highest qualification score. Select any lead to review the
            AI follow-up draft or update pipeline status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Segmented Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter leads by tier"
            className="inline-flex h-9 items-center gap-1 rounded-md bg-slate-100 p-1"
          >
            {(["all", "hot", "warm", "cold"] as const).map((tier) => {
              const isActive = activeTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTierChange(tier)}
                  className={`whitespace-nowrap shrink-0 rounded px-3 py-1 text-xs font-medium capitalize transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>

          {/* Status Dropdown Filter */}
          <div>
            <select
              value={activeStatus}
              onChange={(e) =>
                setActiveStatus(e.target.value as "all" | LeadStatus)
              }
              aria-label="Filter leads by status"
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              {statusFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Client-side search */}
          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or company..."
              aria-label="Search leads by name or company"
              className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
              <th className="px-5 py-3">Lead / Company</th>
              <th className="px-4 py-3">Project Need</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Follow-Up State</th>
              <th className="px-4 py-3 text-right">Updated</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-5 py-3.5">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="mt-1.5 h-3 w-24 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-56 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-24 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="ml-auto h-4 w-10 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-12 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-24 rounded bg-slate-100" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="ml-auto h-4 w-20 rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="ml-auto h-4 w-14 rounded bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <Inbox
                      className="h-8 w-8 text-slate-300"
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      No matching leads in this view
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {searchQuery
                        ? `No leads matched "${searchQuery}". Try clearing your search query or adjusting filters.`
                        : activeStatus !== "all" || activeTier !== "all"
                        ? "No leads match the selected tier and status filters."
                        : "Submit a new lead using the intake form to qualify and score it."}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Clear Search
                        </button>
                      )}
                      {activeStatus !== "all" && (
                        <button
                          type="button"
                          onClick={() => setActiveStatus("all")}
                          className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Show All Statuses
                        </button>
                      )}
                      {activeTier !== "all" && (
                        <button
                          type="button"
                          onClick={() => onTierChange("all")}
                          className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Show All Tiers
                        </button>
                      )}
                      {onAddLeadClick &&
                        !searchQuery &&
                        activeTier === "all" &&
                        activeStatus === "all" && (
                          <button
                            type="button"
                            onClick={onAddLeadClick}
                            className="whitespace-nowrap shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                          >
                            Qualify First Lead
                          </button>
                        )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const isSelected = selectedLeadId === lead.id;
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`cursor-pointer transition-colors duration-150 hover:bg-slate-50 ${
                      isSelected ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 align-top">
                      <div className="font-medium text-slate-900">
                        {lead.name}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {[lead.company, lead.email].filter(Boolean).join(" · ")}
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3.5 align-top text-xs leading-relaxed text-slate-600">
                      <p className="line-clamp-2">{lead.need || "—"}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-top font-mono tabular-nums text-xs text-slate-700">
                      {lead.budget || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right align-top font-mono tabular-nums text-sm font-semibold text-slate-900">
                      {lead.score}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-top text-xs capitalize">
                      <span className={TIER_TEXT_CLASSES[lead.tier]}>
                        {lead.tier}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 align-top text-xs font-medium text-slate-700">
                      {DEMO_STATUS_LABELS[lead.status]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right align-top font-mono tabular-nums text-xs text-slate-500">
                      {formatUnixTimestamp(lead.updated)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right align-top">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        <span>Review</span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
