// ConversationView — speaker-attributed conversation surface + record control.
// Visual-only redesign (Elevation v3, LIGHT theme). The real /stt wiring lands
// in a later phase; the existing `recording` toggle behavior is preserved.

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Microphone,
  MicrophoneSlash,
  UserCircle,
  ChatsCircle,
} from "@phosphor-icons/react";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE_OUT, delay: index * 0.04 }}
      className={[
        "flex w-full items-end gap-2.5",
        isMe ? "flex-row-reverse" : "flex-row",
      ].join(" ")}
    >
      {/* Avatar */}
      <div
        aria-hidden
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
          isMe
            ? "border-voice/30 bg-voice-soft text-voice-deep"
            : "border-ink-line bg-ink-raised text-text-muted",
        ].join(" ")}
      >
        <UserCircle size={26} weight="duotone" />
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
          <span
            className={[
              "font-mono text-eyebrow uppercase",
              isMe ? "text-voice-deep" : "text-text-muted",
            ].join(" ")}
          >
            {entry.name}
          </span>
          <span className="font-mono text-[0.7rem] text-text-faint">
            {entry.time}
          </span>
        </div>

        <div
          className={[
            "rounded-xl border px-4 py-3 shadow-card",
            isMe
              ? "border-voice/25 bg-voice-soft text-text"
              : "rounded-bl-md border-ink-line bg-ink-raised text-text",
            isMe ? "rounded-br-md" : "",
          ].join(" ")}
        >
          <p
            className={[
              "m-0",
              isMe
                ? "font-utter text-[1.2rem] leading-relaxed"
                : "font-ui text-[1.05rem] leading-relaxed",
            ].join(" ")}
          >
            {entry.text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ListeningRing({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  if (!active || reduce) return null;

  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-voice"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.6,
          }}
        />
      ))}
    </>
  );
}

export default function ConversationView() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(SEED_TURNS);

  function handleToggleRecord() {
    // TODO (later phase): start/stop MediaRecorder; on stop, encode audio_base64
    //   and call stt({ audio_base64 }), then append the result to the transcript.
    setRecording((r) => {
      const next = !r;
      // On stopping, drop in a placeholder partner turn so the surface reacts.
      if (r) {
        setTranscript((t) => [
          ...t,
          {
            id: `live-${Date.now()}`,
            speaker: "partner",
            name: "Partner",
            text: "Transcribed speech will appear here.",
            time: "now",
          },
        ]);
      }
      return next;
    });
  }

  const hasTurns = transcript.length > 0;

  return (
    <div className="mx-auto flex h-full max-w-[760px] flex-col gap-5 p-6">
      <header className="flex items-baseline justify-between">
        <h2 className="m-0 font-ui text-aac-lg font-semibold text-text">
          Conversation
        </h2>
        <span className="font-mono text-eyebrow uppercase text-text-muted">
          {hasTurns ? `${transcript.length} turns` : "no turns yet"}
        </span>
      </header>

      {/* Transcript well */}
      <div
        aria-label="Conversation transcript"
        aria-live="polite"
        className="scroll-ink flex min-h-[340px] flex-1 flex-col gap-5 overflow-y-auto rounded-xl border border-ink-line bg-ink-sunken p-5"
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
              className="flex h-16 w-16 items-center justify-center rounded-full bg-mind-soft text-mind"
            >
              <ChatsCircle size={36} weight="duotone" />
            </div>
            <p className="m-0 font-ui text-[1.1rem] leading-relaxed text-text-muted">
              Tap the mic and I'll listen to your partner.
            </p>
          </div>
        )}
      </div>

      {/* Record control */}
      <div className="flex flex-col items-center gap-3 pt-1">
        <div className="relative flex h-[88px] w-[88px] items-center justify-center">
          <ListeningRing active={recording} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            transition={SPRING}
            onClick={handleToggleRecord}
            aria-pressed={recording}
            aria-label={recording ? "Stop listening" : "Listen to partner"}
            className={[
              "relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full text-on-voice shadow-utter transition-colors",
              "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-voice",
              recording ? "bg-voice-deep" : "bg-voice hover:bg-voice-deep",
            ].join(" ")}
          >
            {recording ? (
              <MicrophoneSlash size={34} weight="fill" />
            ) : (
              <Microphone size={34} weight="fill" />
            )}
          </motion.button>
        </div>

        <span
          aria-live="polite"
          className={[
            "font-mono text-eyebrow uppercase",
            recording ? "text-voice-deep" : "text-text-muted",
          ].join(" ")}
        >
          {recording ? "Listening…" : "Listen to partner"}
        </span>
      </div>
    </div>
  );
}
