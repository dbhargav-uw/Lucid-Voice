// ReasoningRail — the machine's "decision trail," in mono with `mind` accents.
// Sections: Heard / Taps signal / Profile / Confidence / Grounded. Reads a
// normalized RailData (built by SpeakerView from the live trace or demo
// reasoning). Confidence is a slim SEGMENTED meter (an instrument, not a chunky
// dashboard track). The list streams in once, during thinking.

import { motion, useReducedMotion } from "framer-motion";
import { CaretRight } from "@phosphor-icons/react";
import { DUR, EASE_OUT } from "../lib/motion";

export interface RailData {
  heard: string;
  tapsSignal: string[];
  profile: string[];
  confidence: number; // 0..1
  grounded: string[];
}

export interface ReasoningRailProps {
  data: RailData | null;
  thinking: boolean;
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-mind/90">
          {label}
        </span>
        <span aria-hidden className="h-px flex-1 bg-ink-line" />
      </div>
      <div className="font-mono text-[0.9rem] leading-relaxed text-text-muted">
        {children}
      </div>
    </div>
  );
}

function Lines({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map((line, i) => (
        <motion.li
          key={`${line}-${i}`}
          initial={reduce ? false : { opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduce ? 0 : 0.05 * i, duration: DUR.base, ease: EASE_OUT }}
          className="flex items-start gap-2"
        >
          <CaretRight
            size={11}
            weight="bold"
            aria-hidden
            className="mt-[5px] shrink-0 text-mind/60"
          />
          <span className="text-text">{line}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const segments = 12;
  const filled = Math.round(value * segments);
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex flex-1 items-center gap-[3px]"
        role="meter"
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Confidence"
      >
        {Array.from({ length: segments }, (_, i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: reduce ? 0 : 0.025 * i, duration: 0.2, ease: EASE_OUT }}
            className={`h-3.5 flex-1 origin-bottom rounded-[2px] ${
              i < filled ? "bg-mind" : "bg-ink-line"
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-[0.9rem] tabular-nums text-mind">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

export default function ReasoningRail({ data, thinking }: ReasoningRailProps) {
  const reduce = useReducedMotion();

  return (
    <aside
      aria-label="Reasoning"
      className="scroll-ink flex h-full flex-col gap-6 overflow-y-auto rounded-xl border border-ink-line bg-mind-soft/30 p-5"
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-mind" />
        <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-mind">
          Decision trail
        </h2>
      </div>

      {!data ? (
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <p className="font-mono text-[0.88rem] leading-relaxed text-text-faint">
            {thinking
              ? "Reading your words and your context…"
              : "Tap a few words and I’ll show how I got to each reply."}
          </p>
        </div>
      ) : (
        <motion.div
          key={data.heard + data.confidence}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.base }}
          className="flex flex-col gap-6"
        >
          <Section label="Heard">
            {data.heard ? (
              <p className="m-0 font-utter text-[1.05rem] italic leading-snug text-text">
                &ldquo;{data.heard}&rdquo;
              </p>
            ) : (
              <p className="m-0 text-text-faint">Nothing yet</p>
            )}
          </Section>

          <Section label="Taps signal">
            <Lines items={data.tapsSignal} />
          </Section>

          <Section label="Profile">
            <Lines items={data.profile} />
          </Section>

          <Section label="Confidence">
            <ConfidenceMeter value={data.confidence} />
          </Section>

          <Section label="Grounded">
            <div className="flex flex-wrap gap-1.5">
              {data.grounded.map((g, i) => (
                <span
                  key={`${g}-${i}`}
                  className="rounded-md border border-mind/25 bg-mind-soft px-2 py-1 text-[0.78rem] text-mind"
                >
                  {g}
                </span>
              ))}
            </div>
            {data.grounded.length > 0 && (
              <p className="m-0 mt-2.5 text-[0.78rem] text-text-faint">
                grounded in {data.grounded.length} memor
                {data.grounded.length === 1 ? "y" : "ies"}
              </p>
            )}
          </Section>
        </motion.div>
      )}
    </aside>
  );
}
