/**
 * Common multi-word phrases that should be treated as a single skill.
 * These are checked BEFORE single-word matching.
 */
export const PHRASES = [
  "object oriented",
  "cloud based",
  "ci cd",
  "infrastructure as code",
  "micro frontends",
  "microservices",
  "design systems",
  "unit testing",
  "integration testing",
  "end to end",
] as const;

/**
 * Hard technical skills we care about matching.
 * These are canonical names used for display.
 */
export const HARD_SKILLS = [
  "react",
  "typescript",
  "javascript",
  "node",
  "aws",
  "azure",
  "gcp",
  "sql",
  "nosql",
  "graphql",
  "docker",
  "kubernetes",
  "terraform",
  "cloudformation",
  "jest",
  "cypress",
  "webpack",
  "redux",
  "next.js",
  "git",
] as const;

/**
 * Tokens that should be ignored entirely.
 * These often show up as false positives in JDs.
 */
export const JUNK_TOKENS = [
  "and",
  "or",
  "with",
  "without",
  "plus",
  "years",
  "year",
  "experience",
  "strong",
  "ability",
  "skills",
  "preferred",
  "required",
  "knowledge",
  "team",
  "work",
  "environment",
  "role",
  "job",
  "candidate",
  "visa",
  "sponsorship",
  "third",
  "3rd",
  "party",
  "parties",
] as const;

export const HARD_SKILLS_SET = new Set<string>(
  HARD_SKILLS as unknown as string[]
);
export const JUNK_TOKENS_SET = new Set<string>(
  JUNK_TOKENS as unknown as string[]
);
