export enum GameEvent {
  ROUND_STARTED = 'roundStarted',
  ROUND_SETTLED = 'roundSettled',
}

export interface RoundInfo {
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
  details?: string;
}

export interface UserBet {
  amount: string;
  guessedUp: boolean;
  claimed: boolean;
}

export interface UserStats {
  currentBet?: UserBet;
  previousRound?: {
    roundId: number;
    won: boolean;
    payout: string;
    claimed: boolean;
    guessedUp: boolean;
  };
}
