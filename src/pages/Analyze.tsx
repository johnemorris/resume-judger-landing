import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Analyze() {
  const navigate = useNavigate();
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");

  function handleAnalyze() {
    // mock flow for now
    navigate("/report");
  }

  return (
    <div className="container">
      <h1>Analyze Your Resume</h1>

      <div className="card">
        <p>
          <strong>Job Description</strong>
        </p>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={8}
          style={{ width: "100%" }}
        />

        <p style={{ marginTop: 16 }}>
          <strong>Your Resume</strong>
        </p>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={10}
          style={{ width: "100%" }}
        />

        <button onClick={handleAnalyze} style={{ marginTop: 16 }}>
          Analyze Resume
        </button>
      </div>
    </div>
  );
}
