// StateIndicator — a quiet status pill. The dot changes color per state and the
// label crossfades on change; NO infinite pulse (motion conveys the state
// transition, not a decorative loop). aria-live announces state to both people.

import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE_OUT } from "../lib/motion";

export type SpeakerState =
  | "idle"
  | "listening"
  | "thinking"
  | "candidates"
  | "speaking";

export interface StateIndicatorProps {
  state: SpeakerState;
}

const STATE_META: Record<SpeakerState, { label: string; dot: string }> = {
  idle: { label: "Ready", dot: "bg-text-faint" },
  listening: { label: "Listening", dot: "bg-voice" },
  thinking: { label: "Composing", dot: "bg-mind" },
  candidates: { label: "Choose a reply", dot: "bg-register-neutral" },
  speaking: { label: "Speaking", dot: "bg-voice" },
};

export default function StateIndicator({ state }: StateIndicatorProps) {
  const meta = STATE_META[state];

  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2.5 rounded-full border border-ink-line bg-ink-raised/70 py-1.5 pl-3 pr-4"
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full transition-colors duration-300 ${meta.dot}`}
      />
      <span className="relative inline-grid">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="font-mono text-[0.74rem] uppercase tracking-[0.14em] text-text-muted"
          >
            {meta.label}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
