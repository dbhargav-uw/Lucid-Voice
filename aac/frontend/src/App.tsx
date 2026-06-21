import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import ConversationView from "./views/ConversationView";
import GraphView from "./views/GraphView";
import { DUR, EASE_OUT } from "./lib/motion";

const NAV_ITEMS = [
  { to: "/", label: "Conversation", end: true },
  { to: "/graph", label: "Graph", end: false },
];

function TopBar() {
  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink-line bg-ink px-4 py-2.5 sm:px-6">
      {/* Wordmark — the voice-orb mark + "Lucid" (Geist) · "Voice" (Newsreader
          serif, the human-utterance type), matching assets/logo-lockup.svg. */}
      <div className="flex items-center gap-2" aria-label="Lucid Voice">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
        >
          <circle cx="50" cy="50" r="46" fill="#E14826" />
          <g fill="#FFFFFF">
            <rect x="22" y="38" width="8" height="24" rx="4" />
            <rect x="34" y="30" width="8" height="40" rx="4" />
            <rect x="46" y="22" width="8" height="56" rx="4" />
            <rect x="58" y="30" width="8" height="40" rx="4" />
            <rect x="70" y="38" width="8" height="24" rx="4" />
          </g>
        </svg>
        <span className="whitespace-nowrap leading-none tracking-[-0.02em]">
          <span className="font-ui text-[1.35rem] font-bold text-text sm:text-[1.5rem]">
            Lucid
          </span>
          <span className="ml-[0.18em] font-utter text-[1.35rem] font-medium text-voice sm:text-[1.5rem]">
            Voice
          </span>
        </span>
      </div>

      {/* Person switcher (hidden on the narrowest screens to keep one row). */}
      <button
        type="button"
        aria-label="Switch person — current: Elena"
        className="ml-1 hidden h-10 items-center gap-1.5 rounded-full border border-ink-line bg-ink-raised px-3.5 font-ui text-[0.95rem] font-medium text-text transition-colors duration-fast ease-out-quart hover:bg-ink-sunken sm:inline-flex"
      >
        Elena
        <CaretDown size={14} weight="bold" aria-hidden className="text-text-muted" />
      </button>

      {/* Quiet pill nav. */}
      <nav className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "inline-flex h-10 items-center justify-center rounded-full px-4 font-ui text-[0.95rem] font-medium transition-colors duration-fast ease-out-quart",
                isActive
                  ? "bg-ink-raised text-text shadow-card ring-1 ring-ink-line"
                  : "text-text-muted hover:bg-ink-sunken hover:text-text",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Honest status chip — non-interactive (hidden below lg). */}
      <div
        role="status"
        className="hidden h-10 items-center gap-2 rounded-full border border-transparent bg-ink-sunken px-3.5 lg:inline-flex"
      >
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
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<ConversationView />} />
              <Route path="/conversation" element={<Navigate to="/" replace />} />
              <Route path="/graph" element={<GraphView />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
    </MotionConfig>
  );
}
