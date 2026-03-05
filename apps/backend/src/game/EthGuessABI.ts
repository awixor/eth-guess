export const EthGuessABI = [
  {
    type: 'function',
    name: 'executeRound',
    inputs: [
      {
        name: '_currentPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'currentRoundId',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rounds',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'startPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'endPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'startTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'endTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'totalPool',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'upPool',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'downPool',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'settled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'placeBet',
    inputs: [
      {
        name: '_guessUp',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'claimWinnings',
    inputs: [
      {
        name: '_roundId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'bets',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'guessedUp',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'claimed',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'feePercent',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'error',
    name: 'EthGuess__NotOwner',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__NotOperator',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__PoolEmpty',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__ReentrancyGuard',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__NoFeesToWithdraw',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__RoundAlreadySettled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__TransferFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__RoundNotSettled',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__BettingWindowClosed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__AlreadyPlacedBet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__AlreadyClaimed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__InvalidOperator',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__InvalidMinBet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__InvalidExecuteRound',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__InvalidPlaceBet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__InvalidClaimWinnings',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EthGuess__InvalidSetMinBet',
    inputs: [],
  },
] as const;
