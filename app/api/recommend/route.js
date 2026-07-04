import { buildRecommendation } from "@/lib/workflows";
import { buildDecisionEngine } from "@/lib/decision-engine";

export async function POST(request) {
  const body = await request.json();
  const scenarioId = body?.scenarioId ?? "transit";
  const analysis = body?.analysis ?? null;
  const recommendation = buildRecommendation(scenarioId, analysis);
  const decision = buildDecisionEngine({
    scenarioId,
    question: body?.question ?? ""
  });

  return Response.json({
    ok: true,
    stage: "recommend",
    recommendation,
    decision
  });
}
