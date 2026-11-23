import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEMO_STATUS_LABELS, Lead, LeadStatus, LeadTier } from "../types/lead";

interface PipelineStatusChartProps {
  leads: Lead[];
  activeTier: "all" | LeadTier;
  activeStatus: "all" | LeadStatus;
  onStatusSelect: (status: "all" | LeadStatus) => void;
  isLoading: boolean;
}

interface StatusDatum {
  status: LeadStatus;
  label: string;
  axisLabel: string;
  count: number;
  percent: number;
  color: string;
}

const STATUS_META: Array<{
  status: LeadStatus;
  axisLabel: string;
  color: string;
}> = [
  { status: "new", axisLabel: "New", color: "#4f46e5" },
  { status: "contacted", axisLabel: "Contacted", color: "#d97706" },
  { status: "won", axisLabel: "Won", color: "#16a34a" },
  { status: "lost", axisLabel: "Lost", color: "#64748b" },
];

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: StatusDatum }>;
}) {
  const datum = active ? payload?.[0]?.payload : undefined;
  if (!datum) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-slate-900">
        {datum.label}{" "}
        <span className="font-mono font-normal text-slate-400">
          ({datum.status})
        </span>
      </div>
      <div className="mt-1 font-mono tabular-nums text-slate-600">
        {datum.count} {datum.count === 1 ? "lead" : "leads"} · {datum.percent}%
      </div>
    </div>
  );
}

export default function PipelineStatusChart({
  leads,
  activeTier,
  activeStatus,
  onStatusSelect,
  isLoading,
}: PipelineStatusChartProps) {
  const data = useMemo<StatusDatum[]>(() => {
    const total = leads.length;
    const counts: Record<LeadStatus, number> = {
      new: 0,
      contacted: 0,
      won: 0,
      lost: 0,
    };

    for (const lead of leads) {
      counts[lead.status] = (counts[lead.status] ?? 0) + 1;
    }

    return STATUS_META.map((meta) => {
      const count = counts[meta.status];
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        status: meta.status,
        label: DEMO_STATUS_LABELS[meta.status],
        axisLabel: meta.axisLabel,
        count,
        percent,
        color: meta.color,
      };
    });
  }, [leads]);

  const handleToggleStatus = (status: LeadStatus) => {
    onStatusSelect(activeStatus === status ? "all" : status);
  };

  const tierScopeLabel =
    activeTier === "all"
      ? "All tiers"
      : `${activeTier.charAt(0).toUpperCase()}${activeTier.slice(1)} tier`;

  return (
    <section
      aria-label="Pipeline health by lead status"
      className="rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            Pipeline Health by Status
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {tierScopeLabel} breakdown across {leads.length}{" "}
            {leads.length === 1 ? "lead" : "leads"} · Click any status to filter
            the table below.
          </p>
        </div>

        {activeStatus !== "all" && (
          <button
            type="button"
            onClick={() => onStatusSelect("all")}
            className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            Clear status filter ({activeStatus})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 divide-y divide-slate-200 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          <div className="p-4 sm:p-5 lg:col-span-7">
            <div className="h-52 w-full animate-pulse rounded bg-slate-100" />
          </div>
          <div className="divide-y divide-slate-200 lg:col-span-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-4 sm:px-5">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 divide-y divide-slate-200 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Bar Chart */}
          <div className="p-4 sm:p-5 lg:col-span-7">
            <div className="h-52 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="axisLabel"
                    interval={0}
                    tick={{ fill: "#475569", fontSize: 12 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={<StatusTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                    onClick={(entry) => {
                      const clickedStatus = (entry as unknown as StatusDatum)
                        ?.status;
                      if (clickedStatus) handleToggleStatus(clickedStatus);
                    }}
                    className="cursor-pointer"
                  >
                    {data.map((entry) => {
                      const isDimmed =
                        activeStatus !== "all" && activeStatus !== entry.status;
                      return (
                        <Cell
                          key={entry.status}
                          fill={entry.color}
                          fillOpacity={isDimmed ? 0.25 : 0.92}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Structured Status Breakdown List */}
          <div className="divide-y divide-slate-200 lg:col-span-5">
            {data.map((item) => {
              const isSelected = activeStatus === item.status;
              return (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => handleToggleStatus(item.status)}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:px-5 ${
                    isSelected
                      ? "bg-indigo-50/60"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {item.label}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        status: {item.status}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-mono tabular-nums">
                    <div className="text-sm font-semibold text-slate-900">
                      {item.count}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.percent}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
