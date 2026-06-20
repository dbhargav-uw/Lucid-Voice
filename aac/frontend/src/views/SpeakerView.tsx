// SpeakerView — the Lucid Voice console (the full AAC loop).
//
// State machine: idle → listening → thinking → candidates → speaking → idle.
// Tapping vocab tiles appends fragments. A "Heard from partner" control sets
// the conversational context. "Suggest replies" calls /generate; on network
// error, abstain, or zero candidates it falls back to bundled demo content; if
// still nothing it shows a calm abstain message. The reasoning rail is fed from
// the response (live trace + confidence, or the demo reasoning).
//
// Selection is the authorship beat: clicking "Say this" marks the card
// `selected`, the others `rejected` (they recede), fires confirm(...) (errors
// ignored), then plays via useSpeak. The app NEVER auto-speaks — audio only
// ever plays from an explicit click.

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkle, Ear, CircleNotch, SpeakerHigh } from "@phosphor-icons/react";
import { DUR, EASE_OUT } from "../lib/motion";
import VocabBoard, { type VocabTile } from "../components/VocabBoard";
import ConstructionStrip from "../components/ConstructionStrip";
import CandidateCard from "../components/CandidateCard";
import StateIndicator from "../components/StateIndicator";
import ReasoningRail, { type RailData } from "../components/ReasoningRail";
import useSpeak from "../hooks/useSpeak";
import { confirm, generate } from "../lib/api";
import type { Candidate } from "../lib/api";
import { demoGenerate, demoReasoning, type DemoReasoning } from "../lib/demo";

type SpeakerStateName =
  | "idle"
  | "listening"
  | "thinking"
  | "candidates"
  | "speaking";

// Matches the demo persona.
const PERSON_ID = "elena";

// Preset "Heard from partner" prompts (their exact text becomes the context so
// the demo signature matches).
const HEARD_PRESETS = [
  "Mom, do you want to come for dinner Sunday?",
  "Grandma, will you play with me?",
  "Nothing yet",
];

// Coerce whatever the backend / demo put in `trace` into RailData.
function railFromTrace(
  trace: Record<string, unknown>,
  fragments: string[],
  context: string,
  confidence: number,
): RailData {
  // Demo path stuffs a typed reasoning object under trace.reasoning.
  const reasoning = trace?.reasoning as DemoReasoning | undefined;
  if (reasoning && Array.isArray(reasoning.tapsSignal)) {
    return reasoning;
  }
  // Live path: derive a best-effort rail from the request + confidence.
  return {
    heard: context,
    tapsSignal: fragments.map((f) => `${f} →`),
    profile: ["Elena: warm, former teacher"],
    confidence,
    grounded: [],
  };
}

