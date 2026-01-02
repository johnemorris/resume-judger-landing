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
    [
      "Frontend (React / TypeScript)",
      r.scores.breakdown.frontendReactTypescript,
    ],
    ["Backend (Node / APIs)", r.scores.breakdown.backendNodeApis],
    ["AWS / Cloud", r.scores.breakdown.awsCloud],
    ["DevOps / CI / IaC", r.scores.breakdown.devopsCicdIac],
    ["Product / UX", r.scores.breakdown.productUxB2c],
    ["Leadership", r.scores.breakdown.leadershipMentorship],
  ] as const;

  const p0 = r.surgicalEdits.filter((e) => e.priority === "p0");
  const p1 = r.surgicalEdits.filter((e) => e.priority === "p1");

  return (
    <div className="container">
      <h1 className="pageTitle">Resume Match Report</h1>
      <p className="small">
        Target role: <strong>{r.meta.roleTitle}</strong> · Overall fit:{" "}
        <strong>{r.meta.overallFit}</strong>
      </p>

      {/* This wrapper controls spacing rhythm for the entire report */}
      <div className="reportStack">
        {/* SKILLS COVERAGE */}
        <div className="reportSection">
          <div>
            <div className="sectionKicker">Coverage</div>
            <h2 className="sectionTitle">Skills Coverage</h2>
            <p className="sectionHint">
              How well your resume reflects the skills and signals emphasized in
              the job description.
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

        {/* OVERALL MATCH */}
        <div className="reportSection">
          <div>
            <div className="sectionKicker">Summary</div>
            <h2 className="sectionTitle">Overall Match</h2>
            <p className="sectionHint">
              A high-level view of how closely your resume aligns with this role
              — based on signal strength, not perfection.
            </p>
          </div>

          <OverallMatchCard
            overallScore={r.scores.overall}
            overallFit={r.meta.overallFit}
          />
        </div>

        {/* SCORE BREAKDOWN */}
        <div className="reportSection">
          <div>
            <div className="sectionKicker">Signals</div>
            <h2 className="sectionTitle">Score Breakdown</h2>
            <p className="sectionHint">
              Where your resume sends strong signals — and where it’s quieter
              than the role expects.
            </p>
          </div>

          <ScoreBreakdown entries={breakdownEntries} />
        </div>

        {/* HIGH-IMPACT FIXES */}
        <div className="reportSection">
          <div>
            <div className="sectionKicker">Act first</div>
            <h2 className="sectionTitle">High-Impact Fixes</h2>
            <p className="sectionHint">
              Targeted wording and structure changes that improve clarity and
              recruiter confidence without rewriting your resume.
            </p>
          </div>

          <SurgicalEditsCard p0={p0} p1={p1} />
        </div>

        {/* SKILL GAPS */}
        <div className="reportSection">
          <div>
            <div className="sectionKicker">Grow</div>
            <h2 className="sectionTitle">Skill Gaps to Close</h2>
            <p className="sectionHint">
              High-leverage learning opportunities that meaningfully improve
              your fit for this role over time.
            </p>
          </div>

          <GapLearningPaths
            gaps={r.gapLearningPaths}
            isPremium={false} // stub for now
            onUpsell={() => setShowPaywall(true)}
          />
        </div>

        {/* REQUIREMENTS */}
        <div className="reportSection">
          <div>
            <div className="sectionKicker">Verify</div>
            <h2 className="sectionTitle">Requirements Coverage</h2>
            <p className="sectionHint">
              How clearly your resume demonstrates the role’s explicit
              requirements.
            </p>
          </div>

          <RequirementsCoverageCard
            required={r.requirementsCoverage.required}
          />
        </div>

        {/* INTERVIEW PREP */}
        <div className="reportSection">
          <div>
            <div className="sectionKicker">Prepare</div>
            <h2 className="sectionTitle">Interview Prep</h2>
            <p className="sectionHint">
              Role- and company-specific interview preparation resources.
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
