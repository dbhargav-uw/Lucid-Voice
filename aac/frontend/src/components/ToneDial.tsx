// ToneDial — a compact segmented control for the desired tone of the suggested
// replies: Warm / Even / Direct / Playful (default Even). Drives candidate
// ordering/emphasis and is prefixed into the generate context. Accessible
// radiogroup with arrow-key navigation; color is never the only signal (each
// segment carries a text label). The active indicator slides on a shared
// layoutId.

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT } from "../lib/motion";

export type Tone = "warm" | "even" | "direct" | "playful";

export const TONES: { id: Tone; label: string; active: string }[] = [
  { id: "warm", label: "Warm", active: "text-register-warm" },
  { id: "even", label: "Even", active: "text-text" },
  { id: "direct", label: "Direct", active: "text-register-direct" },
  { id: "playful", label: "Playful", active: "text-voice-deep" },
];

export interface ToneDialProps {
  value: Tone;
  onChange: (tone: Tone) => void;
}

export default function ToneDial({ value, onChange }: ToneDialProps) {
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % TONES.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (index - 1 + TONES.length) % TONES.length;
    else return;
    e.preventDefault();
    onChange(TONES[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-text-faint">
        Tone
      </span>
      <div
        role="radiogroup"
        aria-label="Reply tone"
        className="inline-flex items-center gap-0.5 rounded-full border border-ink-line bg-ink-sunken p-1"
      >
        {TONES.map((tone, i) => {
          const selected = tone.id === value;
          return (
            <button
              key={tone.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tone.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="relative inline-flex min-h-touch items-center rounded-full px-3.5 font-ui text-[0.9rem] font-medium transition-colors duration-150"
            >
              {selected && (
                <motion.span
                  layoutId="tone-active"
                  className="absolute inset-0 rounded-full border border-ink-line bg-ink-raised shadow-card"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: DUR.base, ease: EASE_OUT }
                  }
                  aria-hidden
                />
              )}
              <span
                className={[
                  "relative z-10",
                  selected ? `${tone.active} font-semibold` : "text-text-muted",
                ].join(" ")}
              >
                {tone.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
