import React from "react";
import { ArrowUpRight, RefreshCw, AlertTriangle } from "lucide-react";
import {
  DEMO_STATUS_LABELS,
  Lead,
  LeadTier,
  TIER_LABELS,
  formatUnixTimestamp,
} from "../types/lead";

interface QualificationResultCardProps {
  lead: Lead | null;
  aiError: { status: number; message: string } | null;
  onRetry: () => void;
  onInspectFollowUp: (leadId: number) => void;
  isRetrying: boolean;
}

const TIER_STYLES: Record<
  LeadTier,
  { text: string; bar: string; surface: string }
> = {
  hot: {
    text: "text-emerald-700",
    bar: "bg-emerald-600",
    surface: "bg-emerald-50",
  },
  warm: {
    text: "text-amber-700",
    bar: "bg-amber-600",
    surface: "bg-amber-50",
  },
  cold: {
    text: "text-sky-700",
    bar: "bg-sky-600",
    surface: "bg-sky-50",
  },
};

export default function QualificationResultCard({
  lead,
  aiError,
  onRetry,
  onInspectFollowUp,
  isRetrying,
}: QualificationResultCardProps) {
  if (aiError) {
    return (
      <div className="flex h-full flex-col justify-between rounded-lg border border-rose-200 bg-rose-50/70 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-rose-200 pb-4">
            <div className="flex items-center gap-2 text-rose-900">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-semibold tracking-tight">
                Qualification Failed
              </h2>
            </div>
            <span className="font-mono tabular-nums text-xs font-medium text-rose-700">
              HTTP {aiError.status}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-rose-800">
            {aiError.message}
          </p>
          <p className="text-xs text-rose-700">
            The AI scoring service could not complete this request. Retry to run
            qualification again without re-entering the lead details.
          </p>
        </div>

        <div className="mt-6 border-t border-rose-200 pt-4">
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="whitespace-nowrap shrink-0 inline-flex items-center gap-2 rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-rose-700 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{isRetrying ? "Retrying..." : "Retry Qualification"}</span>
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-full flex-col justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-base font-semibold text-slate-800">
          Qualification Result Ready
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Submit a lead from the intake form or select any row in the pipeline
          below to review its 0–100 score, tier classification, summary, and
          tailored follow-up draft.
        </p>
        <div className="mx-auto mt-6 grid w-full max-w-sm grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <div className="px-2">
            <div className="font-mono tabular-nums font-semibold text-emerald-700">
              70–100
            </div>
            <div className="mt-0.5">Hot tier</div>
          </div>
          <div className="px-2">
            <div className="font-mono tabular-nums font-semibold text-amber-700">
              40–69
            </div>
            <div className="mt-0.5">Warm tier</div>
          </div>
          <div className="px-2">
            <div className="font-mono tabular-nums font-semibold text-sky-700">
              0–39
            </div>
            <div className="mt-0.5">Cold tier</div>
          </div>
        </div>
      </div>
    );
  }

  const tierStyle = TIER_STYLES[lead.tier];
  const clampedScore = Math.max(0, Math.min(100, lead.score));

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Lead #{lead.id}</span>
              <span aria-hidden="true">·</span>
              <span>{DEMO_STATUS_LABELS[lead.status]}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {formatUnixTimestamp(lead.updated)}
              </span>
            </div>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900">
              {lead.name}
            </h2>
            <p className="mt-0.5 truncate text-sm text-slate-600">
              {[lead.company, lead.email].filter(Boolean).join(" · ") ||
                "No company or email provided"}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="font-mono tabular-nums text-3xl font-semibold tracking-tight text-slate-900">
              {clampedScore}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className={`mt-0.5 text-xs font-semibold ${tierStyle.text}`}>
              {TIER_LABELS[lead.tier]}
            </div>
          </div>
        </div>

        {/* Tier Threshold Indicator */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-md border border-slate-200 bg-slate-50/70 text-center text-xs">
          <div
            className={`px-3 py-2 ${
              lead.tier === "cold"
                ? "bg-sky-50 font-semibold text-sky-800"
                : "text-slate-500"
            }`}
          >
            Cold <span className="font-mono tabular-nums">(&lt;40)</span>
          </div>
          <div
            className={`px-3 py-2 ${
              lead.tier === "warm"
                ? "bg-amber-50 font-semibold text-amber-800"
                : "text-slate-500"
            }`}
          >
            Warm <span className="font-mono tabular-nums">(40–69)</span>
          </div>
          <div
            className={`px-3 py-2 ${
              lead.tier === "hot"
                ? "bg-emerald-50 font-semibold text-emerald-800"
                : "text-slate-500"
            }`}
          >
            Hot <span className="font-mono tabular-nums">(70+)</span>
          </div>
        </div>

        {/* Summary & Next Step separated by hairline */}
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-500">
              Qualification Summary
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">
              {lead.summary}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="text-xs font-semibold text-slate-500">
              Recommended Next Step
            </h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-indigo-700">
              {lead.next_step}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="text-xs font-semibold text-slate-500">
              Follow-Up Draft Subject
            </h3>
            <p className="mt-1 truncate text-sm text-slate-700">
              {lead.email_subject || "No draft subject"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Metadata & Action */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>
            Budget:{" "}
            <strong className="font-medium text-slate-800">
              {lead.budget || "Not specified"}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Timeline:{" "}
            <strong className="font-medium text-slate-800">
              {lead.timeline || "Flexible"}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onInspectFollowUp(lead.id)}
          className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <span>Open Follow-Up Drawer</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
