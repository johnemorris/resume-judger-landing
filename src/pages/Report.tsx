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
const FREE_MISSING_MAX = 2;

export default function Report() {
  const r = mockReport;

  const input = getStoredInput(STORAGE_KEY);
  const jd = input?.jd ?? "";
  const resume = input?.resume ?? "";

  const hasJD = jd.trim().length > 0;
  const hasResume = resume.trim().length > 0;

  // Premium stub
  const [showPaywall, setShowPaywall] = useState(false);

  // If missing required inputs, do NOT show report sections.
  if (!hasJD || !hasResume) {
    return (
      <div className="container">
        <h1>Resume Match Report</h1>
        <MissingInputCard hasJD={hasJD} hasResume={hasResume} />
      </div>
    );
  }

  const company = guessCompany(jd);
  const roleGuess = guessRole(jd);

  const keywords = extractKeywords(jd);
  const { matched, missing } = splitMatchedMissing(keywords, resume);

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
      <h1>Resume Match Report</h1>
      <p className="small">
        Target role: <strong>{r.meta.roleTitle}</strong> · Fit:{" "}
        <strong>{r.meta.overallFit}</strong>
      </p>

      {/* INPUTS + KEYWORD MATCH */}
      <InputsCard
        roleGuess={roleGuess}
        company={company}
        matched={matched}
        missingPreview={missingPreview}
        missingCount={missingCount}
        hasMoreMissing={hasMoreMissing}
        onMoreMissing={() => setShowPaywall(true)}
      />

      {/* OVERVIEW */}
      <OverallMatchCard
        overallScore={r.scores.overall}
        overallFit={r.meta.overallFit}
      />

      {/* BREAKDOWN */}
      <ScoreBreakdown entries={breakdownEntries} />

      {/* DO THIS FIRST */}
      <SurgicalEditsCard p0={p0} p1={p1} />

      {/* GAP LEARNING PATHS */}
      <GapLearningPaths
        gaps={r.gapLearningPaths}
        isPremium={false} // stub for now
        onUpsell={() => setShowPaywall(true)}
      />

      {/* REQUIREMENTS */}
      <RequirementsCoverageCard required={r.requirementsCoverage.required} />

      {/* COMING SOON: INTERVIEW LINKS */}
      <InterviewLinksStub />

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