export default function SpeakerView() {
  const [state, setState] = useState<SpeakerStateName>("idle");
  const [fragments, setFragments] = useState<string[]>([]);
  const [context, setContext] = useState<string>("");
  const [heardInput, setHeardInput] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [rail, setRail] = useState<RailData | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [abstainMsg, setAbstainMsg] = useState<string>("");

  const { speak, playing } = useSpeak(PERSON_ID);

  const speaking = state === "speaking";

  // ── fragment / context mutation ─────────────────────────────────────────
  function handleTileTap(tile: VocabTile) {
    setFragments((prev) => [...prev, tile.label]);
    setCandidates([]);
    setSelectedIdx(null);
    setAbstainMsg("");
    if (state === "idle" || state === "candidates" || state === "speaking") {
      setState("listening");
    }
  }

  function handleRemove(index: number) {
    setFragments((prev) => prev.filter((_, i) => i !== index));
    setCandidates([]);
    setSelectedIdx(null);
    setAbstainMsg("");
    if (fragments.length <= 1) setState("idle");
  }

  function handleClear() {
    setFragments([]);
    setCandidates([]);
    setSelectedIdx(null);
    setAbstainMsg("");
    setState("idle");
  }

  function pickHeard(preset: string) {
    // "Nothing yet" clears the context.
    setContext(preset === "Nothing yet" ? "" : preset);
    setHeardInput(preset === "Nothing yet" ? "" : preset);
  }

  // ── generation ──────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (fragments.length === 0) return;
    setState("thinking");
    setCandidates([]);
    setSelectedIdx(null);
    setAbstainMsg("");
    setRail(null);

    const req = {
      person_id: PERSON_ID,
      fragments,
      context,
    };

    let live = null as Awaited<ReturnType<typeof generate>> | null;
    try {
      live = await generate(req);
    } catch {
      live = null;
    }

    // The live model "actually answered" only when it returns a real choice set
    // (>=2 non-abstain candidates). A single degraded candidate (e.g. LM Studio
    // down → backend builds one from the raw words) is NOT good enough to lose
    // the curated multi-register divergence, so we prefer the demo content when
    // a signature match exists. Live still wins whenever the LLM is up.
    const liveStrong = !!live && !live.abstain && live.candidates.length >= 2;
    const demo = demoGenerate(req);

    let result: Awaited<ReturnType<typeof generate>> | null = null;
    if (liveStrong) {
      result = live;
    } else if (demo) {
      result = demo;
    } else if (live && !live.abstain && live.candidates.length > 0) {
      result = live; // weak live answer, but better than nothing
    }

    if (!result || result.candidates.length === 0) {
      // Calm abstain.
      setAbstainMsg("Add one more word so I can be sure.");
      setRail(demoReasoning(fragments, context));
      setState("candidates");
      return;
    }

    setCandidates(result.candidates);
    setRail(
      railFromTrace(
        result.trace ?? {},
        fragments,
        context,
        result.retrieval.confidence,
      ),
    );
    setState("candidates");
  }

  // ── selection = authorship beat ──────────────────────────────────────────
  async function handleSay(candidate: Candidate, index: number) {
    setSelectedIdx(index);
    setState("speaking");

    // Fire-and-forget graph reinforcement.
    try {
      void confirm({
        person_id: PERSON_ID,
        text: candidate.text,
        context,
      });
    } catch {
      /* ignore */
    }

    // Play (the only place audio is ever triggered).
    await speak(candidate.text);
    // Chosen utterance lingers; return to a calm idle.
    setState("idle");
  }

  const ctaDisabled = fragments.length === 0 || state === "thinking";

  const chosenText = useMemo(
    () => (selectedIdx != null ? candidates[selectedIdx]?.text : undefined),
    [selectedIdx, candidates],
  );

  return (
    <div
      className={[
        "relative grid h-full grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_380px]",
        speaking ? "is-speaking" : "",
      ].join(" ")}
    >
      {/* Stage column. */}
      <section className="relative flex min-w-0 flex-col gap-5">
        <div className="stage-wash" aria-hidden />

        {/* Stage header. */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <StateIndicator state={state} />
        </div>

        {/* Heard from partner. */}
        <div className="relative z-10 flex flex-col gap-2">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <Ear size={14} weight="bold" aria-hidden className="text-text-faint" />
            Heard from partner
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {HEARD_PRESETS.map((preset) => {
              const active =
                preset === "Nothing yet" ? context === "" : context === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => pickHeard(preset)}
                  className={[
                    "rounded-full border px-3.5 py-2 font-ui text-[0.9rem] transition-colors",
                    active
                      ? "border-mind/50 bg-mind-soft text-mind"
                      : "border-ink-line bg-ink-raised text-text-muted hover:text-text",
                  ].join(" ")}
                >
                  {preset}
                </button>
              );
            })}
            <input
              type="text"
              value={heardInput}
              onChange={(e) => {
                setHeardInput(e.target.value);
                setContext(e.target.value);
              }}
              placeholder="…or type what they said"
              aria-label="What the partner said"
              className="min-h-touch flex-1 rounded-md border border-ink-line bg-ink-sunken px-3.5 font-ui text-[0.95rem] text-text placeholder:text-text-faint"
            />
          </div>
        </div>

        {/* Construction strip. */}
        <div className="relative z-10">
          <ConstructionStrip
            fragments={fragments}
            onRemove={handleRemove}
            onClear={handleClear}
          />
        </div>

        {/* CTA. */}
        <div className="relative z-10">
          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={ctaDisabled}
            whileTap={ctaDisabled ? undefined : { scale: 0.98 }}
            className={[
              "inline-flex min-h-cta items-center gap-2.5 rounded-md px-6 font-ui text-[1.1rem] font-semibold transition-colors duration-200",
              ctaDisabled
                ? "cursor-default bg-ink-raised text-text-faint"
                : "bg-voice text-on-voice hover:bg-voice-deep",
            ].join(" ")}
          >
            {state === "thinking" ? (
              <>
                <CircleNotch size={20} weight="bold" aria-hidden className="animate-spin" />
                Composing…
              </>
            ) : (
              <>
                <Sparkle size={20} weight="fill" aria-hidden />
                Suggest replies
              </>
            )}
          </motion.button>
        </div>

        {/* Candidates / thinking skeletons / abstain. */}
        <section
          aria-label="Suggested replies"
          aria-live="polite"
          className="relative z-10 flex flex-col gap-4"
        >
          {state === "thinking" && (
            <div
              aria-hidden
              className="relative overflow-hidden rounded-xl border border-ink-line bg-ink-raised p-6"
            >
              <div className="flex flex-col gap-3">
                <div className="h-5 w-4/5 rounded bg-ink-line/70" />
                <div className="h-5 w-2/5 rounded bg-ink-line/45" />
                <div className="mt-2 h-9 w-32 rounded-md bg-ink-line/35" />
              </div>
              {/* one shimmer sweep — a loading cue, not decorative pulse */}
              <motion.div
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(244,239,233,0.05), transparent)",
                }}
                animate={{ x: ["0%", "300%"] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          {(state === "candidates" || state === "speaking") && (
            <>
              {abstainMsg ? (
                <div className="rounded-xl border border-ink-line bg-ink-raised p-6">
                  <p className="m-0 font-utter text-candidate text-text-muted">
                    {abstainMsg}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {candidates.map((c, i) => (
                    <CandidateCard
                      key={`${c.text}-${i}`}
                      candidate={c}
                      index={i}
                      selected={selectedIdx === i}
                      rejected={selectedIdx != null && selectedIdx !== i}
                      playing={selectedIdx === i && playing}
                      onSay={(cand) => handleSay(cand, i)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </>
          )}

          {state === "idle" && chosenText && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="rounded-xl border border-voice/45 bg-voice-soft p-6 shadow-utter"
            >
              <p className="m-0 font-utter text-stage font-medium leading-tight text-text text-balance">
                {chosenText}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-voice/80">
                <SpeakerHigh size={13} weight="fill" aria-hidden />
                Spoken in Elena’s voice
              </p>
            </motion.div>
          )}
        </section>
      </section>

      {/* Reasoning rail. */}
      <div className="min-h-[300px] lg:min-h-0">
        <ReasoningRail data={rail} thinking={state === "thinking"} />
      </div>

      {/* Vocab well — full width below the two-zone layout. */}
      <section
        aria-label="Vocabulary"
        className="rounded-xl border border-ink-line bg-ink-sunken p-5 lg:col-span-2"
      >
        <VocabBoard onTileTap={handleTileTap} />
      </section>
    </div>
  );
}
