import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export type LeadTier = "hot" | "warm" | "cold";
export type LeadStatus = "new" | "contacted" | "won" | "lost";

export interface LeadMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

export interface LeadRecord {
  id: number;
  source: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  website: string;
  need: string;
  budget: string;
  timeline: string;
  score: number;
  tier: LeadTier;
  summary: string;
  next_step: string;
  email_subject: string;
  email_body: string;
  draft_subject: string;
  draft_body: string;
  status: LeadStatus;
  qualified: number;
  created: number;
  updated: number;
  messages: LeadMessage[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.VERCEL
  ? "/tmp/leadpilot-data"
  : path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "leads.json");

const SEED_LEADS: LeadRecord[] = [
  {
    id: 1,
    source: "form",
    name: "Daniel Brooks",
    email: "daniel@scaleops.io",
    phone: "+1 415-555-0148",
    company: "ScaleOps",
    service: "SaaS landing page & lead capture",
    website: "https://scaleops.io",
    need: "Need a high-converting SaaS landing page and automated lead capture flow this month.",
    budget: "$2,500 per month",
    timeline: "Immediate",
    score: 86,
    tier: "hot",
    summary:
      "Founder at ScaleOps with an immediate timeline and a strong $2,500/mo budget for SaaS conversion architecture.",
    next_step:
      "Send calendar link for a 15-minute scoping call and share two B2B SaaS case studies.",
    email_subject: "Your project: ScaleOps landing page & lead capture",
    email_body:
      "Hi Daniel,\n\nThanks for reaching out about ScaleOps's landing page and lead capture flow. Since you're targeting a launch this month and have a clear $2,500/mo scope, I'd love to walk through how we structure high-converting SaaS funnels.\n\nAre you open to a quick 15-minute call this week to align on pages and integrations?\n\nBest,\nLeadPilot Team",
    draft_subject: "Your project: ScaleOps landing page & lead capture",
    draft_body:
      "Hi Daniel,\n\nThanks for reaching out about ScaleOps's landing page and lead capture flow. Since you're targeting a launch this month and have a clear $2,500/mo scope, I'd love to walk through how we structure high-converting SaaS funnels.\n\nAre you open to a quick 15-minute call this week to align on pages and integrations?\n\nBest,\nLeadPilot Team",
    status: "contacted",
    qualified: 1,
    created: 1763790000.0,
    updated: 1763795000.0,
    messages: [
      {
        role: "user",
        content:
          "Need a high-converting SaaS landing page and automated lead capture flow this month.",
        ts: 1763790000.0,
      },
    ],
  },
  {
    id: 2,
    source: "form",
    name: "Maya Lin",
    email: "maya@vervehealth.co",
    phone: "+1 646-555-0192",
    company: "Verve Health",
    service: "Patient onboarding portal",
    website: "https://vervehealth.co",
    need: "Rebuilding our patient onboarding portal and booking flow ahead of our Q1 clinic expansion.",
    budget: "$4,000 per month",
    timeline: "Within 4 weeks",
    score: 79,
    tier: "hot",
    summary:
      "Operations director at Verve Health preparing for Q1 expansion with dedicated budget and clear deliverable scope.",
    next_step:
      "Schedule technical discovery session and confirm HIPAA/intake form requirements.",
    email_subject: "Your project: Verve Health onboarding portal",
    email_body:
      "Hi Maya,\n\nThank you for sharing the details on Verve Health's upcoming Q1 clinic expansion. We've helped multi-location healthcare teams streamline patient onboarding and booking drop-off.\n\nWould Thursday or Friday work for a 20-minute scoping call?\n\nBest,\nLeadPilot Team",
    draft_subject: "Your project: Verve Health onboarding portal",
    draft_body:
      "Hi Maya,\n\nThank you for sharing the details on Verve Health's upcoming Q1 clinic expansion. We've helped multi-location healthcare teams streamline patient onboarding and booking drop-off.\n\nWould Thursday or Friday work for a 20-minute scoping call?\n\nBest,\nLeadPilot Team",
    status: "new",
    qualified: 1,
    created: 1763796000.0,
    updated: 1763796000.0,
    messages: [
      {
        role: "user",
        content:
          "Rebuilding our patient onboarding portal and booking flow ahead of our Q1 clinic expansion.",
        ts: 1763796000.0,
      },
    ],
  },
  {
    id: 3,
    source: "form",
    name: "Priya Nair",
    email: "priya.nair@lumenskin.co",
    phone: "",
    company: "Lumen Skin",
    service: "Social media management",
    website: "https://lumenskin.co",
    need: "We are a skincare brand and want help with Instagram and TikTok next quarter.",
    budget: "$800 per month",
    timeline: "Next quarter",
    score: 63,
    tier: "warm",
    summary:
      "Marketing lead at a skincare brand looking for social media management next quarter.",
    next_step: "Email a package overview and ask about content creation needs.",
    email_subject: "Your project: Social media management",
    email_body:
      "Hi Priya,\n\nThanks for getting in touch about Instagram and TikTok growth for Lumen Skin. Next quarter is a great window to plan creative sprints and launch calendars.\n\nI've attached a quick overview of our social retainers—let me know if you already have in-house video assets or need full production.\n\nBest,\nLeadPilot Team",
    draft_subject: "Your project: Social media management",
    draft_body:
      "Hi Priya,\n\nThanks for getting in touch about Instagram and TikTok growth for Lumen Skin. Next quarter is a great window to plan creative sprints and launch calendars.\n\nI've attached a quick overview of our social retainers—let me know if you already have in-house video assets or need full production.\n\nBest,\nLeadPilot Team",
    status: "new",
    qualified: 1,
    created: 1763800000.0,
    updated: 1763800000.0,
    messages: [
      {
        role: "user",
        content:
          "We are a skincare brand and want help with Instagram and TikTok next quarter.",
        ts: 1763800000.0,
      },
    ],
  },
  {
    id: 4,
    source: "form",
    name: "Jonas Weber",
    email: "jonas@kinetixlab.de",
    phone: "",
    company: "Kinetix Lab",
    service: "WordPress brochure site",
    website: "",
    need: "Looking for rough pricing on a small WordPress brochure site sometime later this year.",
    budget: "$300 total",
    timeline: "Flexible / later this year",
    score: 34,
    tier: "cold",
    summary:
      "Early price-shopping inquiry with a low one-time budget and no defined launch date.",
    next_step:
      "Send self-serve starter resources and keep in quarterly nurture list.",
    email_subject: "Your inquiry: Website options for Kinetix Lab",
    email_body:
      "Hi Jonas,\n\nThanks for reaching out to us about Kinetix Lab. Based on your $300 target budget, a custom build may not be the best fit right now, so I put together a quick checklist of lean templates you can launch quickly.\n\nFeel free to reply whenever your scope expands.\n\nBest,\nLeadPilot Team",
    draft_subject: "Your inquiry: Website options for Kinetix Lab",
    draft_body:
      "Hi Jonas,\n\nThanks for reaching out to us about Kinetix Lab. Based on your $300 target budget, a custom build may not be the best fit right now, so I put together a quick checklist of lean templates you can launch quickly.\n\nFeel free to reply whenever your scope expands.\n\nBest,\nLeadPilot Team",
    status: "new",
    qualified: 1,
    created: 1763785000.0,
    updated: 1763785000.0,
    messages: [
      {
        role: "user",
        content:
          "Looking for rough pricing on a small WordPress brochure site sometime later this year.",
        ts: 1763785000.0,
      },
    ],
  },
  {
    id: 5,
    source: "form",
    name: "Hina Tariq",
    email: "hina@craftbox.pk",
    phone: "",
    company: "CraftBox",
    service: "Gift store exploration",
    website: "",
    need: "Just exploring ideas for a small gift store sometime next year.",
    budget: "$150 per month",
    timeline: "Exploring",
    score: 28,
    tier: "cold",
    summary:
      "Early-stage exploration with low budget and no fixed start date.",
    next_step: "Keep in nurture sequence and check back next quarter.",
    email_subject: "Ideas for CraftBox",
    email_body:
      "Hi Hina,\n\nThanks for sharing your early plans for CraftBox. While you're still exploring timelines for next year, here's a lightweight guide on validating your gift store catalog before committing to monthly retainers.\n\nWishing you the best with the launch!\n\nBest,\nLeadPilot Team",
    draft_subject: "Ideas for CraftBox",
    draft_body:
      "Hi Hina,\n\nThanks for sharing your early plans for CraftBox. While you're still exploring timelines for next year, here's a lightweight guide on validating your gift store catalog before committing to monthly retainers.\n\nWishing you the best with the launch!\n\nBest,\nLeadPilot Team",
    status: "new",
    qualified: 1,
    created: 1763780000.0,
    updated: 1763780000.0,
    messages: [
      {
        role: "user",
        content: "Just exploring ideas for a small gift store sometime next year.",
        ts: 1763780000.0,
      },
    ],
  },
];

function computeTier(score: number): LeadTier {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

function parseBudgetAmount(budgetRaw: string): number {
  if (!budgetRaw) return 0;
  const cleaned = budgetRaw.toLowerCase().replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*(k)?/);
  if (!match) return 0;
  let amount = Number(match[1]);
  if (Number.isNaN(amount)) return 0;
  if (match[2] === "k") {
    amount *= 1000;
  }
  if (cleaned.includes("total") || cleaned.includes("one-time")) {
    return Math.round(amount / 2);
  }
  return amount;
}

function qualifyLeadLocally(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  website: string;
  need: string;
  budget: string;
  timeline: string;
}): {
  score: number;
  tier: LeadTier;
  summary: string;
  next_step: string;
  email_subject: string;
  email_body: string;
  draft_subject: string;
  draft_body: string;
} {
  let score = 0;

  // 1. Budget strength (0–40 points)
  const monthlyEquivalent = parseBudgetAmount(input.budget);
  if (monthlyEquivalent >= 2500) {
    score += 38;
  } else if (monthlyEquivalent >= 1500) {
    score += 32;
  } else if (monthlyEquivalent >= 800) {
    score += 22;
  } else if (monthlyEquivalent >= 400) {
    score += 14;
  } else if (monthlyEquivalent > 0) {
    score += 6;
  } else {
    score += 10;
  }

  // 2. Timeline urgency (0–25 points)
  const timelineLower = input.timeline.toLowerCase();
  if (
    /\b(immediate|asap|urgent|now|this month|this week|within \d+ week|next month|q1)\b/.test(
      timelineLower
    )
  ) {
    score += 25;
  } else if (
    /\b(next quarter|1-3 month|2-3 month|soon|q2|spring)\b/.test(timelineLower)
  ) {
    score += 16;
  } else if (
    /\b(exploring|later|next year|flexible|someday|no rush)\b/.test(
      timelineLower
    )
  ) {
    score += 6;
  } else if (timelineLower.trim()) {
    score += 14;
  } else {
    score += 10;
  }

  // 3. Scope clarity & business intent (0–20 points)
  const needText = input.need.trim();
  const needLower = needText.toLowerCase();
  const hasHighIntentKeywords =
    /\b(onboarding|conversion|redesign|analytics|funnel|launch|portal|pipeline|retainer|growth|rollout|integration|campaign)\b/.test(
      needLower
    );
  if (needText.length >= 60 && hasHighIntentKeywords) {
    score += 19;
  } else if (needText.length >= 30) {
    score += 14;
  } else if (needText.length > 0) {
    score += 8;
  } else {
    score += 2;
  }

  // 4. Contact & company completeness (0–15 points)
  const emailLower = input.email.toLowerCase();
  const isFreeEmail =
    /@(gmail|yahoo|hotmail|outlook|icloud|aol)\./.test(emailLower);
  if (input.email) {
    score += isFreeEmail ? 3 : 6;
  }
  if (input.company) score += 4;
  if (input.phone) score += 3;
  if (input.website) score += 2;

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const tier = computeTier(clampedScore);

  const firstName = input.name.trim().split(/\s+/)[0] || "there";
  const displayCompany = input.company.trim();
  const serviceFocus =
    input.service.trim() ||
    (input.need.length > 60 ? `${input.need.slice(0, 57)}...` : input.need) ||
    "your upcoming project";

  const subjectTarget = displayCompany
    ? `${displayCompany}: ${input.service.trim() || "Project inquiry"}`
    : `Your project: ${input.service.trim() || "Scope & next steps"}`;

  let summary = "";
  let next_step = "";
  let email_body = "";

  if (tier === "hot") {
    summary = `${
      displayCompany ? `${displayCompany} inquiry` : "Inbound lead"
    }${input.name ? ` from ${input.name}` : ""} with strong ${
      input.budget || "allocated"
    } budget${
      input.timeline ? ` and urgent ${input.timeline.toLowerCase()} timeline` : ""
    } focused on ${serviceFocus}.`;
    next_step =
      "Send calendar link for a 15-minute scoping call and share relevant B2B case studies.";
    email_body = `Hi ${firstName},\n\nThanks for reaching out${
      displayCompany ? ` from ${displayCompany}` : ""
    } regarding ${serviceFocus}. Given your ${
      input.timeline ? `${input.timeline.toLowerCase()} target` : "upcoming launch"
    }${
      input.budget ? ` and ${input.budget} budget` : ""
    }, this looks like a strong fit for our team.\n\nAre you available for a quick 15-minute discovery call this week to review deliverables and timeline?\n\nBest,\nLeadPilot Team`;
  } else if (tier === "warm") {
    summary = `${
      displayCompany ? `${displayCompany} lead` : "Qualified prospect"
    }${input.name ? ` (${input.name})` : ""} exploring ${serviceFocus}${
      input.timeline ? ` for ${input.timeline.toLowerCase()}` : ""
    }${input.budget ? ` at ${input.budget}` : ""}.`;
    next_step =
      "Email a package overview and ask two clarifying questions about scope and stakeholders.";
    email_body = `Hi ${firstName},\n\nThank you for getting in touch${
      displayCompany ? ` about ${displayCompany}` : ""
    } and sharing your goals around ${serviceFocus}.\n\nI've put together a short overview of packages that match your ${
      input.timeline ? `${input.timeline.toLowerCase()} window` : "timeline"
    }. Could you share a bit more about your target milestones so I can tailor a proposal?\n\nBest,\nLeadPilot Team`;
  } else {
    summary = `Early-stage inquiry${
      displayCompany ? ` from ${displayCompany}` : ""
    } regarding ${serviceFocus} with ${
      input.budget ? `a limited ${input.budget} budget` : "unconfirmed budget"
    } and flexible timing.`;
    next_step =
      "Send lightweight starter resources and place in quarterly nurture sequence.";
    email_body = `Hi ${firstName},\n\nThanks for reaching out${
      displayCompany ? ` about ${displayCompany}` : ""
    } and sharing your early plans around ${serviceFocus}.\n\nWhile you're finalizing scope and timing, I'm sharing a concise planning checklist to help prioritize quick wins before committing to a full engagement.\n\nFeel free to reply anytime your timeline firms up.\n\nBest,\nLeadPilot Team`;
  }

  return {
    score: clampedScore,
    tier,
    summary,
    next_step,
    email_subject: subjectTarget,
    email_body,
    draft_subject: subjectTarget,
    draft_body: email_body,
  };
}

