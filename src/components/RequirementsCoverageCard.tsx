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
    <div className="card">
      {required.map((req) => {
        const status = String(req.status).toUpperCase();
        const isMet = req.status === "met";

        return (
          <div key={req.requirement} style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <strong>{req.requirement}</strong>
              <span className="badge">{status}</span>
            </div>

            <p className="small" style={{ marginTop: 6, marginBottom: 0 }}>
              <strong>Evidence:</strong>{" "}
              {req.evidenceQuote || "No evidence found in resume."}
            </p>

            {!isMet && req.whatWouldMakeItMet && (
              <p className="small" style={{ marginTop: 8, marginBottom: 0 }}>
                <strong>To improve:</strong> {req.whatWouldMakeItMet}
              </p>
            )}

            <hr style={{ margin: "14px 0 0" }} />
          </div>
        );
      })}
    </div>
  );
}
