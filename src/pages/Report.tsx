import { mockReport } from "../mock/report";

function pct(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`;
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

      {/* OVERVIEW */}
      <div className="card">
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
