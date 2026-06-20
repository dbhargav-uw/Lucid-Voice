import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SpeakerView from "./views/SpeakerView";
import ConversationView from "./views/ConversationView";
import GraphView from "./views/GraphView";

const NAV_ITEMS = [
  { to: "/", label: "Speak", end: true },
  { to: "/conversation", label: "Conversation", end: false },
  { to: "/graph", label: "Graph", end: false },
];

function TopNav() {
  return (
    <nav className="flex items-center gap-2 border-b border-calm-border bg-calm-surface px-6 py-4">
      <span className="mr-6 text-aac-lg font-semibold text-calm-primary">
        Lucid Voice
      </span>
      <div className="flex gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "min-h-touch rounded-calm px-6 py-3 text-aac-base transition-colors",
                isActive
                  ? "bg-calm-primary-soft text-calm-text"
                  : "text-calm-muted hover:bg-calm-bg",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <TopNav />
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
  );
}
