const cache = new Map();

export function getCachedValue(key) {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCachedValue(key, value, ttlMs = 120_000) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });

  return value;
}

export async function memoizeValue(key, loader, ttlMs = 120_000) {
  const cached = getCachedValue(key);
  if (cached !== null) {
    return { value: cached, cached: true };
  }

  const value = await loader();
  setCachedValue(key, value, ttlMs);
  return { value, cached: false };
}

