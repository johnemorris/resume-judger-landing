import { normalizeText } from "./text";
import { extractPhraseMatches } from "./phrases";

/**
 * We only use this extractor to catch "unknown but clearly required" items
 * (ex: Tanstack) without maintaining an endless whitelist.
 *
 * Key rules:
 * - Prioritize strong language ("must have", "required skills")
 * - Prefer known multi-word phrases via phrase matcher (cloud based, object oriented, etc.)
 * - Avoid generating random bigrams/trigrams (that creates junk)
 * - Filter out generic words ("prior", "developing", "years", "experience", etc.)
 * - Canonicalize hyphens to avoid duplicates ("cloud-based" vs "cloud based")
 */

const REQUIRED_HEADERS = [
  "required skills",
  "requirements",
  "required",
  "minimum qualifications",
  "minimum requirements",
  "basic qualifications",
  "qualifications",
] as const;

const STRONG_PHRASES = [
  "must have",
  "must-have",
  "required",
  "required skills",
  "requirements",
  "strong experience",
  "hands-on",
  "hands on",
  "experience with",
  "proficient in",
  "expert in",
] as const;

// Extra “non-skill” verbs/adjectives that were leaking into badges
const STOP_WORDS = new Set<string>([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "for",
  "and",
  "or",

  "must",
  "have",
  "strong",
  "required",
  "preferred",
  "nice",
  "bonus",
  "optional",

  "prior",
  "background",
  "developing",
  "developed",
  "build",
  "building",
  "design",
  "designing",
  "work",
  "working",
  "team",
  "environment",
  "role",
  "candidate",
  "candidates",

  "experience",
  "skills",
  "skill",
  "ability",
  "years",
  "year",
  "total",
  "development",
  "software",

  "remote",
  "remotely",
  "hours",
  "est",
  "w2",
  "visa",
  "sponsorship",
  "third",
  "party",
  "parties",

  "benefits",
  "package",
  "medical",
  "dental",
  "vision",
  "insurance",
  "disability",
  "coverage",
  "match",

  "based",
  "area",
  "us",
  "usa",
  // Generic filler words that leak from requirement prose
  "understanding",
  "familiarity",
  "available",
  "fundamentals",
  "consistently",
  "comfortably",
  "excited",
  "learn",
  "learning",
  "extensive",
  "performance",
  "delivering",
  "deliver",
  "delivery",
  "language",
  "languages",
  "operating",
  "systems", // NOTE: ok because you still capture "distributed systems" as a phrase
  "protocol",
  "protocols",
  "service",
  "services",
  "management",
  "troubleshooting",
  "scripting",
  "architecture",
  "architectures",
  "persistence",
  "fundamentals",
  "familiarity",
  "understanding",
  "knowledge",
  "learn",
  "learning",

  // generic/non-skill phrases that show up as fluff
  "highly available",
  "high availability",
  "large scale",
  "massive scale",
  "best in class",
  "hands on", // optional depending on your extraction behavior
]);

const STOP_SECTION_HEADERS = [
  "disclaimer",
  "range and benefit",
  "oracle us offers",
  "benefits",
  "paid time off",
  "equal employment",
] as const;

function isStopSectionLine(line: string) {
  const lc = line.toLowerCase().trim();
  return STOP_SECTION_HEADERS.some((h) => lc.startsWith(h));
}

const STRONG_LIST_PREFIXES = [
  "strong knowledge of",
  "strong understanding of",
] as const;

function extractStrongOfList(line: string): string[] {
  const l = normalizeText(line).replace(/-/g, " ");

  const prefix = STRONG_LIST_PREFIXES.find((p) => l.includes(p));
  if (!prefix) return [];

  // Take tail after "... of"
  const idx = l.indexOf(prefix);
  const tail = l.slice(idx + prefix.length).trim();
  if (!tail) return [];

  // Pull parenthetical content into the stream, but mark it weak if it says preferred
  // e.g. "storage systems (block storage preferred)" -> "storage systems, block storage preferred"
  const withParens = tail.replace(/\(([^)]+)\)/g, ", $1");

  // Split list items by commas and "and"
  const parts = withParens
    .split(/,|\band\b/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts
    .map((p) =>
      p
        // remove weak markers but keep the noun phrase
        .replace(/\b(preferred|nice to have|optional|bonus)\b/g, "")
        // strip common trailing qualifiers
        .replace(
          /\b(fundamentals?|technologies?|skills?|experience|background|knowledge|understanding)\b/g,
          ""
        )
        .trim()
    )
    .map((p) => p.split(/\s+/).slice(0, 3).join(" ")) // keep 1–3 tokens
    .map((p) => p.trim())
    .filter(Boolean);
}

