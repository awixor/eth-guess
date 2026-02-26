"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { fetchMe, fetchNonce, logout, verifySignature } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/routes";
import type { AuthUser } from "@/lib/api";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  /** Sign-In with Ethereum — throws on failure */
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, chain } = useConnection();
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();
  const [isSigning, setIsSigning] = useState(false);

  const { data: user = null, isLoading: isQueryLoading } =
    useQuery<AuthUser | null>({
      queryKey: QUERY_KEYS.auth.me,
      queryFn: fetchMe,
      retry: false,
      staleTime: 1000 * 60 * 5,
    });

  const signIn = useCallback(async () => {
    if (!address) throw new Error("Wallet not connected");

    setIsSigning(true);
    try {
      const nonce = await fetchNonce(address);

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to EthGuess - no password needed.",
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id ?? 1,
        nonce,
        issuedAt: new Date().toISOString(),
      });

      const rawMessage = siweMessage.prepareMessage();
      const signature = await signMessageAsync({ message: rawMessage });

      await verifySignature(rawMessage, signature);

      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    } finally {
      setIsSigning(false);
    }
  }, [address, chain?.id, signMessageAsync, queryClient]);

  const signOut = useCallback(async () => {
    await logout();
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: isQueryLoading || isSigning,
      signIn,
      signOut,
    }),
    [user, isQueryLoading, isSigning, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");

  return ctx;
}
