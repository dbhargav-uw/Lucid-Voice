// ConversationView — speaker-attributed conversation surface + a real record
// "sound bar". Visual-only (LIGHT theme); the /stt wiring lands later — the
// existing `recording` toggle behavior is preserved. Coral = the user (Elena);
// teal/neutral = the partner & machine.

import { useMemo, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Microphone, MicrophoneSlash, ChatsCircle } from "@phosphor-icons/react";
import { EASE_OUT, DUR, SPRING } from "../lib/motion";

interface TranscriptEntry {
  id: string;
  speaker: "partner" | "me";
  name: string;
  text: string;
  time: string;
}

// Seed turns so the surface looks alive before /stt is wired.
const SEED_TURNS: TranscriptEntry[] = [
  {
    id: "seed-1",
    speaker: "partner",
    name: "Sofia",
    text: "Mom, do you want to come for dinner Sunday?",
    time: "2:14",
  },
  {
    id: "seed-2",
    speaker: "me",
    name: "Elena",
    text: "I'd love to, sweetie, but I've been so tired lately. Can I tell you Saturday?",
    time: "2:15",
  },
];

function TurnBubble({ entry, index }: { entry: TranscriptEntry; index: number }) {
  const isMe = entry.speaker === "me";
  const initial = entry.name.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: DUR.base, ease: EASE_OUT, delay: index * 0.04 }}
      className={[
        "flex w-full items-end gap-2.5",
        isMe ? "flex-row-reverse" : "flex-row",
      ].join(" ")}
    >
      {/* Avatar — speaker initial, color-coded (me = coral, partner = neutral). */}
      <div
        aria-hidden
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-mono text-[0.95rem] font-semibold",
          isMe
            ? "border-voice/30 bg-voice-soft text-voice-deep"
            : "border-ink-line bg-ink-raised text-text-muted",
        ].join(" ")}
      >
        {initial}
      </div>

      {/* Bubble + meta */}
      <div
        className={[
          "flex min-w-0 max-w-[78%] flex-col gap-1",
          isMe ? "items-end" : "items-start",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center gap-2 px-1",
            isMe ? "flex-row-reverse" : "flex-row",
          ].join(" ")}
        >
          <span className={`eyebrow ${isMe ? "text-voice-deep" : "text-text-muted"}`}>
            {entry.name}
          </span>
          <span className="font-mono text-[0.72rem] text-text-muted">{entry.time}</span>
        </div>

        <div
          className={[
            "rounded-xl border px-4 py-3",
            isMe
              ? "rounded-br-md border-voice/25 bg-voice-soft shadow-utter"
              : "rounded-bl-md border-ink-line bg-ink-raised shadow-card",
          ].join(" ")}
        >
          <p
            className={[
              "m-0",
              isMe ? "font-utter text-[1.25rem] leading-snug" : "font-ui text-aac-base",
            ].join(" ")}
          >
            {entry.text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Soft, non-clipped listening rings (recording only; suppressed on reduce).
function ListeningRing({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  if (!active || reduce) return null;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute inset-0 rounded-full border border-voice/40"
          initial={{ scale: 1, opacity: 0.35 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: i * 0.6 }}
        />
      ))}
    </>
  );
}

// The record bar's center level strip — the "sound bar". Coral + animated while
// recording; a designed static coral silhouette under reduced motion; quiet
// grey rest state when idle.
function LevelStrip({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const BARS = 28;
  const cfg = useMemo(
    () =>
      Array.from({ length: BARS }, (_, i) => ({
        peak: 0.32 + 0.6 * Math.abs(Math.sin(i * 1.3 + 0.5)),
        duration: 0.5 + ((i * 7) % 5) * 0.1,
        delay: (i % 7) * 0.05,
      })),
    [],
  );
  return (
    <div
      aria-hidden
      className="flex h-9 min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden"
    >
      {cfg.map((c, i) => (
        <motion.span
          key={i}
          className={`w-[3px] rounded-full ${active ? "bg-voice" : "bg-ink-line"}`}
          style={{ opacity: active ? 0.7 + (c.peak - 0.32) * 0.5 : 1 }}
          initial={false}
          animate={
            active && !reduce
              ? { height: ["22%", `${c.peak * 100}%`, "34%"] }
              : { height: active ? `${c.peak * 78}%` : "24%" }
          }
          transition={
            active && !reduce
              ? { duration: c.duration, delay: c.delay, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.22 }
          }
        />
      ))}
    </div>
  );
}

export default function ConversationView() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(SEED_TURNS);

  function handleToggleRecord() {
    // TODO (later phase): start/stop MediaRecorder; on stop, encode audio_base64
    //   and call stt({ audio_base64 }), then append the result to the transcript.
    setRecording((r) => {
      // On stopping, append a believable partner turn so the surface reacts.
      if (r) {
        setTranscript((t) => [
          ...t,
          {
            id: `live-${t.length}`,
            speaker: "partner",
            name: "Sofia",
            text: "Take your time, Mom — there's no rush at all.",
            time: "now",
          },
        ]);
      }
      return !r;
    });
  }

  const hasTurns = transcript.length > 0;

  return (
    <div className="mx-auto flex h-full max-w-[760px] flex-col gap-5 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <h2 className="m-0 font-ui text-aac-lg font-semibold text-text">Conversation</h2>
        <span className="eyebrow">
          {hasTurns ? `${transcript.length} turns` : "no turns yet"}
        </span>
      </header>

      {/* Transcript well — only this scrolls; the record bar stays pinned. */}
      <div
        aria-label="Conversation transcript"
        aria-live="polite"
        className="scroll-ink flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto rounded-xl border border-ink-line bg-ink-sunken p-4 sm:p-5"
      >
        {hasTurns ? (
          <AnimatePresence initial={false}>
            {transcript.map((entry, i) => (
              <TurnBubble key={entry.id} entry={entry} index={i} />
            ))}
          </AnimatePresence>
        ) : (
          <div className="m-auto flex max-w-[300px] flex-col items-center gap-4 text-center">
            <div
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-full bg-voice-soft text-voice"
            >
              <ChatsCircle size={36} weight="duotone" />
            </div>
            <p className="m-0 font-ui text-aac-base text-text-muted">
              Tap the mic and I'll listen to your partner.
            </p>
          </div>
        )}
      </div>

      {/* Record "sound bar" — mic · level strip · status. */}
      <div className="flex min-h-cta items-center gap-4 rounded-xl border border-ink-line bg-ink-raised px-4 py-3 shadow-card sm:px-5">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <ListeningRing active={recording} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            transition={SPRING}
            onClick={handleToggleRecord}
            aria-pressed={recording}
            aria-label={recording ? "Stop listening" : "Listen to partner"}
            className={[
              "relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-on-voice shadow-utter transition-colors duration-base",
              recording ? "bg-voice-deep" : "bg-voice hover:bg-voice-deep",
            ].join(" ")}
          >
            {recording ? (
              <MicrophoneSlash size={28} weight="fill" />
            ) : (
              <Microphone size={28} weight="fill" />
            )}
          </motion.button>
        </div>

        <LevelStrip active={recording} />

        <span
          aria-live="polite"
          className={`eyebrow w-[10rem] shrink-0 whitespace-nowrap text-right ${
            recording ? "text-voice-deep" : "text-text-muted"
          }`}
        >
          {recording ? "Listening…" : "Listen to partner"}
        </span>
      </div>
    </div>
  );
}
