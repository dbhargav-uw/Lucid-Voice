/* Lucid Voice — 5-slide pre-demo setup deck (1 title + 4 content).
 * Palette = the product's own brand: coral = the human voice, teal = the
 * machine. Serif (Georgia) is reserved for the spoken human sentences.
 * Slide 4 uses a REAL screenshot of the running app's hologram brain. */

const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Lucid Voice";
p.title = "Lucid Voice — speak again, in your own voice";

const W = 13.33, H = 7.5, M = 0.7;

// ── palette ───────────────────────────────────────────────────────────────
const INK = "0E1726", INK2 = "0A1322";
const BRAINBG = "152636"; // matches the screenshot's flat edge color (seamless)
const CANVAS = "F5F7FA", WHITE = "FFFFFF";
const CORAL = "E14826", CORAL_DEEP = "C23A1B", CORAL_SOFT = "FBE7E1";
const TEAL = "0C8276", TEAL_SOFT = "DCF1ED";
const VIOLET = "5B45C9";
const TEXT = "161A21", MUTED = "566273", FAINT = "8089A3";
const ONDARK = "E7EDF6", ONDARK_MUT = "94A6C2";
const HAIR = "D6DEE8";
const SANS = "Calibri", SERIF = "Georgia";

const softShadow = () => ({ type: "outer", color: "0E1726", blur: 12, offset: 4, angle: 90, opacity: 0.1 });

function bg(s, color) { s.background = { color }; }
function mark(s, x, y, size, color) {
  s.addText("◐", { x, y, w: size * 1.4, h: size * 1.4, fontFace: SERIF, fontSize: size * 64, color, align: "left", valign: "middle", margin: 0 });
}
function wordmark(s, x, y, dark) {
  s.addText([{ text: "◐ ", options: { color: CORAL, fontFace: SERIF } }, { text: "Lucid Voice", options: { color: dark ? ONDARK : TEXT, fontFace: SANS, bold: true } }],
    { x, y, w: 3.5, h: 0.4, fontSize: 15, align: "left", valign: "middle", margin: 0 });
}
let pageNo = 0;
function footer(s, dark, label) {
  pageNo += 1;
  s.addText(label || "Lucid Voice", { x: M, y: H - 0.5, w: 7, h: 0.3, fontFace: SANS, fontSize: 9.5, color: dark ? ONDARK_MUT : FAINT, align: "left", valign: "middle", margin: 0, charSpacing: 1 });
  s.addText(`${String(pageNo).padStart(2, "0")} / 05`, { x: W - M - 1.2, y: H - 0.5, w: 1.2, h: 0.3, fontFace: SANS, fontSize: 9.5, color: dark ? ONDARK_MUT : FAINT, align: "right", valign: "middle", margin: 0 });
}
function eyebrow(s, x, y, text, color) {
  s.addText(text.toUpperCase(), { x, y, w: 9, h: 0.32, fontFace: SANS, fontSize: 12, bold: true, color, align: "left", valign: "middle", margin: 0, charSpacing: 3 });
}
function title(s, x, y, w, text, color, size) {
  s.addText(text, { x, y, w, h: 1.2, fontFace: SANS, fontSize: size || 34, bold: true, color, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 0.98 });
}
function chip(s, x, y, label, fill, color, h) {
  const ww = 0.42 + label.length * 0.135, hh = h || 0.52;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w: ww, h: hh, fill: { color: fill }, line: { type: "none" }, rectRadius: hh / 2 });
  s.addText(label, { x, y, w: ww, h: hh, fontFace: SANS, fontSize: 15, bold: true, color, align: "center", valign: "middle", margin: 0 });
  return ww;
}
function card(s, x, y, w, h, fill, lineColor) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: lineColor ? { color: lineColor, width: 1 } : { type: "none" }, rectRadius: 0.12, shadow: softShadow() });
}
function utterance(s, x, y, w, text, color, size, h) {
  s.addText([{ text: "“", options: { color: CORAL } }, { text, options: { color } }, { text: "”", options: { color: CORAL } }],
    { x, y, w, h: h || 1.6, fontFace: SERIF, italic: true, fontSize: size || 23, color, align: "left", valign: "middle", margin: 0, lineSpacingMultiple: 1.05 });
}

