import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

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

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function qualifyLeadWithAI(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  need: string;
  budget: string;
  timeline: string;
}): Promise<{
  score: number;
  tier: LeadTier;
  summary: string;
  next_step: string;
  email_subject: string;
  email_body: string;
}> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }

  const prompt = `Evaluate this inbound sales lead and generate a qualification assessment plus a tailored follow-up email draft.

Lead Details:
- Name: ${input.name || "Not provided"}
- Email: ${input.email || "Not provided"}
- Phone: ${input.phone || "Not provided"}
- Company: ${input.company || "Not provided"}
- Website: ${input.website || "Not provided"}
- Budget: ${input.budget || "Not specified"}
- Timeline: ${input.timeline || "Not specified"}
- Project Need / Message: ${input.need || "Not provided"}

Scoring Rubric:
- 70 to 100 (hot): Clear business need, strong budget ($1,500+/mo or clear project budget), and urgent/near-term timeline (immediate, this month, within weeks).
- 40 to 69 (warm): Real project need with moderate or unclear budget/timeline (e.g., next quarter, $500-$1,499/mo).
- 0 to 39 (cold): Very low budget (<$400), vague exploration, no timeline, or minimal context.

Return concise, practical, natural B2B copy without placeholders like [Your Name]—sign off as "LeadPilot Team".`;

  const response = await ai.models.generateContent({
    model: "gemini-4-hydrogen",
    contents: prompt,
    config: {
      systemInstruction:
        "You are an expert B2B revenue operations analyst. Score leads objectively between 0 and 100 and write crisp, helpful follow-up emails.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: {
            type: Type.INTEGER,
            description: "Lead qualification score from 0 to 100.",
          },
          summary: {
            type: Type.STRING,
            description: "1-2 sentence executive qualification summary.",
          },
          next_step: {
            type: Type.STRING,
            description: "Concrete recommended next action for the sales rep.",
          },
          email_subject: {
            type: Type.STRING,
            description: "Short, clear follow-up email subject line.",
          },
          email_body: {
            type: Type.STRING,
            description: "Personalized follow-up email draft ready to send.",
          },
        },
        required: [
          "score",
          "summary",
          "next_step",
          "email_subject",
          "email_body",
        ],
      },
    },
  });

  const rawText = (response.text ?? "").trim();
  if (!rawText) {
    throw new Error("Empty response from Gemini AI service.");
  }

  const parsed = JSON.parse(rawText) as {
    score?: number;
    summary?: string;
    next_step?: string;
    email_subject?: string;
    email_body?: string;
  };

  const clampedScore = Math.max(
    0,
    Math.min(100, Math.round(Number(parsed.score ?? 50)))
  );
  return {
    score: clampedScore,
    tier: computeTier(clampedScore),
    summary: String(parsed.summary ?? "").trim() || "Lead evaluated.",
    next_step:
      String(parsed.next_step ?? "").trim() || "Follow up via email.",
    email_subject:
      String(parsed.email_subject ?? "").trim() || "Your project inquiry",
    email_body:
      String(parsed.email_body ?? "").trim() || "Thanks for getting in touch.",
  };
}

export function createLeadPilotApiApp() {
  const app = express();
  app.use(express.json());

  let leads = loadLeads();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
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

  app.post("/api/leads", async (req, res) => {
    const body = req.body ?? {};
    const name = String(body.name ?? body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const company = String(body.company ?? "").trim();
    const website = String(body.website ?? "").trim();
    const budget = String(body.budget ?? body.monthlyBudget ?? "").trim();
    const timeline = String(body.timeline ?? "").trim();
    const source = String(body.source ?? "form").trim() || "form";

    const rawMessage = String(body.message ?? "").trim();
    const combinedNeed =
      rawMessage ||
      [
        String(body.serviceNeeded ?? "").trim(),
        String(body.projectNotes ?? "").trim(),
      ]
        .filter(Boolean)
        .join(" — ");

    if (!email && !phone && !combinedNeed) {
      res.status(400).json({
        detail: "Provide at least one of email, phone, or message.",
      });
      return;
    }

    try {
      const aiResult = await qualifyLeadWithAI({
        name,
        email,
        phone,
        company,
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
        website,
        need: combinedNeed,
        budget,
        timeline,
        score: aiResult.score,
        tier: aiResult.tier,
        summary: aiResult.summary,
        next_step: aiResult.next_step,
        email_subject: aiResult.email_subject,
        email_body: aiResult.email_body,
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
    } catch (err) {
      console.error("AI qualification error on POST /api/leads:", err);
      res.status(502).json({
        detail: "The AI qualification service failed, please try again.",
      });
    }
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

    const nextStatus = req.body?.status;
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

  app.post("/api/leads/:id/requalify", async (req, res) => {
    const id = Number(req.params.id);
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }

    const current = leads[index];
    try {
      const aiResult = await qualifyLeadWithAI({
        name: current.name,
        email: current.email,
        phone: current.phone,
        company: current.company,
        website: current.website,
        need: current.need,
        budget: current.budget,
        timeline: current.timeline,
      });

      const updated: LeadRecord = {
        ...current,
        score: aiResult.score,
        tier: aiResult.tier,
        summary: aiResult.summary,
        next_step: aiResult.next_step,
        email_subject: aiResult.email_subject,
        email_body: aiResult.email_body,
        qualified: 1,
        updated: Math.floor(Date.now() / 1000),
      };
      leads[index] = updated;
      saveLeads(leads);
      res.json(updated);
    } catch (err) {
      console.error(
        "AI qualification error on POST /api/leads/:id/requalify:",
        err
      );
      res.status(502).json({
        detail: "The AI qualification service failed, please try again.",
      });
    }
  });

  return app;
}
