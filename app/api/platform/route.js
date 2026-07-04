import { buildDemoStatus, buildGkeDeploymentPath } from "@/lib/demo-init";
import { enforceAuthIfRequired } from "@/lib/auth";
import { getGcpConfig } from "@/lib/gcp-client";
import { getProviderStatus } from "@/lib/provider-client";
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
  const gcp = getGcpConfig();
  const gke = buildGkeDeploymentPath();
  const providers = getProviderStatus();

  return Response.json({
    ok: true,
    stage: "platform",
    gcp,
    status,
    providers,
    looker: status.manifest.looker,
    gke,
    liveServices: {
      cloudRun: true,
      bigquery: status.manifest.bigquery.live,
      storage: status.manifest.storage.live
    }
  });
}
