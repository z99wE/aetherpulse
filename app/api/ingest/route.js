import { getScenario } from "@/lib/mock-data";
import { persistIngestBatch } from "@/lib/gcp-client";
import { enforceAuthIfRequired } from "@/lib/auth";
import { isAllowedMethod, jsonError, normalizeScenarioId } from "@/lib/request-utils";

function buildIngestBatch(scenario) {
  const now = new Date();
  return {
    sourceTheme: scenario.sourceTheme,
    ward: scenario.ward,
    domain: scenario.domain,
    receivedAt: now.toISOString(),
    streams: scenario.feeds.map((feed, index) => ({
      id: `${scenario.id}-${index + 1}`,
      source: feed.source,
      detail: feed.detail,
      timestamp: new Date(now.getTime() - index * 900000).toISOString()
    })),
    signalVector: scenario.signals.map((signal) => ({
      name: signal.name,
      value: signal.value,
      note: signal.note
    })),
    chart: scenario.chart
  };
}

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
  const scenario = getScenario(scenarioId);
  const batch = buildIngestBatch(scenario);
  const storage = await persistIngestBatch({ scenarioId, batch });

  return Response.json({
    ok: true,
    stage: "ingest",
    pipeline: [
      "Cloud Storage",
      "Dataflow",
      "BigQuery"
    ],
    batch,
    storage
  });
}
