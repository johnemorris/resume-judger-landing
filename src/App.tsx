import { useState } from "react";

export default function App() {
  const FORM_ENDPOINT = "https://formspree.io/f/xdanpqdj";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, source: "coming-soon" }),
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
      {/* ... your content ... */}

      <form onSubmit={onSubmit}>
        <div className="formRow">
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
          />
          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Notify me"}
          </button>
        </div>

        {status === "success" && (
          <p className="small" style={{ marginTop: 10 }}>
            ✅ Thanks! You’re on the list. We’ll email you when it’s ready.
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

      {/* ... */}
    </div>
  );
}