function loadLeads(): LeadRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_LEADS, null, 2), "utf8");
      return [...SEED_LEADS];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as LeadRecord[];
    }
  } catch (err) {
    console.error("Failed to read leads store, using seed data:", err);
  }
  return [...SEED_LEADS];
}

function saveLeads(leads: LeadRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to persist leads:", err);
  }
}

function toSummaryLead(lead: LeadRecord) {
  const { messages: _messages, ...summary } = lead;
  return summary;
}

function shouldSimulateError(req: express.Request): boolean {
  const headerVal = String(req.headers["x-simulate-error"] ?? "").toLowerCase();
  const queryVal = String(req.query.simulate_error ?? "").toLowerCase();
  const bodyVal = Boolean((req.body as Record<string, unknown> | undefined)?.simulateError);
  return (
    headerVal === "true" ||
    headerVal === "1" ||
    queryVal === "true" ||
    queryVal === "1" ||
    bodyVal
  );
}

export function createLeadPilotApiApp() {
  const app = express();

  // Safely handle pre-parsed JSON bodies in serverless environments (e.g., Vercel)
  app.use((req, res, next) => {
    if (req.body !== undefined && typeof req.body === "object" && req.body !== null) {
      next();
      return;
    }
    express.json()(req, res, next);
  });

  let leads = loadLeads();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Simulate-Error");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.get("/api/stats", (_req, res) => {
    res.json({
      total: leads.length,
      hot: leads.filter((l) => l.tier === "hot").length,
      warm: leads.filter((l) => l.tier === "warm").length,
      cold: leads.filter((l) => l.tier === "cold").length,
      new: leads.filter((l) => l.status === "new").length,
      won: leads.filter((l) => l.status === "won").length,
    });
  });

  app.get("/api/leads", (req, res) => {
    const tierParam =
      typeof req.query.tier === "string" ? req.query.tier.toLowerCase() : "";
    let result = [...leads];
    if (tierParam) {
      if (tierParam !== "hot" && tierParam !== "warm" && tierParam !== "cold") {
        res
          .status(400)
          .json({ detail: "Invalid tier filter. Use hot, warm, or cold." });
        return;
      }
      result = result.filter((l) => l.tier === tierParam);
    }
    result.sort((a, b) => b.score - a.score || b.updated - a.updated);
    res.json(result.map(toSummaryLead));
  });

  app.post("/api/leads", (req, res) => {
    if (shouldSimulateError(req)) {
      res.status(502).json({
        detail: "Simulated 502: The AI qualification service failed, please try again.",
      });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = String(body.name ?? body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const company = String(body.company ?? "").trim();
    const service = String(body.service ?? body.serviceNeeded ?? "").trim();
    const website = String(body.website ?? "").trim();
    const budget = String(body.budget ?? body.monthlyBudget ?? "").trim();
    const timeline = String(body.timeline ?? "").trim();
    const source = String(body.source ?? "form").trim() || "form";

    const notes = String(body.notes ?? body.projectNotes ?? "").trim();
    const rawMessage = String(body.message ?? "").trim();
    const combinedNeed =
      rawMessage || [service, notes].filter(Boolean).join(" — ");

    if (!email && !phone && !combinedNeed) {
      res.status(400).json({
        detail: "Provide at least one of email, phone, or message.",
      });
      return;
    }

    const scored = qualifyLeadLocally({
      name,
      email,
      phone,
      company,
      service,
      website,
      need: combinedNeed,
      budget,
      timeline,
    });

    const now = Math.floor(Date.now() / 1000);
    const nextId = leads.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    const newLead: LeadRecord = {
      id: nextId,
      source,
      name: name || company || email || "Inbound Lead",
      email,
      phone,
      company,
      service,
      website,
      need: combinedNeed,
      budget,
      timeline,
      score: scored.score,
      tier: scored.tier,
      summary: scored.summary,
      next_step: scored.next_step,
      email_subject: scored.email_subject,
      email_body: scored.email_body,
      draft_subject: scored.draft_subject,
      draft_body: scored.draft_body,
      status: "new",
      qualified: 1,
      created: now,
      updated: now,
      messages: combinedNeed
        ? [{ role: "user", content: combinedNeed, ts: now }]
        : [],
    };

    leads = [newLead, ...leads];
    saveLeads(leads);
    res.status(201).json(toSummaryLead(newLead));
  });

  app.get("/api/leads/:id", (req, res) => {
    const id = Number(req.params.id);
    const lead = leads.find((l) => l.id === id);
    if (!lead) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }
    res.json(lead);
  });

  app.patch("/api/leads/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }

    const nextStatus = (req.body as Record<string, unknown> | undefined)?.status;
    if (
      nextStatus !== "new" &&
      nextStatus !== "contacted" &&
      nextStatus !== "won" &&
      nextStatus !== "lost"
    ) {
      res.status(400).json({
        detail:
          "Invalid status. Allowed values are new, contacted, won, and lost.",
      });
      return;
    }

    const updated: LeadRecord = {
      ...leads[index],
      status: nextStatus,
      updated: Math.floor(Date.now() / 1000),
    };
    leads[index] = updated;
    saveLeads(leads);
    res.json(updated);
  });

  app.post("/api/leads/:id/requalify", (req, res) => {
    if (shouldSimulateError(req)) {
      res.status(502).json({
        detail: "Simulated 502: The AI qualification service failed, please try again.",
      });
      return;
    }

    const id = Number(req.params.id);
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }

    const current = leads[index];
    const scored = qualifyLeadLocally({
      name: current.name,
      email: current.email,
      phone: current.phone,
      company: current.company,
      service: current.service ?? "",
      website: current.website,
      need: current.need,
      budget: current.budget,
      timeline: current.timeline,
    });

    const updated: LeadRecord = {
      ...current,
      score: scored.score,
      tier: scored.tier,
      summary: scored.summary,
      next_step: scored.next_step,
      email_subject: scored.email_subject,
      email_body: scored.email_body,
      draft_subject: scored.draft_subject,
      draft_body: scored.draft_body,
      qualified: 1,
      updated: Math.floor(Date.now() / 1000),
    };
    leads[index] = updated;
    saveLeads(leads);
    res.json(updated);
  });

  return app;
}
