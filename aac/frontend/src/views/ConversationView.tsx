// ConversationView — live partner transcript + record control.
// Phase 1: layout stub with local state only.
// TODO Phase 7: /stt — capture mic audio, POST to stt(), append transcript.

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        padding: "1.5rem",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.3rem" }}>Conversation</h2>

      <div
        aria-label="Live transcript"
        style={{
          flex: 1,
          minHeight: "320px",
          padding: "1rem",
          borderRadius: "16px",
          background: "var(--strip-bg, #ffffff)",
          border: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {transcript.length === 0 ? (
          <p style={{ opacity: 0.45, margin: 0 }}>
            {/* TODO Phase 7: partner speech transcribed here in real time. */}
            The partner&apos;s words will appear here once recording starts.
          </p>
        ) : (
          transcript.map((entry) => (
            <div key={entry.id}>
              <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>
                {entry.speaker}
              </span>
              <p style={{ margin: "0.2rem 0 0", fontSize: "1.1rem" }}>
                {entry.text}
              </p>
            </div>
          ))
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={handleToggleRecord}
        style={{
          alignSelf: "center",
          minHeight: "72px",
          minWidth: "72px",
          padding: "0 2rem",
          borderRadius: "20px",
          border: "none",
          background: recording ? "#ff4d4f" : "var(--accent, #2b6cff)",
          color: "#fff",
          fontSize: "1.1rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {recording ? "Stop listening" : "Listen to partner"}
      </motion.button>
    </div>
  );
}
