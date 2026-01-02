import { mockReport } from "../mock/report";
import { useState } from "react";

import PaywallModal from "../components/PaywallModal";
import MissingInputCard from "../components/MissingInputCard";
import InputsCard from "../components/InputsCard";
import ScoreBreakdown from "../components/ScoreBreakdown";
import OverallMatchCard from "../components/OverallMatchCard";
import GapLearningPaths from "../components/GapLearningPaths";
import SurgicalEditsCard from "../components/SurgicalEditsCard";
import RequirementsCoverageCard from "../components/RequirementsCoverageCard";
import InterviewLinksStub from "../components/InterviewLinksStub";

import { getStoredInput } from "../utils/storage";
import { guessCompany, guessRole } from "../utils/guess";
import { extractKeywords } from "../utils/keywordExtraction";
import { splitMatchedMissing } from "../utils/keywordMatch";

const STORAGE_KEY = "rj_last_input_v1";

export default function Report() {
  const r = mockReport;

  const input = getStoredInput(STORAGE_KEY);
  const jd = input?.jd ?? "";
  const resume = input?.resume ?? "";

  const hasJD = jd.trim().length > 0;
  const hasResume = resume.trim().length > 0;

  // Premium stub
  const FREE_MISSING_MAX = 2;
  const [showPaywall, setShowPaywall] = useState(false);

  // If missing required inputs, do NOT show report sections.
  if (!hasJD || !hasResume) {
    return (
      <div className="container">
        <h1 className="pageTitle">Resume Match Report</h1>
        <MissingInputCard hasJD={hasJD} hasResume={hasResume} />
      </div>
    );
  }

  const company = jd ? guessCompany(jd) : undefined;
  const roleGuess = jd ? guessRole(jd) : undefined;

  const keywords = jd ? extractKeywords(jd) : [];
  const { matched, missing } =
    keywords.length > 0
      ? splitMatchedMissing(keywords, resume)
      : { matched: [], missing: [] };

  const missingCount = missing.length;
  const missingPreview = missing.slice(0, FREE_MISSING_MAX);
  const hasMoreMissing = missingCount > FREE_MISSING_MAX;

  const breakdownEntries = [
    ["Frontend (React/TS)", r.scores.breakdown.frontendReactTypescript],
    ["Backend (Node/APIs)", r.scores.breakdown.backendNodeApis],
    ["AWS/Cloud", r.scores.breakdown.awsCloud],
    ["DevOps/IaC", r.scores.breakdown.devopsCicdIac],
    ["Product/UX", r.scores.breakdown.productUxB2c],
    ["Leadership", r.scores.breakdown.leadershipMentorship],
  ] as const;

  const p0 = r.surgicalEdits.filter((e) => e.priority === "p0");
  const p1 = r.surgicalEdits.filter((e) => e.priority === "p1");

  return (
    <div className="container">
      <h1 className="pageTitle">Resume Match Report</h1>
      <p className="small">
        Target role: <strong>{r.meta.roleTitle}</strong> · Fit:{" "}
        <strong>{r.meta.overallFit}</strong>
      </p>

      {/* This wrapper controls spacing rhythm for the entire report */}
      <div className="reportStack">
        <div className="reportSection">
          <div>
            <div className="sectionKicker">Inputs</div>
            <h2 className="sectionTitle">Skills Coverage</h2>
            <p className="sectionHint">
              Quick read on matched vs missing skills based on the job
              description keywords.
            </p>
          </div>

          <InputsCard
            roleGuess={roleGuess}
            company={company}
            matched={matched}
            missingPreview={missingPreview}
            missingCount={missingCount}
            hasMoreMissing={hasMoreMissing}
            onMoreMissing={() => setShowPaywall(true)}
          />
        </div>

        <div className="reportSection">
          <div>
            <div className="sectionKicker">Diagnose</div>
            <h2 className="sectionTitle">Overall Match</h2>
            <p className="sectionHint">
              Your current fit for this role, based on the resume + job
              description overlap.
            </p>
          </div>

          <OverallMatchCard
            overallScore={r.scores.overall}
            overallFit={r.meta.overallFit}
          />
        </div>

        <div className="reportSection">
          <div>
            <div className="sectionKicker">Diagnose</div>
            <h2 className="sectionTitle">Score Breakdown</h2>
            <p className="sectionHint">
              Where you’re strong vs where the resume needs clearer signals.
            </p>
          </div>

          <ScoreBreakdown entries={breakdownEntries} />
        </div>

        <div className="reportSection">
          <div>
            <div className="sectionKicker">Fix first</div>
            <h2 className="sectionTitle">High-Impact Fixes</h2>
            <p className="sectionHint">
              “Add-if-true” bullets and ATS-friendly wording changes with the
              biggest payoff.
            </p>
          </div>

          <SurgicalEditsCard p0={p0} p1={p1} />
        </div>

        <div className="reportSection">
          <div>
            <div className="sectionKicker">Close gaps</div>
            <h2 className="sectionTitle">Skill Gaps to Close</h2>
            <p className="sectionHint">
              Mini-project ideas and learning steps tied to this role. (Some
              items are premium.)
            </p>
          </div>

          <GapLearningPaths
            gaps={r.gapLearningPaths}
            isPremium={false} // stub for now
            onUpsell={() => setShowPaywall(true)}
          />
        </div>

        <div className="reportSection">
          <div>
            <div className="sectionKicker">Verify</div>
            <h2 className="sectionTitle">Requirements Coverage</h2>
            <p className="sectionHint">
              What the job explicitly requires, and whether your resume clearly
              shows it.
            </p>
          </div>

          <RequirementsCoverageCard
            required={r.requirementsCoverage.required}
          />
        </div>

        <div className="reportSection">
          <div>
            <div className="sectionKicker">Coming soon</div>
            <h2 className="sectionTitle">Interview Prep</h2>
            <p className="sectionHint">
              Curated question links and role-specific prep suggestions.
            </p>
          </div>

          <InterviewLinksStub />
        </div>
      </div>

      {/* PREMIUM MODAL (STUB) */}
      {showPaywall && (
        <PaywallModal
          open={showPaywall}
          freeMissingMax={FREE_MISSING_MAX}
          onClose={() => setShowPaywall(false)}
          onUnlock={() => alert("TODO: Hook up pricing / checkout")}
        />
      )}
    </div>
  );
}
