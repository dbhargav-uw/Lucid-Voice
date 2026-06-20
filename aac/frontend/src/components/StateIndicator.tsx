// StateIndicator — visualizes the SpeakerView state machine so the speaker
// and partner always know what the app is doing. Calm, glanceable.
// TODO Phase 3: animate transitions in step with real state changes.

import { motion } from "framer-motion";

// Mirror of the SpeakerView state union (kept in sync intentionally).
export type SpeakerState =
  | "idle"
  | "listening"
  | "thinking"
  | "candidates"
  | "speaking";

export interface StateIndicatorProps {
  state: SpeakerState;
}

const STATE_META: Record<
  SpeakerState,
  { label: string; color: string }
> = {
  idle: { label: "Ready", color: "#9aa0a6" },
  listening: { label: "Listening", color: "#2b6cff" },
  thinking: { label: "Thinking", color: "#a06bff" },
  candidates: { label: "Choose a reply", color: "#1f9d55" },
  speaking: { label: "Speaking", color: "#ff8a3d" },
};

export default function StateIndicator({ state }: StateIndicatorProps) {
  const meta = STATE_META[state];
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.5rem 1rem",
        borderRadius: "999px",
        background: "var(--strip-bg, #ffffff)",
        border: "1px solid rgba(0,0,0,0.08)",
        fontSize: "0.95rem",
        fontWeight: 500,
      }}
    >
      <motion.span
        key={state}
        aria-hidden
        animate={
          state === "thinking" || state === "listening"
            ? { opacity: [0.4, 1, 0.4] }
            : { opacity: 1 }
        }
        transition={{ repeat: Infinity, duration: 1.2 }}
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: meta.color,
        }}
      />
      {meta.label}
    </div>
  );
}