// ════════════════════════════════════════════════════════════════════════
// 1 — TITLE
// ════════════════════════════════════════════════════════════════════════
let s = p.addSlide(); bg(s, INK);
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.16, h: H * 0.62, fill: { color: CORAL }, line: { type: "none" } });
s.addShape(p.shapes.RECTANGLE, { x: 0, y: H * 0.62, w: 0.16, h: H * 0.38, fill: { color: TEAL }, line: { type: "none" } });
mark(s, M, 1.0, 0.62, CORAL);
s.addText("Lucid Voice", { x: M + 0.95, y: 0.95, w: 8, h: 0.9, fontFace: SANS, fontSize: 40, bold: true, color: ONDARK, valign: "middle", margin: 0 });
s.addText("Speak again — in your own voice.", { x: M, y: 2.55, w: 11.6, h: 1.5, fontFace: SERIF, italic: true, fontSize: 54, color: WHITE, valign: "middle", margin: 0 });
s.addText("On-device AAC that turns 2–3 tapped words into a full, situationally-correct sentence —\nspoken in a cloned version of the user's own voice.", { x: M, y: 4.3, w: 11.4, h: 1.1, fontFace: SANS, fontSize: 18, color: ONDARK_MUT, valign: "top", margin: 0, lineSpacingMultiple: 1.15 });
let tx = M;
["On-device & private", "Your cloned voice", "Personal-memory layer"].forEach((t, i) => {
  const c = [CORAL, TEAL, VIOLET][i];
  const ww = 0.5 + t.length * 0.115;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: tx, y: 5.8, w: ww, h: 0.5, fill: { color: INK2 }, line: { color: c, width: 1 }, rectRadius: 0.25 });
  s.addText(t, { x: tx, y: 5.8, w: ww, h: 0.5, fontFace: SANS, fontSize: 13, bold: true, color: ONDARK, align: "center", valign: "middle", margin: 0 });
  tx += ww + 0.25;
});
footer(s, true, "A 90-second setup — then a live demo");

// ════════════════════════════════════════════════════════════════════════
// 2 — THE LEAP (problem + wow)
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, CANVAS); wordmark(s, M, 0.45, false);
eyebrow(s, M, 1.15, "The leap", CORAL);
title(s, M, 1.55, 11.8, "Tap two words. Speak a whole\nsentence — in their own voice.");
// stat strip
s.addText([
  { text: "~8", options: { color: CORAL, bold: true, fontSize: 24 } },
  { text: "  wpm on a tap-board today", options: { color: MUTED, fontSize: 15 } },
  { text: "      →      ", options: { color: FAINT, fontSize: 15 } },
  { text: "~150", options: { color: TEAL, bold: true, fontSize: 24 } },
  { text: "  wpm of ordinary speech", options: { color: MUTED, fontSize: 15 } },
], { x: M, y: 3.35, w: 11.8, h: 0.5, fontFace: SANS, valign: "middle", margin: 0 });
// the wow example
s.addText("She taps", { x: M, y: 4.4, w: 1.3, h: 0.4, fontFace: SANS, fontSize: 13, bold: true, color: FAINT, charSpacing: 2, margin: 0 });
let cx = M + 1.3;
cx += chip(s, cx, 4.3, "cold", CORAL_SOFT, CORAL_DEEP) + 0.22;
chip(s, cx, 4.3, "window", CORAL_SOFT, CORAL_DEEP);
s.addText("→", { x: 4.65, y: 4.78, w: 0.9, h: 0.7, fontFace: SANS, fontSize: 34, bold: true, color: TEAL, align: "center", valign: "middle", margin: 0 });
card(s, 5.7, 4.25, 6.9, 1.7, WHITE, CORAL_SOFT);
s.addShape(p.shapes.RECTANGLE, { x: 5.7, y: 4.25, w: 0.12, h: 1.7, fill: { color: CORAL }, line: { type: "none" } });
utterance(s, 6.15, 4.25, 6.1, "Could you close the window? I'm getting cold.", TEXT, 22, 1.25);
s.addShape(p.shapes.OVAL, { x: 6.17, y: 5.5, w: 0.16, h: 0.16, fill: { color: CORAL }, line: { type: "none" } });
s.addText("SPOKEN IN HER OWN VOICE", { x: 6.45, y: 5.43, w: 6, h: 0.35, fontFace: SANS, fontSize: 11.5, bold: true, color: CORAL_DEEP, charSpacing: 2, valign: "middle", margin: 0 });
footer(s, false);

