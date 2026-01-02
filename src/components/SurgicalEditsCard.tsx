import React from "react";

type SurgicalEdit = {
  priority: string;
  where: string;
  editType: string;
  instruction: string;
  before: string;
  after: string;
  truthfulness: string; // "safe-rewrite" | "add-if-true" (string for now)
};

function TruthBadge({ t }: { t: string }) {
  const label = t === "safe-rewrite" ? "✅ Safe rewrite" : "⚠️ Add-if-true";
  return (
    <span className="badge" style={{ marginLeft: 8 }}>
      {label}
    </span>
  );
}

function SectionEdits({
  title,
  edits,
}: {
  title: string;
  edits: ReadonlyArray<SurgicalEdit>;
}) {
  if (!edits || edits.length === 0) {
    return (
      <p className="small" style={{ margin: "10px 0 0" }}>
        <strong>{title}:</strong> None found.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 2,
        }}
      >
        <p style={{ margin: 0, fontWeight: 750 }}>{title}</p>
        <span className="small" style={{ margin: 0 }}>
          {edits.length} item{edits.length === 1 ? "" : "s"}
        </span>
      </div>

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

          <div className="subcard" style={{ marginTop: 8 }}>
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

/**
 * User-facing copy:
 * - P0 remains free (core value)
 * - P1 is premium (nice-to-have polish)
 */
export default function SurgicalEditsCard({
  p0,
  p1,
  primaryLabel = "High-impact fixes",
  secondaryLabel = "Nice-to-have improvements",
  isPremium,
  freeSecondaryMax = 0,
  onUpsell,
}: {
  p0: ReadonlyArray<SurgicalEdit>;
  p1: ReadonlyArray<SurgicalEdit>;
  primaryLabel?: string;
  secondaryLabel?: string;

  isPremium: boolean;
  freeSecondaryMax?: number;
  onUpsell: () => void;
}) {
  const showLockedSecondary = !isPremium && p1.length > freeSecondaryMax;
  const secondaryFree = isPremium ? p1 : p1.slice(0, freeSecondaryMax);
  const secondaryLockedCount = Math.max(0, p1.length - secondaryFree.length);

  return (
    <div className="card">
      <SectionEdits title={primaryLabel} edits={p0} />

      <div style={{ marginTop: 14 }} />

      <SectionEdits title={secondaryLabel} edits={secondaryFree} />

      {showLockedSecondary && secondaryLockedCount > 0 && (
        <div
          className="subcard gatedRow"
          style={{ marginTop: 12, cursor: "pointer" }}
          onClick={onUpsell}
          title="Locked — upgrade to view"
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <strong>Unlock the rest</strong>
            <span className="badge gatedDebug">
              🔒 {secondaryLockedCount} locked
            </span>
          </div>

          <p className="small" style={{ marginTop: 8, marginBottom: 0 }}>
            Nice-to-have improvements are premium. They’re great for polishing
            your resume once the high-impact fixes are done.
          </p>
        </div>
      )}

      <p className="small" style={{ marginTop: 14, marginBottom: 0 }}>
        Tip: Only use “Add-if-true” suggestions if they reflect real experience.
      </p>
    </div>
  );
}
