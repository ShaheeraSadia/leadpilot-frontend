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
  website?: string;
  message: string;
  budget: string;
  timeline: string;
  source: "form";
}

export const DEFAULT_LOCAL_FASTAPI_URL = "http://127.0.0.1:8002";

export const CONFIGURED_API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  ""
).trim();

export function mapFormToLeadPayload(values: IntakeFormValues): LeadPayload {
  const combinedMessage = [values.serviceNeeded.trim(), values.projectNotes.trim()]
    .filter(Boolean)
    .join(" — ");

  const payload: LeadPayload = {
    name: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    company: values.company.trim(),
    message: combinedMessage,
    budget: values.monthlyBudget.trim(),
    timeline: values.timeline.trim(),
    source: "form",
  };

  if (values.website.trim()) {
    payload.website = values.website.trim();
  }

  return payload;
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
  if (!ts) return "—";
  const date = new Date(ts * 1000);
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

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : `Request failed with status ${response.status}`;
    throw new ApiHttpError(response.status, detail);
  }

  return data as T;
}
