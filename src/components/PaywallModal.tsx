import { useEffect, useRef, useState } from "react";

type PaywallModalProps = {
  open: boolean;
  freeMissingMax: number;
  missingCount: number;
  onClose: () => void;

  // v1: modal handles email capture; keep this for future Stripe wiring
  onUnlock: () => void;
};

const WAITLIST_EMAIL_KEY = "rj_waitlist_email_v1";

function readStoredEmail(): string {
  try {
    return localStorage.getItem(WAITLIST_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function PaywallModal({
  open,
  freeMissingMax,
  missingCount,
  onClose,
  onUnlock,
}: PaywallModalProps) {
  const isStrongCandidate = missingCount <= freeMissingMax + 1;

  // Initialize once per mount (modal is typically conditionally rendered)
  const [step, setStep] = useState<"pitch" | "notify" | "thanks">("pitch");
  const [email, setEmail] = useState<string>(() => readStoredEmail());
  const [error, setError] = useState<string>("");

  const emailRef = useRef<HTMLInputElement | null>(null);

  // When we enter the notify step, force caret + scroll to the START.
  // (No setState here, so it won't trigger the cascading-renders warning.)
  useEffect(() => {
    if (!open) return;
    if (step !== "notify") return;

    const id = window.requestAnimationFrame(() => {
      const el = emailRef.current;
      if (!el) return;

      el.focus();

      // Force showing the start of the email (fixes "left side hidden")
      try {
        el.setSelectionRange(0, 0);
      } catch {
        // ignore
      }
      el.scrollLeft = 0;
    });

    return () => window.cancelAnimationFrame(id);
  }, [open, step]);

  function isValidEmail(v: string) {
    const s = v.trim();
    return s.length >= 5 && s.includes("@") && s.includes(".");
  }

  function handleClose() {
    // No need to reset state here; modal is normally unmounted on close.
    // If you keep it mounted, we can reset here without effects.
    onClose();
  }

  function handlePrimaryClick() {
    setError("");
    setStep("notify");
  }

  function handleSubmitNotify() {
    const trimmed = email.trim();

    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");

    try {
      localStorage.setItem(WAITLIST_EMAIL_KEY, trimmed);
    } catch {
      // ignore storage failure
    }

    // v1 placeholder: keep the callback for later Stripe / API wiring
    try {
      onUnlock();
    } catch {
      // ignore
    }

    setStep("thanks");
  }

  // Hooks must run unconditionally; safe to return after hooks.
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,

        // darker so background doesn't compete with modal text
        background: "rgba(0,0,0,0.72)",

        // THIS is the missing “blur the page behind the modal”
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 640,
          width: "100%",
        }}
      >
        <button
          aria-label="Close"
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            color: "inherit",
          }}
        >
          ×
        </button>

        {step === "pitch" && (
          <>
            <h3 style={{ marginTop: 0 }}>
              Unlock the full missing-skills report
            </h3>

            {isStrongCandidate ? (
              <>
                <p className="small" style={{ marginTop: 8 }}>
                  Your resume already looks strong for this role. Premium helps
                  you understand <strong>which gaps actually matter</strong> —
                  and which ones you can safely ignore.
                </p>

                <div className="card" style={{ marginTop: 12 }}>
                  <ul style={{ marginTop: 0 }}>
                    <li>Impact ranking for each missing skill</li>
                    <li>ATS risk explanations tied to this job description</li>
                    <li>
                      Clear guidance on what’s worth fixing vs. optional polish
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <p className="small" style={{ marginTop: 8 }}>
                  Free shows the top {freeMissingMax}. Premium shows{" "}
                  <strong>all</strong> missing skills for this role, ranked by
                  ATS impact.
                </p>

                <div className="card" style={{ marginTop: 12 }}>
                  <ul style={{ marginTop: 0 }}>
                    <li>
                      All missing skills (not just the top {freeMissingMax})
                    </li>
                    <li>Ranked by impact based on this job description</li>
                    <li>Clear explanations of why each skill matters</li>
                    <li>Nice-to-have resume improvements (secondary polish)</li>
                  </ul>
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="button" onClick={handleClose}>
                Not now
              </button>

              <button type="button" onClick={handlePrimaryClick}>
                Unlock full report
              </button>
            </div>

            <p className="small" style={{ marginTop: 12, marginBottom: 0 }}>
              Payments aren’t live yet — want an email when it’s ready?
            </p>
          </>
        )}

        {step === "notify" && (
          <>
            <h3 style={{ marginTop: 0 }}>Get notified when premium is ready</h3>

            <p className="small" style={{ marginTop: 8 }}>
              Payments aren’t live yet. Drop your email and we’ll notify you
              when premium unlock is available.
            </p>

            <div style={{ marginTop: 12 }}>
              <label
                className="small"
                style={{ display: "block", marginBottom: 8 }}
              >
                Email
              </label>

              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onFocus={(e) => {
                  // If browser scrolls to end, force view back to start
                  try {
                    e.currentTarget.setSelectionRange(0, 0);
                  } catch {
                    // ignore
                  }
                  e.currentTarget.scrollLeft = 0;
                }}
                placeholder="you@example.com"
                style={{ width: "100%" }}
              />

              {error && (
                <p className="small" style={{ marginTop: 8, color: "#ff6b6b" }}>
                  {error}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("pitch");
                }}
              >
                Back
              </button>

              <button
                type="button"
                className="primary"
                onClick={handleSubmitNotify}
              >
                Notify me
              </button>
            </div>

            <p className="small" style={{ marginTop: 12, marginBottom: 0 }}>
              No spam. One email when premium is ready.
            </p>
          </>
        )}

        {step === "thanks" && (
          <>
            <h3 style={{ marginTop: 0 }}>You’re on the list ✅</h3>

            <p className="small" style={{ marginTop: 8 }}>
              We’ll email you when premium unlock is available.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="button" className="primary" onClick={handleClose}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
