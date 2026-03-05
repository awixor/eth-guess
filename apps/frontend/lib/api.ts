import { ROUTES } from "@/lib/routes";
import { UserStats } from "./game.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// ---------------------------------------------------------------------------
// Response types (mirror backend DTOs / controller return shapes)
// ---------------------------------------------------------------------------

export interface AuthUser {
  address: string;
  iat: number;
  exp: number;
}

interface NonceResponse {
  nonce: string;
}

interface VerifyResponse {
  address: string;
}

interface LogoutResponse {
  message: string;
}

interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function parseError(res: Response): Promise<string> {
  const body: ApiErrorResponse = await res.json().catch(() => ({}));

  return body.message ?? `Request failed: ${res.status} ${res.statusText}`;
}

/** GET /api/auth/nonce?address=0x... */
export async function fetchNonce(address: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}${ROUTES.auth.nonce}?address=${encodeURIComponent(address)}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error(await parseError(res));
  const data: NonceResponse = await res.json();
  return data.nonce;
}

/** POST /api/auth/verify */
export async function verifySignature(
  message: string,
  signature: string,
): Promise<VerifyResponse> {
  const res = await fetch(`${API_BASE}${ROUTES.auth.verify}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });

  if (!res.ok) throw new Error(await parseError(res));
  const data: VerifyResponse = await res.json();
  return data;
}

/** GET /api/auth/me — returns null when not authenticated */
export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE}${ROUTES.auth.me}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await parseError(res));
  const data: AuthUser = await res.json();
  return data;
}

export interface PriceResponse {
  price: number;
}

export interface RoundResponse {
  roundId: number;
  startPrice: string;
  startTime: number;
  endTime: number;
  serverTime: number;
  totalPool: string;
  upPool: string;
  downPool: string;
  settled: boolean;
  remainingTime: number;
  status?: string;
}

/** GET /api/price/current */
export async function fetchCurrentPrice(): Promise<number> {
  const res = await fetch(`${API_BASE}${ROUTES.price.current}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data: PriceResponse = await res.json();
  return data.price;
}

/** GET /api/game/current-round */
export async function fetchCurrentRound(): Promise<RoundResponse> {
  const res = await fetch(`${API_BASE}${ROUTES.game.currentRound}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data: RoundResponse = await res.json();
  return data;
}

/** GET /api/game/my-stats */
export async function fetchMyStats(): Promise<UserStats> {
  const res = await fetch(`${API_BASE}${ROUTES.game.myStats}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) return {};
  if (!res.ok) throw new Error(await parseError(res));
  return await res.json();
}

/** POST /api/auth/logout */
export async function logout(): Promise<LogoutResponse> {
  const res = await fetch(`${API_BASE}${ROUTES.auth.logout}`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error(await parseError(res));
  const data: LogoutResponse = await res.json();
  return data;
}
