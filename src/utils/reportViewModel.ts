import { guessCompany, guessRole } from "./guess";
import { extractKeywords } from "./keywordExtraction";
import { splitMatchedMissing } from "./keywordMatch";

export type ReportTemplate = {
  meta: {
    roleTitle: string;
    overallFit: string;
  };
  scores: {
    overall: number;
    breakdown: {
      frontendReactTypescript: number;
      backendNodeApis: number;
      awsCloud: number;
      devopsCicdIac: number;
      productUxB2c: number;
      leadershipMentorship: number;
    };
  };
  surgicalEdits: ReadonlyArray<{ priority: string } & Record<string, any>>;
  gapLearningPaths: any;
  requirementsCoverage: {
    required: ReadonlyArray<any>;
  };
};

export type ReportViewModel = {
  // Inputs
  jd: string;
  resume: string;

  // Detected
  company?: string;
  roleGuess?: string;

  // Keywords
  keywords: string[];
  matched: string[];
  missing: string[];
  missingCount: number;
  missingPreview: string[];
  hasMoreMissing: boolean;

  // Scores
  overallScore: number;
  overallFit: string;
  breakdownEntries: ReadonlyArray<readonly [label: string, score: number]>;

  // Edits
  p0: ReadonlyArray<any>;
  p1: ReadonlyArray<any>;

  // Pass-through sections
  gapLearningPaths: any;
  requirementsRequired: ReadonlyArray<any>;
  roleTitle: string;
};

/**
 * Build the "view model" that Report.tsx renders.
 * This is PURE and unit-test friendly.
 */
export function buildReportViewModel(args: {
  jd: string;
  resume: string;
  report: ReportTemplate;
  freeMissingMax: number;
}): ReportViewModel {
  const { jd, resume, report, freeMissingMax } = args;

  const companyRaw = guessCompany(jd);
  const roleGuessRaw = guessRole(jd);

  const company = companyRaw ? companyRaw : undefined;
  const roleGuess = roleGuessRaw ? roleGuessRaw : undefined;

  const keywords = extractKeywords(jd);
  const { matched, missing } = keywords.length
    ? splitMatchedMissing(keywords, resume)
    : { matched: [], missing: [] };

  const missingCount = missing.length;
  const missingPreview = missing.slice(0, freeMissingMax);
  const hasMoreMissing = missingCount > freeMissingMax;

  const breakdownEntries = [
    ["Frontend (React/TS)", report.scores.breakdown.frontendReactTypescript],
    ["Backend (Node/APIs)", report.scores.breakdown.backendNodeApis],
    ["AWS/Cloud", report.scores.breakdown.awsCloud],
    ["DevOps/IaC", report.scores.breakdown.devopsCicdIac],
    ["Product/UX", report.scores.breakdown.productUxB2c],
    ["Leadership", report.scores.breakdown.leadershipMentorship],
  ] as const;

  const p0 = report.surgicalEdits.filter((e) => e.priority === "p0");
  const p1 = report.surgicalEdits.filter((e) => e.priority === "p1");

  return {
    jd,
    resume,

    company,
    roleGuess,

    keywords,
    matched,
    missing,
    missingCount,
    missingPreview,
    hasMoreMissing,

    overallScore: report.scores.overall,
    overallFit: report.meta.overallFit,
    breakdownEntries,

    p0,
    p1,

    gapLearningPaths: report.gapLearningPaths,
    requirementsRequired: report.requirementsCoverage.required,
    roleTitle: report.meta.roleTitle,
  };
}
