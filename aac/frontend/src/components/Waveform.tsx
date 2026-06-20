// Waveform — small reusable animated bars in `voice` (the human/speak color).
// Animates while `playing`; respects prefers-reduced-motion (renders static
// bars with no animation). Decorative only — aria-hidden.

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface WaveformProps {
  playing: boolean;
  bars?: number;
  className?: string;
}

export default function Waveform({
  playing,
  bars = 5,
  className = "",
}: WaveformProps) {
  const reduce = useReducedMotion();

  // Stable per-bar timing so the wave looks organic, not a sine sweep.
  const timings = useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => ({
        duration: 0.6 + (i % 3) * 0.18,
        delay: (i % bars) * 0.08,
      })),
    [bars],
  );

  return (
    <div
      aria-hidden
      className={`flex items-end gap-[3px] h-5 ${className}`}
    >
      {timings.map((t, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-voice"
          style={{ height: "30%" }}
          animate={
            playing && !reduce
              ? { height: ["30%", "100%", "45%", "85%", "30%"] }
              : { height: playing ? "70%" : "30%" }
          }
          transition={
            playing && !reduce
              ? {
                  duration: t.duration,
                  delay: t.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}
