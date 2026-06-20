// useSpeak — owns playback for the Speaker view.
//
// Chain (never silent): call speak({ person_id, text }); if audio_base64 is
// non-empty, decode + play it; otherwise (empty payload or any error) fall
// back to the browser SpeechSynthesis API so the demo ALWAYS produces audio.
//
// The hook NEVER auto-speaks — it only plays when speak() is called explicitly
// (the Speaker view calls it from the "Say this" click only).

import { useCallback, useEffect, useRef, useState } from "react";
import { speak as apiSpeak } from "../lib/api";

export interface UseSpeak {
  speak: (text: string) => Promise<void>;
  playing: boolean;
}

// Decode a base64 string into an ArrayBuffer for the Audio element.
function base64ToBlobUrl(b64: string): string {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  // WAV is the safe default for XTTS output; the browser sniffs anyway.
  const blob = new Blob([bytes], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

export function useSpeak(personId: string): UseSpeak {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  // Clean up any object URL / utterance on unmount.
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* no-op */
      }
    };
  }, []);

  const playBrowserTTS = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.98;
      utter.pitch = 1.0;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });
  }, []);

  const playAudioUrl = useCallback((url: string) => {
    return new Promise<void>((resolve) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      void audio.play().catch(() => resolve());
    });
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setPlaying(true);
      try {
        let audioB64 = "";
        try {
          const res = await apiSpeak({ person_id: personId, text: trimmed });
          audioB64 = res.audio_base64 ?? "";
        } catch {
          audioB64 = "";
        }

        if (audioB64) {
          if (urlRef.current) URL.revokeObjectURL(urlRef.current);
          const url = base64ToBlobUrl(audioB64);
          urlRef.current = url;
          await playAudioUrl(url);
        } else {
          // Fallback so the demo is never silent.
          await playBrowserTTS(trimmed);
        }
      } finally {
        setPlaying(false);
      }
    },
    [personId, playAudioUrl, playBrowserTTS],
  );

  return { speak, playing };
}

export default useSpeak;
