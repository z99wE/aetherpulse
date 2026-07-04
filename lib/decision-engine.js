import { getScenario } from "./mock-data.js";
import { analyzeScenario, buildBaseline, buildForecast, retrieveSimilarIncidents } from "./analytics.js";
import { buildRecommendation } from "./workflows.js";
import { buildAgentRun } from "./adk.js";

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function round(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreSignalCoherence(scenario, questionTokens) {
  const signalTokens = tokenize(
    [
      scenario.title,
      scenario.summary,
      scenario.sourceTheme,
      scenario.primarySignal,
      scenario.action,
      scenario.ward,
      ...(scenario.feeds || []).map((feed) => `${feed.source} ${feed.detail}`),
      ...(scenario.signals || []).map((signal) => `${signal.name} ${signal.note}`)
    ].join(" ")
  );

  const overlap = questionTokens.filter((token) => signalTokens.includes(token)).length;
  const signalIntensity = avg((scenario.signals || []).map((signal) => signal.value || 0));
  const complaintWeight = (scenario.feeds || []).some((feed) =>
    /complaint|resident|feedback/i.test(feed.source + " " + feed.detail)
  )
    ? 0.08
    : 0;

  return round(
    Math.min(0.96, 0.42 + signalIntensity * 0.32 + overlap * 0.04 + complaintWeight),
    2
  );
}

function buildCounterfactual(scenario, score) {
  const delayHours = scenario.forecastWindowHours <= 6 ? 3 : 6;

  if (scenario.domain === "transportation") {
    return {
      delayHours,
      outcome:
        score >= 0.8
          ? "Missed transfers and crowding become visible to riders by the next commute cycle."
          : "Delay pressure stays localized if reroute capacity lands quickly."
    };
  }

  if (scenario.domain === "utilities") {
    return {
      delayHours,
      outcome:
        score >= 0.8
          ? "Localized pressure issues can spread into a broader trust problem."
          : "Inspection before the next cycle should keep the issue contained."
    };
  }

  return {
    delayHours,
    outcome:
      score >= 0.8
        ? "Peak exposure rises for vulnerable residents during the hottest window."
        : "Cooling support can still prevent escalation if it lands before peak heat."
  };
}

function buildStackMap(scenario, analysis, recommendation, agentRun) {
  return [
    {
      service: "Cloud Storage",
      role: "Raw ingest landing zone",
      detail: `Batches ${scenario.feeds.length} live feeds and keeps the original event trail.`
    },
    {
      service: "Dataflow",
      role: "Normalization and joins",
      detail: "Aligns telemetry, complaint text, and neighborhood context into one event stream."
    },
    {
      service: "BigQuery",
      role: "Baseline and feature store",
      detail: `Holds ward baselines, retention windows, and the comparison set used by the engine.`
    },
    {
      service: "Vertex AI",
      role: "Risk scoring and inference",
      detail: `Scores the scenario at ${analysis.metrics.confidence}% confidence and ranks urgency.`
    },
    {
      service: "Gemini",
      role: "Explanation synthesis",
      detail: "Turns model output into plain language for operators, residents, and leadership."
    },
    {
      service: "AlloyDB",
      role: "Incident memory",
      detail: `Retrieves ${analysis.similarIncidents.length} similar incidents and response playbooks.`
    },
    {
      service: "Cloud Run",
      role: "API and app shell",
      detail: "Serves the demo interface and receives decision packets from the local engine."
    },
    {
      service: "Cloud Functions",
      role: "Automation triggers",
      detail: recommendation.automation.join(" ")
    },
    {
      service: "Looker",
      role: "Operational view",
      detail: "Exposes ward drill-downs, trend deltas, and leadership-ready summaries."
    },
    {
      service: "Agent Development Kit",
      role: "Decision orchestration",
      detail: `Coordinates observe, reason, retrieve, explain, act, and follow-up steps. ${agentRun.state} mode.`
    }
  ];
}

export function buildDecisionEngine({ scenarioId = "transit", question = "" } = {}) {
  const scenario = getScenario(scenarioId);
  const normalizedQuestion = (question || `Why is ${scenario.ward} flagged?`).trim();
  const questionTokens = tokenize(normalizedQuestion);
  const analysis = analyzeScenario({ scenarioId, question: normalizedQuestion });
  const recommendation = buildRecommendation(scenarioId, analysis);
  const agentRun = buildAgentRun({ scenarioId, analysis });
  const baseline = buildBaseline(scenario);
  const forecast = buildForecast(scenario);
  const similarIncidents = retrieveSimilarIncidents(scenario, normalizedQuestion);
  const fusionScore = scoreSignalCoherence(scenario, questionTokens);
  const counterfactual = buildCounterfactual(scenario, fusionScore);
  const stack = buildStackMap(scenario, analysis, recommendation, agentRun);

  return {
    scenario: {
      id: scenario.id,
      title: scenario.title,
      ward: scenario.ward,
      domain: scenario.domain,
      sourceTheme: scenario.sourceTheme
    },
    question: normalizedQuestion,
    engine: {
      name: "Civic Fusion Graph",
      mode: "deterministic demo",
      purpose:
        "Fuse structured telemetry, citizen language, and historical response memory into one civic decision packet."
    },
    score: {
      fusion: round(fusionScore * 100, 0),
      confidence: analysis.metrics.confidence,
      risk: baseline.risk,
      projectedRisk: forecast.projectedRisk
    },
    explanation: analysis.answer,
    counterfactual,
    similarIncidents,
    recommendation,
    agentRun,
    stack,
    trace: [
      ...analysis.modelTrace,
      `fusion_score=${Math.round(fusionScore * 100)}%`,
      `counterfactual_delay=${counterfactual.delayHours}h`
    ]
  };
}

