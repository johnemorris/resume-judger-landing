type MissingInputCardProps = {
  hasJD: boolean;
  hasResume: boolean;
};

export default function MissingInputCard({
  hasJD,
  hasResume,
}: MissingInputCardProps) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3 style={{ marginTop: 0 }}>Missing input</h3>

      <p className="small" style={{ marginTop: 8 }}>
        {!hasJD &&
          !hasResume &&
          "Add a job description and your resume to generate a report."}
        {!hasJD && hasResume && "Add a job description to generate a report."}
        {hasJD && !hasResume && "Add your resume to generate a report."}
      </p>

      <a href="/analyze">
        <button style={{ marginTop: 12 }}>Go to Analyze</button>
      </a>

      <p className="small" style={{ marginTop: 12 }}>
        Tip: Your last inputs are saved locally unless you cleared them.
      </p>
    </div>
  );
}
