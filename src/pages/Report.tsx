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
import { computeKeywordImportance } from "../utils/keywordImportance";

const STORAGE_KEY = "rj_last_input_v1";

export default function Report() {
  const r = mockReport;

  const input = getStoredInput(STORAGE_KEY);
  const jd = input?.jd ?? "";
  const resume = input?.resume ?? "";

  const hasJD = jd.trim().length > 0;
  const hasResume = resume.trim().length > 0;

  const FREE_MISSING_MAX = 2;
  const [showPaywall, setShowPaywall] = useState(false);

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
  const { matched, missing } =
    keywords.length > 0
      ? splitMatchedMissing(keywords, resume)
      : { matched: [], missing: [] };

  // ⭐ NEW: importance-aware ordering
  const importance = computeKeywordImportance(jd, missing);

  const missingSorted = [...missing].sort((a, b) => {
    const ia = importance.get(a)?.score ?? 0;
    const ib = importance.get(b)?.score ?? 0;
    return ib - ia;
  });

  const missingPreview = missingSorted.slice(0, FREE_MISSING_MAX);
  const hasMoreMissing = missingSorted.length > FREE_MISSING_MAX;

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

      <div className="reportStack">
        <InputsCard
          roleGuess={roleGuess}
          company={company}
          matched={matched}
          missingPreview={missingPreview}
          missingCount={missingSorted.length}
          hasMoreMissing={hasMoreMissing}
          onMoreMissing={() => setShowPaywall(true)}
        />

        <OverallMatchCard
          overallScore={r.scores.overall}
          overallFit={r.meta.overallFit}
        />

        <ScoreBreakdown entries={breakdownEntries} />
        <SurgicalEditsCard
          p0={p0}
          p1={p1}
          isPremium={false}
          onUpsell={() => setShowPaywall(true)}
        />
        <GapLearningPaths
          gaps={r.gapLearningPaths}
          isPremium={false}
          onUpsell={() => setShowPaywall(true)}
        />
        <RequirementsCoverageCard required={r.requirementsCoverage.required} />
        <InterviewLinksStub />
      </div>

      {showPaywall && (
        <PaywallModal
          open={showPaywall}
          freeMissingMax={FREE_MISSING_MAX}
          missingCount={missingSorted.length}
          onClose={() => setShowPaywall(false)}
          onUnlock={() => {}}
        />
      )}
    </div>
  );
}
