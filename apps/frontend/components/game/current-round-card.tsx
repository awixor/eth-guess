"use client";

import { RoundCard } from "@/components/game/round-card";
import { RoundTimer } from "@/components/game/round-timer";
import { ActionButtons } from "@/components/game/action-buttons";

interface CurrentRoundCardProps {
  endTimeMs: number;
  onTimerComplete: () => void;
  upPercentage: number;
  onBetUp: () => void;
  onBetDown: () => void;
}

export function CurrentRoundCard({
  endTimeMs,
  onTimerComplete,
  upPercentage,
  onBetUp,
  onBetDown,
}: CurrentRoundCardProps) {
  return (
    <div className="flex w-full justify-center mt-4">
      <div className="w-full max-w-lg">
        <RoundCard
          title="CURRENT ROUND"
          timerText={
            <RoundTimer endTimeMs={endTimeMs} onComplete={onTimerComplete} />
          }
          upPercentage={upPercentage}
        >
          <ActionButtons onBetUp={onBetUp} onBetDown={onBetDown} />
        </RoundCard>
      </div>
    </div>
  );
}
