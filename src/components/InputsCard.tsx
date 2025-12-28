type InputsCardProps = {
  roleGuess?: string;
  company?: string;

  matched: string[];
  missingPreview: string[];
  missingCount: number;
  hasMoreMissing: boolean;

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
  const matchedCount = matched.length;

  return (
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

      <p className="small" style={{ marginTop: 10 }}>
        Keyword match (basic): <strong>{matchedCount}</strong> matched ·{" "}
        <strong>{missingCount}</strong> missing
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {/* Show ALL matched */}
        {matched.map((k) => (
          <span key={`m-${k}`} className="badge">
            ✅ {k}
          </span>
        ))}

        {/* Show missing preview only */}
        {missingPreview.map((k) => (
          <span key={`x-${k}`} className="badge">
            ⚠️ {k}
          </span>
        ))}

        {/* Paywall teaser ONLY for missing */}
        {hasMoreMissing && (
          <button
            type="button"
            className="badge"
            onClick={onMoreMissing}
            style={{ cursor: "pointer" }}
          >
            More…
          </button>
        )}
      </div>

      <p className="small" style={{ marginTop: 10 }}>
        Note: this is a simple match check for now — deeper gap detection comes
        next.
      </p>
    </div>
  );
}
