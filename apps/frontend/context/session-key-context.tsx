"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useConnection, useWalletClient } from "wagmi";
import {
  createPublicClient,
  http,
  parseEther,
  encodeFunctionData,
  Chain,
} from "viem";
import { foundry, sepolia } from "viem/chains";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  toPermissionValidator,
  serializePermissionAccount,
  deserializePermissionAccount,
} from "@zerodev/permissions";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { toCallPolicy, CallPolicyVersion } from "@zerodev/permissions/policies";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  BUNDLER_URL,
  PAYMASTER_URL,
  SESSION_KEY_STORAGE_KEY,
  ZERODEV_PROJECT_ID,
} from "@/config/zerodev";
import { EthGuessABI } from "@/lib/EthGuessABI";
import { GetPaymasterDataParameters } from "viem/account-abstraction";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`;

/** Use EntryPoint v0.7 (Kernel v3.x). */
const ENTRY_POINT = getEntryPoint("0.7");
const KERNEL_VERSION = KERNEL_V3_1;

const SESSION_PK_KEY = `${SESSION_KEY_STORAGE_KEY}:pk`;

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface SessionKeyContextValue {
  isSessionActive: boolean;
  isCreatingSession: boolean;
  sessionError: string | null;
  enableSession: () => Promise<void>;
  disableSession: () => void;
  placeBetWithSession: (
    guessUp: boolean,
    amountEth: string,
  ) => Promise<`0x${string}`>;
}

const SessionKeyContext = createContext<SessionKeyContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePublicClient(chainId?: number) {
  if (chainId === foundry.id) {
    return createPublicClient({
      chain: foundry,
      transport: http("http://127.0.0.1:8545"),
    });
  }
  return createPublicClient({ chain: sepolia, transport: http() });
}

function chainFromId(chainId?: number) {
  if (chainId === foundry.id) return foundry;
  return sepolia;
}

/** Build the paymaster config - only if a Paymaster URL is configured. */
function buildPaymasterConfig(chain: Chain) {
  if (!PAYMASTER_URL) return undefined;
  return {
    getPaymasterData: async (userOperation: GetPaymasterDataParameters) => {
      const paymasterClient = createZeroDevPaymasterClient({
        chain,
        transport: http(PAYMASTER_URL),
      });
      return paymasterClient.sponsorUserOperation({ userOperation });
    },
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SessionKeyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address, chainId } = useConnection();

  const { data: walletClient } = useWalletClient();

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Stable ref for the kernel client — avoids triggering re-renders.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kernelClientRef = useRef<any>(null);

  // ---------------------------------------------------------------------------
  // On mount / address change: try to restore a persisted session.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // ZeroDev infrastructure (EntryPoint v0.7) is generally not on local Anvil
    if (chainId === foundry.id) {
      kernelClientRef.current = null;
      setIsSessionActive(false);
      return;
    }

    if (!address || !walletClient || !ZERODEV_PROJECT_ID) return;

    const stored = localStorage.getItem(SESSION_KEY_STORAGE_KEY);
    if (!stored) return;

    let parsed: { serialized: string; owner: string };
    try {
      parsed = JSON.parse(stored) as { serialized: string; owner: string };
    } catch {
      localStorage.removeItem(SESSION_KEY_STORAGE_KEY);
      return;
    }

    if (parsed.owner.toLowerCase() !== address.toLowerCase()) {
      localStorage.removeItem(SESSION_KEY_STORAGE_KEY);
      return;
    }

    void (async () => {
      try {
        const publicClient = makePublicClient(chainId);
        const chain = chainFromId(chainId);

        const kernelAccount = await deserializePermissionAccount(
          publicClient,
          ENTRY_POINT,
          KERNEL_VERSION,
          parsed.serialized,
        );

        kernelClientRef.current = createKernelAccountClient({
          account: kernelAccount,
          chain,
          bundlerTransport: http(BUNDLER_URL),
          paymaster: buildPaymasterConfig(chain),
        });

        setIsSessionActive(true);
      } catch (err) {
        console.warn("Failed to restore ZeroDev session:", err);
        localStorage.removeItem(SESSION_KEY_STORAGE_KEY);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId]);

  // ---------------------------------------------------------------------------
  // enableSession()
  // ---------------------------------------------------------------------------
  const enableSession = useCallback(async () => {
    if (!address || !walletClient) throw new Error("Wallet not connected");

    // ZeroDev requires EntryPoint v0.7 (not on Anvil by default)
    if (chainId === foundry.id) {
      throw new Error(
        "ZeroDev session keys require EntryPoint v0.7 infrastructure, which is not available on local Anvil. Please switch to Sepolia to test this feature.",
      );
    }

    if (!ZERODEV_PROJECT_ID) {
      throw new Error("ZERODEV_PROJECT_ID is not set. Add it to .env.local.");
    }

    setIsCreatingSession(true);
    setSessionError(null);

    try {
      const publicClient = makePublicClient(chainId);
      const chainObj = chainFromId(chainId);

      // 1. EOA (sudo) ECDSA validator — backs the Kernel smart account.
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: walletClient,
        entryPoint: ENTRY_POINT,
        kernelVersion: KERNEL_VERSION,
      });

      // 2. Ephemeral session private key (persisted in localStorage).
      let sessionPrivKey = localStorage.getItem(SESSION_PK_KEY) as
        | `0x${string}`
        | null;
      if (!sessionPrivKey) {
        sessionPrivKey = generatePrivateKey();
        localStorage.setItem(SESSION_PK_KEY, sessionPrivKey);
      }
      const sessionAccount = privateKeyToAccount(sessionPrivKey);
      const sessionSigner = await toECDSASigner({ signer: sessionAccount });

      // 3. Permission: only allow calling placeBet on the EthGuess contract.
      const callPolicy = toCallPolicy({
        policyVersion: CallPolicyVersion.V0_0_4,
        permissions: [
          {
            target: CONTRACT_ADDRESS,
            abi: EthGuessABI,
            functionName: "placeBet",
          },
        ],
      });

      // 4. Permission validator scoped to the call policy.
      const permissionValidator = await toPermissionValidator(publicClient, {
        entryPoint: ENTRY_POINT,
        signer: sessionSigner,
        policies: [callPolicy],
        kernelVersion: KERNEL_VERSION,
      });

      // 5. Kernel account: EOA is sudo, session key is the regular signer.
      const kernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
          regular: permissionValidator,
        },
        entryPoint: ENTRY_POINT,
        kernelVersion: KERNEL_VERSION,
      });

      // 6. Serialize to localStorage for persistence across page refreshes.
      const serialized = await serializePermissionAccount(
        kernelAccount,
        sessionPrivKey,
      );
      localStorage.setItem(
        SESSION_KEY_STORAGE_KEY,
        JSON.stringify({ serialized, owner: address }),
      );

      // 7. Build the kernel client used by placeBetWithSession.
      kernelClientRef.current = createKernelAccountClient({
        account: kernelAccount,
        chain: chainObj,
        bundlerTransport: http(BUNDLER_URL),
        paymaster: buildPaymasterConfig(chainObj),
      });

      setIsSessionActive(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSessionError(message);
      throw err;
    } finally {
      setIsCreatingSession(false);
    }
  }, [address, walletClient, chainId]);

  // ---------------------------------------------------------------------------
  // disableSession()
  // ---------------------------------------------------------------------------
  const disableSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY_STORAGE_KEY);
    localStorage.removeItem(SESSION_PK_KEY);
    kernelClientRef.current = null;
    setIsSessionActive(false);
    setSessionError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // placeBetWithSession()
  // ---------------------------------------------------------------------------
  const placeBetWithSession = useCallback(
    async (guessUp: boolean, amountEth: string): Promise<`0x${string}`> => {
      const client = kernelClientRef.current;
      if (!client) {
        throw new Error("No active session. Call enableSession() first.");
      }

      const callData = encodeFunctionData({
        abi: EthGuessABI,
        functionName: "placeBet",
        args: [guessUp],
      });

      const encodedCalls = (await client.account.encodeCalls([
        {
          to: CONTRACT_ADDRESS,
          value: parseEther(amountEth),
          data: callData,
        },
      ])) as `0x${string}`;

      const userOpHash = (await client.sendUserOperation({
        callData: encodedCalls,
      })) as `0x${string}`;

      const receipt = await client.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      return receipt.receipt.transactionHash as `0x${string}`;
    },
    [],
  );

  const value = useMemo<SessionKeyContextValue>(
    () => ({
      isSessionActive,
      isCreatingSession,
      sessionError,
      enableSession,
      disableSession,
      placeBetWithSession,
    }),
    [
      isSessionActive,
      isCreatingSession,
      sessionError,
      enableSession,
      disableSession,
      placeBetWithSession,
    ],
  );

  return (
    <SessionKeyContext.Provider value={value}>
      {children}
    </SessionKeyContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSessionKey(): SessionKeyContextValue {
  const ctx = useContext(SessionKeyContext);
  if (!ctx) {
    throw new Error("useSessionKey must be used inside <SessionKeyProvider>");
  }
  return ctx;
}
