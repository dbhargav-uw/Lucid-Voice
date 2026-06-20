// PlaybackButton — large play button that will call /speak and play the
// returned audio. Phase 1 is a visual stub only.
// TODO Phase 4: call speak({ person_id, text }) and play audio_base64.

import { motion } from "framer-motion";

export interface PlaybackButtonProps {
  text: string;
  personId: string;
  disabled?: boolean;
  // Phase 4 will wire this to the /speak endpoint + audio playback.
  onPlay?: (args: { personId: string; text: string }) => void;
}

export default function PlaybackButton({
  text,
  personId,
  disabled = false,
  onPlay,
}: PlaybackButtonProps) {
  const isDisabled = disabled || text.trim().length === 0;

  function handleClick() {
    // TODO Phase 4: const res = await speak({ person_id: personId, text });
    //               play decoded res.audio_base64.
    onPlay?.({ personId, text });
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label="Play message aloud"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        minHeight: "72px",
        minWidth: "72px",
        padding: "0 1.75rem",
        borderRadius: "20px",
        border: "none",
        background: isDisabled ? "var(--chip-bg, #eef0f4)" : "var(--accent, #2b6cff)",
        color: isDisabled ? "rgba(0,0,0,0.35)" : "#fff",
        fontSize: "1.2rem",
        fontWeight: 600,
        cursor: isDisabled ? "default" : "pointer",
      }}
    >
      <span aria-hidden style={{ fontSize: "1.4rem" }}>
        ▶
      </span>
      Speak
    </motion.button>
  );
}
