type OverallMatchCardProps = {
  overallScore: number;
  overallFit: string;
};

export default function OverallMatchCard({
  overallScore,
  overallFit,
}: OverallMatchCardProps) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>Overall Match</h2>

      <div style={{ fontSize: 44, fontWeight: 800, marginTop: 6 }}>
        {overallScore} / 100
      </div>

      <p style={{ marginTop: 8 }}>
        Your resume is a <strong>{overallFit}</strong> match. Focus on the edits
        below to raise confidence and reduce rejection risk.
      </p>
    </div>
  );
}
