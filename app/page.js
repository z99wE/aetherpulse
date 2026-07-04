"use client";

import { useEffect, useMemo, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring
} from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Cloud,
  Layers3,
  LineChart,
  MapPinned,
  MessageSquareMore,
  Radar,
  ShieldCheck,
  Sparkles,
  ServerCog,
  Workflow,
  Zap
} from "lucide-react";
import { buildDecisionEngine } from "@/lib/decision-engine";
import { scenarios } from "@/lib/mock-data";
import { LookerWorkspace } from "@/components/looker-workspace";
import { AuthPanel } from "@/components/auth-panel";

const heroMetrics = [
  { value: "24.8k", label: "signals analyzed / day" },
  { value: "6 min", label: "median anomaly detection" },
  { value: "91%", label: "explanation confidence" },
  { value: "3", label: "clicks from signal to action" }
];

const pillars = [
  {
    icon: Radar,
    title: "See the signal",
    copy:
      "Bring together telemetry, citizen feedback, and service logs into one neighborhood view."
  },
  {
    icon: Sparkles,
    title: "Reason with AI",
    copy:
      "The model turns raw spikes into clear causes, forecasts, and recommended moves."
  },
  {
    icon: Workflow,
    title: "Act automatically",
    copy:
      "The app can dispatch alerts, create tickets, and schedule follow-ups."
  },
  {
    icon: ShieldCheck,
    title: "Stay explainable",
    copy:
      "Every answer shows the evidence trail so civic teams can trust what the system is telling them."
  }
];

const serviceCards = [
  {
    name: "Signal intake",
    copy: "Pulls feeds, citizen notes, and service logs into one working view.",
    icon: Radar,
    color: "bg-[#8bd3ff]"
  },
  {
    name: "Risk scoring",
    copy: "Ranks what is most urgent, what is probably next, and what needs attention now.",
    icon: Sparkles,
    color: "bg-[#ffe38a]"
  },
  {
    name: "City memory",
    copy: "Keeps prior incidents, seasonality, and playbooks available for comparison.",
    icon: Layers3,
    color: "bg-[#a7f3d0]"
  },
  {
    name: "Action routing",
    copy: "Turns a recommendation into a task, alert, or follow-up without extra clicks.",
    icon: Zap,
    color: "bg-[#ff9fb0]"
  },
  {
    name: "Narrative layer",
    copy: "Turns raw output into a clear answer anyone on the team can read quickly.",
    icon: MessageSquareMore,
    color: "bg-[#c4b5fd]"
  },
  {
    name: "Ops dashboard",
    copy: "Packages the status view, trends, and deltas for decision makers.",
    icon: LineChart,
    color: "bg-[#ffd37a]"
  },
  {
    name: "Deployment path",
    copy: "Keeps the app container-ready for whichever cloud target the team chooses.",
    icon: ServerCog,
    color: "bg-[#9ee7ff]"
  }
];

const useCases = [
  {
    title: "Urban mobility",
    copy:
      "Predict route delays, compress rider complaints into one view, and reroute faster."
  },
  {
    title: "Utilities",
    copy:
      "Catch pressure drift, service anomalies, and complaint clusters before trust breaks."
  },
  {
    title: "Wellness",
    copy:
      "Detect heat risk, accessibility gaps, and neighborhoods that need relief first."
  }
];

const liveNarrative = [
  {
    title: "Collect",
    service: "Signal layer",
    copy: "Pulls transit, utility, weather, and service feedback into one baseline."
  },
  {
    title: "Score",
    service: "Risk model",
    copy: "Scores the anomaly, estimates impact, and surfaces the likely failure window."
  },
  {
    title: "Compare",
    service: "Memory layer",
    copy: "Pulls similar incidents and the most relevant playbook from prior cases."
  },
  {
    title: "Explain",
    service: "Narrative layer",
    copy: "Writes a concise civic summary and a technical trace side by side."
  },
  {
    title: "Act",
    service: "Workflow engine",
    copy: "Triggers notifications, tickets, and follow-up checks without losing context."
  }
];

const navLinks = [
  { id: "overview", label: "Overview" },
  { id: "signals", label: "Signal fabric" },
  { id: "decision", label: "Decision engine" },
  { id: "agent", label: "Agent trace" },
  { id: "stack", label: "Platform" },
  { id: "governance", label: "Governance" },
  { id: "contact", label: "Contact" }
];

const rollingCopy = [
  "Turn scattered city signals into one clear action",
  "See what changed before it becomes a service issue",
  "Catch risk early, route the next step, and keep teams aligned",
  "Make public operations feel faster, calmer, and easier to trust",
  "Give every team a clean view of what to do now",
  "Move from complaint to action without losing context",
  "Keep daily civic work readable, explainable, and on time"
];

const platformModules = [
  {
    title: "Signal intake",
    copy:
      "Blend telemetry, citizen text, and environmental context into one baseline before scoring risk.",
    badge: "Data"
  },
  {
    title: "Decision model",
    copy:
      "Fuse evidence, compare it to historical incidents, and rank the safest next action.",
    badge: "Scoring"
  },
  {
    title: "Automation relay",
    copy:
      "Route recommendations into a task stream so the city can act without waiting on a handoff.",
    badge: "Actions"
  },
  {
    title: "Executive lens",
    copy:
      "Package the same decision packet for operators, leadership, and service teams in one place.",
    badge: "Reports"
  }
];

const lookerTabs = [
  { id: "summary", label: "Summary" },
  { id: "drilldown", label: "Drill-down" },
  { id: "alerts", label: "Alerts" }
];

const lookerSlicers = [
  { label: "Region", value: "North corridor" },
  { label: "Ward group", value: "Priority wards" },
  { label: "Signal type", value: "Transit + service" },
  { label: "Time grain", value: "Week over week" }
];

const governanceCards = [
  {
    title: "Explainable by default",
    copy:
      "Every recommendation includes the evidence trail, confidence score, and the counterfactual if the city waits."
  },
  {
    title: "Demo mode is honest",
    copy:
      "This build runs on local heuristics and mock data, so the workflow is demoable now and can be swapped to live services later."
  },
  {
    title: "Orchestration-ready",
    copy:
      "The agent trace is structured to map straight into a real orchestration loop when the project moves from prototype to deployment."
  }
];

