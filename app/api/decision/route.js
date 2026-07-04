import { buildDecisionEngine } from "@/lib/decision-engine";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get("scenarioId") ?? "transit";
  const question = searchParams.get("question") ?? "";
  const decision = buildDecisionEngine({ scenarioId, question });

  return Response.json({
    ok: true,
    stage: "decision",
    decision
  });
}

export async function POST(request) {
  const body = await request.json();
  const scenarioId = body?.scenarioId ?? "transit";
  const question = body?.question ?? "";
  const decision = buildDecisionEngine({ scenarioId, question });

  return Response.json({
    ok: true,
    stage: "decision",
    decision
  });
}
