import React, { useState } from "react";
import { AlertTriangle, Check, Loader2, Server } from "lucide-react";
import { DEFAULT_LOCAL_FASTAPI_URL } from "../types/lead";

interface ApiReferenceViewProps {
  apiBaseUrl: string;
  onChangeApiBaseUrl: (nextUrl: string) => void;
  simulateError: boolean;
  onToggleSimulateError: (next: boolean) => void;
  onPreviewErrorCard: () => void;
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
  simulateError,
  onToggleSimulateError,
  onPreviewErrorCard,
}: ApiReferenceViewProps) {
  const [customUrl, setCustomUrl] = useState(
    apiBaseUrl || DEFAULT_LOCAL_FASTAPI_URL
  );
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const isBuiltIn = apiBaseUrl === "";

  const handleSelectBuiltIn = () => {
    setConnectionError(null);
    onChangeApiBaseUrl("");
    setSavedNotice("Switched to built-in /api/*");
    setTimeout(() => setSavedNotice(null), 2200);
  };

  const handleConnectExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (customUrl.trim() || DEFAULT_LOCAL_FASTAPI_URL).replace(
      /\/+$/,
      ""
    );
    setConnectionError(null);
    setSavedNotice(null);

    const isMixedContent =
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      trimmed.startsWith("http://");

    if (isMixedContent) {
      setConnectionError(
        `Cannot connect to ${trimmed} from an HTTPS preview because browsers block HTTP localhost requests. Run the frontend locally on http://localhost:3000 to test FastAPI, or keep using the Built-in LeadPilot Server here.`
      );
      return;
    }

    setIsCheckingUrl(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${trimmed}/api/stats`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        setConnectionError(
          `Server at ${trimmed} responded with HTTP ${res.status}. Verify FastAPI is running properly.`
        );
        return;
      }

      onChangeApiBaseUrl(trimmed);
      setSavedNotice(`Connected to ${trimmed}`);
      setTimeout(() => setSavedNotice(null), 2200);
    } catch {
      setConnectionError(
        `Could not reach ${trimmed}. Start FastAPI locally (uvicorn app.main:app --host 127.0.0.1 --port 8002) and check CORS, or stay on the Built-in LeadPilot Server.`
      );
    } finally {
      setIsCheckingUrl(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Backend Target Configuration */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
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
              {savedNotice}
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
              deterministic scoring and persistent JSON demo storage.
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
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (connectionError) setConnectionError(null);
                }}
                placeholder="http://127.0.0.1:8002"
                aria-label="FastAPI base URL"
                className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 font-mono text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isCheckingUrl}
                className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-md bg-slate-900 px-3.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {isCheckingUrl && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                )}
                <span>
                  {isCheckingUrl
                    ? "Checking..."
                    : !isBuiltIn
                    ? "Update URL"
                    : "Connect FastAPI"}
                </span>
              </button>
            </div>

            {connectionError && (
              <div
                role="alert"
                className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900"
              >
                <p>{connectionError}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {!isBuiltIn && (
                    <button
                      type="button"
                      onClick={handleSelectBuiltIn}
                      className="font-medium text-indigo-700 underline hover:text-indigo-900"
                    >
                      Switch back to Built-in Server
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = (
                        customUrl.trim() || DEFAULT_LOCAL_FASTAPI_URL
                      ).replace(/\/+$/, "");
                      setConnectionError(null);
                      onChangeApiBaseUrl(trimmed);
                    }}
                    className="font-medium text-amber-900 underline hover:text-amber-700"
                  >
                    Save URL anyway
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Demo Error Simulation (HTTP 502) */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="h-4 w-4 text-rose-600"
                aria-hidden="true"
              />
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Simulate Qualification Error (HTTP 502)
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Toggle simulated 502 responses on{" "}
              <span className="font-mono">POST /api/leads</span> and{" "}
              <span className="font-mono">POST /api/leads/&#123;id&#125;/requalify</span>{" "}
              or preview the Qualification Failed retry state directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={simulateError}
              onClick={() => onToggleSimulateError(!simulateError)}
              className={`inline-flex h-9 items-center gap-2 rounded-md border px-3.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 whitespace-nowrap shrink-0 ${
                simulateError
                  ? "border-rose-300 bg-rose-50 text-rose-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>
                Simulate Error: {simulateError ? "On (502)" : "Off"}
              </span>
            </button>

            <button
              type="button"
              onClick={onPreviewErrorCard}
              className="inline-flex h-9 items-center rounded-md bg-rose-700 px-3.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-rose-700 whitespace-nowrap shrink-0"
            >
              Preview Error Card
            </button>
          </div>
        </div>
      </section>

      {/* Spec Endpoints Table */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4 sm:p-5">
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
              className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-baseline sm:gap-6 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3 sm:w-72 sm:shrink-0">
                <span className="w-12 shrink-0 font-mono text-xs font-semibold text-indigo-700">
                  {ep.method}
                </span>
                <span className="break-all font-mono text-xs text-slate-900 sm:break-normal">
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
