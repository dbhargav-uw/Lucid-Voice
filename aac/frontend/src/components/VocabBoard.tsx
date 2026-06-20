// VocabBoard — categorized vocabulary tiles in the bottom well.
//
// Tiles are ink-raised, lift + gain a voice-tinted ring on hover, and tap to
// 0.96. Includes the demo people (Sofia, Mateo, Marco) and the demo words
// (cold, window, tired, maybe) so all three demo rounds are tappable.

import { motion } from "framer-motion";
import { EASE_OUT } from "../lib/motion";

export interface VocabTile {
  id: string;
  label: string;
}

export interface VocabCategory {
  id: string;
  label: string;
  tiles: VocabTile[];
}

export interface VocabBoardProps {
  onTileTap: (tile: VocabTile) => void;
  categories?: VocabCategory[];
}

// Demo persona (Elena) vocabulary — covers all three demo rounds.
const DEMO_CATEGORIES: VocabCategory[] = [
  {
    id: "people",
    label: "People",
    tiles: [
      { id: "p-sofia", label: "Sofia" },
      { id: "p-mateo", label: "Mateo" },
      { id: "p-marco", label: "Marco" },
    ],
  },
  {
    id: "feelings",
    label: "Feelings",
    tiles: [
      { id: "f-tired", label: "tired" },
      { id: "f-cold", label: "cold" },
      { id: "f-happy", label: "happy" },
      { id: "f-okay", label: "okay" },
    ],
  },
  {
    id: "needs",
    label: "Needs",
    tiles: [
      { id: "n-window", label: "window" },
      { id: "n-water", label: "water" },
      { id: "n-rest", label: "rest" },
      { id: "n-help", label: "help" },
    ],
  },
  {
    id: "social",
    label: "Social",
    tiles: [
      { id: "s-maybe", label: "maybe" },
      { id: "s-yes", label: "yes" },
      { id: "s-no", label: "no" },
      { id: "s-later", label: "later" },
    ],
  },
];

export default function VocabBoard({
  onTileTap,
  categories = DEMO_CATEGORIES,
}: VocabBoardProps) {
  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => (
        <section key={category.id} aria-label={category.label}>
          <h3 className="eyebrow mb-2">{category.label}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-3">
            {category.tiles.map((tile) => (
              <motion.button
                key={tile.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97, y: 0 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                onClick={() => onTileTap(tile)}
                className="min-h-tile rounded-lg border border-ink-line bg-ink-raised font-ui text-tile font-semibold text-text shadow-card transition-[border-color,box-shadow,background-color] duration-200 hover:border-voice/45 hover:bg-ink-raised hover:shadow-lift"
              >
                {tile.label}
              </motion.button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
