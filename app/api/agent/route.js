import { buildAgentRun } from "@/lib/adk";
import { buildDecisionEngine } from "@/lib/decision-engine";
import { enforceAuthIfRequired } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isAllowedMethod, jsonError, normalizeScenarioId, readJsonBody, sanitizeQuestion } from "@/lib/request-utils";

export async function POST(request) {
  if (!isAllowedMethod(request, ["POST"])) {
    return jsonError("Method not allowed", 405);
  }

  const auth = enforceAuthIfRequired(request);
  if (!auth.allowed) {
    return auth.response;
  }

  const rateLimit = enforceRateLimit(request, "api-agent");
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
  const analysis = body?.analysis ?? null;
  const agentRun = buildAgentRun({ scenarioId, analysis });
  const decision = buildDecisionEngine({
    scenarioId,
    question: sanitizeQuestion(body?.question)
  });

  return Response.json({
    ok: true,
    stage: "agent",
    agentRun,
    decision
  });
}
