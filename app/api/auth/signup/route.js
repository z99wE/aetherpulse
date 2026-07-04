import {
  buildSessionCookie,
  createSession,
  isAuthEnabled,
  isAuthRequired,
  validateInviteCode
} from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { jsonError, readJsonBody } from "@/lib/request-utils";

export async function POST(request) {
  const rateLimit = enforceRateLimit(request, "auth-signup");
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
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const code = String(body?.code || "").trim();

  if (!name && !email) {
    return jsonError("Name or email is required", 400);
  }

  if (!isAuthEnabled()) {
    return jsonError("AUTH_SECRET is required to enable sign-up sessions", 500);
  }

  if ((isAuthRequired() || process.env.AUTH_INVITE_CODE) && !validateInviteCode(code)) {
    return jsonError("Invite code required", 403);
  }

  const session = createSession({ name, email });
  if (!session) {
    return jsonError("Could not create session", 400);
  }

  return Response.json(
    {
      ok: true,
      session: {
        name: name || email.split("@")[0],
        email: email || null
      }
    },
    {
      headers: {
        "Set-Cookie": buildSessionCookie({ name: name || email.split("@")[0], email })
      }
    }
  );
}
