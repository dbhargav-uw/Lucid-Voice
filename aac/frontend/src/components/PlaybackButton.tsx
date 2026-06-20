// PlaybackButton — large `voice` speak control with an inline waveform while
// playing. Playback itself is owned by useSpeak (passed via onPlay); this stays
// a presentational control so the app NEVER auto-speaks.

import { motion } from "framer-motion";
import Waveform from "./Waveform";

export interface PlaybackButtonProps {
  text: string;
  personId: string;
  disabled?: boolean;
  playing?: boolean;
  onPlay?: (args: { personId: string; text: string }) => void;
}

export default function PlaybackButton({
  text,
  personId,
  disabled = false,
  playing = false,
  onPlay,
}: PlaybackButtonProps) {
  const isDisabled = disabled || text.trim().length === 0;

  function handleClick() {
    if (isDisabled) return;
    onPlay?.({ personId, text });
  }

  return (
    <motion.button
      type="button"
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label="Play message aloud"
      className={[
        "inline-flex min-h-cta min-w-cta items-center justify-center gap-2.5 rounded-lg px-6 font-ui text-[1.1rem] font-semibold transition-colors",
        isDisabled
          ? "cursor-default bg-ink-raised text-text-faint"
          : "bg-voice text-ink hover:bg-voice-deep",
      ].join(" ")}
    >
      {playing ? (
        <Waveform playing />
      ) : (
        <span aria-hidden className="text-[1.3rem] leading-none">
          ▸
        </span>
      )}
      Speak
    </motion.button>
  );
}
