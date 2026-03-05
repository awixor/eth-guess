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
  game: {
    currentRound: "/game/current-round",
    myStats: "/game/my-stats",
    whaleRoom: "/game/whale-room",
  },
  price: {
    current: "/price/current",
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
  game: {
    round: ["game", "round"] as const,
    myStats: ["game", "my-stats"] as const,
    whaleRoom: ["game", "whale-room"] as const,
  },
  price: {
    current: ["price", "current"] as const,
  },
} as const;
