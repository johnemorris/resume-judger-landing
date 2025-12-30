import { Link, useLocation } from "react-router-dom";

const STORAGE_KEY = "rj_last_input_v1";

export default function Nav() {
  const { pathname } = useLocation();

  // Coming soon route: show brand only, hide right links
  const isComingSoon = pathname === "/";

  // Optional: only show Report when we have data (and not on coming soon)
  const hasReportData = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.jd?.trim() && parsed?.resume?.trim());
    } catch {
      return false;
    }
  })();

  return (
    <header className="nav">
      <div className="navInner">
        <Link to="/" className="brand" aria-label="Go to home">
          <span className="brandDot" aria-hidden="true" />
          <span className="brandText">Resume Judger</span>
        </Link>

        {!isComingSoon && (
          <nav className="navLinks" aria-label="Primary navigation">
            <Link to="/analyze">Analyze</Link>
            {hasReportData && <Link to="/report">Report</Link>}
          </nav>
        )}
      </div>
    </header>
  );
}
