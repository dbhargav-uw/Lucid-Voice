// ConversationView — live partner transcript + record control.
// Not the focus of this build; aligned to the dark ink theme so it stays
// coherent. Functional behavior is still a Phase 7 stub.

import { useState } from "react";
import { motion } from "framer-motion";

interface TranscriptEntry {
  id: string;
  speaker: "partner" | "me";
  text: string;
}

export default function ConversationView() {
  const [recording, setRecording] = useState(false);
  const [transcript] = useState<TranscriptEntry[]>([]);

  function handleToggleRecord() {
    // TODO Phase 7: start/stop MediaRecorder; on stop, encode audio_base64 and
    //   call stt({ audio_base64 }), then append the result to the transcript.
    setRecording((r) => !r);
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-5 p-6">
      <h2 className="m-0 font-ui text-aac-lg font-semibold text-text">
        Conversation
      </h2>

      <div
        aria-label="Live transcript"
        className="scroll-ink flex min-h-[320px] flex-1 flex-col gap-3 rounded-xl border border-ink-line bg-ink-sunken p-4"
      >
        {transcript.length === 0 ? (
          <p className="m-0 text-text-faint">
            The partner&apos;s words will appear here once recording starts.
          </p>
        ) : (
          transcript.map((entry) => (
            <div key={entry.id}>
              <span className="font-mono text-eyebrow uppercase text-text-faint">
                {entry.speaker}
              </span>
              <p className="m-0 mt-1 text-[1.1rem] text-text">{entry.text}</p>
            </div>
          ))
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={handleToggleRecord}
        className={[
          "min-h-cta min-w-cta self-center rounded-lg px-8 font-ui text-[1.1rem] font-semibold transition-colors",
          recording
            ? "bg-voice-deep text-on-voice"
            : "bg-voice text-on-voice hover:bg-voice-deep",
        ].join(" ")}
      >
        {recording ? "Stop listening" : "Listen to partner"}
      </motion.button>
    </div>
  );
}
