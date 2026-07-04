import { buildDecisionEngine } from "@/lib/decision-engine";
import { enforceAuthIfRequired } from "@/lib/auth";
import { isAllowedMethod, jsonError, normalizeScenarioId, readJsonBody, sanitizeQuestion } from "@/lib/request-utils";

export async function GET(request) {
  if (!isAllowedMethod(request, ["GET"])) {
    return jsonError("Method not allowed", 405);
  }

  const auth = enforceAuthIfRequired(request);
  if (!auth.allowed) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const scenarioId = normalizeScenarioId(searchParams.get("scenarioId"));
  const question = sanitizeQuestion(searchParams.get("question"));
  const decision = buildDecisionEngine({ scenarioId, question });

  return Response.json({
    ok: true,
    stage: "decision",
    decision
  });
}

export async function POST(request) {
  if (!isAllowedMethod(request, ["POST"])) {
    return jsonError("Method not allowed", 405);
  }

  const auth = enforceAuthIfRequired(request);
  if (!auth.allowed) {
    return auth.response;
  }

  const body = await readJsonBody(request);
  const scenarioId = normalizeScenarioId(body?.scenarioId);
  const question = sanitizeQuestion(body?.question);
  const decision = buildDecisionEngine({ scenarioId, question });

  return Response.json({
    ok: true,
    stage: "decision",
    decision
  });
}
