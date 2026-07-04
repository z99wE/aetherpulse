import { buildDemoStatus, seedDemoData } from "@/lib/demo-init";
import { enforceAuthIfRequired } from "@/lib/auth";
import { isAllowedMethod, jsonError } from "@/lib/request-utils";

export async function GET(request) {
  if (!isAllowedMethod(request, ["GET"])) {
    return jsonError("Method not allowed", 405);
  }

  const auth = enforceAuthIfRequired(request);
  if (!auth.allowed) {
    return auth.response;
  }

  const status = buildDemoStatus();

  return Response.json({
    ok: true,
    stage: "demo",
    mode: "preview",
    status
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

  const result = await seedDemoData({
    seedBigQueryRows: true,
    writeStorageBundle: true
  });

  return Response.json({
    ok: true,
    stage: "demo",
    mode: "initialized",
    result
  });
}
