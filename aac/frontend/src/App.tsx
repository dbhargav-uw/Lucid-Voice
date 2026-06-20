import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import SpeakerView from "./views/SpeakerView";
import ConversationView from "./views/ConversationView";
import GraphView from "./views/GraphView";

const NAV_ITEMS = [
  { to: "/", label: "Speak", end: true },
  { to: "/conversation", label: "Conversation", end: false },
  { to: "/graph", label: "Graph", end: false },
];

function TopBar() {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-line bg-ink px-4 py-3 sm:px-6 sm:py-3.5">
      {/* Wordmark. */}
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-[1.35rem] leading-none text-voice">
          ◐
        </span>
        <span className="whitespace-nowrap font-ui text-[1.35rem] font-bold tracking-[-0.02em] text-text sm:text-[1.5rem]">
          Lucid Voice
        </span>
      </div>

      {/* Static person pill (hidden on the narrowest screens to keep one row). */}
      <button
        type="button"
        className="ml-2 hidden items-center gap-1.5 rounded-full border border-ink-line bg-ink-raised px-3.5 py-1.5 font-ui text-[0.95rem] font-medium text-text sm:inline-flex"
      >
        Elena
        <CaretDown size={14} weight="bold" aria-hidden className="text-text-muted" />
      </button>

      {/* Quiet pill nav. */}
      <nav className="ml-auto flex items-center gap-1 sm:gap-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "min-h-touch rounded-full px-4 py-2 font-ui text-[0.95rem] font-medium transition-colors",
                isActive
                  ? "bg-ink-raised text-text"
                  : "text-text-muted hover:bg-ink-raised/60 hover:text-text",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Honest status chip (only when there's room — hidden below lg). */}
      <div className="hidden items-center gap-2 rounded-full border border-ink-line bg-ink-raised px-3 py-1.5 lg:inline-flex">
        <span aria-hidden className="h-2 w-2 rounded-full bg-mind" />
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-text-muted">
          on-device · airplane-ok
        </span>
      </div>
    </header>
  );
}

export default function App() {
  const location = useLocation();

  return (
    // reducedMotion="user" makes every Framer Motion component honor the OS
    // "reduce motion" setting (disables transform/layout animation, keeps
    // opacity) — covers the candidate bloom + selection choreography that CSS
    // alone can't reach.
    <MotionConfig reducedMotion="user">
    <div className="flex h-full flex-col bg-ink text-text">
      <TopBar />
      <main className="flex-1 overflow-auto">
        {/* Light-touch route transitions. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<SpeakerView />} />
              <Route path="/conversation" element={<ConversationView />} />
              <Route path="/graph" element={<GraphView />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
    </MotionConfig>
  );
}
