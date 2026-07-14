import "server-only";
import type { OpenStackToken } from "@/lib/openstack/types";

const tokenCache = new Map<string, OpenStackToken>();
const refreshSkewMs = 60_000;

export function getCachedToken(cacheKey: string) {
  const token = tokenCache.get(cacheKey);
  if (!token) {
    return null;
  }

  if (token.expiresAt.getTime() - refreshSkewMs <= Date.now()) {
    tokenCache.delete(cacheKey);
    return null;
  }

  return token;
}

export function setCachedToken(cacheKey: string, token: OpenStackToken) {
  tokenCache.set(cacheKey, token);
}

export function invalidateCachedToken(cacheKey: string) {
  tokenCache.delete(cacheKey);
}
