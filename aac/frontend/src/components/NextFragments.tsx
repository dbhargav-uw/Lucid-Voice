// NextFragments — predictive "next word" suggestions directly under the
// construction strip. A small local co-occurrence map proposes 3-4 likely next
// fragments from the LAST tapped word; tapping one appends it (same contract as
// a vocab tile). Calm and clearly secondary to the vocab board; the row morphs
// (AnimatePresence) as fragments change.

import { AnimatePresence, motion } from "framer-motion";
import { Lightning, Plus } from "@phosphor-icons/react";
import { DUR, EASE_OUT } from "../lib/motion";
import type { VocabTile } from "./VocabBoard";

// Local co-occurrence map: last fragment -> likely next fragments.
const NEXT_MAP: Record<string, string[]> = {
  tired: ["maybe", "later", "rest"],
  cold: ["window", "blanket"],
  maybe: ["later", "tomorrow"],
  window: ["cold", "open"],
  help: ["please", "now"],
};

// Shown when nothing is tapped yet (a calm starting point).
const DEFAULT_SUGGESTIONS = ["tired", "cold", "help", "yes"];

export interface NextFragmentsProps {
  fragments: string[];
  // Mirrors the vocab-tile contract so the view can reuse handleTileTap.
  onSuggest: (tile: VocabTile) => void;
}

function suggestionsFor(fragments: string[]): string[] {
  if (fragments.length === 0) return DEFAULT_SUGGESTIONS;
  const last = fragments[fragments.length - 1]?.toLowerCase().trim() ?? "";
  const next = NEXT_MAP[last];
  if (next && next.length > 0) {
    // Don't re-suggest words already on the strip.
    const have = new Set(fragments.map((f) => f.toLowerCase().trim()));
    const filtered = next.filter((w) => !have.has(w));
    return filtered.length > 0 ? filtered : next;
  }
  return DEFAULT_SUGGESTIONS;
}

export default function NextFragments({ fragments, onSuggest }: NextFragmentsProps) {
  const suggestions = suggestionsFor(fragments);
  // Key the morph on the current set so AnimatePresence crossfades on change.
  const groupKey = suggestions.join("|");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-text-faint">
        <Lightning size={12} weight="fill" aria-hidden className="text-mind" />
        Next
      </span>
      <div role="list" aria-label="Suggested next words" className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {suggestions.map((word, i) => (
            <motion.button
              key={`${groupKey}-${word}`}
              role="listitem"
              type="button"
              layout
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: DUR.fast, ease: EASE_OUT, delay: i * 0.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSuggest({ id: `next-${word}`, label: word })}
              className="inline-flex min-h-touch items-center gap-1 rounded-full border border-mind/30 bg-mind-soft px-3.5 py-1.5 font-ui text-[0.9rem] text-text transition-colors duration-150 hover:border-mind/55 hover:text-mind"
            >
              <Plus size={13} weight="bold" aria-hidden className="text-mind/70" />
              {word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
