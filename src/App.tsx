export default function App() {
  // TODO: replace with your Formspree/Getform endpoint once created
  const FORM_ACTION_URL = "https://formspree.io/f/xdanpqdj";

  return (
    <div className="container">
      <div className="badgeRow">
        <span className="badge">ResumeJudger</span>
        <span className="badge">Job-specific scoring</span>
        <span className="badge">Exact edits</span>
        <span className="badge">Learning paths</span>
      </div>

      <div className="grid">
        <div>
          <h1>
            See exactly why your resume gets rejected — and how to fix it fast.
          </h1>
          <p>
            Paste a job description and your resume. Get a clear match score,
            exact edits, and learning paths to close gaps quickly.
          </p>

          <div className="card">
            <p style={{ marginBottom: 8, fontWeight: 700 }}>What you’ll get</p>
            <ul>
              <li>Compares your resume against real job descriptions</li>
              <li>Shows exactly what to change (not generic advice)</li>
              <li>
                Recommends tutorials + mini-projects to close missing skills
                fast
              </li>
            </ul>

            <hr />

            <p style={{ marginBottom: 6, fontWeight: 700 }}>
              Launching soon — want early access?
            </p>
            <p className="small">
              Be the first to try it and get early-access pricing.
            </p>

            <form action={FORM_ACTION_URL} method="POST">
              <div className="formRow">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  aria-label="Email address"
                />
                <button type="submit">Notify me</button>
              </div>

              <input type="hidden" name="source" value="coming-soon" />
              <p className="small" style={{ marginTop: 10 }}>
                Expected launch price: <strong>$5–$9</strong> per analysis
              </p>
            </form>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <p style={{ marginBottom: 8, fontWeight: 700 }}>
              Planned after launch
            </p>
            <ul>
              <li>Interview prep links (Glassdoor, Reddit, LinkedIn)</li>
              <li>Company-specific resume insights</li>
              <li>Iteration tracking across applications</li>
            </ul>
          </div>

          <footer>
            © {new Date().getFullYear()} ResumeJudger · Built for busy engineers
          </footer>
        </div>

        <div className="card">
          <p style={{ marginBottom: 10, fontWeight: 700 }}>
            Preview (sample report)
          </p>
          <div className="mock">
            Screenshot coming soon
            <div className="small" style={{ marginTop: 8 }}>
              Match score · Surgical edits · Gap learning paths
            </div>
          </div>
          <p className="small" style={{ marginTop: 12 }}>
            Tip: Once you have the report UI, drop a screenshot here. It boosts
            signups.
          </p>
        </div>
      </div>
    </div>
  );
}
