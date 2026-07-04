import { getAuthSummary } from "@/lib/auth";

export async function GET(request) {
  return Response.json({
    ok: true,
    auth: getAuthSummary(request)
  });
}

