export type LeadTier = "hot" | "warm" | "cold";
export type LeadStatus = "new" | "contacted" | "won" | "lost";

export interface LeadMessage {
  role: "user" | "assistant" | string;
  content: string;
  ts: number;
}

export interface Lead {
  id: number;
  source: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  service?: string;
  website?: string;
  need: string;
  budget: string;
  timeline: string;
  score: number; // 0 to 100
  tier: LeadTier;
  summary: string;
  next_step: string;
  email_subject: string;
  email_body: string;
  draft_subject?: string;
  draft_body?: string;
  status: LeadStatus;
  qualified: number;
  created: number;
  updated: number;
  messages?: LeadMessage[];
}

export interface LeadStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  new: number;
  won: number;
}

export interface IntakeFormValues {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  monthlyBudget: string;
  timeline: string;
  serviceNeeded: string;
  projectNotes: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  budget: string;
  timeline: string;
  source: string;
}

export const DEFAULT_LOCAL_FASTAPI_URL = "http://127.0.0.1:8002";

function resolveInitialApiBaseUrl(): string {
  const configured = (
    import.meta.env.NEXT_PUBLIC_API_URL ||
    (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_API_URL : "") ||
    import.meta.env.VITE_API_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (
    configured &&
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/.*)?$/i.test(configured)
  ) {
    return "";
  }

  return configured;
}

export const API_BASE_URL = resolveInitialApiBaseUrl();

export const CONFIGURED_API_BASE_URL = API_BASE_URL;

export function mapFormToLeadPayload(values: IntakeFormValues): LeadPayload {
  const service = values.serviceNeeded.trim();
  const notes = values.projectNotes.trim();

  const messageParts: string[] = [];
  if (service) {
    messageParts.push(`Service Needed: ${service}`);
  }
  if (notes) {
    messageParts.push(notes);
  }

  return {
    name: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    company: values.company.trim(),
    message: messageParts.join("\n\n"),
    budget: values.monthlyBudget.trim(),
    timeline: values.timeline.trim(),
    source: "web_form",
  };
}

export function getTierFromScore(score: number): LeadTier {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export const DEMO_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Draft Ready",
  contacted: "Follow-Up Sent",
  won: "Won",
  lost: "Lost",
};

export const TIER_LABELS: Record<LeadTier, string> = {
  hot: "Hot (70+)",
  warm: "Warm (40–69)",
  cold: "Cold (<40)",
};

export function formatUnixTimestamp(ts?: number): string {
  if (!ts || !Number.isFinite(ts)) return "—";
  const ms = ts > 1e12 ? ts : ts * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export class ApiHttpError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

function extractApiErrorDetail(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail.trim();
    }
    if (Array.isArray(record.detail) && record.detail.length > 0) {
      const first = record.detail[0] as Record<string, unknown> | undefined;
      if (first && typeof first.msg === "string" && first.msg.trim()) {
        return first.msg.trim();
      }
    }
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message.trim();
    }
  }

  if (status === 400) {
    return "Invalid request. Provide at least one of email, phone, or message.";
  }
  if (status === 404) {
    return "Lead not found.";
  }
  if (status === 502) {
    return "AI qualification service returned an upstream error (HTTP 502).";
  }
  return `Request failed with status ${status}`;
}

export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const url = `${normalizedBase}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = extractApiErrorDetail(data, response.status);
    throw new ApiHttpError(response.status, detail);
  }

  return (data ?? {}) as T;
}
