import React from "react";

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
};

export default function InputsCard({
  roleGuess,
  company,
  matched,
  missingPreview,
  missingCount,
  hasMoreMissing,
  onMoreMissing,
}: InputsCardProps) {
  const FREE_MISSING_MAX = missingPreview.length; // derived from what Report passed in
  const overflowCount = Math.max(0, missingCount - FREE_MISSING_MAX);

  return (
    <div className="card">
      {/* Subtle context line (Report section header already carries the title) */}
      <p className="small" style={{ margin: 0 }}>
        Signals detected from the job description and your resume.
      </p>

      {(roleGuess || company) && (
        <div style={{ marginTop: 10 }}>
          <p className="small" style={{ margin: 0 }}>
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
        </div>
      )}

      <hr />

      {/* MATCHED SKILLS */}
      <div>
        <div
          className="inputsHeaderRow"
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
          className="inputsHeaderRow"
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
            {/* Free preview badges */}
            <div className="badgeRow" style={{ marginTop: 10 }}>
              {missingPreview.map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}

              {/* Debug-gated affordance (NOT blur yet) */}
              {hasMoreMissing && overflowCount > 0 && (
                <span
                  className="badge gatedDebug"
                  onClick={onMoreMissing}
                  style={{ cursor: "pointer" }}
                  title="Locked — upgrade to view all missing skills"
                >
                  +{overflowCount} more
                </span>
              )}
            </div>

            {/* Optional: show a couple of red “gated” examples so you can SEE the gated set. */}
            {hasMoreMissing && (
              <div className="badgeRow" style={{ marginTop: 8 }}>
                <span
                  className="badge gatedDebug"
                  onClick={onMoreMissing}
                  style={{ cursor: "pointer" }}
                  title="Locked — upgrade to view"
                >
                  🔒 locked
                </span>
                <span
                  className="badge gatedDebug"
                  onClick={onMoreMissing}
                  style={{ cursor: "pointer" }}
                  title="Locked — upgrade to view"
                >
                  🔒 locked
                </span>
              </div>
            )}

            <p className="small" style={{ marginTop: 10 }}>
              Tip: Missing skills aren’t “bad” — they’re your fastest upgrade
              targets. We’ll later add learning links and micro-project ideas
              for each.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
