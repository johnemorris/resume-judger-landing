type Requirement = {
  requirement: string;
  status: string;
  evidenceQuote?: string;
  whatWouldMakeItMet?: string;
};

export default function RequirementsCoverageCard({
  required,
}: {
  required: ReadonlyArray<Requirement>;
}) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>Requirements Coverage</h3>

      {required.map((req) => (
        <div key={req.requirement} style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>{req.requirement}</strong>
            <span className="badge">{String(req.status).toUpperCase()}</span>
          </div>

          <p className="small" style={{ marginTop: 6 }}>
            <strong>Evidence:</strong>{" "}
            {req.evidenceQuote || "No evidence found in resume."}
          </p>

          {req.status !== "met" && req.whatWouldMakeItMet && (
            <p className="small">
              <strong>To improve:</strong> {req.whatWouldMakeItMet}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
