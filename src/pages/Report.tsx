import { mockReport } from "../mock/report";

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

/** --- keyword extraction (no AI) --- */

// Phrases we keep together (v1, extend as we see real JDs)
const PHRASES = [
  "object oriented",
  "object-oriented",
  "full stack",
  "front end",
  "back end",
  "ci/cd",
  "cloud based",
  "cloud-based",
  "cloud native",
  "cloud-native",
  "real time",
  "real-time",
  "high performance",
  "high-performance",
  "micro services",
  "micro-services",
  "unit testing",
  "integration testing",
];

// Never filter these out even if they appear in "junk"
const HARD_SKILLS = new Set([
  "react",
  "typescript",
  "javascript",
  "node",
  "node js",
  "sql",
  "rdbms",
  "aws",
  "azure",
  "gcp",
  "cloud",
  "kubernetes",
  "docker",
  "eks",
  "ecs",
  "lambda",
  "dynamodb",
  "s3",
  "graphql",
  "rest",
  "microservices",
  "ci",
  "cd",
  "cicd",
  "devops",
  "terraform",
  "cloudformation",
  "jest",
  "cypress",
  "storybook",
  "accessibility",
  "a11y",
  "next js",
  "nextjs",
  "redux",
]);

// Junk / boilerplate terms we want to ignore (v1 baseline)
const junk = new Set([
  // time / quantity
  "years",
  "year",
  "yrs",
  "yr",
  "plus",
  "over",
  "under",
  "minimum",
  "maximum",

  // generic experience fluff
  "experience",
  "experienced",
  "strong",
  "skills",
  "skill",
  "ability",
  "abilities",
  "knowledge",
  "familiarity",
  "proficient",
  "expert",
  "expertise",

  // job-title noise
  "software",
  "developer",
  "engineer",
  "engineers",
  "senior",
  "junior",
  "lead",
  "staff",

  // work environment filler
  "work",
  "working",
  "environment",
  "team",
  "teams",
  "collaboration",
  "collaborative",
  "fast",
  "paced",
  "dynamic",
  "culture",

  // development fluff
  "development",
  "developing",
  "design",
  "designed",
  "implement",
  "implemented",
  "implementation",
  "build",
  "building",
  "maintain",
  "maintaining",

  // JD boilerplate
  "required",
  "requirements",
  "preferred",
  "nice",
  "have",
  "must",
  "should",
  "responsibilities",
  "role",
  "position",

  // employment / eligibility noise
  "visa",
  "visas",
  "sponsorship",
  "sponsor",
  "citizen",
  "citizens",
  "citizenship",
  "green",
  "card",
  "c2c",
  "w2",
  "contract",
  "full",
  "time",
  "remote",
  "hybrid",
  "united",
  "states",
  "us",
  "u s",

  // legal / HR boilerplate
  "equal",
  "opportunity",
  "employer",
  "race",
  "gender",
  "sexual",
  "orientation",
  "religion",
  "disability",
  "age",

  // fragments/noise seen in JDs
  "3rd",
  "third",
  "party",
  "parties",
  "etc",
  "and",
  "or",
  "with",
  "without",
]);

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
    .filter((w) => HARD_SKILLS.has(w) || !junk.has(w));

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

  const hardSkills = normalizeTokens.filter((t) => HARD_SKILLS.has(t));

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

  if (!hasJD || !hasResume) {
    return (
      <div className="container">
        <h1>Resume Match Report</h1>

        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Missing input</h3>
          <p className="small" style={{ marginTop: 8 }}>
            {!hasJD &&
              !hasResume &&
              "Add a job description and your resume to generate a report."}
            {!hasJD &&
              hasResume &&
              "Add a job description to generate a report."}
            {hasJD && !hasResume && "Add your resume to generate a report."}
          </p>

          <a href="/analyze">
            <button style={{ marginTop: 12 }}>Go to Analyze</button>
          </a>

          <p className="small" style={{ marginTop: 12 }}>
            Tip: Your inputs are saved locally. If you cleared them, just paste
            again.
          </p>
        </div>
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

      {!input && (
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ margin: 0 }}>
            No job description/resume found. Go to{" "}
            <a href="/analyze">Analyze</a> and paste your text first.
          </p>
        </div>
      )}

      {/* INPUTS + KEYWORD MATCH */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Your Inputs</h3>

        <p className="small" style={{ marginTop: 6 }}>
          {roleGuess ? (
            <>
              Role detected: <strong>{roleGuess}</strong>
            </>
          ) : (
            <>
              Role detected: <strong>(not detected)</strong>
            </>
          )}
          {company ? (
            <>
              {" "}
              · Company: <strong>{company}</strong>
            </>
          ) : null}
        </p>

        {keywords.length === 0 ? (
          <p className="small" style={{ marginTop: 10 }}>
            Paste a job description on the Analyze page to see keyword matching.
          </p>
        ) : (
          <>
            <p className="small" style={{ marginTop: 10 }}>
              Keyword match (basic): <strong>{matched.length}</strong> matched ·{" "}
              <strong>{missing.length}</strong> missing
            </p>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              {matched.slice(0, 14).map((k) => (
                <span key={`m-${k}`} className="badge">
                  ✅ {k}
                </span>
              ))}
              {missing.slice(0, 14).map((k) => (
                <span key={`x-${k}`} className="badge">
                  ⚠️ {k}
                </span>
              ))}
            </div>

            <p className="small" style={{ marginTop: 10 }}>
              Note: this is a simple match check for now — AI scoring and deeper
              gap detection come next.
            </p>
          </>
        )}
      </div>

      {/* OVERVIEW */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Overall Match</h2>
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 6 }}>
          {r.scores.overall} / 100
        </div>
        <p style={{ marginTop: 8 }}>
          Your resume is a <strong>{r.meta.overallFit}</strong> match. Focus on
          the edits below to raise confidence and reduce rejection risk.
        </p>
      </div>

      {/* BREAKDOWN */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Score Breakdown</h3>
        {breakdownEntries.map(([label, score]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{label}</span>
              <strong>{score}</strong>
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
                marginTop: 6,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: pct(score),
                  background: "rgba(255,255,255,0.22)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* DO THIS FIRST */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Do This First (High Impact)</h3>

        <SectionEdits title="P0 Edits" edits={p0} />
        <div style={{ marginTop: 12 }} />
        <SectionEdits title="P1 Edits" edits={p1} />
      </div>

      {/* GAP LEARNING PATHS */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Close These Gaps Fast</h3>
        <p className="small">
          Short tutorials + mini-projects to get you job-ready quicker.
        </p>

        {r.gapLearningPaths.map((g) => (
          <div key={g.gap} style={{ marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong>{g.gap}</strong>
              <span className="badge">{g.priority.toUpperCase()}</span>
            </div>

            <p className="small" style={{ marginTop: 6 }}>
              {g.whyItMatters}
            </p>

            <ul style={{ marginTop: 8 }}>
              <li>
                🆓 Tutorial:{" "}
                <a
                  href={g.fastTrack.tutorial.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {g.fastTrack.tutorial.title}
                </a>{" "}
                <span className="small">
                  ({g.fastTrack.tutorial.time} · {g.fastTrack.tutorial.provider}
                  )
                </span>
              </li>

              <li>
                🛠 Mini project:{" "}
                <a
                  href={g.fastTrack.project.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {g.fastTrack.project.title}
                </a>{" "}
                <span className="small">
                  ({g.fastTrack.project.time} · {g.fastTrack.project.provider})
                </span>
              </li>

              <li>
                🎓 Optional deep dive:{" "}
                <a
                  href={g.fastTrack.optionalDeepDive.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {g.fastTrack.optionalDeepDive.title}
                </a>{" "}
                <span className="small">
                  ({g.fastTrack.optionalDeepDive.time} ·{" "}
                  {g.fastTrack.optionalDeepDive.provider})
                  {g.fastTrack.optionalDeepDive.affiliate ? " · affiliate" : ""}
                </span>
              </li>
            </ul>
          </div>
        ))}
      </div>

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
