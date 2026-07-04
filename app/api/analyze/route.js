import { analyzeScenario } from "@/lib/analytics";
import { buildDecisionEngine } from "@/lib/decision-engine";
import { enforceAuthIfRequired } from "@/lib/auth";
import { enrichWithProviders } from "@/lib/provider-client";
import { fetchScenarioBaseline } from "@/lib/gcp-client";
import {
  isAllowedMethod,
  jsonError,
  normalizeScenarioId,
  readJsonBody,
  sanitizeQuestion
} from "@/lib/request-utils";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  if (!isAllowedMethod(request, ["POST"])) {
    return jsonError("Method not allowed", 405);
  }

  const auth = enforceAuthIfRequired(request);
  if (!auth.allowed) {
    return auth.response;
  }

  const rateLimit = enforceRateLimit(request, "api-analyze");
  if (!rateLimit.allowed) {
    return Response.json(
      { ok: false, error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter)
        }
      }
    );
  }

  const body = await readJsonBody(request);
  const scenarioId = normalizeScenarioId(body?.scenarioId);
  const question = sanitizeQuestion(body?.question, "Why is this ward flagged?");
  if (!question) {
    return jsonError("Question is required", 400);
  }

  const analysis = analyzeScenario({ scenarioId, question });
  const decision = buildDecisionEngine({ scenarioId, question });
  const gcp = {
    bigquery: await fetchScenarioBaseline(scenarioId)
  };
  const provider = await enrichWithProviders({
    scenario: decision.scenario,
    question,
    analysis,
    recommendation: decision.recommendation
  });

  if (provider.narrative) {
    analysis.providerNarrative = provider.narrative;
    analysis.providerSource = provider.source;
  }

  if (gcp.bigquery?.row) {
    analysis.gcpBaseline = gcp.bigquery.row;
  }

  analysis.gcp = gcp;

  return Response.json({
    ok: true,
    stage: "analyze",
    analysis,
    decision,
    provider,
    gcp
  });
}
