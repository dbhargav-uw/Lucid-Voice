// NextFragments — predictive "next word" suggestions directly under the
// construction strip. A small local co-occurrence map proposes 3-4 likely next
// fragments from the LAST tapped word; tapping one appends it (same contract as
// a vocab tile). Calm and clearly secondary to the vocab board; the row morphs
// (AnimatePresence) as fragments change.

import { motion } from "framer-motion";
import { Lightning } from "@phosphor-icons/react";
import type { VocabTile } from "./VocabBoard";

// Local co-occurrence map: last fragment -> likely next fragments.
const NEXT_MAP: Record<string, string[]> = {
  tired: ["maybe", "later", "rest"],
  cold: ["window", "blanket"],
  maybe: ["later", "tomorrow"],
  window: ["cold", "open"],
  help: ["please", "now"],
};

// Generic starting point when nothing is tapped and the partner context gives
// no signal.
const DEFAULT_SUGGESTIONS = ["tired", "cold", "help", "yes"];

// Context-keyed openers — the first words ADAPT to what the partner just said,
// matched by keyword on the latest partner utterance (first match wins).
const CONTEXT_STARTERS: { match: RegExp; words: string[] }[] = [
  { match: /\b(dinner|eat|food|lunch|breakfast|come over|visit)\b/i, words: ["tired", "maybe", "yes", "later"] },
  { match: /\b(play|game|toy|toys)\b/i, words: ["tired", "later", "maybe", "soon"] },
  { match: /\b(okay|alright|feeling|how are you|sad|sick|tired)\b/i, words: ["okay", "tired", "happy", "thank you"] },
  { match: /\b(bring|need|want|anything|soup|water|help)\b/i, words: ["yes", "no", "water", "thank you"] },
  { match: /\b(rest|nap|sleep)\b/i, words: ["yes", "later", "thank you", "okay"] },
  { match: /\b(love|miss|hug)\b/i, words: ["love", "yes", "happy", "thank you"] },
  { match: /\b(time|tomorrow|when|later|call)\b/i, words: ["tomorrow", "later", "maybe", "okay"] },
];

function starterSuggestions(context?: string): string[] {
  const c = (context ?? "").trim();
  if (c) {
    for (const { match, words } of CONTEXT_STARTERS) {
      if (match.test(c)) return words;
    }
  }
  return DEFAULT_SUGGESTIONS;
}

export interface NextFragmentsProps {
  fragments: string[];
  // The latest partner utterance — used to seed the first suggestions.
  context?: string;
  // Mirrors the vocab-tile contract so the view can reuse handleTileTap.
  onSuggest: (tile: VocabTile) => void;
}

function suggestionsFor(fragments: string[], context?: string): string[] {
  if (fragments.length === 0) return starterSuggestions(context);
  const last = fragments[fragments.length - 1]?.toLowerCase().trim() ?? "";
  const next = NEXT_MAP[last];
  if (next && next.length > 0) {
    // Don't re-suggest words already on the strip.
    const have = new Set(fragments.map((f) => f.toLowerCase().trim()));
    const filtered = next.filter((w) => !have.has(w));
    return filtered.length > 0 ? filtered : next;
  }
  return starterSuggestions(context);
}

export default function NextFragments({ fragments, context, onSuggest }: NextFragmentsProps) {
  const suggestions = suggestionsFor(fragments, context);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="eyebrow inline-flex items-center gap-1.5">
        <Lightning size={12} weight="fill" aria-hidden className="text-mind" />
        Next
      </span>
      <div role="list" aria-label="Suggested next words" className="flex flex-wrap gap-2">
        {/* Plain buttons (tap-press feedback only). These rows re-render on every
            context/fragment change; framer enter/exit transitions deadlock under
            that churn, so the set just swaps instantly. */}
        {suggestions.map((word) => (
          <motion.button
            key={word}
            role="listitem"
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => onSuggest({ id: `next-${word}`, label: word })}
            className="inline-flex min-h-[2.25rem] items-center rounded-full border border-mind/25 bg-mind-soft px-3.5 font-ui text-[0.9rem] text-text transition-colors duration-fast hover:border-mind/55 hover:text-mind"
          >
            {word}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
