import { mockReport } from "../mock/report";
import { useState } from "react";
import PaywallModal from "../components/PaywallModal";
import MissingInputCard from "../components/MissingInputCard";
import InputsCard from "../components/InputsCard";
import ScoreBreakdown from "../components/ScoreBreakdown";
import OverallMatchCard from "../components/OverallMatchCard";
import GapLearningPaths from "../components/GapLearningPaths";

import {
  PHRASES,
  HARD_SKILLS_SET,
  JUNK_TOKENS_SET,
} from "../constants/keywords";

const STORAGE_KEY = "rj_last_input_v1";

/** --- text utils --- */
function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[-_/]/g, " ")
    .replace(/[^\w\s+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pct(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`;
}

function getStoredInput(): {
  jd: string;
  resume: string;
  savedAtISO?: string;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.jd !== "string" || typeof parsed?.resume !== "string")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

/** --- heuristics: role/company guess --- */
function guessCompany(jd: string) {
  const head = jd.slice(0, 450);
  const m = head.match(/\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,50})/);
  return m?.[1]?.trim();
}

function guessRole(jd: string) {
  const head = jd.slice(0, 250);
  const m = head.match(/^(.*?)(?:\n|·|$)/);
  const firstLine = m?.[1]?.trim();
  if (!firstLine) return undefined;
  return firstLine.length <= 80 ? firstLine : undefined;
}

function extractPhraseMatches(jd: string) {
  const text = normalizeText(jd);
  const found = new Set<string>();

  for (const phrase of PHRASES) {
    const p = normalizeText(phrase);
    if (p && text.includes(p)) found.add(p);
  }
  return found;
}

function removePhrasesFromText(text: string, phrases: Set<string>) {
  let t = text;
  phrases.forEach((p) => {
    // remove all occurrences to avoid splitting into parts
    t = t.split(p).join(" ");
  });
  return normalizeText(t);
}

function extractFromSkillsSection(jd: string) {
  const skillsMatch = jd.match(/skills\s*:\s*([\s\S]{0,1000})/i);
  return skillsMatch ? skillsMatch[1] : "";
}

function extractKeywords(jd: string) {
  const phraseMatches = extractPhraseMatches(jd);

  // normalize JD and remove phrases before tokenization
  const normalized = normalizeText(jd);
  const withoutPhrases = removePhrasesFromText(normalized, phraseMatches);

  // Pull from skills section too (helps focus)
  const skillsChunk = normalizeText(extractFromSkillsSection(jd));

  // Acronyms in skills chunk: SQL, RDBMS, etc.
  // We already normalized to lowercase, so we won't capture uppercase here.
  // Instead, we extract common acronyms via a small allow-list:
  const commonAcronyms = ["sql", "rdbms", "oop"];
  const acronymsFound = new Set<string>();
  for (const a of commonAcronyms) {
    if (skillsChunk.includes(a)) acronymsFound.add(a);
  }

  // Tokenize combined text: "withoutPhrases" + "skillsChunk" to increase recall
  const combined = `${withoutPhrases} ${skillsChunk}`.trim();

  const tokens = combined
    .split(" ")
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => w.length >= 3)
    .filter((w) => !/^\d/.test(w)) // remove 3rd, 7+, 4+
    .filter((w) => HARD_SKILLS_SET.has(w) || !JUNK_TOKENS_SET.has(w));

  // Optional: collapse some common variations
  const normalizeTokens = tokens.map((t) => {
    if (t === "nodejs") return "node";
    if (t === "nextjs") return "next js";
    if (t === "microservice" || t === "microservices") return "microservices";
    return t;
  });

  // Prefer showing meaningful “signals” rather than everything:
  // Keep hard skills + phrase matches + a few soft signals
  const SOFT_SIGNALS = new Set([
    "agile",
    "communication",
    "leadership",
    "mentorship",
    "collaboration",
  ]);
  const softSignals = normalizeTokens.filter((t) => SOFT_SIGNALS.has(t));

  const hardSkills = normalizeTokens.filter((t) => HARD_SKILLS_SET.has(t));

  // Dedupe + cap
  const out = new Set<string>([
    ...Array.from(phraseMatches),
    ...Array.from(acronymsFound),
    ...hardSkills,
  ]);

  // Add a small number of soft signals if present
  for (const s of softSignals) out.add(s);

  return Array.from(out).slice(0, 24);
}

function splitMatchedMissing(keywords: string[], resume: string) {
  const r = normalizeText(resume);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const k of keywords) {
    const kk = normalizeText(k);
    if (!kk) continue;
    if (r.includes(kk)) matched.push(k);
    else missing.push(k);
  }

  return { matched, missing };
}

/** --- UI helpers --- */
function TruthBadge({ t }: { t: string }) {
  const label = t === "safe-rewrite" ? "✅ Safe rewrite" : "⚠️ Add-if-true";
  return (
    <span className="badge" style={{ marginLeft: 8 }}>
      {label}
    </span>
  );
}

export default function Report() {
  const r = mockReport;

  const input = getStoredInput();
  const jd = input?.jd ?? "";
  const resume = input?.resume ?? "";

  const hasJD = jd.trim().length > 0;
  const hasResume = resume.trim().length > 0;

  // Premium stub
  const FREE_MISSING_MAX = 2;
  const [showPaywall, setShowPaywall] = useState(false);

  // If missing required inputs, do NOT show report sections.
  if (!hasJD || !hasResume) {
    return (
      <div className="container">
        <h1>Resume Match Report</h1>
        <MissingInputCard hasJD={hasJD} hasResume={hasResume} />
      </div>
    );
  }

  const company = jd ? guessCompany(jd) : undefined;
  const roleGuess = jd ? guessRole(jd) : undefined;

  const keywords = jd ? extractKeywords(jd) : [];
  const { matched, missing } =
    keywords.length > 0
      ? splitMatchedMissing(keywords, resume)
      : { matched: [], missing: [] };

  const missingCount = missing.length;

  const missingPreview = missing.slice(0, FREE_MISSING_MAX);
  const hasMoreMissing = missingCount > FREE_MISSING_MAX;

  const breakdownEntries = [
    ["Frontend (React/TS)", r.scores.breakdown.frontendReactTypescript],
    ["Backend (Node/APIs)", r.scores.breakdown.backendNodeApis],
    ["AWS/Cloud", r.scores.breakdown.awsCloud],
    ["DevOps/IaC", r.scores.breakdown.devopsCicdIac],
    ["Product/UX", r.scores.breakdown.productUxB2c],
    ["Leadership", r.scores.breakdown.leadershipMentorship],
  ] as const;

  const p0 = r.surgicalEdits.filter((e) => e.priority === "p0");
  const p1 = r.surgicalEdits.filter((e) => e.priority === "p1");

  return (
    <div className="container">
      <h1>Resume Match Report</h1>
      <p className="small">
        Target role: <strong>{r.meta.roleTitle}</strong> · Fit:{" "}
        <strong>{r.meta.overallFit}</strong>
      </p>

      {/* INPUTS + KEYWORD MATCH */}
      <InputsCard
        roleGuess={roleGuess}
        company={company}
        matched={matched}
        missingPreview={missingPreview}
        missingCount={missingCount}
        hasMoreMissing={hasMoreMissing}
        onMoreMissing={() => setShowPaywall(true)}
      />

      {/* OVERVIEW */}
      <OverallMatchCard
        overallScore={r.scores.overall}
        overallFit={r.meta.overallFit}
      />

      {/* BREAKDOWN */}
      <ScoreBreakdown entries={breakdownEntries} />

      {/* DO THIS FIRST */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Do This First (High Impact)</h3>
        <SectionEdits title="P0 Edits" edits={p0} />
        <div style={{ marginTop: 12 }} />
        <SectionEdits title="P1 Edits" edits={p1} />
      </div>

      {/* GAP LEARNING PATHS */}
      <GapLearningPaths
        gaps={r.gapLearningPaths}
        isPremium={false} // stub for now
        onUpsell={() => setShowPaywall(true)}
      />

      {/* REQUIREMENTS */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Requirements Coverage</h3>

        {r.requirementsCoverage.required.map((req) => (
          <div key={req.requirement} style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <strong>{req.requirement}</strong>
              <span className="badge">{req.status.toUpperCase()}</span>
            </div>

            <p className="small" style={{ marginTop: 6 }}>
              <strong>Evidence:</strong>{" "}
              {req.evidenceQuote || "No evidence found in resume."}
            </p>

            {req.status !== "met" && (
              <p className="small">
                <strong>To improve:</strong> {req.whatWouldMakeItMet}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* COMING SOON: INTERVIEW LINKS */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Interview Prep Links (Coming Soon)</h3>
        <p className="small">
          We plan to include curated links to common interview questions for the
          company/role (Glassdoor, Reddit, LinkedIn, etc.) — without scraping.
        </p>
      </div>

      {/* PREMIUM MODAL (STUB) */}
      {showPaywall && (
        <PaywallModal
          open={showPaywall}
          freeMissingMax={FREE_MISSING_MAX}
          onClose={() => setShowPaywall(false)}
          onUnlock={() => alert("TODO: Hook up pricing / checkout")}
        />
      )}
    </div>
  );
}

function SectionEdits({
  title,
  edits,
}: {
  title: string;
  edits: ReadonlyArray<{
    priority: string;
    where: string;
    editType: string;
    instruction: string;
    before: string;
    after: string;
    truthfulness: string;
  }>;
}) {
  if (edits.length === 0) {
    return (
      <p className="small">
        <strong>{title}:</strong> None found.
      </p>
    );
  }

  return (
    <div>
      <p style={{ margin: 0, fontWeight: 700 }}>{title}</p>

      {edits.map((e, idx) => (
        <div key={idx} style={{ marginTop: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span className="badge">{e.where}</span>
            <span className="badge">{e.editType}</span>
            <TruthBadge t={e.truthfulness} />
          </div>

          <p className="small" style={{ marginTop: 6 }}>
            {e.instruction}
          </p>

          <div className="card" style={{ marginTop: 8 }}>
            <p className="small" style={{ marginBottom: 6 }}>
              <strong>Before:</strong> {e.before}
            </p>
            <p className="small" style={{ marginBottom: 0 }}>
              <strong>After:</strong> {e.after}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
