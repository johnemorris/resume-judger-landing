import { useNavigate } from "react-router-dom";
import { useState } from "react";

const STORAGE_KEY = "rj_input_v1";

export default function Analyze() {
  const navigate = useNavigate();
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");

  function handleAnalyze() {
    const payload = {
      jd,
      resume,
      savedAtISO: new Date().toISOString(),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    navigate("/report");
  }

  return (
    <div className="container">
      <h1>Analyze</h1>
      <p className="small">
        Paste a job description and your resume. We’ll generate a tailored
        report.
      </p>

      <div className="card">
        <p style={{ marginBottom: 8, fontWeight: 700 }}>Job Description</p>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={10}
          placeholder="Paste the job description here..."
        />

        <p style={{ marginTop: 16, marginBottom: 8, fontWeight: 700 }}>
          Your Resume
        </p>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={14}
          placeholder="Paste your resume text here..."
        />

        <button
          onClick={handleAnalyze}
          style={{ marginTop: 16 }}
          disabled={!jd.trim() || !resume.trim()}
        >
          Analyze Resume
        </button>

        <p className="small" style={{ marginTop: 10 }}>
          Tip: Keep it raw text for now. PDF upload later.
        </p>
      </div>
    </div>
  );
}
