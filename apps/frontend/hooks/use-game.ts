"use client";

import { useQuery } from "@tanstack/react-query";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { fetchCurrentPrice, fetchCurrentRound } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/routes";
import { EthGuessABI } from "@/lib/EthGuessABI";
import { parseEther } from "viem";

const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as `0x${string}`;

export function useGame() {
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
    isLoading: isPriceLoading || isRoundLoading,
    isActionPending: isTxSending || isTxConfirming,
    isTxSuccess,
    placeBet,
    claimWinnings,
    refetchRound,
    contractAddress,
  };
}
