import React, { useState } from "react";
import { Check, Server } from "lucide-react";
import { DEFAULT_LOCAL_FASTAPI_URL } from "../types/lead";

interface ApiReferenceViewProps {
  apiBaseUrl: string;
  onChangeApiBaseUrl: (nextUrl: string) => void;
}

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/leads",
    summary:
      "Qualifies a new lead with AI scoring (0–100), tier classification, next step, and follow-up email draft. Requires at least one of email, phone, or message (returns 400 otherwise).",
  },
  {
    method: "GET",
    path: "/api/leads?tier=hot|warm|cold",
    summary:
      "Lists all leads ordered by highest score first, with optional tier filtering. Name/company search is applied client-side.",
  },
  {
    method: "GET",
    path: "/api/stats",
    summary:
      "Returns pipeline badge counts: total, hot, warm, cold, new, and won.",
  },
  {
    method: "GET",
    path: "/api/leads/{id}",
    summary:
      "Fetches a single lead along with its email draft and messages conversation array.",
  },
  {
    method: "PATCH",
    path: "/api/leads/{id}",
    summary:
      "Updates pipeline status (new, contacted, won, lost). Demo treats new as Draft Ready and contacted as Follow-Up Sent.",
  },
  {
    method: "POST",
    path: "/api/leads/{id}/requalify",
    summary:
      "Re-runs AI qualification on an existing lead and returns the updated score, summary, and draft.",
  },
];

export default function ApiReferenceView({
  apiBaseUrl,
  onChangeApiBaseUrl,
}: ApiReferenceViewProps) {
  const [customUrl, setCustomUrl] = useState(
    apiBaseUrl || DEFAULT_LOCAL_FASTAPI_URL
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const isBuiltIn = apiBaseUrl === "";

  const handleSelectBuiltIn = () => {
    onChangeApiBaseUrl("");
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleConnectExternal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrl.trim() || DEFAULT_LOCAL_FASTAPI_URL;
    onChangeApiBaseUrl(trimmed);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Backend Target Configuration */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Backend Connection Target
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Switch between the built-in LeadPilot AI backend or a local
              FastAPI server running on port 8002.
            </p>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Target updated
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div
            className={`rounded-md border p-4 ${
              isBuiltIn
                ? "border-indigo-600 bg-indigo-50/40"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Server className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                <span>Built-in LeadPilot Server</span>
              </div>
              <span className="font-mono text-xs text-slate-500">/api/*</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Runs all LeadPilot endpoints directly inside this workspace with
              live AI qualification and persistent JSON demo storage.
            </p>
            <button
              type="button"
              onClick={handleSelectBuiltIn}
              disabled={isBuiltIn}
              className="mt-4 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:border-indigo-200 disabled:bg-indigo-600 disabled:text-white"
            >
              {isBuiltIn ? "Active Target" : "Use Built-in Server"}
            </button>
          </div>

          <form
            onSubmit={handleConnectExternal}
            className={`rounded-md border p-4 ${
              !isBuiltIn
                ? "border-indigo-600 bg-indigo-50/40"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                External FastAPI Server
              </span>
              <span className="font-mono text-xs text-slate-500">
                127.0.0.1:8002
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Point the frontend directly to Muhammad Saqlain&apos;s local
              Python FastAPI backend (CORS open).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="http://127.0.0.1:8002"
                aria-label="FastAPI base URL"
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="submit"
                className="whitespace-nowrap shrink-0 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                {!isBuiltIn ? "Update URL" : "Connect FastAPI"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Spec Endpoints Table */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            LeadPilot API Contract (Draft v1)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Field mapping, scoring tiers, and error codes implemented by both
            the built-in server and FastAPI specification.
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {ENDPOINTS.map((ep) => (
            <div
              key={`${ep.method}-${ep.path}`}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <div className="flex w-64 shrink-0 items-center gap-3">
                <span className="w-12 font-mono text-xs font-semibold text-indigo-700">
                  {ep.method}
                </span>
                <span className="font-mono text-xs text-slate-900">
                  {ep.path}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                {ep.summary}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
