import { useState } from "react";

export default function ComingSoon() {
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
        body: JSON.stringify({ email }),
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
      <div className="badgeRow">
        <span className="badge">Coming Soon</span>
        <span className="badge">Resume Feedback</span>
        <span className="badge">Job-Specific</span>
      </div>

      <h1>
        See exactly why your resume gets rejected — and how to fix it fast.
      </h1>

      <p>
        Paste a job description and your resume. Get a clear match report, the
        top gaps holding you back, and practical next steps.
      </p>

      <div className="card">
        <p style={{ fontWeight: 700, marginBottom: 8 }}>Launching soon</p>
        <p className="small">Want early access and discounted pricing?</p>

        <form onSubmit={handleSubmit}>
          <div className="formRow">
            <input
              type="email"
              required
              placeholder="you@example.com"
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
              ✅ Thanks! You’re on the list.
            </p>
          )}

          {status === "error" && (
            <p className="small" style={{ marginTop: 10 }}>
              ⚠️ Something went wrong. Try again.
            </p>
          )}

          <p className="small" style={{ marginTop: 10 }}>
            Expected launch price: <strong>$5–$9</strong>
          </p>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>Planned after launch</p>
        <ul>
          <li>Clear resume ↔ job matching</li>
          <li>Exact edits (not rewrites)</li>
          <li>Learning paths to close gaps</li>
          <li>Interview prep links</li>
        </ul>
      </div>

      <footer style={{ marginTop: 32 }}>
        © {new Date().getFullYear()} · Built for job seekers
      </footer>
    </div>
  );
}
