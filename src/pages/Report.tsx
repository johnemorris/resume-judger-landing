export default function Report() {
  return (
    <div className="container">
      <h1>Resume Match Report</h1>

      <div className="card">
        <h2>Overall Match</h2>
        <p style={{ fontSize: 32, fontWeight: 700 }}>82 / 100</p>
        <p>Strong fit — a few gaps worth addressing.</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Do This First</h3>
        <ul>
          <li>Add clearer evidence of ownership and impact</li>
          <li>Clarify experience with cloud infrastructure</li>
          <li>Align summary more closely with the role</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Close These Gaps (Fast)</h3>
        <ul>
          <li>Infrastructure as Code → short tutorial + mini project</li>
          <li>Cloud deployment depth → targeted learning path</li>
        </ul>
      </div>
    </div>
  );
}
