// ConstructionStrip — shows the fragments the speaker has chosen so far,
// with a clear button. Calm, large targets.
// TODO Phase 3: allow re-ordering / removing individual fragments.

import { AnimatePresence, motion } from "framer-motion";

export interface ConstructionStripProps {
  fragments: string[];
  onClear: () => void;
}

export default function ConstructionStrip({
  fragments,
  onClear,
}: ConstructionStripProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        minHeight: "72px",
        padding: "0.75rem 1rem",
        borderRadius: "16px",
        background: "var(--strip-bg, #ffffff)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        {fragments.length === 0 ? (
          <span style={{ opacity: 0.45, fontSize: "1.05rem" }}>
            Tap words to build a message…
          </span>
        ) : (
          <AnimatePresence initial={false}>
            {fragments.map((fragment, i) => (
              <motion.span
                key={`${fragment}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "999px",
                  background: "var(--chip-bg, #eef0f4)",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                }}
              >
                {fragment}
              </motion.span>
            ))}
          </AnimatePresence>
        )}
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={fragments.length === 0}
        style={{
          minHeight: "48px",
          minWidth: "72px",
          borderRadius: "12px",
          border: "none",
          background: "transparent",
          color: "inherit",
          opacity: fragments.length === 0 ? 0.3 : 0.7,
          fontSize: "1rem",
          cursor: fragments.length === 0 ? "default" : "pointer",
        }}
      >
        Clear
      </button>
    </div>
  );
}
