import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LS_KEY_LAST = "rj_last_input_v1";

type StoredInput = {
  jd: string;
  resume: string;
  savedAtISO?: string;
};

function readStored(): StoredInput | null {
  try {
    const raw = localStorage.getItem(LS_KEY_LAST);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.jd !== "string" || typeof parsed?.resume !== "string")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(payload: StoredInput) {
  localStorage.setItem(LS_KEY_LAST, JSON.stringify(payload));
}

export default function Analyze() {
  const navigate = useNavigate();
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");

  // Prefill on mount
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setJd(stored.jd);
      setResume(stored.resume);
    }
  }, []);

  // Autosave (debounced)
  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (jd.trim() || resume.trim()) {
        writeStored({ jd, resume, savedAtISO: new Date().toISOString() });
      }
    }, 350);

    return () => window.clearTimeout(handle);
  }, [jd, resume]);

  function handleAnalyze() {
    writeStored({ jd, resume, savedAtISO: new Date().toISOString() });
    navigate("/report");
  }

  function clearJD() {
    setJd("");
    writeStored({ jd: "", resume, savedAtISO: new Date().toISOString() });
  }

  function clearResume() {
    setResume("");
    writeStored({ jd, resume: "", savedAtISO: new Date().toISOString() });
  }

  function clearAll() {
    localStorage.removeItem(LS_KEY_LAST);
    setJd("");
    setResume("");
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>Analyze</h1>
          <p className="small" style={{ marginTop: 0 }}>
            Paste a job description and your resume. Inputs are saved on this
            device.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={clearAll}>
            Clear All
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!jd.trim() || !resume.trim()}
          >
            Analyze
          </button>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <p style={{ marginBottom: 8, fontWeight: 700 }}>Job Description</p>
          <button type="button" onClick={clearJD}>
            Clear
          </button>
        </div>

        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={10}
          placeholder="Paste the job description here..."
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <p style={{ marginBottom: 8, fontWeight: 700 }}>Your Resume</p>
          <button type="button" onClick={clearResume}>
            Clear
          </button>
        </div>

        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={14}
          placeholder="Paste your resume text here..."
        />
      </div>
    </div>
  );
}
