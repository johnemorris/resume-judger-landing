type OverallMatchCardProps = {
  overallScore: number;
  overallFit: string;
};

export default function OverallMatchCard({
  overallScore,
  overallFit,
}: OverallMatchCardProps) {
  return (
    <div className="card">
      <div className="small" style={{ margin: 0 }}>
        Score
      </div>

      <div
        style={{
          fontSize: 44,
          fontWeight: 750,
          marginTop: 6,
          letterSpacing: -0.02,
          lineHeight: 1.05,
        }}
      >
        {overallScore} / 100
      </div>

      <p style={{ marginTop: 10 }}>
        Your resume is a <strong>{overallFit}</strong> match. Focus on the
        high-impact fixes below to raise confidence and reduce rejection risk.
      </p>
    </div>
  );
}
