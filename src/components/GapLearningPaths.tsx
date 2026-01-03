import React from "react";

/** ---------- Types that match BOTH possible data shapes ---------- */

type SimpleTutorial = { label: string; href: string };

type SimpleFastTrack = {
  tutorials: SimpleTutorial[];
  projectIdea: string;
  timebox: string;
};

type MockTutorial = {
  title: string;
  provider?: string;
  time?: string;
  url: string;
  affiliate?: boolean;
};

type MockProject = {
  title?: string;
  description?: string;
  timebox?: string;
};

type MockFastTrack = {
  // your mock appears to use singular `tutorial`
  tutorial?: MockTutorial;

  // allow plural too (future-proof)
  tutorials?: readonly MockTutorial[];

  // your mock appears to use `project`
  project?: MockProject;

  // some mocks include other fields; keep them permissive but typed
  optionalDeepDive?: unknown;
};

export type GapLearningPath = {
  gap: string;
  priority: "high" | "medium" | "low";
  whyItMatters: string;

  // union: supports either normalized UI shape or your existing mock shape
  fastTrack: SimpleFastTrack | MockFastTrack;
};

type GapLearningPathsProps = {
  gaps: ReadonlyArray<GapLearningPath>;
  isPremium: boolean; // later
  onUpsell: () => void;

  // how many gaps are free in MVP
  freeMax?: number;
};

/** ---------- Type guards (NO `any`) ---------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isSimpleFastTrack(
  ft: GapLearningPath["fastTrack"]
): ft is SimpleFastTrack {
  if (!isRecord(ft)) return false;

  // tutorials must exist and be an array
  const t = ft["tutorials"];
  if (!Array.isArray(t)) return false;

  // ensure array elements look like {label, href} at least
  const first = t[0];
  if (first === undefined) return true; // empty tutorials is still valid

  return (
    isRecord(first) &&
    typeof first["label"] === "string" &&
    typeof first["href"] === "string"
  );
}

/** ---------- Normalizer ---------- */

function normalizeFastTrack(ft: GapLearningPath["fastTrack"]): {
  tutorials: { label: string; href: string }[];
  timebox: string;
  projectIdea: string;
} {
  // 1) Simple (already in the UI shape)
  if (isSimpleFastTrack(ft)) {
    return {
      tutorials: (ft.tutorials ?? []).map((t) => ({
        label: t.label,
        href: t.href,
      })),
      timebox: ft.timebox ?? "—",
      projectIdea: ft.projectIdea ?? "—",
    };
  }

  // 2) Mock / verbose shape
  const mock = ft as MockFastTrack;

  const tutorialList: MockTutorial[] = [];

  if (Array.isArray(mock.tutorials)) {
    for (const t of mock.tutorials) {
      if (t && typeof t.url === "string" && typeof t.title === "string") {
        tutorialList.push(t);
      }
    }
  } else if (mock.tutorial && typeof mock.tutorial.url === "string") {
    tutorialList.push(mock.tutorial);
  }

  const tutorials = tutorialList.map((t) => ({
    label: t.time ? `${t.title} (${t.time})` : t.title,
    href: t.url,
  }));

  const timebox =
    (mock.project?.timebox && String(mock.project.timebox)) ||
    (mock.tutorial?.time && String(mock.tutorial.time)) ||
    (tutorialList[0]?.time && String(tutorialList[0].time)) ||
    "—";

  const projectIdea =
    (mock.project?.title && String(mock.project.title)) ||
    (mock.project?.description && String(mock.project.description)) ||
    "Mini-project coming soon.";

  return { tutorials, timebox, projectIdea };
}

/** ---------- Component ---------- */

export default function GapLearningPaths({
  gaps,
  isPremium,
  onUpsell,
  freeMax = 2,
}: GapLearningPathsProps) {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>What to level up next</h3>
        <p className="small">No gaps detected yet.</p>
      </div>
    );
  }

  const locked = !isPremium;
  const free = gaps.slice(0, freeMax);
  const gated = gaps.slice(freeMax);
  const gatedCount = Math.max(0, gaps.length - freeMax);

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 0 }}>What to level up next</h3>
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
            +{gatedCount} more
          </span>
        )}
      </div>

      <p className="small" style={{ marginTop: 8 }}>
        We group related missing skills into a few high-impact upgrades so you
        can focus on what matters most.
      </p>

      {/* FREE */}
      <div style={{ marginTop: 12 }}>
        {free.map((g) => (
          <GapCard key={g.gap} g={g} />
        ))}
      </div>

      {/* GATED */}
      {locked && gated.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {gated.map((g) => {
            const n = normalizeFastTrack(g.fastTrack);

            return (
              <div
                key={g.gap}
                className="card gatedRow"
                style={{ marginTop: 12, cursor: "pointer" }}
                onClick={onUpsell}
                title="Locked — upgrade to view"
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <strong>{g.gap}</strong>
                  <span className="badge gatedDebug">🔒</span>
                  <span className="badge gatedDebug">{g.priority}</span>
                </div>

                <p className="small" style={{ marginTop: 8 }}>
                  {g.whyItMatters}
                </p>

                <p className="small" style={{ marginTop: 8, marginBottom: 0 }}>
                  <strong>Fast-track:</strong> {n.timebox} · {n.projectIdea}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GapCard({ g }: { g: GapLearningPath }) {
  const n = normalizeFastTrack(g.fastTrack);

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
          <strong>Fast-track:</strong> {n.timebox}
        </p>

        {n.tutorials.length > 0 ? (
          <ul style={{ marginTop: 6 }}>
            {n.tutorials.slice(0, 3).map((t) => (
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
          <strong>Mini-project:</strong> {n.projectIdea}
        </p>
      </div>
    </div>
  );
}
