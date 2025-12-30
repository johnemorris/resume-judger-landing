import React from "react";

export type GapLearningPath = {
  gap: string;
  priority: "high" | "medium" | "low";
  whyItMatters: string;
  fastTrack: {
    tutorials: { label: string; href: string }[];
    projectIdea: string;
    timebox: string;
  };
};

type GapLearningPathsProps = {
  gaps: GapLearningPath[];
  isPremium: boolean; // later
  onUpsell: () => void;

  // new: how many gaps are free in MVP
  freeMax?: number;
};

export default function GapLearningPaths({
  gaps,
  isPremium,
  onUpsell,
  freeMax = 2,
}: GapLearningPathsProps) {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Gap Learning Paths</h3>
        <p className="small">No gaps detected yet.</p>
      </div>
    );
  }

  const locked = !isPremium;
  const free = gaps.slice(0, freeMax);
  const gated = gaps.slice(freeMax);
  const gatedCount = Math.max(0, gaps.length - freeMax);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 0 }}>Gap Learning Paths</h3>
        <span className="small">
          {gaps.length} gap{gaps.length === 1 ? "" : "s"}
        </span>

        {locked && gatedCount > 0 && (
          <span
            className="badge gatedDebug"
            onClick={onUpsell}
            style={{ cursor: "pointer", marginLeft: "auto" }}
            title="Locked — upgrade to see all gaps"
          >
            +{gatedCount} more (locked)
          </span>
        )}
      </div>

      <p className="small" style={{ marginTop: 8 }}>
        Focus on the highest-impact gaps first. We’ll provide tutorials and a
        fast-track mini-project for each.
      </p>

      {/* FREE */}
      <div style={{ marginTop: 12 }}>
        {free.map((g) => (
          <GapCard key={g.gap} g={g} />
        ))}
      </div>

      {/* GATED (debug red, clickable) */}
      {locked && gated.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {gated.map((g) => (
            <div
              key={g.gap}
              className="card gatedRow"
              style={{ marginTop: 12, cursor: "pointer" }}
              onClick={onUpsell}
              title="Locked — upgrade to view"
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <strong>{g.gap}</strong>
                <span className="badge gatedDebug">🔒 LOCKED</span>
                <span className="badge gatedDebug">{g.priority}</span>
              </div>

              <p className="small" style={{ marginTop: 8 }}>
                {g.whyItMatters}
              </p>

              <p className="small" style={{ marginTop: 8, marginBottom: 0 }}>
                <strong>Fast-track:</strong> {g.fastTrack?.timebox ?? "—"} ·{" "}
                {g.fastTrack?.projectIdea ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GapCard({ g }: { g: GapLearningPath }) {
  const tutorials = g.fastTrack?.tutorials ?? [];
  const timebox = g.fastTrack?.timebox ?? "—";
  const projectIdea = g.fastTrack?.projectIdea ?? "—";

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <strong>{g.gap}</strong>
        <span className="badge">{g.priority}</span>
      </div>

      <p className="small" style={{ marginTop: 8 }}>
        {g.whyItMatters}
      </p>

      <div style={{ marginTop: 10 }}>
        <p className="small" style={{ marginBottom: 6 }}>
          <strong>Fast-track:</strong> {timebox}
        </p>

        {tutorials.length > 0 ? (
          <ul style={{ marginTop: 6 }}>
            {tutorials.slice(0, 3).map((t) => (
              <li key={t.href}>
                <a href={t.href} target="_blank" rel="noreferrer">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small" style={{ marginTop: 8 }}>
            Tutorials coming soon.
          </p>
        )}

        <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
          <strong>Mini-project:</strong> {projectIdea}
        </p>
      </div>
    </div>
  );
}