function buildPath(values, width = 520, height = 180) {
  const padding = 18;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const points = values.map((value, index) => {
    const x = padding + (usableWidth / (values.length - 1)) * index;
    const y = padding + usableHeight - value * usableHeight;
    return { x, y };
  });
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  return { line, area, points };
}

function getFallbackPayload(scenario) {
  const decision = buildDecisionEngine({
    scenarioId: scenario.id,
    question: scenario.questions.why
  });

  return {
    ingest: {
      streams: scenario.feeds,
      signalVector: scenario.signals,
      chart: scenario.chart
    },
    analysis: {
      answer: scenario.questions.why,
      metrics: {
        confidence: Math.round(scenario.confidence * 100),
        primarySignal: scenario.primarySignal
      },
      forecast: {
        projectedRisk: scenario.riskScore + 8,
        nextFailure: scenario.domain === "transportation"
          ? "Corridor slowdown and missed transfers"
          : scenario.domain === "utilities"
            ? "Localized service interruption"
            : "A wellness incident during peak heat"
      },
      similarIncidents: scenario.similarIncidents,
      modelTrace: [
        `question_tokens=5`,
        `ward=${scenario.ward}`,
        `baseline_band=critical`,
        `forecast_risk=${scenario.riskScore + 8}`,
        `retrieval_hits=${scenario.similarIncidents.length}`,
        `confidence=${Math.round(scenario.confidence * 100)}%`
      ]
    },
    recommendation: {
      title: scenario.action,
      summary:
        scenario.questions.next,
      riskIfIgnored: scenario.riskIfIgnored,
      responseWindow: scenario.responseWindow,
      actions: scenario.workflow
    },
    agentRun: {
      framework: "Orchestration",
      objective: `Resolve ${scenario.ward} service risk`,
      state: "execute",
      confidence: Math.round(scenario.confidence * 100),
      lifecycle: liveNarrative.map((item) => ({
        stage: item.title,
        service: item.service,
        note: item.copy
      })),
      toolCalls: [
        {
          service: "Data layer",
          action: "Query baseline",
          detail: "Pulled ward-level trend history and seasonal variance."
        },
        {
          service: "Scoring model",
          action: "Score anomaly",
          detail: "Estimated risk based on combined telemetry and public feedback."
        },
        {
          service: "Narrative layer",
          action: "Draft explanation",
          detail: "Turned the result into a civic-ready response."
        },
        {
          service: "Memory layer",
          action: "Retrieve playbook",
          detail: "Matched the pattern to similar incidents and response notes."
        },
        {
          service: "Workflow engine",
          action: "Trigger workflow",
          detail: "Prepared alert and ticket automation."
        }
      ]
    },
    decision,
    storage: {
      connected: false,
      source: "local-fallback"
    }
  };
}

function Marquee() {
  const duplicated = [...rollingCopy, ...rollingCopy];

  return (
    <div className="marquee border-b-[3px] border-black bg-[#f7f2e8]">
      <div className="marquee-track gap-3 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
        {duplicated.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white px-4 py-2 shadow-[4px_4px_0_0_#111]"
          >
            <span className="h-2 w-2 rounded-full bg-[#ff7d91]" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function CursorDot() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 700, damping: 45, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 700, damping: 45, mass: 0.25 });

  useEffect(() => {
    const move = (event) => {
      x.set(event.clientX - 8);
      y.set(event.clientY - 8);
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] h-4 w-4 rounded-full bg-white mix-blend-difference"
      style={{ x: springX, y: springY }}
    />
  );
}

function MotionButton({ children, className = "", variant = "primary", ...props }) {
  const styles =
    variant === "secondary"
      ? "bg-[#ffe98a] text-ink"
      : "bg-[#2f6bff] text-white";

  return (
    <motion.button
      whileHover={{ y: -3, boxShadow: "4px 4px 0 0 #111" }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 rounded-full border-[3px] border-black px-5 py-3 text-sm font-semibold shadow-[8px_8px_0_0_#111] transition will-change-transform ${styles} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function SectionHeading({ eyebrow, title, copy, align = "left" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] shadow-[6px_6px_0_0_#111]">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.05em] text-ink sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {copy ? (
        <p className="mt-4 text-base leading-7 text-ink-soft sm:text-lg">{copy}</p>
      ) : null}
    </motion.div>
  );
}

function Sparkline({ values }) {
  const { line, area, points } = useMemo(() => buildPath(values), [values]);
  return (
    <svg viewBox="0 0 520 180" className="h-full w-full">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f6bff" />
          <stop offset="100%" stopColor="#ff7d91" />
        </linearGradient>
      </defs>
      <path d={area} fill="rgba(47,107,255,0.18)" />
      <path d={line} fill="none" stroke="url(#lineGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="5.5" fill="#fff" stroke="#111" strokeWidth="3" />
      ))}
    </svg>
  );
}

