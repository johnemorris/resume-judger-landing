// src/utils/atsImpact.ts
import { normalizeText } from "./text";

export type AtsCategory =
  | "AWS/Cloud"
  | "DevOps/IaC"
  | "Backend"
  | "Frontend"
  | "Product/UX"
  | "Leadership"
  | "Other";

export type RankedKeyword = {
  term: string;
  category: AtsCategory;
  jdFreq: number;
  inResume: boolean;
  impactScore: number; // 0-100+
  tier: "HIGH" | "MED" | "LOW";
  reason: string;
};

/**
 * v1 classifier tuned to YOUR canonical extractor output:
 * - PHRASE_ALIASES keys (e.g. "ci/cd", "infrastructure as code", "micro frontends")
 * - HARD_SKILLS canonical terms (e.g. "react", "node", "aws", "next.js")
 *
 * Keep this mapping small and accurate. Expand later as you add more canonical skills.
 */
const CATEGORY_EXACT_TERMS: Record<AtsCategory, readonly string[]> = {
  Frontend: [
    // HARD_SKILLS
    "react",
    "typescript",
    "javascript",
    "redux",
    "next.js",
    "webpack",

    // phrases
    "micro frontends",
  ],
  Backend: [
    // HARD_SKILLS
    "node",
    "graphql",
    "sql",
    "nosql",

    // COMMON_ACRONYMS emitted by extractor
    "rdbms",

    // phrases
    "microservices",
    "object oriented",
  ],
  "AWS/Cloud": [
    // HARD_SKILLS
    "aws",
    "azure",
    "gcp",
    "cloudformation",

    // phrases
    "cloud based",
  ],
  "DevOps/IaC": [
    // HARD_SKILLS
    "docker",
    "kubernetes",
    "terraform",
    "git",

    // phrases
    "ci/cd",
    "infrastructure as code",
    "end to end",
    "unit testing",
    "integration testing",
  ],
  "Product/UX": [
    // keep minimal for now; extractor doesn't strongly emit product terms yet
  ],
  Leadership: [
    // extractor includes soft signals separately; leave minimal
    "leadership",
    "mentorship",
    "communication",
    "collaboration",
    "agile",
  ],
  Other: [],
};

/**
 * Category weighting: higher means more likely ATS filter / hard requirement.
 * This directly supports "pay for the ranked blockers" value.
 */
const CATEGORY_WEIGHT: Record<AtsCategory, number> = {
  "AWS/Cloud": 1.25,
  "DevOps/IaC": 1.2,
  Backend: 1.1,
  Frontend: 1.05,
  "Product/UX": 0.95,
  Leadership: 0.9,
  Other: 0.85,
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function log2(n: number) {
  return Math.log(n) / Math.log(2);
}

/**
 * Count occurrences of a term in normalized text.
 * - For multi-word phrases: phrase count via indexOf loop.
 * - For single tokens: exact token matches.
 *
 * NOTE: Because your extractor already canonicalizes terms (via PHRASE_ALIASES),
 * this does NOT need to chase aliases here for v1.
 */
export function countOccurrencesNormalizedText(
  normalizedHaystack: string,
  term: string
) {
  const t = normalizeText(term).trim();
  if (!t) return 0;

  const isPhrase = t.includes(" ");

  if (isPhrase) {
    let count = 0;
    let idx = 0;
    while (true) {
      const found = normalizedHaystack.indexOf(t, idx);
      if (found === -1) break;
      count += 1;
      idx = found + t.length;
    }
    return count;
  }

  const tokens = normalizedHaystack.split(" ").filter(Boolean);
  let c = 0;
  for (const tok of tokens) {
    if (tok === t) c += 1;
  }
  return c;
}

/**
 * Exact-match classifier (preferred):
 * Since extractKeywords() outputs canonical terms, exact matching is the safest.
 * Priority order matters when a term could plausibly overlap.
 */
export function categorizeKeyword(term: string): AtsCategory {
  const t = normalizeText(term).trim();

  // Priority order:
  // Cloud > DevOps > Backend > Frontend > Product/UX > Leadership > Other
  const priority: readonly AtsCategory[] = [
    "AWS/Cloud",
    "DevOps/IaC",
    "Backend",
    "Frontend",
    "Product/UX",
    "Leadership",
  ];

  for (const cat of priority) {
    const terms = CATEGORY_EXACT_TERMS[cat] ?? [];
    for (const exact of terms) {
      if (t === normalizeText(exact)) return cat;
    }
  }

  return "Other";
}

function tierFromScore(score: number): "HIGH" | "MED" | "LOW" {
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MED";
  return "LOW";
}

function reasonFor(jdFreq: number, inResume: boolean) {
  if (inResume) {
    if (jdFreq >= 4)
      return `Appears ${jdFreq}× in the JD; found in your resume.`;
    return `Mentioned in the JD; found in your resume.`;
  }

  if (jdFreq >= 5)
    return `High signal: appears ${jdFreq}× in the JD; not found in your resume.`;
  if (jdFreq >= 2)
    return `Appears ${jdFreq}× in the JD; not found in your resume.`;
  return `Mentioned in the JD; not found in your resume.`;
}

/**
 * Rank keywords by impact for v1:
 * Impact = JD emphasis (freq) × category weight × missing multiplier
 */
export function rankKeywordsByAtsImpact(params: {
  jd: string;
  resume: string;
  keywords: string[];
}): RankedKeyword[] {
  const jdN = normalizeText(params.jd);
  const resumeN = normalizeText(params.resume);

  const rows: RankedKeyword[] = params.keywords.map((term) => {
    const category = categorizeKeyword(term);
    const jdFreq = countOccurrencesNormalizedText(jdN, term);
    const resumeFreq = countOccurrencesNormalizedText(resumeN, term);
    const inResume = resumeFreq > 0;

    // Emphasis curve: log2(freq+1) capped/normalized
    const emphasis = log2(jdFreq + 1);
    const emphasisNorm = clamp01(emphasis / 3.5);

    const catW = CATEGORY_WEIGHT[category] ?? 1.0;
    const missingMultiplier = inResume ? 0.35 : 1.0;

    const impactScore = Math.round(
      100 * emphasisNorm * catW * missingMultiplier
    );
    const tier = tierFromScore(impactScore);

    return {
      term,
      category,
      jdFreq,
      inResume,
      impactScore,
      tier,
      reason: reasonFor(jdFreq, inResume),
    };
  });

  // Sort: missing first, then impact desc, then jdFreq desc, then alpha
  rows.sort((a, b) => {
    if (a.inResume !== b.inResume) return a.inResume ? 1 : -1;
    if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
    if (b.jdFreq !== a.jdFreq) return b.jdFreq - a.jdFreq;
    return a.term.localeCompare(b.term);
  });

  return rows;
}
