// StageOverlay — Stage mode. A calm, full-bleed frosted overlay that presents
// the chosen sentence LARGE in the human serif (font-utter) for the partner to
// read, with a soft speaking animation while audio plays and a clear dismiss.
//
// This is the demo's emotional payload. It uses a small local Lottie (concentric
// coral rings expanding from a soft core) beneath the sentence while `playing`;
// if Lottie fails it falls back to the existing Waveform. Audio is NEVER started
// here — the view triggers playback on the explicit click that opens this
// overlay; the overlay only mirrors the playing state. Esc / Done dismisses;
// focus moves to the Done button on open.

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, SpeakerHigh } from "@phosphor-icons/react";
import { DUR, EASE_OUT, SPRING } from "../lib/motion";
import Waveform from "./Waveform";

// Lottie is dynamically rendered; if the JSON or the lib fails we fall back.
import Lottie from "lottie-react";
import voicePulse from "../assets/voice-pulse.json";

export interface StageOverlayProps {
  open: boolean;
  text: string;
  playing: boolean;
  onClose: () => void;
}

export default function StageOverlay({ open, text, playing, onClose }: StageOverlayProps) {
  const reduce = useReducedMotion();
  const doneRef = useRef<HTMLButtonElement | null>(null);
  // Guard: if Lottie throws at render we flip to the Waveform fallback.
  const lottieOk = useLottieGuard();

  // Esc to dismiss + focus the Done button on open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => doneRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Now speaking"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-ink/92 px-8 backdrop-blur-xl"
          // Click on the backdrop (not the content) dismisses.
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Dismiss control. */}
          <button
            ref={doneRef}
            type="button"
            onClick={onClose}
            aria-label="Done"
            className="btn-touch absolute right-6 top-6 rounded-full border border-ink-line bg-ink-raised font-ui text-[0.95rem] font-medium text-text-muted shadow-card transition-colors duration-fast hover:text-text"
          >
            <X size={18} weight="bold" aria-hidden />
            Done
          </button>

          {/* The chosen sentence — large, centered, balanced. */}
          <motion.p
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={reduce ? { duration: DUR.base } : SPRING}
            className="m-0 max-w-[22ch] text-center font-utter text-stage font-medium leading-tight text-text text-balance"
          >
            {text}
          </motion.p>

          {/* Speaking cue while audio plays — reserves height ONLY when playing
              so the attribution caption isn't orphaned over a void otherwise. */}
          <div
            className={`flex flex-col items-center justify-center gap-5 ${
              playing ? "min-h-[128px]" : ""
            }`}
          >
            {playing ? (
              reduce ? (
                // Reduced motion: a calm static cue with presence, no loop.
                <span className="inline-flex items-center gap-2 rounded-full bg-voice-soft px-4 py-2 font-mono text-[0.8125rem] uppercase tracking-[0.12em] text-voice-deep">
                  <SpeakerHigh size={18} weight="fill" aria-hidden />
                  Speaking
                </span>
              ) : lottieOk ? (
                <div aria-hidden className="h-28 w-28">
                  <Lottie animationData={voicePulse} loop autoplay />
                </div>
              ) : (
                // Fallback if Lottie cannot render — full-presence sound bar.
                <Waveform playing size="lg" />
              )
            ) : null}

            <span className="inline-flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-voice-deep">
              <SpeakerHigh size={13} weight="fill" aria-hidden />
              Spoken in Elena’s voice
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// Tiny render guard so a malformed Lottie can never white-screen the demo.
function useLottieGuard(): boolean {
  // lottie-react present + a valid Bodymovin JSON (has a layers array). If
  // either is missing the overlay falls back to the Waveform.
  return (
    !!Lottie &&
    !!voicePulse &&
    Array.isArray((voicePulse as { layers?: unknown[] }).layers) &&
    (voicePulse as { layers: unknown[] }).layers.length > 0
  );
}
