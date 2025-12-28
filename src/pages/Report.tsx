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
import { buildReportViewModel } from "../utils/reportViewModel";

const STORAGE_KEY = "rj_last_input_v1";
const FREE_MISSING_MAX = 2;

export default function Report() {
  const r = mockReport;

  const input = getStoredInput(STORAGE_KEY);
  const jd = input?.jd ?? "";
  const resume = input?.resume ?? "";

  const hasJD = jd.trim().length > 0;
  const hasResume = resume.trim().length > 0;

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

  // ✅ Build the view model (pure logic moved out)
  const vm = buildReportViewModel({
    jd,
    resume,
    report: r,
    freeMissingMax: FREE_MISSING_MAX,
  });

  return (
    <div className="container">
      <h1>Resume Match Report</h1>
      <p className="small">
        Target role: <strong>{vm.roleTitle}</strong> · Fit:{" "}
        <strong>{vm.overallFit}</strong>
      </p>

      {/* INPUTS + KEYWORD MATCH */}
      <InputsCard
        roleGuess={vm.roleGuess}
        company={vm.company}
        matched={vm.matched}
        missingPreview={vm.missingPreview}
        missingCount={vm.missingCount}
        hasMoreMissing={vm.hasMoreMissing}
        onMoreMissing={() => setShowPaywall(true)}
      />

      {/* OVERVIEW */}
      <OverallMatchCard
        overallScore={vm.overallScore}
        overallFit={vm.overallFit}
      />

      {/* BREAKDOWN */}
      <ScoreBreakdown entries={vm.breakdownEntries} />

      {/* DO THIS FIRST */}
      <SurgicalEditsCard p0={vm.p0} p1={vm.p1} />

      {/* GAP LEARNING PATHS */}
      <GapLearningPaths
        gaps={vm.gapLearningPaths}
        isPremium={false} // stub for now
        onUpsell={() => setShowPaywall(true)}
      />

      {/* REQUIREMENTS */}
      <RequirementsCoverageCard required={vm.requirementsRequired} />

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
