/**
 * All backend API route paths, relative to API_BASE.
 */
export const ROUTES = {
  auth: {
    nonce: "/auth/nonce",
    verify: "/auth/verify",
    me: "/auth/me",
    logout: "/auth/logout",
  },
} as const;

/**
 * React Query cache keys.
 * Define every key here so invalidations and queries always reference
 * the same tuple — no string drift between files.
 */
export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
} as const;
