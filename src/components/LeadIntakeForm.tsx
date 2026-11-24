import React, { useState } from "react";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import {
  ApiHttpError,
  IntakeFormValues,
  Lead,
  LeadPayload,
  apiRequest,
  mapFormToLeadPayload,
} from "../types/lead";

interface LeadIntakeFormProps {
  apiBaseUrl: string;
  simulateError?: boolean;
  onLeadScored: (lead: Lead) => void;
  onQualificationError: (error: {
    status: number;
    message: string;
    lastPayload: LeadPayload;
  }) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const INITIAL_FORM: IntakeFormValues = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  monthlyBudget: "",
  timeline: "",
  serviceNeeded: "",
  projectNotes: "",
};

const DEMO_SAMPLE: IntakeFormValues = {
  fullName: "Nadia Qureshi",
  email: "nadia@nordicpay.co",
  phone: "+44 20 7946 0821",
  company: "NordicPay",
  website: "https://nordicpay.co",
  monthlyBudget: "$3,200 per month",
  timeline: "This month",
  serviceNeeded: "B2B onboarding redesign & conversion analytics",
  projectNotes:
    "We need to cut merchant drop-off during KYC setup ahead of our Series A partner rollout next month.",
};

export default function LeadIntakeForm({
  apiBaseUrl,
  simulateError = false,
  onLeadScored,
  onQualificationError,
  inputRef,
}: LeadIntakeFormProps) {
  const [form, setForm] = useState<IntakeFormValues>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleLoadSample = () => {
    setForm(DEMO_SAMPLE);
    setValidationError(null);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const payload = mapFormToLeadPayload(form);

    // Spec: You need to send at least one of email, phone or message. Otherwise 400.
    if (!payload.email && !payload.phone && !payload.message) {
      setValidationError(
        "Provide at least an email address, phone number, or project message to qualify a lead."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const scored = await apiRequest<Lead>(apiBaseUrl, "/api/leads", {
        method: "POST",
        headers: simulateError ? { "X-Simulate-Error": "true" } : undefined,
        body: JSON.stringify(payload),
      });
      onLeadScored(scored);
      setForm(INITIAL_FORM);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        if (err.status === 400) {
          setValidationError(err.detail);
        } else {
          onQualificationError({
            status: err.status,
            message: err.detail,
            lastPayload: payload,
          });
        }
      } else {
        onQualificationError({
          status: 502,
          message: "Could not reach the LeadPilot API server.",
          lastPayload: payload,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 sm:p-6"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Lead Intake
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Local demo workspace — avoid entering real client data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={isSubmitting}
              className="whitespace-nowrap shrink-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              Fill sample lead
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              aria-label="Clear form"
              className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {validationError && (
          <div
            role="alert"
            className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800"
          >
            <span className="font-semibold">Validation error:</span>{" "}
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="intake-fullName"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Full Name
            </label>
            <input
              ref={inputRef}
              id="intake-fullName"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Priya Nair"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="intake-email"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="intake-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="priya.nair@lumenskin.co"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="intake-company"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Company
            </label>
            <input
              id="intake-company"
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Lumen Skin"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="intake-phone"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Phone (optional)
            </label>
            <input
              id="intake-phone"
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 415 555 0199"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="intake-monthlyBudget"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Monthly Budget
            </label>
            <input
              id="intake-monthlyBudget"
              type="text"
              name="monthlyBudget"
              value={form.monthlyBudget}
              onChange={handleChange}
              placeholder="$800 per month"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="intake-timeline"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Timeline
            </label>
            <input
              id="intake-timeline"
              type="text"
              name="timeline"
              value={form.timeline}
              onChange={handleChange}
              placeholder="Next quarter"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="intake-serviceNeeded"
              className="mb-1.5 block text-xs font-medium text-slate-700"
            >
              Service Needed
            </label>
            <input
              id="intake-serviceNeeded"
              type="text"
              name="serviceNeeded"
              value={form.serviceNeeded}
              onChange={handleChange}
              placeholder="Social media management"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="intake-website"
              className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs font-medium text-slate-700"
            >
              <span>Website</span>
              <span className="text-[11px] font-normal text-slate-400">
                Optional · skipped in API payload
              </span>
            </label>
            <input
              id="intake-website"
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://lumenskin.co"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="intake-projectNotes"
            className="mb-1.5 block text-xs font-medium text-slate-700"
          >
            Project Notes
          </label>
          <textarea
            id="intake-projectNotes"
            name="projectNotes"
            rows={3}
            value={form.projectNotes}
            onChange={handleChange}
            placeholder="We are a skincare brand and want help with Instagram and TikTok next quarter."
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-slate-500">
          Requires email, phone, or project message
        </span>
        <button
          type="submit"
          disabled={isSubmitting}
          className="whitespace-nowrap shrink-0 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Qualifying lead...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Qualify Lead</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
