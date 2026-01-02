import { useState } from "react";

export default function Home() {
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
      {/* HERO */}
      <div className="card heroCard" style={{ marginBottom: 28 }}>
        <div className="badgeRow">
          <span className="badge">Early access</span>
          <span className="badge">Feedback welcome</span>
        </div>

        <h1>Stop guessing why your resume isn’t landing interviews</h1>

        <p>
          Clear, job-specific feedback that shows what to fix — and what to
          leave alone.
        </p>

        {/* EARLY ACCESS */}
        <div className="card joinCard" style={{ marginTop: 22 }}>
          <p style={{ fontWeight: 700, marginBottom: 6 }}>Join early access</p>

          <p className="small">
            Be the first to use ResumeClarity when it opens. Early users get
            discounted pricing and help shape the product.
          </p>

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
                {status === "sending" ? "Sending…" : "Notify me"}
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
              Expected early-access pricing: <strong>$5–$9</strong>
            </p>
          </form>
        </div>
      </div>

      {/* THREE PILLARS */}
      <div className="grid">
        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 6 }}>
            🔍 Diagnose the mismatch
          </p>
          <p className="small">
            See how your resume actually aligns with a specific job.
          </p>
          <ul>
            <li>Match score by category</li>
            <li>Skills you already cover</li>
            <li>Missing or weak signals</li>
            <li>ATS keyword alignment</li>
          </ul>
        </div>

        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 6 }}>
            ✍️ Fix what’s holding you back
          </p>
          <p className="small">
            Get precise rewrite guidance — without lying or starting over.
          </p>
          <ul>
            <li>“Add-if-true” bullet suggestions</li>
            <li>ATS-friendly keyword swaps</li>
            <li>What to change — and what not to touch</li>
          </ul>
        </div>

        <div className="card">
          <p style={{ fontWeight: 700, marginBottom: 6 }}>
            🚀 Close real skill gaps
          </p>
          <p className="small">
            If something’s missing, we help you close it fast.
          </p>
          <ul>
            <li>High-impact skill gaps</li>
            <li>Learning paths (coming soon)</li>
            <li>Mini-project ideas tied to the role</li>
          </ul>
        </div>
      </div>

      {/* EXPECTATION SETTER */}
      <p className="small" style={{ marginTop: 28 }}>
        Best for software engineering, technical, and product roles. If your
        role is less technical, results may be less precise — we’re improving
        this over time.
      </p>

      <footer style={{ marginTop: 32 }}>
        Built by a senior engineer. Feedback welcome.
      </footer>
    </div>
  );
}
