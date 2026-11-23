import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FileCode2,
  LayoutDashboard,
  ListFilter,
  Menu,
  Plus,
  X,
} from "lucide-react";
import ApiReferenceView from "./components/ApiReferenceView";
import FollowUpDrawer from "./components/FollowUpDrawer";
import LeadIntakeForm from "./components/LeadIntakeForm";
import PipelineStatusChart from "./components/PipelineStatusChart";
import PipelineTable from "./components/PipelineTable";
import QualificationResultCard from "./components/QualificationResultCard";
import {
  ApiHttpError,
  CONFIGURED_API_BASE_URL,
  Lead,
  LeadPayload,
  LeadStats,
  LeadStatus,
  LeadTier,
  apiRequest,
} from "./types/lead";

type WorkspaceTab = "workspace" | "pipeline" | "api";

const EMPTY_STATS: LeadStats = {
  total: 0,
  hot: 0,
  warm: 0,
  cold: 0,
  new: 0,
  won: 0,
};

const TAB_TITLES: Record<WorkspaceTab, string> = {
  workspace: "Qualification & Pipeline",
  pipeline: "Pipeline Queue",
  api: "API & Backend Target",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("workspace");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Uses VITE_API_URL / NEXT_PUBLIC_API_URL when set, otherwise built-in /api/*
  const [apiBaseUrl, setApiBaseUrl] = useState(CONFIGURED_API_BASE_URL);
  const [simulateError, setSimulateError] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>(EMPTY_STATS);
  const [activeTier, setActiveTier] = useState<"all" | LeadTier>("all");
  const [activeStatus, setActiveStatus] = useState<"all" | LeadStatus>("all");
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [latestScoredLead, setLatestScoredLead] = useState<Lead | null>(null);
  const [qualificationError, setQualificationError] = useState<{
    status: number;
    message: string;
    lastPayload: LeadPayload;
  } | null>(null);
  const [isRetryingQualification, setIsRetryingQualification] = useState(false);

  const [drawerLeadId, setDrawerLeadId] = useState<number | null>(null);
  const [drawerInitialLead, setDrawerInitialLead] = useState<Lead | null>(null);

  const intakeNameInputRef = useRef<HTMLInputElement | null>(null);

  const fetchDashboardData = useCallback(
    async (tierFilter: "all" | LeadTier) => {
      setIsLoadingLeads(true);
      setLoadError(null);
      try {
        const tierQuery = tierFilter === "all" ? "" : `?tier=${tierFilter}`;
        const [leadsData, statsData] = await Promise.all([
          apiRequest<Lead[]>(apiBaseUrl, `/api/leads${tierQuery}`),
          apiRequest<LeadStats>(apiBaseUrl, "/api/stats"),
        ]);
        setLeads(leadsData);
        setStats(statsData);
        setLatestScoredLead((prev) => {
          if (prev) {
            const refreshed = leadsData.find((l) => l.id === prev.id);
            return refreshed ?? prev;
          }
          return leadsData[0] ?? null;
        });
      } catch (err) {
        const detail =
          err instanceof ApiHttpError
            ? err.detail
            : "Could not reach the LeadPilot API.";
        setLoadError(detail);
      } finally {
        setIsLoadingLeads(false);
      }
    },
    [apiBaseUrl]
  );

  useEffect(() => {
    fetchDashboardData(activeTier);
  }, [fetchDashboardData, activeTier]);

  const handleLeadScored = async (scoredLead: Lead) => {
    setQualificationError(null);
    setLatestScoredLead(scoredLead);
    await fetchDashboardData(activeTier);
  };

  const handleQualificationError = (error: {
    status: number;
    message: string;
    lastPayload: LeadPayload;
  }) => {
    setQualificationError(error);
  };

  const handleRetryQualification = async () => {
    if (!qualificationError) return;
    setIsRetryingQualification(true);
    try {
      const scored = await apiRequest<Lead>(apiBaseUrl, "/api/leads", {
        method: "POST",
        headers: simulateError ? { "X-Simulate-Error": "true" } : undefined,
        body: JSON.stringify(qualificationError.lastPayload),
      });
      await handleLeadScored(scored);
    } catch (err) {
      const status = err instanceof ApiHttpError ? err.status : 502;
      const message =
        err instanceof ApiHttpError
          ? err.detail
          : "Could not reach the LeadPilot API server.";
      setQualificationError({
        status,
        message,
        lastPayload: qualificationError.lastPayload,
      });
    } finally {
      setIsRetryingQualification(false);
    }
  };

  const handleOpenDrawer = (lead: Lead) => {
    setDrawerInitialLead(lead);
    setDrawerLeadId(lead.id);
  };

  const handleOpenDrawerById = (leadId: number) => {
    const found =
      leads.find((l) => l.id === leadId) ??
      (latestScoredLead?.id === leadId ? latestScoredLead : null);
    setDrawerInitialLead(found);
    setDrawerLeadId(leadId);
  };

  const handleLeadUpdated = async (updated: Lead) => {
    setLatestScoredLead((prev) => (prev?.id === updated.id ? updated : prev));
    setDrawerInitialLead((prev) => (prev?.id === updated.id ? updated : prev));
    await fetchDashboardData(activeTier);
  };

  const handleFocusNewLead = () => {
    setActiveTab("workspace");
    setMobileNavOpen(false);
    setTimeout(() => {
      intakeNameInputRef.current?.focus();
      intakeNameInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 60);
  };

  const handlePreviewErrorCard = () => {
    setQualificationError({
      status: 502,
      message: "Simulated 502: The AI qualification service failed, please try again.",
      lastPayload: {
        name: "Nadia Qureshi",
        email: "nadia@nordicpay.co",
        phone: "+44 20 7946 0821",
        company: "NordicPay",
        service: "B2B onboarding redesign & conversion analytics",
        website: "https://nordicpay.co",
        notes:
          "We need to cut merchant drop-off during KYC setup ahead of our Series A partner rollout next month.",
        message:
          "B2B onboarding redesign & conversion analytics — We need to cut merchant drop-off during KYC setup ahead of our Series A partner rollout next month.",
        budget: "$3,200 per month",
        timeline: "This month",
        source: "form",
      },
    });
    setActiveTab("workspace");
    setMobileNavOpen(false);
  };

  const navItems: Array<{
    id: WorkspaceTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "workspace", label: "Intake & Scoring", icon: LayoutDashboard },
    { id: "pipeline", label: "Pipeline Queue", icon: ListFilter },
    { id: "api", label: "API & Backend", icon: FileCode2 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar (248px) */}
      <aside className="hidden w-62 shrink-0 flex-col justify-between border-r border-slate-200 bg-white lg:flex">
        <div>
          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              LeadPilot
            </span>
          </div>

          <nav className="space-y-1 p-3" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Demo Workspace</p>
          <p className="mt-1 leading-relaxed">
            No login required. Avoid entering real client contact data.
          </p>
          <p className="mt-2 font-mono text-[11px] text-slate-400 truncate">
            Target: {apiBaseUrl || "Built-in /api"}
          </p>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 flex bg-slate-900/35 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <aside
            className="flex h-full w-64 flex-col justify-between border-r border-slate-200 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5">
                <span className="font-display text-base font-bold tracking-tight text-slate-900">
                  LeadPilot
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <nav className="space-y-1 p-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap shrink-0 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
              Target: {apiBaseUrl || "Built-in /api"}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary action on right */}
        <header className="flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:h-16 sm:gap-6 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="font-medium text-slate-400 whitespace-nowrap shrink-0 lg:hidden">
                LeadPilot
              </span>
              <span
                className="text-slate-300 lg:hidden"
                aria-hidden="true"
              >
                /
              </span>
              <h1 className="truncate font-semibold tracking-tight text-slate-900">
                {TAB_TITLES[activeTab]}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFocusNewLead}
            className="whitespace-nowrap shrink-0 inline-flex h-10 items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:h-9 sm:px-4"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Lead</span>
          </button>
        </header>

        {/* Main Viewport */}
        <main className="mx-auto w-full max-w-[1280px] flex-1 space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
          {/* Global Load Error */}
          {loadError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => fetchDashboardData(activeTier)}
                className="whitespace-nowrap shrink-0 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-100"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Header Stats Grid (GET /api/stats) */}
          {activeTab !== "api" && (
            <section
              aria-label="Pipeline summary statistics"
              className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-6"
            >
              <div className="bg-white px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="text-xs font-medium text-slate-500">
                  Total Leads
                </div>
                <div className="mt-1 font-mono tabular-nums text-xl font-semibold text-slate-900 sm:text-2xl">
                  {stats.total}
                </div>
              </div>
              <div className="bg-white px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="text-xs font-medium text-emerald-700">
                  Hot (70+)
                </div>
                <div className="mt-1 font-mono tabular-nums text-xl font-semibold text-slate-900 sm:text-2xl">
                  {stats.hot}
                </div>
              </div>
              <div className="bg-white px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="text-xs font-medium text-amber-700">
                  Warm (40–69)
                </div>
                <div className="mt-1 font-mono tabular-nums text-xl font-semibold text-slate-900 sm:text-2xl">
                  {stats.warm}
                </div>
              </div>
              <div className="bg-white px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="text-xs font-medium text-sky-700">
                  Cold (&lt;40)
                </div>
                <div className="mt-1 font-mono tabular-nums text-xl font-semibold text-slate-900 sm:text-2xl">
                  {stats.cold}
                </div>
              </div>
              <div className="bg-white px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="text-xs font-medium text-indigo-700">
                  Draft Ready
                </div>
                <div className="mt-1 font-mono tabular-nums text-xl font-semibold text-slate-900 sm:text-2xl">
                  {stats.new}
                </div>
              </div>
              <div className="bg-white px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="text-xs font-medium text-slate-600">Won</div>
                <div className="mt-1 font-mono tabular-nums text-xl font-semibold text-slate-900 sm:text-2xl">
                  {stats.won}
                </div>
              </div>
            </section>
          )}

          {activeTab === "workspace" && (
            <>
              {/* Split Intake & Result View */}
              <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <LeadIntakeForm
                    apiBaseUrl={apiBaseUrl}
                    simulateError={simulateError}
                    onLeadScored={handleLeadScored}
                    onQualificationError={handleQualificationError}
                    inputRef={intakeNameInputRef}
                  />
                </div>
                <div className="lg:col-span-5">
                  <QualificationResultCard
                    lead={latestScoredLead}
                    aiError={
                      qualificationError
                        ? {
                            status: qualificationError.status,
                            message: qualificationError.message,
                          }
                        : null
                    }
                    onRetry={handleRetryQualification}
                    onInspectFollowUp={handleOpenDrawerById}
                    isRetrying={isRetryingQualification}
                  />
                </div>
              </div>

              {/* Pipeline Health Visualization */}
              <PipelineStatusChart
                leads={leads}
                activeTier={activeTier}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
                isLoading={isLoadingLeads}
              />

              {/* Pipeline Table */}
              <PipelineTable
                leads={leads}
                activeTier={activeTier}
                onTierChange={setActiveTier}
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
                onSelectLead={(lead) => {
                  setLatestScoredLead(lead);
                  setQualificationError(null);
                  handleOpenDrawer(lead);
                }}
                onAddLeadClick={handleFocusNewLead}
                isLoading={isLoadingLeads}
                selectedLeadId={drawerLeadId}
              />
            </>
          )}

          {activeTab === "pipeline" && (
            <>
              <PipelineStatusChart
                leads={leads}
                activeTier={activeTier}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
                isLoading={isLoadingLeads}
              />

              <PipelineTable
                leads={leads}
                activeTier={activeTier}
                onTierChange={setActiveTier}
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
                onSelectLead={(lead) => {
                  setLatestScoredLead(lead);
                  handleOpenDrawer(lead);
                }}
                onAddLeadClick={handleFocusNewLead}
                isLoading={isLoadingLeads}
                selectedLeadId={drawerLeadId}
              />
            </>
          )}

          {activeTab === "api" && (
            <ApiReferenceView
              apiBaseUrl={apiBaseUrl}
              onChangeApiBaseUrl={(nextUrl) => setApiBaseUrl(nextUrl)}
              simulateError={simulateError}
              onToggleSimulateError={setSimulateError}
              onPreviewErrorCard={handlePreviewErrorCard}
            />
          )}
        </main>
      </div>

      {/* Follow-Up Status Drawer */}
      <FollowUpDrawer
        apiBaseUrl={apiBaseUrl}
        simulateError={simulateError}
        leadId={drawerLeadId}
        initialLead={drawerInitialLead}
        onClose={() => setDrawerLeadId(null)}
        onLeadUpdated={handleLeadUpdated}
      />
    </div>
  );
}
