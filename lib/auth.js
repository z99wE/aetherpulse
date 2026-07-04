import crypto from "node:crypto";

const COOKIE_NAME = "cyvix_session";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function unbase64url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || process.env.SESSION_SECRET || "";
}

function getInviteCode() {
  return process.env.AUTH_INVITE_CODE || "";
}

function shouldUseSecureCookies() {
  if (String(process.env.AUTH_COOKIE_SECURE || "").toLowerCase() === "true") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

export function isAuthEnabled() {
  return Boolean(getAuthSecret());
}

export function isAuthRequired() {
  return String(process.env.AUTH_REQUIRED || "").toLowerCase() === "true";
}

function signPayload(payload) {
  const secret = getAuthSecret();
  if (!secret) {
    return null;
  }

  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token) {
  const secret = getAuthSecret();
  if (!secret || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");

  if (signature.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    return JSON.parse(unbase64url(body));
  } catch {
    return null;
  }
}

export function parseCookieHeader(header = "") {
  return header.split(";").reduce((acc, chunk) => {
    const index = chunk.indexOf("=");
    if (index === -1) {
      return acc;
    }

    const key = chunk.slice(0, index).trim();
    const value = chunk.slice(index + 1).trim();
    if (key) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function getSessionFromRequest(request) {
  const cookies = parseCookieHeader(request.headers.get("cookie") || "");
  const token = cookies[COOKIE_NAME];
  return verifyToken(token);
}

export function buildSessionCookie(payload) {
  const token = signPayload(payload);
  if (!token) {
    return null;
  }

  const secure = shouldUseSecureCookies() ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
}

export function clearSessionCookie() {
  const secure = shouldUseSecureCookies() ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`;
}

export function validateInviteCode(code) {
  const invite = getInviteCode();
  if (!invite) {
    return true;
  }

  return code === invite;
}

export function createSession({ name, email }) {
  const safeName = String(name || "").trim().slice(0, 60);
  const safeEmail = String(email || "").trim().slice(0, 120);
  if (!safeName && !safeEmail) {
    return null;
  }

  return signPayload({
    name: safeName || safeEmail.split("@")[0] || "Analyst",
    email: safeEmail || null,
    createdAt: new Date().toISOString()
  });
}

export function getAuthSummary(request) {
  const session = getSessionFromRequest(request);
  return {
    enabled: isAuthEnabled(),
    required: isAuthRequired(),
    signedIn: Boolean(session),
    session
  };
}

export function enforceAuthIfRequired(request) {
  if (!isAuthRequired()) {
    return { allowed: true, session: getSessionFromRequest(request) };
  }

  const session = getSessionFromRequest(request);
  if (!session) {
    return { allowed: false, response: Response.json({ ok: false, error: "Authentication required" }, { status: 401 }) };
  }

  return { allowed: true, session };
}