function extractMustHavePhrase(line: string): string | null {
  // examples:
  // "Must have strong widget farming experience" -> "widget farming"
  // "Must-have Tanstack experience" -> "tanstack"
  const l = normalizeText(line).replace(/-/g, " ");

  // Support "must have:", "must-have:", etc.
  const m =
    l.match(/\bmust have\b[:\s]+(.*)$/) ||
    l.match(/\bmust\b\s+have\b[:\s]+(.*)$/) ||
    l.match(/\bmust have\b\s+(.*)$/);

  const tail = (m?.[1] ?? "").trim();
  if (!tail) return null;

  // remove common fillers
  const cleaned = tail
    .replace(/\b(strong|hands on|hands-on|solid|proven|prior)\b/g, "")
    .replace(/\b(experience|skills?|background|knowledge)\b/g, "")
    .trim();

  const tokens = cleaned
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !STOP_WORDS.has(t));

  // keep 1-3 tokens as the phrase, but prefer 2 (like "widget farming")
  if (tokens.length >= 2) return tokens.slice(0, 2).join(" ");
  if (tokens.length === 1) return tokens[0];
  return null;
}

function hasStrongSignal(line: string) {
  const l = line.toLowerCase();
  return STRONG_PHRASES.some((p) => l.includes(p));
}

function lineStrengthBoost(line: string, inRequiredBlock: boolean) {
  const l = line.toLowerCase();

  // Highest: explicit "must have"
  if (l.includes("must have") || l.includes("must-have")) return 60;

  // Strong: inside REQUIRED SKILLS / REQUIREMENTS block
  if (inRequiredBlock) return 40;

  // Medium: other strong language
  if (hasStrongSignal(line)) return 25;

  return 0;
}

function canonicalize(t: string) {
  return t
    .replace(/[.,:;]+$/g, "") // 👈 STRIP punctuation
    .replace(/-/g, " ")
    .trim()
    .toLowerCase();
}

type Scored = { key: string; score: number };

function bump(map: Map<string, number>, key: string, score: number) {
  const k = canonicalize(key);
  map.set(k, Math.max(map.get(k) ?? 0, score));
}

function looksLikeRequirementHeader(line: string) {
  // Accept: "Requirements", "REQUIRED SKILLS", "Required:", etc.
  // Keep it conservative to avoid accidentally marking "Required: Bachelor's degree..." as a block header
  const l = line.trim();
  const lc = l.toLowerCase().replace(/:$/, "").trim();

  const isShort = lc.length <= 28;
  const isHeader = REQUIRED_HEADERS.some((h) => lc === h);
  const isAllCaps = l === l.toUpperCase() && /[A-Z]/.test(l);

  return isHeader && (isShort || isAllCaps || /:$/i.test(l));
}

/**
 * Extracts "unknown but clearly required" candidates from a JD.
 * Non-AI, but high-signal: only reads requirement sections / strong-language lines.
 *
 * Output is ranked by line strength so late "must-have Tanstack" doesn't get dropped.
 */
export function extractRequiredLineKeywords(jd: string) {
  const lines = (jd || "").split(/\r?\n/);

  let inRequiredBlock = false;
  let blankStreak = 0;

  const scores = new Map<string, number>();

  for (const raw of lines) {
    // Preserve bullets but trim whitespace
    const line = raw.trim();

    if (!line) {
      blankStreak++;
      if (inRequiredBlock && blankStreak >= 2) inRequiredBlock = false;
      continue;
    }

    blankStreak = 0;
    // If we reached legal/benefits sections, stop extracting entirely.
    if (isStopSectionLine(line)) break;

    // Start required block on headers like "REQUIREMENTS" or "REQUIRED SKILLS:"
    if (looksLikeRequirementHeader(line)) {
      inRequiredBlock = true;
      continue;
    }

    const boost = lineStrengthBoost(line, inRequiredBlock);
    // Only parse: required blocks + "must have" lines.
    // Keeps v1 from turning prose into “skills”.
    const shouldParse = inRequiredBlock || boost >= 60;

    // If it's a "must have" line, try to extract a short authoritative phrase and STOP
    // so we don’t generate junk like "widget" + "farming" separately.
    if (boost >= 60) {
      const phrase = extractMustHavePhrase(line);
      if (phrase) {
        bump(scores, phrase, boost + 45);
        continue; // 👈 prevents "widget" + "farming"
      }
      // If phrase extraction fails, fall through and parse normally (still high signal).
    }

    // Strong "knowledge/understanding of X, Y, Z" list extraction
    if (boost >= 25) {
      const list = extractStrongOfList(line);
      for (const item of list) {
        // If original line contains "preferred"/"optional"/etc, down-weight
        const weak = /\b(preferred|nice to have|optional|bonus)\b/i.test(line);
        bump(scores, item, weak ? boost + 5 : boost + 20);
      }
    }

    if (!shouldParse) continue;

    // 1) Phrase matches (cloud based, object oriented, ci/cd, etc.)
    // These are usually the best “multi-word skills”, so score them high.
    const phraseMatches = extractPhraseMatches(line);
    for (const p of phraseMatches) bump(scores, p, boost + 30);
  }

  // Sort by score desc, then by length desc (prefer meaningful tokens)
  const ranked: Scored[] = Array.from(scores.entries())
    .map(([key, score]) => ({ key, score }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.key.length - a.key.length;
    });

  // Keep it tight, but enough headroom so "must-have tanstack" is included.
  return ranked.map((r) => r.key).slice(0, 24);
}
