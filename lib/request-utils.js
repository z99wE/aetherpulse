import { scenarios } from "./mock-data.js";

const scenarioIds = new Set(scenarios.map((scenario) => scenario.id));

export function normalizeScenarioId(value, fallback = scenarios[0].id) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim().toLowerCase();
  return scenarioIds.has(trimmed) ? trimmed : fallback;
}

export function sanitizeQuestion(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim().slice(0, 280);
}

export async function readJsonBody(request) {
  try {
    const payload = await request.json();
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    return {};
  }
}

export function jsonError(message, status = 400) {
  return Response.json(
    {
      ok: false,
      error: message
    },
    { status }
  );
}

export function isAllowedMethod(request, allowedMethods) {
  return allowedMethods.includes(request.method);
}

