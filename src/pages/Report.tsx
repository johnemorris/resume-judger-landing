import { mockReport } from "../mock/report";

const STORAGE_KEY = "rj_input_v1";

function pct(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`;
}

function getStoredInput(): {
  jd: string;
  resume: string;
  savedAtISO?: string;
} | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.jd !== "string" || typeof parsed?.resume !== "string")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalize(s: string) {
  return s.toLowerCase();
}

function extractKeywords(jd: string) {
  // Minimal high-signal keywords for your target roles.
  // Later: derive from JD, detect phrases, weight by requirement frequency, etc.
  const known = [
    "react",
    "typescript",
    "node",
    "node.js",
    "aws",
    "lambda",
    "ecs",
    "eks",
    "dynamodb",
    "s3",
    "terraform",
    "cloudformation",
    "ci/cd",
    "cicd",
    "devops",
    "graphql",
    "microservices",
    "observability",
    "jest",
    "cypress",
    "storybook",
    "accessibility",
    "a11y",
  ];

  const jdN = normalize(jd);

  // Only keep ones that appear in the JD (so we don't show irrelevant badges).
  return known.filter((k) => {
    const token = k.replace("/", "");
    return jdN.includes(k) || jdN.includes(token);
  });
}

function splitMatchedMissing(keywords: string[], resume: string) {
  const r = normalize(resume);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const k of keywords) {
    const token = k.replace("/", "");
    if (r.includes(k) || r.includes(token)) matched.push(k);
    else missing.push(k);
  }
  return { matched, missing };
}

function guessCompany(jd: string) {
  // Crude heuristic: find "at X" in the first part of JD
  const head = jd.slice(0, 400);
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
              {matched.slice(0, 12).map((k) => (
                <span key={`m-${k}`} className="badge">
                  ✅ {k}
                </span>
              ))}
              {missing.slice(0, 12).map((k) => (
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
