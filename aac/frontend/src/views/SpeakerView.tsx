// SpeakerView — the core AAC speaker UI.
// Phase 1: state machine + layout wired with local state only. The real
// retrieval/generation/abstain handling lands in Phase 3.

import { useState } from "react";
import VocabBoard, { type VocabTile } from "../components/VocabBoard";
import ConstructionStrip from "../components/ConstructionStrip";
import CandidateCard from "../components/CandidateCard";
import StateIndicator from "../components/StateIndicator";
import PlaybackButton from "../components/PlaybackButton";
import type { Candidate } from "../lib/api";

// Speaker flow: idle -> listening -> thinking -> candidates -> speaking.
type SpeakerStateName =
  | "idle"
  | "listening"
  | "thinking"
  | "candidates"
  | "speaking";

// Placeholder person until profile selection exists (later phase).
const PERSON_ID = "demo-person";

export default function SpeakerView() {
  const [state, setState] = useState<SpeakerStateName>("idle");
  const [fragments, setFragments] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Engagement metric: how many taps it took vs. words produced.
  const [taps, setTaps] = useState(0);

  function handleTileTap(tile: VocabTile) {
    setFragments((prev) => [...prev, tile.label]);
    setTaps((n) => n + 1);
    if (state === "idle") setState("listening");
  }

  function handleClear() {
    setFragments([]);
    setCandidates([]);
    setState("idle");
  }

  function handleGenerate() {
    if (fragments.length === 0) return;
    setState("thinking");
    // TODO Phase 3: call generate({ person_id: PERSON_ID, fragments, ... }),
    //   set candidates from the response, and handle abstain / abstain_reason.
    setCandidates([]);
    setState("candidates");
  }

  function handleConfirmAndPlay(_candidate: Candidate) {
    setState("speaking");
    // TODO Phase 3: call confirm(...) to reinforce the graph, then play via
    //   the /speak endpoint (Phase 4). Return to idle when playback ends.
    setState("idle");
  }

  // Escape hatches when none of the candidates fit.
  function handleNoneOfThese() {
    // TODO Phase 3: re-generate with a "reject" signal / widen retrieval.
    setState("listening");
  }

  function handleAddAWord() {
    // TODO Phase 3: open a quick add-word affordance.
    setState("listening");
  }

  function handleTryAgain() {
    handleGenerate();
  }

  const wordCount = fragments.join(" ").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        padding: "1.5rem",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <StateIndicator state={state} />
        <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>
          {taps} taps → {wordCount} words
        </span>
      </header>

      <ConstructionStrip fragments={fragments} onClear={handleClear} />

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={fragments.length === 0}
          style={{
            minHeight: "56px",
            padding: "0 1.5rem",
            borderRadius: "14px",
            border: "none",
            background:
              fragments.length === 0
                ? "var(--chip-bg, #eef0f4)"
                : "var(--accent, #2b6cff)",
            color: fragments.length === 0 ? "rgba(0,0,0,0.35)" : "#fff",
            fontSize: "1.05rem",
            fontWeight: 600,
            cursor: fragments.length === 0 ? "default" : "pointer",
          }}
        >
          Suggest replies
        </button>
        <PlaybackButton text={fragments.join(" ")} personId={PERSON_ID} />
      </div>

      {state === "candidates" && (
        <section
          aria-label="Suggested replies"
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {candidates.length === 0 ? (
            <p style={{ opacity: 0.55 }}>
              {/* TODO Phase 3: render real candidates / abstain message. */}
              No suggestions yet — Phase 3 will fill these in.
            </p>
          ) : (
            candidates.map((c, i) => (
              <CandidateCard
                key={i}
                candidate={c}
                onConfirmAndPlay={handleConfirmAndPlay}
              />
            ))
          )}

          {/* Escape hatch. */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" onClick={handleNoneOfThese} style={escapeBtn}>
              None of these
            </button>
            <button type="button" onClick={handleAddAWord} style={escapeBtn}>
              Add a word
            </button>
            <button type="button" onClick={handleTryAgain} style={escapeBtn}>
              Try again
            </button>
          </div>
        </section>
      )}

      <VocabBoard onTileTap={handleTileTap} />
    </div>
  );
}

const escapeBtn: React.CSSProperties = {
  minHeight: "48px",
  padding: "0 1.2rem",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "transparent",
  color: "inherit",
  fontSize: "0.95rem",
  cursor: "pointer",
};
