import { useState } from "react";

export default function App() {
  // 🔁 REPLACE with your real Formspree endpoint
  const FORM_ENDPOINT = "https://formspree.io/f/xdanpqdj";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          source: "coming-soon",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container">
      {/* Top badges */}
      <div className="badgeRow">
        <span className="badge">ResumeJudger</span>
        <span className="badge">Job-specific scoring</span>
        <span className="badge">Exact edits</span>
        <span className="badge">Learning paths</span>
      </div>

      <div className="grid">
        {/* LEFT COLUMN */}
        <div>
          <h1>
            See exactly why your resume gets rejected — and how to fix it fast.
          </h1>

          <p>
            Paste a job description and your resume. Get a clear match score,
            exact edits, and learning paths to close gaps quickly.
          </p>

          {/* MAIN CARD */}
          <div className="card">
            <p style={{ marginBottom: 8, fontWeight: 700 }}>What you’ll get</p>
            <ul>
              <li>Compares your resume against real job descriptions</li>
              <li>Shows exactly what to change (not generic advice)</li>
              <li>
                Recommends tutorials and mini-projects to close missing skills
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

            {/* EMAIL FORM */}
            <form onSubmit={handleSubmit}>
              <div className="formRow">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "sending" || status === "success"}
                />

                <button
                  type="submit"
                  disabled={status === "sending" || status === "success"}
                >
                  {status === "sending" ? "Sending..." : "Notify me"}
                </button>
              </div>

              {status === "success" && (
                <p className="small" style={{ marginTop: 10 }}>
                  ✅ Thanks! You’re on the list. We’ll email you when it’s
                  ready.
                </p>
              )}

              {status === "error" && (
                <p className="small" style={{ marginTop: 10 }}>
                  ⚠️ Something went wrong. Please try again.
                </p>
              )}

              <p className="small" style={{ marginTop: 10 }}>
                Expected launch price: <strong>$5–$9</strong> per analysis
              </p>
            </form>
          </div>

          {/* PLANNED FEATURES */}
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

        {/* RIGHT COLUMN */}
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
