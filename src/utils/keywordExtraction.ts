// src/utils/keywordExtraction.ts
import { HARD_SKILLS_SET, JUNK_TOKENS_SET } from "../constants/keywords";
import { normalizeText } from "./text";
import { extractFromSkillsSection } from "./skillsSection";
import { extractPhraseMatches, removePhrasesFromText } from "./phrases";
import { extractRequiredLineKeywords } from "./requiredLineExtraction";
import { PHRASE_ALIASES } from "../constants/keywords";

const COMMON_ACRONYMS = ["sql", "rdbms", "oop"] as const;

const SOFT_SIGNALS_SET = new Set<string>([
  "agile",
  "communication",
  "leadership",
  "mentorship",
  "collaboration",
]);

export function extractKeywords(jd: string) {
  const phraseMatches = extractPhraseMatches(jd);

  const normalized = normalizeText(jd);
  const withoutPhrases = removePhrasesFromText(normalized, phraseMatches);

  const skillsChunk = normalizeText(extractFromSkillsSection(jd));

  const acronymsFound = new Set<string>();
  for (const a of COMMON_ACRONYMS) {
    if (skillsChunk.includes(a)) acronymsFound.add(a);
  }

  const combined = `${withoutPhrases} ${skillsChunk}`.trim();

  const rawTokens = combined
    .split(" ")
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => w.length >= 2)
    .filter((w) => !/^\d/.test(w));

  const normalizedTokens = rawTokens.map((t) => {
    if (t === "nodejs") return "node";
    if (t === "nextjs") return "next.js";
    if (t === "microservice") return "microservices";
    if (t === "iac") return "infrastructure as code";
    return t;
  });

  const keptTokens = normalizedTokens.filter((w) => {
    if (JUNK_TOKENS_SET.has(w)) return false;
    if (HARD_SKILLS_SET.has(w)) return true;
    if (SOFT_SIGNALS_SET.has(w)) return true;
    if ((COMMON_ACRONYMS as readonly string[]).includes(w)) return true;
    return false;
  });

  const hardSkills = keptTokens.filter((t) => HARD_SKILLS_SET.has(t));
  const softSignals = keptTokens.filter((t) => SOFT_SIGNALS_SET.has(t));

  // NEW: Extract unknown-but-required skills from strong-language / required sections
  const requiredLineCandidates = extractRequiredLineKeywords(jd)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !JUNK_TOKENS_SET.has(t));

  const out = new Set<string>([
    ...Array.from(phraseMatches),
    ...Array.from(acronymsFound),
    ...hardSkills,
    ...requiredLineCandidates,
  ]);

  for (const s of softSignals.slice(0, 4)) out.add(s);

  function canonicalPhraseKey(k: string) {
    return k
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // remove punctuation
      .replace(/\band\b/g, "") // remove glue words
      .split(/\s+/)
      .sort()
      .join(" ");
  }

  function collapseEquivalentPhrases(list: string[]) {
    const best = new Map<string, string>();

    for (const k of list) {
      const key = canonicalPhraseKey(k);

      const existing = best.get(key);
      if (!existing) {
        best.set(key, k);
        continue;
      }

      // Prefer:
      // 1) longer phrase
      // 2) phrase containing "and"
      if (
        k.length > existing.length ||
        (k.includes(" and ") && !existing.includes(" and "))
      ) {
        best.set(key, k);
      }
    }

    return Array.from(best.values());
  }

  function suppressAliasExpansions(list: string[], aliases: readonly string[]) {
    return list.filter((k) => {
      return !aliases.some((canon) => {
        if (k === canon) return false;
        const canonTokens = canon.split(" ");
        const kTokens = k.split(" ");
        return canonTokens.every((t) => kTokens.includes(t));
      });
    });
  }

  function suppressSubtokens(list: string[]) {
    const multi = list.filter((k) => k.includes(" "));
    return list.filter((k) => {
      if (k.includes(" ")) return true;
      return !multi.some((m) => m.split(/\s+/).includes(k));
    });
  }

  function stripEdgePunctuation(s: string) {
    // remove trailing/leading punctuation (keeps . + # / inside tokens)
    return s
      .trim()
      .replace(/^[\s"'“”‘’()[\]{}<>.,;:!?-]+/g, "")
      .replace(/[\s"'“”‘’()[\]{}<>.,;:!?-]+$/g, "")
      .trim();
  }

  function isGarbageKeyword(k: string) {
    const s = stripEdgePunctuation(k);
    if (!s) return true;

    const lower = s.toLowerCase();

    // if any word is purely numeric-ish, drop
    if (lower.split(/\s+/).some((w) => !/[a-z]/i.test(w))) return true;

    // super short single tokens that tend to be junk (unless already whitelisted)
    const tokens = lower.split(/\s+/).filter(Boolean);
    if (tokens.length === 1) {
      const t = tokens[0];
      // allow if it’s in your known sets
      if (HARD_SKILLS_SET.has(t)) return false;
      if (SOFT_SIGNALS_SET.has(t)) return false;
      if ((COMMON_ACRONYMS as readonly string[]).includes(t)) return false;
      // otherwise reject most single-word “english”
      return true;
    }

    // drop if contains obvious non-skill policy/legal/benefits words
    const banned = [
      "benefit",
      "benefits",
      "insurance",
      "401k",
      "vacation",
      "pto",
      "salary",
      "range",
      "disclaimer",
      "immunization",
      "mandate",
      "mandates",
      "client-facing",
      "client facing",
      "equal opportunity",
      "eeo",
    ];
    if (banned.some((b) => lower.includes(b))) return true;

    // drop multi-word phrases that are just generic adjectives/nouns
    const genericHeads = new Set([
      "strong",
      "hands",
      "understanding",
      "knowledge",
      "familiarity",
      "experience",
      "ability",
      "comfortable",
      "collaborative",
      "consistently",
      "learn",
      "delivering",
      "operating",
      "services",
      "protocols",
      "languages",
      "performance",
    ]);
    // if phrase is mostly generic words, drop
    const meaningful = tokens.filter((t) => !genericHeads.has(t));
    if (meaningful.length <= 1) return true;

    return false;
  }

  const canonicalPhrases = Object.keys(PHRASE_ALIASES);

  const cleaned = Array.from(out)
    .map(stripEdgePunctuation)
    .filter(Boolean)
    .filter((k) => !isGarbageKeyword(k));

  const final = suppressAliasExpansions(
    collapseEquivalentPhrases(suppressSubtokens(cleaned)),
    canonicalPhrases
  );

  return final.slice(0, 24);
}
