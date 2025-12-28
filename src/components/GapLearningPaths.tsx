type LearningItem = {
  title: string;
  url: string;
  time: string;
  provider: string;
  affiliate?: boolean;
};

type GapLearningPath = Readonly<{
  gap: string;
  priority: "high" | "medium" | "low";
  whyItMatters: string;
  fastTrack: Readonly<{
    tutorial: LearningItem;
    project: LearningItem;
    optionalDeepDive: LearningItem;
  }>;
}>;

type GapLearningPathsProps = {
  gaps: ReadonlyArray<GapLearningPath>;
  isPremium: boolean;
  onUpsell: () => void;
};

export default function GapLearningPaths({
  gaps,
  isPremium,
  onUpsell,
}: GapLearningPathsProps) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>Close These Gaps Fast</h3>
      <p className="small">
        Short tutorials + mini-projects to get you job-ready quicker.
      </p>

      {gaps.map((g) => (
        <div key={g.gap} style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong>{g.gap}</strong>
            <span className="badge">{g.priority.toUpperCase()}</span>
          </div>

          <p className="small" style={{ marginTop: 6 }}>
            {g.whyItMatters}
          </p>

          {isPremium ? (
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
          ) : (
            <div style={{ marginTop: 10 }}>
              <div className="small">
                🔒 Premium unlocks tutorials + mini-project links for each gap.
              </div>

              <button
                type="button"
                onClick={onUpsell}
                style={{ marginTop: 10 }}
              >
                Unlock Premium
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