// ════════════════════════════════════════════════════════════════════════
// 3 — THE THESIS & THE MOAT
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, INK); wordmark(s, M, 0.45, true);
eyebrow(s, M, 1.15, "The thesis — and the moat", CORAL);
s.addText([
  { text: "The same input → a ", options: { color: ONDARK } },
  { text: "different, correctly-registered", options: { color: CORAL, italic: true, bold: true } },
  { text: " reply, depending on ", options: { color: ONDARK } },
  { text: "who is listening", options: { color: TEAL, bold: true } },
  { text: ".", options: { color: ONDARK } },
], { x: M, y: 1.65, w: 11.7, h: 1.5, fontFace: SANS, fontSize: 30, bold: true, valign: "top", margin: 0, lineSpacingMultiple: 1.05 });
// two divergence rows
const rows = [
  ["To Sofia (daughter)", "I'd love to, sweetie, but I've been so tired. Can I tell you Saturday?", TEAL],
  ["To Mateo (grandson)", "I'm a little tired right now, mijo. Maybe after my nap? I love you.", CORAL],
];
let ry = 3.45;
rows.forEach(([who, q, c]) => {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: M, y: ry, w: 11.9, h: 1.05, fill: { color: INK2 }, line: { color: "1E2A3D", width: 1 }, rectRadius: 0.1 });
  // shared taps chip
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: M + 0.35, y: ry + 0.33, w: 1.9, h: 0.4, fill: { color: "2A1C18" }, line: { color: CORAL_DEEP, width: 1 }, rectRadius: 0.2 });
  s.addText("tired · maybe", { x: M + 0.35, y: ry + 0.33, w: 1.9, h: 0.4, fontFace: SANS, fontSize: 12, bold: true, color: CORAL, align: "center", valign: "middle", margin: 0 });
  s.addText("→", { x: M + 2.4, y: ry, w: 0.5, h: 1.05, fontFace: SANS, fontSize: 22, bold: true, color: c, align: "center", valign: "middle", margin: 0 });
  s.addText(who.toUpperCase(), { x: M + 3.0, y: ry + 0.16, w: 8, h: 0.3, fontFace: SANS, fontSize: 10.5, bold: true, color: c, charSpacing: 1.5, valign: "middle", margin: 0 });
  s.addText([{ text: "“", options: { color: c } }, { text: q, options: { color: ONDARK } }, { text: "”", options: { color: c } }], { x: M + 3.0, y: ry + 0.44, w: 8.6, h: 0.5, fontFace: SERIF, italic: true, fontSize: 16, valign: "middle", margin: 0 });
  ry += 1.25;
});
s.addText([
  { text: "The moat: ", options: { color: TEAL, bold: true } },
  { text: "a personal-memory layer + on-device privacy + your own preserved voice — not the text generation, which any LLM can do.", options: { color: ONDARK_MUT } },
], { x: M, y: 6.25, w: 11.9, h: 0.6, fontFace: SANS, fontSize: 14.5, valign: "top", margin: 0, lineSpacingMultiple: 1.15 });
footer(s, true);

// ════════════════════════════════════════════════════════════════════════
// 4 — THE MEMORY BRAIN (real screenshot hero)
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, BRAINBG);
// the real hologram-brain screenshot, right-bleed (its flat edge matches the bg)
s.addImage({ path: "brain.jpg", x: 3.95, y: 0.2, w: 9.43, h: 7.11, altText: "Lucid Voice hologram memory graph, firing" });
// text overlay on the dark left margin
eyebrow(s, M, 1.45, "Not a black box", TEAL);
s.addText("Watch your\nmemory fire.", { x: M, y: 1.9, w: 5.0, h: 1.7, fontFace: SANS, fontSize: 38, bold: true, color: WHITE, valign: "top", margin: 0, lineSpacingMultiple: 0.98 });
s.addText("Every reply is grounded in your personal knowledge graph — and the exact memories that shaped it light up, live. This is a real screen, not a mockup.", { x: M, y: 3.85, w: 4.9, h: 1.7, fontFace: SANS, fontSize: 15.5, color: ONDARK_MUT, valign: "top", margin: 0, lineSpacingMultiple: 1.22 });
s.addShape(p.shapes.OVAL, { x: M, y: 5.62, w: 0.18, h: 0.18, fill: { color: TEAL }, line: { type: "none" } });
s.addText([{ text: "Build your brain", options: { color: TEAL, bold: true } }, { text: " — a warm AI interviews you, and each answer blooms a new memory onto the graph.", options: { color: ONDARK_MUT } }],
  { x: M + 0.3, y: 5.5, w: 4.7, h: 1.1, fontFace: SANS, fontSize: 13.5, valign: "top", margin: 0, lineSpacingMultiple: 1.18 });
