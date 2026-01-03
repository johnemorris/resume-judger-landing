type InputsCardProps = {
  roleGuess?: string;
  company?: string;

  matched: string[];

  // Free preview list (already sliced in Report)
  missingPreview: string[];

  // Total missing count (for "+N more")
  missingCount: number;

  // If true, we render gated overflow affordances
  hasMoreMissing: boolean;

  // Called when user clicks any gated item or "+N more"
  onMoreMissing: () => void;

  // NEW: optional tooltip/meta per missing keyword (e.g. impact reason)
  missingMeta?: Record<string, string>;
};

export default function InputsCard({
  roleGuess,
  company,
  matched,
  missingPreview,
  missingCount,
  hasMoreMissing,
  onMoreMissing,
  missingMeta,
}: InputsCardProps) {
  const FREE_MISSING_MAX = missingPreview.length; // derived from what Report passed in
  const overflowCount = Math.max(0, missingCount - FREE_MISSING_MAX);

  return (
    <div className="card">
      <p className="small" style={{ marginTop: 0 }}>
        Signals detected from the job description and your resume.
      </p>

      {(roleGuess || company) && (
        <p className="small" style={{ marginTop: 6 }}>
          {roleGuess && (
            <>
              <strong>Role guess:</strong> {roleGuess}
              {company ? " · " : ""}
            </>
          )}
          {company && (
            <>
              <strong>Company guess:</strong> {company}
            </>
          )}
        </p>
      )}

      <hr />

      {/* MATCHED SKILLS */}
      <div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0 }}>Skill matches</h3>
          <span className="small">
            {matched.length > 0 ? `${matched.length} found` : "None found yet"}
          </span>
        </div>

        {matched.length > 0 ? (
          <div className="badgeRow" style={{ marginTop: 10 }}>
            {matched.map((t) => (
              <span key={t} className="badge">
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="small" style={{ marginTop: 10 }}>
            No clear matches detected yet. Try pasting more of your resume text
            (especially the Skills section) or a fuller job description.
          </p>
        )}
      </div>

      <hr />

      {/* MISSING SKILLS */}
      <div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0 }}>Missing skills</h3>
          <span className="small">
            {missingCount > 0 ? `${missingCount} missing` : "None missing 🎉"}
          </span>
        </div>

        {missingCount === 0 ? (
          <p className="small" style={{ marginTop: 10 }}>
            Nice — your resume already covers the key signals we extracted from
            this job description.
          </p>
        ) : (
          <>
            <div className="badgeRow" style={{ marginTop: 10 }}>
              {/* Free preview badges */}
              {missingPreview.map((t) => (
                <span
                  key={t}
                  className="badge"
                  title={missingMeta?.[t] ?? undefined}
                  style={{ cursor: missingMeta?.[t] ? "help" : undefined }}
                >
                  {t}
                </span>
              ))}

              {/* Gated affordance */}
              {hasMoreMissing && overflowCount > 0 && (
                <span
                  className="badge gatedDebug"
                  onClick={onMoreMissing}
                  style={{ cursor: "pointer" }}
                  title="Upgrade to view the full missing list ranked by impact."
                >
                  +{overflowCount} more
                </span>
              )}
            </div>

            <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
              Tip: Missing skills aren’t “bad” — they’re your fastest upgrade
              targets. Only add keywords if they reflect real experience.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
