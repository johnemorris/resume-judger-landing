type PaywallModalProps = {
  open: boolean;
  freeMissingMax: number;
  onClose: () => void;
  onUnlock: () => void;
};

export default function PaywallModal({
  open,
  freeMissingMax,
  onClose,
  onUnlock,
}: PaywallModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,

        /* DARKER BACKDROP — page should disappear */
        background: "rgba(0, 0, 0, 0.78)",

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
          maxWidth: 520,
          width: "100%",

          /* STRONGER CARD SURFACE — overrides global card translucency */
          background:
            "linear-gradient(180deg, rgba(18,22,32,0.98), rgba(14,18,26,0.96))",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            color: "inherit",
            opacity: 0.75,
          }}
        >
          ×
        </button>

        <h3 style={{ marginTop: 0 }}>Unlock the full report</h3>

        <p className="small" style={{ marginTop: 8 }}>
          Free shows the top <strong>{freeMissingMax}</strong> missing skills
          and the highest-impact fixes. Premium unlocks the full depth.
        </p>

        <div className="subcard" style={{ marginTop: 14 }}>
          <p className="small" style={{ margin: 0 }}>
            <strong>Premium unlocks:</strong>
          </p>
          <ul style={{ marginTop: 10 }}>
            <li>All missing skills (not just the top {freeMissingMax})</li>
            <li>Nice-to-have resume improvements (P1 polish)</li>
            <li>Fast-track learning plan: tutorials, mini-project, timebox</li>
            <li>All additional skill gaps beyond the free preview</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose}>
            Not now
          </button>

          <button type="button" className="primary" onClick={onUnlock}>
            Unlock full report
          </button>
        </div>

        <p className="small" style={{ marginTop: 12, marginBottom: 0 }}>
          Payment is not wired yet — this is a preview of the premium
          experience.
        </p>
      </div>
    </div>
  );
}
