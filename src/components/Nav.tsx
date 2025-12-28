import { Link } from "react-router-dom";

const STORAGE_KEY = "rj_last_input_v1";

export default function Nav() {
  const hasReportData = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.jd && parsed?.resume);
    } catch {
      return false;
    }
  })();

  return (
    <header className="nav">
      <div className="navInner">
        <Link to="/" className="brand">
          <span className="brandMark" aria-hidden="true" />
          <span>Resume Judger</span>
        </Link>

        <nav className="navLinks">
          <Link to="/analyze">Analyze</Link>
          {hasReportData && <Link to="/report">Report</Link>}
        </nav>
      </div>
    </header>
  );
}
