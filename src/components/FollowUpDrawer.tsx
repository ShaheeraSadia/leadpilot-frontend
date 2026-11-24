import React, { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import {
  ApiHttpError,
  DEMO_STATUS_LABELS,
  Lead,
  LeadStatus,
  TIER_LABELS,
  apiRequest,
  formatUnixTimestamp,
} from "../types/lead";

interface FollowUpDrawerProps {
  apiBaseUrl: string;
  simulateError?: boolean;
  leadId: number | null;
  initialLead: Lead | null;
  onClose: () => void;
  onLeadUpdated: (updated: Lead) => void;
}

const ALL_STATUSES: LeadStatus[] = ["new", "contacted", "won", "lost"];

function buildFallbackLeadDetail(lead: Lead): Lead {
  const fallbackMessages =
    lead.messages && lead.messages.length > 0
      ? lead.messages
      : lead.need
      ? [{ role: "user" as const, content: lead.need, ts: lead.created }]
      : [];

  return {
    ...lead,
    email_subject: lead.email_subject || lead.draft_subject || "",
    email_body: lead.email_body || lead.draft_body || "",
    messages: fallbackMessages,
  };
}

export default function FollowUpDrawer({
  apiBaseUrl,
  simulateError = false,
  leadId,
  initialLead,
  onClose,
  onLeadUpdated,
}: FollowUpDrawerProps) {
  const [detail, setDetail] = useState<Lead | null>(() =>
    initialLead ? buildFallbackLeadDetail(initialLead) : null
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRequalifying, setIsRequalifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const initialLeadRef = React.useRef<Lead | null>(initialLead);
  initialLeadRef.current = initialLead;

  useEffect(() => {
    if (initialLead && leadId !== null && initialLead.id === leadId) {
      setDetail((prev) => {
        if (prev && prev.id === initialLead.id) {
          return buildFallbackLeadDetail({ ...prev, ...initialLead });
        }
        return buildFallbackLeadDetail(initialLead);
      });
    }
  }, [initialLead, leadId]);

  useEffect(() => {
    const cachedLead = initialLeadRef.current;
    setDetail(cachedLead ? buildFallbackLeadDetail(cachedLead) : null);
    setFeedback(null);
    setCopied(false);

    if (leadId === null) return;

    let cancelled = false;
    setIsLoadingDetail(true);

    apiRequest<Lead>(apiBaseUrl, `/api/leads/${leadId}`)
      .then((data) => {
        if (!cancelled) {
          setDetail((prev) =>
            buildFallbackLeadDetail({
              ...(prev ?? ({} as Lead)),
              ...data,
            })
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const fallback = initialLeadRef.current;
          if (fallback && fallback.id === leadId) {
            setDetail((prev) =>
              buildFallbackLeadDetail(prev?.id === leadId ? prev : fallback)
            );
            return;
          }
          const msg =
            err instanceof ApiHttpError
              ? err.detail
              : "Could not load full conversation history.";
          setFeedback({ type: "error", text: msg });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, leadId]);

  useEffect(() => {
    if (leadId === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [leadId, onClose]);

  if (leadId === null || !detail) return null;

  const handleStatusChange = async (nextStatus: LeadStatus) => {
    setIsUpdatingStatus(true);
    setFeedback(null);
    try {
      const updated = await apiRequest<Lead>(
        apiBaseUrl,
        `/api/leads/${detail.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const merged = { ...detail, ...updated };
      setDetail(merged);
      onLeadUpdated(merged);
      setFeedback({
        type: "success",
        text: `Pipeline status updated to "${DEMO_STATUS_LABELS[nextStatus]}".`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiHttpError
          ? err.detail
          : "Failed to update lead status.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRequalify = async () => {
    setIsRequalifying(true);
    setFeedback(null);
    try {
      const updated = await apiRequest<Lead>(
        apiBaseUrl,
        `/api/leads/${detail.id}/requalify`,
        {
          method: "POST",
          headers: simulateError ? { "X-Simulate-Error": "true" } : undefined,
        }
      );
      const merged = { ...detail, ...updated };
      setDetail(merged);
      onLeadUpdated(merged);
      setFeedback({
        type: "success",
        text: `Re-qualified at ${merged.score}/100 (${merged.tier}).`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiHttpError
          ? err.detail
          : "AI re-qualification failed. Try again.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsRequalifying(false);
    }
  };

  const handleCopyDraft = async () => {
    const text = `Subject: ${detail.email_subject}\n\n${detail.email_body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setFeedback({
        type: "error",
        text: "Clipboard access was blocked by the browser.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Follow-up drawer for ${detail.name}`}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-xl"
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
              <span>Lead #{detail.id}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Score {detail.score}/100
              </span>
              <span aria-hidden="true">·</span>
              <span>{TIER_LABELS[detail.tier]}</span>
            </div>
            <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              {detail.name || "Unnamed Lead"}
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {[detail.company, detail.email, detail.phone]
                .filter(Boolean)
                .join(" · ") || "No contact metadata"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close follow-up drawer"
            className="whitespace-nowrap shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:h-9 sm:w-9"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {feedback && (
            <div
              role="status"
              className={`rounded-md border px-3.5 py-2.5 text-xs font-medium ${
                feedback.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Pipeline & Demo Follow-up Status */}
          <div className="space-y-3 border-b border-slate-200 pb-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500">
                Pipeline & Demo Follow-Up Status
              </h3>
              <span className="text-xs font-semibold text-indigo-700">
                {DEMO_STATUS_LABELS[detail.status]}{" "}
                <span className="font-mono font-normal text-slate-400">
                  ({detail.status})
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ALL_STATUSES.map((statusOption) => {
                const isActive = detail.status === statusOption;
                return (
                  <button
                    key={statusOption}
                    type="button"
                    disabled={isUpdatingStatus || isActive}
                    onClick={() => handleStatusChange(statusOption)}
                    className={`whitespace-nowrap shrink-0 rounded-md border px-3 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                      isActive
                        ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    } disabled:cursor-default`}
                  >
                    {DEMO_STATUS_LABELS[statusOption]}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Demo mapping: <span className="font-mono">new</span> maps to Draft
              Ready and <span className="font-mono">contacted</span> maps to
              Follow-Up Sent.
            </p>
          </div>

          {/* AI-Written Follow-Up Email Draft */}
          <div className="space-y-3 border-b border-slate-200 pb-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold text-slate-500">
                AI Follow-Up Email Draft
              </h3>
              <button
                type="button"
                onClick={handleCopyDraft}
                className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {copied ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="border-b border-slate-200 pb-2.5">
                <span className="text-xs font-medium text-slate-500">
                  Subject
                </span>
                <p className="mt-0.5 font-medium text-slate-900">
                  {detail.email_subject || "No subject generated"}
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-medium text-slate-500">Body</span>
                <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-700">
                  {detail.email_body || "No follow-up draft body available."}
                </p>
              </div>
            </div>
          </div>

          {/* Summary & Next Step */}
          {(detail.summary || detail.next_step) && (
            <div className="space-y-3 border-b border-slate-200 pb-5">
              <h3 className="text-xs font-semibold text-slate-500">
                Qualification Assessment
              </h3>
              {detail.summary && (
                <p className="text-sm leading-relaxed text-slate-700">
                  {detail.summary}
                </p>
              )}
              {detail.next_step && (
                <p className="text-xs font-medium text-indigo-700">
                  Next step: {detail.next_step}
                </p>
              )}
            </div>
          )}

          {/* Conversation History (GET /api/leads/{id}) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500">
                Conversation Messages
              </h3>
              {isLoadingDetail && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Loader2
                    className="h-3 w-3 animate-spin"
                    aria-hidden="true"
                  />
                  Syncing
                </span>
              )}
            </div>

            {detail.messages && detail.messages.length > 0 ? (
              <div className="space-y-2.5">
                {detail.messages.map((msg, idx) => (
                  <div
                    key={`${msg.ts}-${idx}`}
                    className="rounded-md border border-slate-200 bg-white p-3.5 text-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium capitalize text-slate-700">
                        {msg.role}
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatUnixTimestamp(msg.ts)}
                      </span>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-slate-700">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No conversation messages recorded for this lead yet.
              </p>
            )}
          </div>
        </div>

        {/* Sticky Drawer Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3.5 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={handleRequalify}
            disabled={isRequalifying}
            className="whitespace-nowrap shrink-0 inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-60 sm:min-h-0 sm:flex-none"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRequalifying ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>
              {isRequalifying ? "Re-qualifying..." : "Re-qualify Lead"}
            </span>
          </button>

          {detail.status === "new" ? (
            <button
              type="button"
              onClick={() => handleStatusChange("contacted")}
              disabled={isUpdatingStatus}
              className="whitespace-nowrap shrink-0 inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-60 sm:min-h-0 sm:flex-none"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mark Follow-Up Sent</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="whitespace-nowrap shrink-0 inline-flex min-h-[42px] flex-1 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:min-h-0 sm:flex-none"
            >
              Done
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
