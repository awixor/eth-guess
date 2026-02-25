import { motion } from "framer-motion";

interface ProgressCircleProps {
  progress: number; // 0 to 100
  className?: string; // Used to color the progress bar
}

export function ProgressCircle({
  progress,
  className = "text-blue-500",
}: ProgressCircleProps) {
  return (
    <svg className="absolute h-full w-full -rotate-90">
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        strokeWidth="4"
        fill="transparent"
        className="text-zinc-200 dark:text-zinc-800"
      />
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="currentColor"
        strokeWidth="4"
        fill="transparent"
        strokeDasharray="226.2"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: 226.2 - (226.2 * progress) / 100 }}
        transition={{ duration: 1, ease: "linear" }}
        className={className}
      />
    </svg>
  );
}
