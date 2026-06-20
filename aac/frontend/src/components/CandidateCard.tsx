// CandidateCard — renders a single generated Candidate (text, register,
// length, rationale) with a confirm-and-play action. Calm, large target.
// TODO Phase 3: surface grounded_node_ids as a "why this?" affordance.

import { motion } from "framer-motion";
import type { Candidate } from "../lib/api";

export interface CandidateCardProps {
  candidate: Candidate;
  // Confirm this candidate and play it (Phase 3 wires /confirm + /speak).
  onConfirmAndPlay: (candidate: Candidate) => void;
}

const REGISTER_COLORS: Record<Candidate["register"], string> = {
  warm: "#e8b4c8",
  neutral: "#b4c5e8",
  direct: "#b4e8c5",
};

export default function CandidateCard({
  candidate,
  onConfirmAndPlay,
}: CandidateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "1.25rem",
        borderRadius: "20px",
        background: "var(--card-bg, #ffffff)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: 0, fontSize: "1.35rem", lineHeight: 1.35 }}>
        {candidate.text}
      </p>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "0.25rem 0.7rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600,
            background: REGISTER_COLORS[candidate.register],
          }}
        >
          {candidate.register}
        </span>
        <span
          style={{
            padding: "0.25rem 0.7rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            background: "var(--chip-bg, #eef0f4)",
          }}
        >
          {candidate.length_label}
        </span>
      </div>

      {candidate.rationale && (
        <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.6 }}>
          {candidate.rationale}
        </p>
      )}

      <button
        type="button"
        onClick={() => onConfirmAndPlay(candidate)}
        style={{
          alignSelf: "flex-start",
          minHeight: "56px",
          padding: "0 1.5rem",
          borderRadius: "14px",
          border: "none",
          background: "var(--accent, #2b6cff)",
          color: "#fff",
          fontSize: "1.05rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Say this
      </button>
    </motion.div>
  );
}
