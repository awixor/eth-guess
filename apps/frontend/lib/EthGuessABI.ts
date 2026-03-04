export const EthGuessABI = [
  {
    type: "function",
    name: "executeRound",
    inputs: [
      {
        name: "_currentPrice",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "currentRoundId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rounds",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "startPrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "endPrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "startTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "endTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "totalPool",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "upPool",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "downPool",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "settled",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "placeBet",
    inputs: [
      {
        name: "_guessUp",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "claimWinnings",
    inputs: [
      {
        name: "_roundId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
