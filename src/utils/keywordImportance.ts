import { normalizeText } from "./text";

type Importance = {
  score: number;
  strongest: "strong" | "neutral" | "weak";
};

const STRONG_PHRASES = [
  "must have",
  "required to",
  "required experience",
  "strong experience",
  "deep experience",
  "expert in",
  "hands on experience",
];

const STRONG_WORDS = ["must", "required", "strong", "deep", "expert"];

const WEAK_TERMS = ["nice to have", "preferred", "bonus", "optional"];

function detectLanguageStrength(context: string): Importance["strongest"] {
  for (const p of STRONG_PHRASES) {
    if (context.includes(p)) return "strong";
  }

  for (const w of STRONG_WORDS) {
    if (context.includes(w)) return "strong";
  }

  for (const w of WEAK_TERMS) {
    if (context.includes(w)) return "weak";
  }

  return "neutral";
}

function matchesAt(words: string[], idx: number, parts: string[]) {
  for (let j = 0; j < parts.length; j++) {
    if (words[idx + j] !== parts[j]) return false;
  }
  return true;
}

/**
 * Computes importance scores for keywords based on:
 * - frequency
 * - nearby language strength
 *
 * Supports single tokens AND multi-word phrases (ex: "widget farming")
 */
export function computeKeywordImportance(
  jd: string,
  keywords: string[]
): Map<string, Importance> {
  const text = normalizeText(jd);
  const words = text.split(" ");

  const result = new Map<string, Importance>();

  for (const kwRaw of keywords) {
    const kw = normalizeText(kwRaw).trim();
    if (!kw) continue;

    const parts = kw.split(" ").filter(Boolean);
    if (parts.length === 0) continue;

    let score = 0;
    let strongest: Importance["strongest"] = "neutral";

    // Scan for occurrences (single token OR multi-word phrase)
    for (let i = 0; i < words.length; i++) {
      if (parts.length === 1) {
        if (words[i] !== parts[0]) continue;
      } else {
        if (i + parts.length > words.length) break;
        if (!matchesAt(words, i, parts)) continue;
      }

      // context window ±10 words around the *start* of the match
      const start = Math.max(0, i - 10);
      const end = Math.min(words.length, i + 10 + parts.length);
      const context = words.slice(start, end).join(" ");

      const strength = detectLanguageStrength(context);

      let weight = 1;
      if (strength === "strong") weight = 3;
      if (strength === "weak") weight = 0.25;

      score += weight;

      // strongest signal wins
      if (strength === "strong") strongest = "strong";
      else if (strength === "weak" && strongest !== "strong")
        strongest = "weak";
    }

    // weak-only cap (prevents frequency gaming)
    if (strongest === "weak") {
      score = Math.min(score, 1.5);
    }

    result.set(kwRaw, { score, strongest });
  }

  return result;
}
