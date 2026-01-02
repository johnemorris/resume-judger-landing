function pct(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`;
}

type ScoreBreakdownProps = {
  entries: ReadonlyArray<readonly [label: string, score: number]>;
};

export default function ScoreBreakdown({ entries }: ScoreBreakdownProps) {
  return (
    <div className="card">
      {entries.map(([label, score]) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 10,
            }}
          >
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
  );
}
