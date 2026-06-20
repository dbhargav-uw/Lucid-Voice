// VocabBoard — categorized vocabulary tile board.
// Calm layout, large touch targets. Phase 1 renders placeholder categories.
// TODO Phase 2: source categories/tiles from seeded vocabulary + graph.

import { motion } from "framer-motion";

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

// Placeholder vocabulary until Phase 2 wires real data.
const PLACEHOLDER_CATEGORIES: VocabCategory[] = [
  {
    id: "people",
    label: "People",
    tiles: [
      { id: "p-mum", label: "Mum" },
      { id: "p-dad", label: "Dad" },
      { id: "p-nurse", label: "Nurse" },
      { id: "p-friend", label: "Friend" },
    ],
  },
  {
    id: "feelings",
    label: "Feelings",
    tiles: [
      { id: "f-tired", label: "tired" },
      { id: "f-happy", label: "happy" },
      { id: "f-pain", label: "in pain" },
      { id: "f-okay", label: "okay" },
    ],
  },
  {
    id: "needs",
    label: "Needs",
    tiles: [
      { id: "n-water", label: "water" },
      { id: "n-rest", label: "rest" },
      { id: "n-help", label: "help" },
      { id: "n-bathroom", label: "bathroom" },
    ],
  },
  {
    id: "social",
    label: "Social",
    tiles: [
      { id: "s-yes", label: "yes" },
      { id: "s-no", label: "no" },
      { id: "s-thanks", label: "thank you" },
      { id: "s-later", label: "later" },
    ],
  },
];

export default function VocabBoard({
  onTileTap,
  categories = PLACEHOLDER_CATEGORIES,
}: VocabBoardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {categories.map((category) => (
        <section key={category.id} aria-label={category.label}>
          <h3
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            {category.label}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {category.tiles.map((tile) => (
              <motion.button
                key={tile.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onTileTap(tile)}
                style={{
                  minHeight: "88px",
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "var(--tile-bg, #f5f5f7)",
                  color: "inherit",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
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
