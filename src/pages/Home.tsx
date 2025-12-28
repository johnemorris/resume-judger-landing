import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="hero">
        <div className="heroBadge">Early access</div>

        <h1 className="heroTitle">
          Stop guessing why your resume isn’t landing interviews
        </h1>

        <p className="heroSubtitle">
          Paste a job description and your resume. Get a clear match report, the
          top gaps holding you back, and practical next steps.
        </p>

        <div className="heroCtas">
          <button className="primary" onClick={() => navigate("/analyze")}>
            Analyze my resume
          </button>

          <button className="secondary" onClick={() => navigate("/analyze")}>
            Try a sample job post
          </button>
        </div>

        <p className="heroNote">
          <strong>Best for:</strong> software engineering, technical, and
          product roles.{" "}
          <span className="muted">
            If your role is less technical, results may be less precise (we’ll
            improve this over time).
          </span>
        </p>
      </div>

      <div className="grid3">
        <div className="card">
          <div className="kicker">1) Match</div>
          <h3 style={{ marginTop: 6 }}>See what you already cover</h3>
          <p className="small">
            We highlight what your resume already supports so you don’t rewrite
            what’s working.
          </p>
        </div>

        <div className="card">
          <div className="kicker">2) Gaps</div>
          <h3 style={{ marginTop: 6 }}>Find what’s missing</h3>
          <p className="small">
            We surface the most important missing skills/phrases from the job
            post—ranked by impact.
          </p>
        </div>

        <div className="card">
          <div className="kicker">3) Fix</div>
          <h3 style={{ marginTop: 6 }}>Improve fast</h3>
          <p className="small">
            You’ll get clear suggestions and learning paths so you can close
            gaps without wasting time.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>What you get in seconds</h3>
        <ul className="list">
          <li>Overall match + score breakdown</li>
          <li>
            Matched skills and missing skills (with a premium unlock option)
          </li>
          <li>High-impact edits you can apply immediately</li>
          <li>Learning paths for the biggest gaps</li>
        </ul>

        <div
          style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <button className="primary" onClick={() => navigate("/analyze")}>
            Start analyzing
          </button>
          <button className="secondary" onClick={() => navigate("/analyze")}>
            I’m just browsing
          </button>
        </div>

        <p className="small muted" style={{ marginTop: 10 }}>
          No account required. We keep it simple while we validate demand.
        </p>
      </div>

      <div className="footerNote">
        Built by a senior engineer. Feedback welcome.
      </div>
    </div>
  );
}
