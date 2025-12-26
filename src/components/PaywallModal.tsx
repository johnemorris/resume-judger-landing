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
        background: "rgba(0,0,0,0.6)",
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
          }}
        >
          ×
        </button>

        <h3 style={{ marginTop: 0 }}>Unlock the full missing-skills list</h3>

        <p className="small" style={{ marginTop: 8 }}>
          Free shows the top {freeMissingMax}. Premium shows all missing skills,
          ordered by impact — plus guided tutorials and projects.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={onClose}>
            Not now
          </button>

          <button type="button" onClick={onUnlock}>
            Unlock Premium
          </button>
        </div>

        <p className="small" style={{ marginTop: 12 }}>
          (Stub) Payment flow coming next.
        </p>
      </div>
    </div>
  );
}
