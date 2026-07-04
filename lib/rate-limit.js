const buckets = new Map();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function getClientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "anonymous";
}

export function enforceRateLimit(request, scope = "default") {
  const key = `${scope}:${getClientKey(request)}`;
  const now = Date.now();
  const bucket = buckets.get(key) ?? { count: 0, resetAt: now + WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  const remaining = Math.max(0, MAX_REQUESTS - bucket.count);
  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    allowed: bucket.count <= MAX_REQUESTS,
    remaining,
    retryAfter
  };
}