footer(s, true);

// ════════════════════════════════════════════════════════════════════════
// 5 — ON-DEVICE & RUNNING TODAY (handoff to demo)
// ════════════════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, CANVAS); wordmark(s, M, 0.45, false);
eyebrow(s, M, 1.15, "On-device, and running today", TEAL);
title(s, M, 1.55, 11.8, "Private by design — demo-safe by\nthe very same property.");
const colW = 5.75;
card(s, M, 3.3, colW, 2.5, WHITE, HAIR);
s.addShape(p.shapes.OVAL, { x: M + 0.4, y: 3.6, w: 0.18, h: 0.18, fill: { color: TEAL }, line: { type: "none" } });
s.addText("RUNS LOCALLY", { x: M + 0.68, y: 3.53, w: colW - 1, h: 0.35, fontFace: SANS, fontSize: 13, bold: true, color: TEAL, charSpacing: 2, valign: "middle", margin: 0 });
s.addText([
  { text: "Personal knowledge graph + retrieval", options: { bullet: true, breakLine: true } },
  { text: "Local LLM · Whisper STT · XTTS voice clone", options: { bullet: true, breakLine: true } },
  { text: "Airplane-mode capable — no Wi-Fi needed", options: { bullet: true } },
], { x: M + 0.45, y: 4.05, w: colW - 0.8, h: 1.6, fontFace: SANS, fontSize: 14.5, color: TEXT, valign: "top", margin: 0, paraSpaceAfter: 9 });
const x2 = M + colW + 0.55;
card(s, x2, 3.3, colW, 2.5, WHITE, HAIR);
s.addShape(p.shapes.OVAL, { x: x2 + 0.4, y: 3.6, w: 0.18, h: 0.18, fill: { color: CORAL }, line: { type: "none" } });
s.addText("OPT-IN CLOUD — SPONSORS", { x: x2 + 0.68, y: 3.53, w: colW - 1, h: 0.35, fontFace: SANS, fontSize: 13, bold: true, color: CORAL_DEEP, charSpacing: 2, valign: "middle", margin: 0 });
s.addText([
  { text: "ElevenLabs — premium voice cloning / TTS", options: { bullet: true, breakLine: true } },
  { text: "Deepgram — fast partner speech-to-text", options: { bullet: true, breakLine: true } },
  { text: "Claude — the reconstruction reasoning", options: { bullet: true } },
], { x: x2 + 0.45, y: 4.05, w: colW - 0.8, h: 1.6, fontFace: SANS, fontSize: 14.5, color: TEXT, valign: "top", margin: 0, paraSpaceAfter: 9 });
// handoff banner
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: M, y: 6.05, w: 11.93, h: 0.95, fill: { color: INK }, line: { type: "none" }, rectRadius: 0.12, shadow: softShadow() });
s.addText([{ text: "Now — let's show you live.", options: { color: WHITE, bold: true, fontSize: 19, fontFace: SERIF, italic: true } }],
  { x: M + 0.5, y: 6.05, w: 6.5, h: 0.95, fontFace: SANS, valign: "middle", margin: 0 });
s.addText([
  { text: "ElevenLabs", options: { color: CORAL, bold: true } },
  { text: "  ·  ", options: { color: ONDARK_MUT } },
  { text: "Deepgram", options: { color: TEAL, bold: true } },
  { text: "  ·  ", options: { color: ONDARK_MUT } },
  { text: "Claude", options: { color: "B9AEF2", bold: true } },
], { x: x2, y: 6.05, w: colW + 0.4, h: 0.95, fontFace: SANS, fontSize: 15, align: "right", valign: "middle", margin: 0 });
footer(s, false, "Thank you");

p.writeFile({ fileName: "Lucid-Voice.pptx" }).then((f) => console.log("WROTE", f)).catch((e) => { console.error(e); process.exit(1); });
