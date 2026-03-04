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
