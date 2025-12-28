// src/utils/keywordExtraction.ts
import { HARD_SKILLS_SET, JUNK_TOKENS_SET } from "../constants/keywords";
import { normalizeText } from "./text";
import { extractFromSkillsSection } from "./skillsSection";
import { extractPhraseMatches, removePhrasesFromText } from "./phrases";

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

  const out = new Set<string>([
    ...Array.from(phraseMatches),
    ...Array.from(acronymsFound),
    ...hardSkills,
  ]);

  for (const s of softSignals.slice(0, 4)) out.add(s);

  return Array.from(out).slice(0, 24);
}
