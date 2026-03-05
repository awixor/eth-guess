"use client";

import { useQuery } from "@tanstack/react-query";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { fetchCurrentPrice, fetchCurrentRound, fetchMyStats } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/routes";
import { EthGuessABI } from "@/lib/EthGuessABI";
import { parseEther } from "viem";
import { useEffect } from "react";
import { useSocket } from "@/context/socket-context";
import { GameEvent } from "@/lib/game.types";
import { useAuth } from "@/context/auth-context";

const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`;

export function useGame() {
  const { socket } = useSocket();
  const { data: price = 0, isLoading: isPriceLoading } = useQuery({
    queryKey: QUERY_KEYS.price.current,
    queryFn: fetchCurrentPrice,
    refetchInterval: 10000,
  });

  const {
    data: round,
    isLoading: isRoundLoading,
    refetch: refetchRound,
  } = useQuery({
    queryKey: QUERY_KEYS.game.round,
    queryFn: fetchCurrentRound,
    refetchInterval: 30000,
  });

  const { user } = useAuth();

  const {
    data: myStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: QUERY_KEYS.game.myStats,
    queryFn: fetchMyStats,
    enabled: !!user,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!socket) return;

    const handleRoundUpdate = () => {
      console.log("WebSocket: Round update received, refetching...");
      void refetchRound();
      void refetchStats();
    };

    socket.on(GameEvent.ROUND_STARTED, handleRoundUpdate);
    socket.on(GameEvent.ROUND_SETTLED, handleRoundUpdate);

    return () => {
      socket.off(GameEvent.ROUND_STARTED, handleRoundUpdate);
      socket.off(GameEvent.ROUND_SETTLED, handleRoundUpdate);
    };
  }, [socket, refetchRound, refetchStats]);

  const {
    mutateAsync: writeContractAsync,
    isPending: isTxSending,
    data: txHash,
  } = useWriteContract();

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const placeBet = async (guessUp: boolean, amountEth: string) => {
    return await writeContractAsync({
      address: contractAddress,
      abi: EthGuessABI,
      functionName: "placeBet",
      args: [guessUp],
      value: parseEther(amountEth),
    });
  };

  const claimWinnings = async (roundId: number) => {
    return await writeContractAsync({
      address: contractAddress,
      abi: EthGuessABI,
      functionName: "claimWinnings",
      args: [BigInt(roundId)],
    });
  };

  return {
    price,
    round,
    myStats,
    isLoading: isPriceLoading || isRoundLoading || isStatsLoading,
    isActionPending: isTxSending || isTxConfirming,
    isTxSuccess,
    placeBet,
    claimWinnings,
    refetchRound,
    refetchStats,
    contractAddress,
  };
}
