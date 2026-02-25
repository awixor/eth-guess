import { useState, useEffect } from "react";

export function useCountdown(endTimeMs: number, onComplete?: () => void) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Total duration for progress calculation (assuming 60s rounds for now)
    // In a real app, you might pass the startTime or totalDuration in
    const totalDuration = 60000;

    let animationFrameId: number;

    const tick = () => {
      const now = Date.now();
      const remainingMs = Math.max(0, endTimeMs - now);

      setTimeLeft(Math.ceil(remainingMs / 1000));
      setProgress(
        Math.max(0, Math.min(100, (remainingMs / totalDuration) * 100)),
      );

      if (remainingMs > 0) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    // Start ticking
    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [endTimeMs, onComplete]);

  return { timeLeft, progress };
}