function ServiceBrick({ name, copy, icon: Icon, color }) {
  return (
    <motion.article
      whileHover={{ y: -4, rotate: -0.4 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      className="relative rounded-[28px] border-[3px] border-black bg-white p-5 shadow-[8px_8px_0_0_#111]"
    >
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-black ${color} shadow-[5px_5px_0_0_#111]`}>
        <Icon className="h-6 w-6 text-ink" />
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.04em] text-ink">
        {name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{copy}</p>
    </motion.article>
  );
}

function ScenarioCard({ scenario, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[24px] border-[3px] border-black p-4 text-left transition ${
        active ? "bg-[#2f6bff] text-white shadow-[8px_8px_0_0_#111]" : "bg-white text-ink shadow-[8px_8px_0_0_#111]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">
            {scenario.tag}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl tracking-[-0.04em]">
            {scenario.title}
          </h3>
        </div>
        <div className={`rounded-full border-[3px] border-black px-3 py-1 text-xs font-bold shadow-[4px_4px_0_0_#111] ${
          active ? "bg-[#ffe98a] text-ink" : "bg-[#a7f3d0] text-ink"
        }`}>
          {scenario.riskScore}
        </div>
      </div>
      <p className={`mt-3 text-sm leading-6 ${active ? "text-white/85" : "text-ink-soft"}`}>
        {scenario.summary}
      </p>
    </button>
  );
}

export default function Page() {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [workspaceMode, setWorkspaceMode] = useState("overview");
  const [queryDraft, setQueryDraft] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activityLog, setActivityLog] = useState([
    { title: "Session ready", detail: "Demo data loaded and the workspace is interactive." }
  ]);
  const [payload, setPayload] = useState(() => getFallbackPayload(scenarios[0]));
  const [platformStatus, setPlatformStatus] = useState(null);
  const [demoInitState, setDemoInitState] = useState({
    loading: false,
    result: null
  });
  const [authState, setAuthState] = useState({
    loading: true,
    enabled: false,
    required: false,
    signedIn: false,
    session: null
  });
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    code: ""
  });
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("Session data is loading.");
  const [lookerTab, setLookerTab] = useState("summary");
  const [comparisonWard, setComparisonWard] = useState(scenarios[1].ward);

  const scenario = scenarios[activeScenarioIndex];
  const active = payload ?? getFallbackPayload(scenario);
  const activeAnalysis = active.analysis ?? getFallbackPayload(scenario).analysis;
  const activeRecommendation = active.recommendation ?? getFallbackPayload(scenario).recommendation;
  const activeAgent = active.agentRun ?? getFallbackPayload(scenario).agentRun;
  const activeIngest = active.ingest ?? getFallbackPayload(scenario).ingest;
  const activeDecision = active.decision ?? getFallbackPayload(scenario).decision;
  const activeProvider = active.provider ?? { source: "local", providerStatus: {} };
  const activeStorage = active.storage ?? { connected: false, source: "local-fallback" };
  const activeGcp = activeAnalysis.gcp ?? { bigquery: { connected: false, source: "local-fallback" } };

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!autoRotate) return;
      setActiveScenarioIndex((current) => (current + 1) % scenarios.length);
    }, 12000);

    return () => window.clearInterval(timer);
  }, [autoRotate]);

  useEffect(() => {
    let cancelled = false;
    const prompt = submittedQuery || `Why is ${scenario.ward} flagged?`;

    async function load() {
      try {
        const [ingestResponse, analysisResponse, recommendationResponse, agentResponse, decisionResponse] =
          await Promise.all([
            fetch(`/api/ingest?scenarioId=${scenario.id}`),
            fetch("/api/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ scenarioId: scenario.id, question: prompt })
            }),
            fetch("/api/recommend", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ scenarioId: scenario.id })
            }),
            fetch("/api/agent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ scenarioId: scenario.id })
            }),
            fetch(`/api/decision?scenarioId=${scenario.id}&question=${encodeURIComponent(prompt)}`)
          ]);

        const [ingestJson, analysisJson, recommendationJson, agentJson, decisionJson] = await Promise.all([
          ingestResponse.json(),
          analysisResponse.json(),
          recommendationResponse.json(),
          agentResponse.json(),
          decisionResponse.json()
        ]);

        if (!cancelled) {
          setPayload({
            ingest: ingestJson.batch,
            analysis: analysisJson.analysis,
            recommendation: recommendationJson.recommendation,
            agentRun: agentJson.agentRun,
            decision: decisionJson.decision,
            provider: analysisJson.provider,
            storage: ingestJson.storage
          });
        }
      } catch {
        if (!cancelled) {
          setPayload(getFallbackPayload(scenario));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [scenario.id, scenario.ward, submittedQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadPlatformStatus() {
      try {
        const response = await fetch("/api/platform");
        const json = await response.json();
        if (!cancelled) {
          setPlatformStatus(json);
        }
      } catch {
        if (!cancelled) {
          setPlatformStatus(null);
        }
      }
    }

    loadPlatformStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAuthState() {
      try {
        const response = await fetch("/api/auth/me");
        const json = await response.json();
        if (!cancelled) {
          const auth = json.auth ?? {};
          setAuthState({
            loading: false,
            enabled: Boolean(auth.enabled),
            required: Boolean(auth.required),
            signedIn: Boolean(auth.signedIn),
            session: auth.session ?? null
          });
          setAuthMessage(
            auth.signedIn
              ? `Signed in as ${auth.session?.name ?? "Analyst"}`
              : auth.enabled
                ? "Create a signed session to protect the live routes."
                : "Authentication is not enabled in this environment yet."
          );
        }
      } catch {
        if (!cancelled) {
          setAuthState({
            loading: false,
            enabled: false,
            required: false,
            signedIn: false,
            session: null
          });
          setAuthMessage("Authentication status could not be loaded.");
        }
      }
    }

    loadAuthState();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleQuestion(e) {
    e.preventDefault();
    const trimmed = queryDraft.trim();
    setSubmittedQuery(trimmed);
    if (trimmed) {
      setAutoRotate(false);
      setWorkspaceMode("live");
      recordAction("Question submitted", trimmed);
    }
  }

  async function handleDemoInit() {
    setDemoInitState({ loading: true, result: null });
    setWorkspaceMode("deploy");

    try {
      const response = await fetch("/api/demo", { method: "POST" });
      const json = await response.json();
      setDemoInitState({ loading: false, result: json.result ?? json });
      recordAction("Demo bundle initialized", "Baseline rows and manifest were prepared.");
    } catch {
      setDemoInitState({
        loading: false,
        result: {
          manifest: null,
          bigquery: { connected: false, source: "local-fallback" },
          storage: { connected: false, source: "local-fallback" }
        }
      });
      recordAction("Demo bundle fallback", "Demo data stayed local because a cloud path was unavailable.");
    }
  }

  const lookerStatus = platformStatus?.status?.looker ?? {
    live: false,
    title: "Civic operations review",
    dashboardUrl: null,
    status: "preview"
  };
  const lookerGeneratedAt = platformStatus?.status?.manifest?.generatedAt ?? null;
  const gkeStatus = platformStatus?.gke ?? {
    live: false,
    clusterName: "cyvix-gke",
    location: "asia-south1",
    namespace: "cyvix",
    image: "gcr.io/project/cyvix:latest",
    manifestPath: "k8s/gke/cyvix.yaml",
    commands: []
  };
  const platformLive = platformStatus?.status?.live ?? {
    cloudRun: true,
    bigquery: false,
    storage: false,
    looker: false,
    gke: false
  };
  const lookerMetrics = [
    {
      label: "Baseline risk",
      value: activeDecision.score.risk,
      note: `Ward ${scenario.ward.replace("Ward ", "")} prior state`
    },
    {
      label: "Projected risk",
      value: activeDecision.score.projectedRisk,
      note: "With the current signal mix"
    },
    {
      label: "Confidence",
      value: `${activeDecision.score.confidence}%`,
      note: "Model + retrieval agreement"
    },
    {
      label: "Similar cases",
      value: activeDecision.similarIncidents.length,
      note: "Historical pattern matches"
    }
  ];
  const lookerFilters = [
    { label: "Ward", value: scenario.ward },
    { label: "Domain", value: scenario.tag },
    { label: "Window", value: `${scenario.forecastWindowHours}h` },
    { label: "Source", value: scenario.primarySignal }
  ];
  const lookerSignals = scenario.signals.map((signal, index) => ({
    ...signal,
    tone:
      index % 4 === 0
        ? "bg-[#a7f3d0]"
        : index % 4 === 1
          ? "bg-[#8bd3ff]"
        : index % 4 === 2
          ? "bg-[#ffe98a]"
          : "bg-[#ff9fb0]"
  }));
  const comparisonScenario =
    scenarios.find((item) => item.ward === comparisonWard) ?? scenarios[0];
  const comparisonDelta = comparisonScenario.riskScore - scenario.riskScore;
  const trendRows = [
    {
      period: "This week",
      signal: scenario.riskScore,
      delta: "Current"
    },
    {
      period: "Last week",
      signal: Math.max(0, scenario.riskScore - 9),
      delta: "-9"
    },
    {
      period: "4 weeks ago",
      signal: Math.max(0, scenario.riskScore - 17),
      delta: "-17"
    }
  ];

  function recordAction(title, detail) {
    setActivityLog((current) => [{ title, detail }, ...current].slice(0, 4));
  }

  async function refreshAuthState() {
    try {
      const response = await fetch("/api/auth/me");
      const json = await response.json();
      const auth = json.auth ?? {};
      setAuthState({
        loading: false,
        enabled: Boolean(auth.enabled),
        required: Boolean(auth.required),
        signedIn: Boolean(auth.signedIn),
        session: auth.session ?? null
      });
      setAuthMessage(
        auth.signedIn
          ? `Signed in as ${auth.session?.name ?? "Analyst"}`
          : auth.enabled
            ? "Create a signed session to protect the live routes."
            : "Authentication is not enabled in this environment yet."
      );
    } catch {
      setAuthMessage("Authentication status could not be refreshed.");
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("Creating your session...");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "Could not create session");
      }

      setAuthForm((current) => ({ ...current, code: "" }));
      recordAction("Session created", `${json.session?.name ?? "Analyst"} is now signed in.`);
      await refreshAuthState();
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Could not create session.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    setAuthBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthState({
        loading: false,
        enabled: authState.enabled,
        required: authState.required,
        signedIn: false,
        session: null
      });
      setAuthMessage("Signed out.");
      recordAction("Session ended", "The signed cookie was cleared.");
    } catch {
      setAuthMessage("Could not sign out.");
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden cursor-none bg-[#f4efe6] text-ink">
      <CursorDot />
      <Marquee />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#a7f3d0] opacity-70 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[#ffd37a] opacity-70 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-[#8bd3ff] opacity-60 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1600px] gap-6 px-4 pb-8 pt-4 lg:grid-cols-[300px_1fr] lg:px-6">
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4 rounded-[32px] border-[3px] border-black bg-white p-5 shadow-[12px_12px_0_0_#111]">
            <div className="rounded-[24px] border-[3px] border-black bg-[#2f6bff] p-4 text-white shadow-[8px_8px_0_0_#111]">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">
                CyVix control room
              </div>
              <div className="mt-3 font-[family-name:var(--font-display)] text-3xl font-black tracking-[-0.06em]">
                Civic decisions, not slideware.
              </div>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Local heuristics power the demo now. The app is ready to connect to live cloud
                services when the team configures them.
              </p>
            </div>

            <nav className="space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="flex items-center justify-between rounded-[18px] border-[3px] border-black bg-[#f7f2e8] px-4 py-3 text-sm font-semibold text-ink shadow-[6px_6px_0_0_#111] transition hover:-translate-y-0.5"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              ))}
            </nav>

            <div className="grid gap-3">
              <div className="rounded-[20px] border-[3px] border-black bg-[#a7f3d0] p-4 shadow-[6px_6px_0_0_#111]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                  Engine mode
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.04em] text-ink">
                  Decision engine
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{activeDecision.engine.mode}</p>
              </div>
              <div className="rounded-[20px] border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                  Fusion score
                </p>
                <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-ink">
                  {activeDecision.score.fusion}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  Confidence {activeDecision.score.confidence}% and projected risk {activeDecision.score.projectedRisk}.
                </p>
              </div>
              <div className="rounded-[20px] border-[3px] border-black bg-[#ffe98a] p-4 shadow-[6px_6px_0_0_#111]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                  Provider
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.04em] text-ink">
                  {activeProvider.source.toUpperCase()}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  {activeProvider.providerStatus?.gemini
                    ? "Gemini is connected for narrative enrichment."
                    : null}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  {activeProvider.providerStatus?.groq
                    ? "Narrative enrichment is connected."
                  : activeProvider.providerStatus?.nim
                    ? "Narrative enrichment is connected."
                    : "Local fallback is active."}
                </p>
              </div>
              <div className="rounded-[20px] border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                  Cloud data plane
                </p>
                <p className="mt-2 text-lg font-black tracking-[-0.04em] text-ink">
                  {activeGcp.bigquery?.connected ? "Data plane live" : "Data plane fallback"}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  {activeStorage.connected
                    ? `Storage writes to ${activeStorage.bucket}.`
                    : "Storage stays local until a bucket is configured."}
                </p>
              </div>

              <AuthPanel
                authState={authState}
                authForm={authForm}
                setAuthForm={setAuthForm}
                authBusy={authBusy}
                authMessage={authMessage}
                onSubmit={handleAuthSubmit}
                onLogout={handleLogout}
                onRefresh={refreshAuthState}
              />
            </div>
          </div>
        </aside>

      <main className="relative z-10">
        <section id="overview" className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="rounded-[28px] border-[3px] border-black bg-white px-4 py-3 shadow-[10px_10px_0_0_#111] sm:px-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-black bg-[#2f6bff] text-xl font-black text-white shadow-[5px_5px_0_0_#111]">
                  C
                </div>
                <div>
                  <div className="font-[family-name:var(--font-display)] text-2xl font-black tracking-[-0.05em]">
                    CyVix
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
                    Civic Decision Intelligence
                  </p>
                </div>
              </div>

              <nav className="hidden items-center gap-5 text-sm font-semibold text-ink-soft md:flex">
                {navLinks.slice(0, 4).map((link) => (
                  <a key={link.id} href={`#${link.id}`} className="hover:text-ink">
                    {link.label}
                  </a>
                ))}
              </nav>

              <MotionButton
                variant="secondary"
                className="hidden sm:inline-flex"
                onClick={() => {
                  setWorkspaceMode("live");
                  setAutoRotate(false);
                  setActiveScenarioIndex((current) => (current + 1) % scenarios.length);
                  recordAction("Live demo opened", "A fresh scenario loaded into the workspace.");
                }}
              >
                Request demo
                <ArrowRight className="h-4 w-4" />
              </MotionButton>
            </div>
          </motion.header>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#ffe98a] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] shadow-[8px_8px_0_0_#111]">
                <BadgeCheck className="h-4 w-4" />
                Built for city teams
              </div>

              <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-5xl font-black leading-[0.92] tracking-[-0.07em] text-ink sm:text-6xl lg:text-8xl">
                See the city before it feels the problem.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-ink-soft sm:text-xl">
                CyVix turns public signals, service telemetry, and citizen feedback into one living
                decision layer. Ask in natural language, spot risk early, and move from signal to
                action without leaving the room.
              </p>

              <div className="flex flex-wrap gap-3">
                <MotionButton
                  onClick={() => {
                    setWorkspaceMode("live");
                    setAutoRotate(false);
                    document.getElementById("agent")?.scrollIntoView({ behavior: "smooth" });
                    recordAction("Live analysis started", "The workspace is now focused on the active ward.");
                  }}
                >
                  Start the live demo
                  <ArrowRight className="h-4 w-4" />
                </MotionButton>
                <MotionButton
                  variant="secondary"
                  onClick={() => {
                    setWorkspaceMode("ops");
                    document.getElementById("stack")?.scrollIntoView({ behavior: "smooth" });
                    recordAction("Operations view opened", "The workspace shifted to system and deployment details.");
                  }}
                >
                  Open operations
                </MotionButton>
              </div>

              <div className="rounded-[28px] border-[3px] border-black bg-white p-3 shadow-[8px_8px_0_0_#111]">
              <div className="flex flex-wrap gap-2">
                {[
                  ["overview", "Overview"],
                  ["live", "Live run"],
                  ["ops", "Operations"],
                    ["deploy", "Deploy"]
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setWorkspaceMode(mode);
                        recordAction(`${label} mode`, "The workspace view changed.");
                      }}
                      className={`rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_0_#111] ${
                        workspaceMode === mode ? "bg-[#2f6bff] text-white" : "bg-[#f7f2e8] text-ink"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:hidden">
              <AuthPanel
                authState={authState}
                authForm={authForm}
                setAuthForm={setAuthForm}
                authBusy={authBusy}
                authMessage={authMessage}
                onSubmit={handleAuthSubmit}
                onLogout={handleLogout}
                onRefresh={refreshAuthState}
              />
            </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {heroMetrics.map((metric) => (
                  <motion.div
                    key={metric.label}
                    whileHover={{ y: -3 }}
                    className="rounded-[24px] border-[3px] border-black bg-white p-4 shadow-[8px_8px_0_0_#111]"
                  >
                    <div className="text-3xl font-black tracking-[-0.06em] text-ink">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-ink-muted">{metric.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {["Transit", "Utilities", "Wellness", "Public services", "Forecasting", "Explainable AI"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border-[3px] border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] shadow-[6px_6px_0_0_#111]"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -right-2 -top-4 z-20 rounded-full border-[3px] border-black bg-[#ff7d91] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[6px_6px_0_0_#111]">
                Live AI loop
              </div>

              <div className="rounded-[32px] border-[3px] border-black bg-white p-4 shadow-[14px_14px_0_0_#111] sm:p-6">
                <div className="grid gap-4 rounded-[28px] border-[3px] border-black bg-[#f7f2e8] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-faint">
                        Current watch
                      </p>
                      <h3 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-black tracking-[-0.05em] text-ink">
                        {scenario.title}
                      </h3>
                    </div>
                    <div className="rounded-full border-[3px] border-black bg-[#a7f3d0] px-4 py-2 text-sm font-black shadow-[5px_5px_0_0_#111]">
                      {scenario.riskScore}/100
                    </div>
                  </div>

                  <div className="rounded-[24px] border-[3px] border-black bg-white p-4 shadow-[8px_8px_0_0_#111]">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">
                          Neighborhood stress line
                        </p>
                        <p className="text-sm font-semibold text-ink-soft">
                          Forecast horizon {scenario.forecastWindowHours}h
                        </p>
                      </div>
                      <div className="rounded-full border-[3px] border-black bg-[#ffe98a] px-3 py-1 text-xs font-black uppercase shadow-[4px_4px_0_0_#111]">
                        Forecast view
                      </div>
                    </div>
                    <Sparkline values={scenario.chart} />
                  </div>

                  <div className="rounded-[24px] border-[3px] border-black bg-[#0e1b2b] p-4 text-white shadow-[8px_8px_0_0_#111]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/55">
                          Workspace mode
                        </p>
                        <h4 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-black tracking-[-0.05em]">
                          {workspaceMode === "overview"
                            ? "Overview"
                            : workspaceMode === "live"
                              ? "Live run"
                              : workspaceMode === "ops"
                                ? "Operations"
                                : "Deploy"}
                        </h4>
                      </div>
                      <span className="rounded-full border-[3px] border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]">
                        {scenario.tag}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {workspaceMode === "overview" ? (
                        <>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              Summary
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/82">
                              {scenario.summary}
                            </p>
                          </div>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              Response
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/82">
                              {scenario.action}
                            </p>
                          </div>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              Status
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/82">
                              One tap moves from signal to action.
                            </p>
                          </div>
                        </>
                      ) : null}

                      {workspaceMode === "live" ? (
                        <>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3 sm:col-span-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              Latest question
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/82">
                              {submittedQuery || scenario.questions.why}
                            </p>
                          </div>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              Confidence
                            </p>
                            <p className="mt-2 text-2xl font-black">{Math.round(scenario.confidence * 100)}%</p>
                          </div>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3 sm:col-span-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              What changes now
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/82">
                              A new scenario, a fresh answer, and an updated recommendation are ready when you switch.
                            </p>
                          </div>
                        </>
                      ) : null}

                      {workspaceMode === "ops" ? (
                        <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3 sm:col-span-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                            Recent activity
                          </p>
                          <div className="mt-2 space-y-2">
                            {activityLog.map((item) => (
                              <div
                                key={`${item.title}-${item.detail}`}
                                className="rounded-[14px] border-[1px] border-white/10 bg-white/5 p-3"
                              >
                                <p className="text-sm font-black text-white">{item.title}</p>
                                <p className="mt-1 text-xs leading-5 text-white/70">{item.detail}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {workspaceMode === "deploy" ? (
                        <>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              Deploy
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/82">
                              Ready to package, publish, and verify.
                            </p>
                          </div>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              Demo data
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/82">
                              {demoInitState.loading ? "Preparing..." : demoInitState.result ? "Initialized" : "Not started"}
                            </p>
                          </div>
                          <div className="rounded-[18px] border-[2px] border-white/10 bg-white/5 p-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                              Status
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/82">
                              The deployment path is ready in the repo and live on the web.
                            </p>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Primary signal", value: scenario.primarySignal, tone: "bg-[#8bd3ff]" },
                      { label: "Response window", value: scenario.responseWindow, tone: "bg-[#ffe98a]" },
                      { label: "Confidence", value: `${Math.round(scenario.confidence * 100)}%`, tone: "bg-[#ff9fb0]" }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-[22px] border-[3px] border-black ${item.tone} p-4 shadow-[6px_6px_0_0_#111]`}
                      >
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-black tracking-[-0.04em] text-ink">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border-[3px] border-black bg-[#2f6bff] p-4 text-white shadow-[8px_8px_0_0_#111]">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                        Recommendation
                      </p>
                      <h4 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-black tracking-[-0.05em]">
                        {scenario.action}
                      </h4>
                    </div>
                    <div className="rounded-[24px] border-[3px] border-black bg-white p-4 shadow-[8px_8px_0_0_#111]">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">
                        Why now
                      </p>
                      <p className="mt-2 text-sm leading-6 text-ink-soft">
                      Service delay, complaint velocity, and weather are compounding inside the same
                      ward. CyVix catches the pattern before it becomes a citywide issue.
                      </p>
                    </div>
                  </div>
                </div>
            </motion.div>
          </div>
        </section>

        <section id="signals" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Signal fabric"
            title="Everything the city knows, folded into one operational surface."
            copy="This layer is where structured telemetry, unstructured resident language, and policy context start to behave like one dataset."
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="grid gap-5 sm:grid-cols-2">
              {platformModules.map((module) => (
                <motion.article
                  key={module.title}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className="rounded-[28px] border-[3px] border-black bg-white p-5 shadow-[8px_8px_0_0_#111]"
                >
                  <div className="inline-flex rounded-full border-[3px] border-black bg-[#ffe98a] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_#111]">
                    {module.badge}
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl tracking-[-0.04em] text-ink">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{module.copy}</p>
                </motion.article>
              ))}
            </div>

            <div className="grid gap-4">
              <div className="rounded-[32px] border-[3px] border-black bg-[#f7f2e8] p-5 shadow-[12px_12px_0_0_#111]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
                    Decision packet
                  </p>
                  <div className="rounded-full border-[3px] border-black bg-[#ff9fb0] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_0_#111]">
                    {activeDecision.engine.name}
                  </div>
                </div>
                <h3 className="mt-3 max-w-lg font-[family-name:var(--font-display)] text-4xl font-black tracking-[-0.06em] text-ink">
                  {activeDecision.explanation}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Fusion", `${activeDecision.score.fusion}%`],
                    ["Confidence", `${activeDecision.score.confidence}%`],
                    ["Projected risk", activeDecision.score.projectedRisk]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[22px] border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-ink-muted">{label}</p>
                      <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-ink">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[32px] border-[3px] border-black bg-[#8bd3ff] p-5 shadow-[12px_12px_0_0_#111]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
                  Counterfactual
                </p>
                <p className="mt-2 text-xl font-black tracking-[-0.04em] text-ink">
                  Delay {activeDecision.counterfactual.delayHours}h and {activeDecision.counterfactual.outcome}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="decision" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How CyVix works"
            title="A decision engine wrapped in a calm, simple interface."
            copy="It does the hard part quietly: collect the signals, find the pattern, explain the why, and trigger the right next move."
          />

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map(({ icon: Icon, title, copy }, index) => (
              <motion.article
                key={title}
                whileHover={{ y: -5, rotate: index % 2 === 0 ? -1 : 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className={`rounded-[28px] border-[3px] border-black p-5 shadow-[8px_8px_0_0_#111] ${
                  index === 0
                    ? "bg-[#a7f3d0]"
                    : index === 1
                      ? "bg-[#8bd3ff]"
                      : index === 2
                        ? "bg-[#ffe98a]"
                        : "bg-[#ff9fb0]"
                }`}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-black bg-white shadow-[5px_5px_0_0_#111]">
                  <Icon className="h-6 w-6 text-ink" />
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.04em] text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="agent" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Live decision loop"
            title="Switch the scenario and watch the system think."
            copy="A live example makes the stack tangible: the app ingests the feed, runs analysis, surfaces a recommendation, and hands off the next action."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              className="space-y-4"
            >
              {scenarios.map((item, index) => (
                <ScenarioCard
                  key={item.id}
                  scenario={item}
                  active={index === activeScenarioIndex}
                  onClick={() => {
                    setActiveScenarioIndex(index);
                    setAutoRotate(false);
                    setWorkspaceMode("live");
                    recordAction("Scenario changed", item.title);
                  }}
                />
              ))}

              <form
                onSubmit={handleQuestion}
                className="rounded-[28px] border-[3px] border-black bg-[#2f6bff] p-4 shadow-[10px_10px_0_0_#111]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                  Ask CyVix
                </p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={queryDraft}
                    onChange={(event) => setQueryDraft(event.target.value)}
                    placeholder={`Ask about ${scenario.ward}, the next failure, or the best action`}
                    className="min-h-14 flex-1 rounded-full border-[3px] border-black bg-white px-5 text-sm font-semibold text-ink outline-none shadow-[6px_6px_0_0_#111] placeholder-ink-muted"
                  />
                  <MotionButton variant="secondary" type="submit" className="justify-center">
                    Run analysis
                    <ArrowRight className="h-4 w-4" />
                  </MotionButton>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Why is this ward flagged?", "What happens next?", "What should city staff do now?"].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                    onClick={() => {
                      setQueryDraft(prompt);
                      setSubmittedQuery(prompt);
                      setAutoRotate(false);
                      setWorkspaceMode("live");
                      recordAction("Prompt loaded", prompt);
                    }}
                      className="rounded-full border-[3px] border-black bg-[#ffe98a] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_0_#111]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              className="rounded-[32px] border-[3px] border-black bg-white p-4 shadow-[14px_14px_0_0_#111] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-faint">
                    Agent trace
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-black tracking-[-0.05em]">
                    {scenario.title}
                  </h3>
                </div>
                <div className="rounded-full border-[3px] border-black bg-[#a7f3d0] px-4 py-2 text-sm font-black shadow-[5px_5px_0_0_#111]">
                  Orchestration loop
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.48fr_0.52fr]">
                <div className="space-y-3">
                  {liveNarrative.map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-[22px] border-[3px] border-black bg-[#f7f2e8] p-4 shadow-[6px_6px_0_0_#111]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="rounded-full border-[3px] border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_#111]">
                          {step.service}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
                          Step {index + 1}
                        </span>
                      </div>
                      <h4 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-black tracking-[-0.05em]">
                        {step.title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-ink-soft">{step.copy}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border-[3px] border-black bg-[#2f6bff] p-4 text-white shadow-[8px_8px_0_0_#111]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                      AI explanation
                    </p>
                    <p className="mt-2 text-base leading-7">
                      {activeAnalysis.answer}
                    </p>
                    {activeAnalysis.providerNarrative ? (
                      <div className="mt-4 rounded-[18px] border-[2px] border-white/20 bg-white/10 p-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                          Live model reply
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/90">
                          {activeAnalysis.providerNarrative}
                        </p>
                        <p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
                          Source: {activeAnalysis.providerSource?.toUpperCase?.() ?? "MODEL"}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[24px] border-[3px] border-black bg-[#ffe98a] p-4 shadow-[8px_8px_0_0_#111]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">
                      Next best action
                    </p>
                    <h4 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-black tracking-[-0.05em]">
                      {activeRecommendation.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                      {activeRecommendation.summary}
                    </p>
                  </div>

                  <div className="rounded-[24px] border-[3px] border-black bg-white p-4 shadow-[8px_8px_0_0_#111]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">
                      Evidence trail
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(activeAnalysis.modelTrace || []).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border-[3px] border-black bg-[#a7f3d0] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_0_#111]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border-[3px] border-black bg-[#ff9fb0] p-4 shadow-[6px_6px_0_0_#111]">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                        Risk if ignored
                      </p>
                      <p className="mt-2 text-xl font-black tracking-[-0.05em] text-ink">
                        {activeRecommendation.riskIfIgnored}
                      </p>
                    </div>
                    <div className="rounded-[22px] border-[3px] border-black bg-[#8bd3ff] p-4 shadow-[6px_6px_0_0_#111]">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                        Follow-up window
                      </p>
                      <p className="mt-2 text-xl font-black tracking-[-0.05em] text-ink">
                        {activeRecommendation.responseWindow}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border-[3px] border-black bg-[#f7f2e8] p-4 shadow-[8px_8px_0_0_#111]">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    ["Stream", activeIngest.streams?.length ?? 0],
                    ["Signals", activeIngest.signalVector?.length ?? 0],
                    ["Confidence", `${Math.round(scenario.confidence * 100)}%`],
                    ["Framework", "Orchestration"]
                  ].map(([label, value]) => (
                    <span
                      key={label}
                      className="rounded-full border-[3px] border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_0_#111]"
                    >
                      {label}: {value}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="stack" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform"
            title="Signals, scoring, routing, and reporting in one flow."
            copy="CyVix is a working operations app, not a slide deck. The controls let you move from signal to decision without losing context."
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((service) => (
              <ServiceBrick key={service.name} {...service} />
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.58fr_0.42fr]">
            <LookerWorkspace
              lookerStatus={lookerStatus}
              platformLive={platformLive}
              demoInitState={demoInitState}
              onDemoInit={handleDemoInit}
              comparisonWard={comparisonWard}
              setComparisonWard={setComparisonWard}
              scenarios={scenarios}
              scenario={scenario}
              comparisonScenario={comparisonScenario}
              lookerTab={lookerTab}
              setLookerTab={setLookerTab}
              lookerTabs={lookerTabs}
              lookerSlicers={lookerSlicers}
              lookerMetrics={lookerMetrics}
              lookerSignals={lookerSignals}
              trendRows={trendRows}
              activeRecommendation={activeRecommendation}
              comparisonDelta={comparisonDelta}
              lookerGeneratedAt={lookerGeneratedAt}
            />

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              className="rounded-[32px] border-[3px] border-black bg-[#8bd3ff] p-5 shadow-[12px_12px_0_0_#111] sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-ink-muted">
                    Deployment path
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-black tracking-[-0.06em] text-ink">
                    Container path
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    The same app ships cleanly as a container with a deployment manifest and rollout steps.
                  </p>
                </div>
                <div className={`rounded-full border-[3px] border-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_#111] ${gkeStatus.live ? "bg-[#a7f3d0]" : "bg-white"}`}>
                  {gkeStatus.live ? "Live path" : "Path ready"}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  { label: "Cluster", value: gkeStatus.clusterName },
                  { label: "Region", value: gkeStatus.location },
                  { label: "Namespace", value: gkeStatus.namespace },
                  { label: "Image", value: gkeStatus.image }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
                      {item.label}
                    </p>
                    <p className="mt-2 break-all text-sm font-black tracking-[-0.03em] text-ink">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[28px] border-[3px] border-black bg-[#f7f2e8] p-4 shadow-[8px_8px_0_0_#111]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-muted">
                  Deployment steps
                </p>
                <ol className="mt-3 space-y-3">
                  <li className="rounded-[18px] border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_0_#111]">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
                      1. Build
                    </p>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">
                      {platformStatus?.gke?.buildCommand || `gcloud builds submit --tag ${gkeStatus.image} .`}
                    </p>
                  </li>
                  <li className="rounded-[18px] border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_0_#111]">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
                      2. Deploy
                    </p>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">
                      kubectl apply -f {gkeStatus.manifestPath}
                    </p>
                  </li>
                  <li className="rounded-[18px] border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_0_#111]">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
                      3. Verify
                    </p>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">
                      kubectl -n {gkeStatus.namespace} rollout status deployment/cyvix
                    </p>
                  </li>
                </ol>
              </div>

              <div className="mt-4 rounded-[24px] border-[3px] border-black bg-[#2f6bff] p-4 text-white shadow-[8px_8px_0_0_#111]">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  What this path gives you
                </p>
                <p className="mt-2 text-sm leading-6 text-white/85">
                  The app is container-ready, the manifest is checked in, and the same API routes can run on a managed cluster when you want more control over the runtime.
                </p>
              </div>
            </motion.article>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="rounded-[32px] border-[3px] border-black bg-[#ff9fb0] p-6 shadow-[10px_10px_0_0_#111]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-muted">
                How the system works
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-black tracking-[-0.06em] text-ink">
                From raw signal to action in one loop.
              </h3>
              <p className="mt-4 text-base leading-7 text-ink-soft">
                The platform keeps the history, scores what changed, retrieves similar cases,
                drafts the response, and routes the follow-up without losing the decision trail.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Keep it current", "The app refreshes the selected scenario and shows the latest answer at a glance."],
                ["Compare what matters", "You can switch the ward, load another prompt, and watch the deltas update."],
                ["Explain the reason", "Every recommendation keeps the evidence trail in view for quick review."],
                ["Act without delay", "The workspace surfaces the next step so the team can move faster."]
              ].map(([title, copy], index) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -3 }}
                  className={`rounded-[24px] border-[3px] border-black p-4 shadow-[8px_8px_0_0_#111] ${
                    index % 4 === 0
                      ? "bg-[#a7f3d0]"
                      : index % 4 === 1
                        ? "bg-[#8bd3ff]"
                        : index % 4 === 2
                          ? "bg-[#ffe98a]"
                          : "bg-white"
                  }`}
                >
                  <div className="text-sm font-black uppercase tracking-[0.16em] text-ink-muted">
                    Utility
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {useCases.map((item, index) => (
              <motion.article
                key={item.title}
                whileHover={{ y: -5 }}
                className={`rounded-[30px] border-[3px] border-black p-6 shadow-[10px_10px_0_0_#111] ${
                  index === 0 ? "bg-[#ffe98a]" : index === 1 ? "bg-[#a7f3d0]" : "bg-[#8bd3ff]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-[family-name:var(--font-display)] text-3xl font-black tracking-[-0.05em] text-ink">
                    {item.title}
                  </h3>
                  <MapPinned className="h-7 w-7 shrink-0 text-ink" />
                </div>
                <p className="mt-4 text-sm leading-7 text-ink-soft">{item.copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="governance" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Governance"
            title="Deep tech is visible, explainable, and safe to demo."
            copy="The platform shows its work. That matters for judges, city teams, and anyone who wants to know why a recommendation was made."
            align="center"
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {governanceCards.map((item, index) => (
              <motion.article
                key={item.title}
                whileHover={{ y: -4, rotate: index % 2 === 0 ? -0.6 : 0.6 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className={`rounded-[30px] border-[3px] border-black p-6 shadow-[10px_10px_0_0_#111] ${
                  index === 0 ? "bg-[#ffe98a]" : index === 1 ? "bg-[#a7f3d0]" : "bg-[#ff9fb0]"
                }`}
              >
                <div className="inline-flex rounded-full border-[3px] border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_#111]">
                  {index === 0 ? "Trace" : index === 1 ? "Demo mode" : "Workflow"}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-black tracking-[-0.05em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{item.copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto max-w-7xl px-4 py-12 pb-20 sm:px-6 lg:px-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="overflow-hidden rounded-[36px] border-[3px] border-black bg-[#2f6bff] p-6 shadow-[14px_14px_0_0_#111] sm:p-8 lg:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[0.66fr_0.34fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
                  Ready when the city is
                </p>
                <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl lg:text-7xl">
                  Bring CyVix into the room where decisions happen.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                  Give operators one place to see what changed, why it changed, and what to do
                  next. That is the difference between reacting to the city and leading it.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <MotionButton
                  variant="secondary"
                  className="w-full justify-center sm:w-auto"
                  onClick={() => {
                    setWorkspaceMode("deploy");
                    recordAction("Demo requested", "A guided handoff is ready.");
                    document.getElementById("agent")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Request a demo
                  <ArrowRight className="h-4 w-4" />
                </MotionButton>
                <MotionButton
                  className="w-full justify-center bg-[#ffe98a] text-ink sm:w-auto"
                  onClick={() => setAutoRotate((current) => !current)}
                >
                  {autoRotate ? "Pause auto demo" : "Resume auto demo"}
                </MotionButton>
              </div>
            </div>
          </motion.div>

          <footer className="mt-6 flex flex-col gap-4 border-t-2 border-black/15 pt-6 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
            <p>CyVix for civic decision intelligence.</p>
            <div className="flex flex-wrap items-center gap-4">
              <span>Signals</span>
              <span>Scoring</span>
              <span>Memory</span>
              <span>Workflow</span>
              <span>Reports</span>
              <span>Deployment</span>
            </div>
          </footer>
        </section>
      </main>
      </div>
    </div>
  );
}
