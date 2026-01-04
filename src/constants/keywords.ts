/**
 * Common multi-word phrases that should be treated as a single skill.
 * These are checked BEFORE single-word matching.
 */

export const PHRASE_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "object oriented": [
    "object oriented",
    "object-oriented",
    "oop",
    "object oriented programming",
  ],
  "cloud based": ["cloud based", "cloud-based", "cloud native", "cloud-native"],
  "ci/cd": [
    "ci cd",
    "ci/cd",
    "cicd",
    "continuous integration",
    "continuous delivery",
    "continuous deployment",
  ],
  "infrastructure as code": [
    "infrastructure as code",
    "iac",
    "terraform",
    "cloudformation",
  ],
  "end to end": ["end to end", "end-to-end", "e2e"],
  "micro frontends": [
    "micro frontends",
    "micro-frontends",
    "microfrontend",
    "micro-frontend",
  ],
  "real time": ["real time", "real-time", "realtime"],
  "unit testing": ["unit testing", "unit tests", "tdd"],
  "integration testing": ["integration testing", "integration tests"],
  agile: ["agile", "scrum", "kanban"],

  // ✅ NEW: core infra phrases (high-signal, very common)
  "distributed systems": [
    "distributed systems",
    "distributed system",
    "distributed-systems",
    "distributed-system",
    "distributed orchestration",
    "distributed orchestration layer",
  ],
  "virtualized infrastructure": [
    "virtualized infrastructure",
    "virtualised infrastructure",
    "virtualized storage infrastructure",
    "virtualized storage",
    "virtualised storage",
  ],
  "block storage": ["block storage", "block volumes", "block volume"],
  "data structures and algorithms": [
    "data structures and algorithms",
    "data structures algorithms",
  ],
} as const;

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
  // JD boilerplate / fluff verbs
  "responsibilities",
  "responsibility",
  "looking",
  "seeking",
  "join",
  "seeks",
  "play",
  "key",
  "including",
  "ensure",
  "ensures",
  "across",
  "within",
  "value",
  "values",
  "excited",
  "learn",
  "learning",
  "passion",
  "problem",
  "problems",
  "complex",
  "solutions",

  // hiring/legal boilerplate
  "disclaimer",
  "compliance",
  "applicable",
  "requirements",
  "requirement",
  "mandate",
  "mandates",
  "immunization",
  "occupational",
  "client",
  "customer",
  "customers",
  "dependent",
  "dependents",

  // benefits/comp noise
  "benefit",
  "benefits",
  "package",
  "medical",
  "dental",
  "vision",
  "insurance",
  "disability",
  "coverage",
  "bonus",
  "equity",
  "range",
  "salary",
  "holidays",
  "vacation",
  "pto",
  "leave",
  "plan",
  "match",
] as const;

export const HARD_SKILLS_SET = new Set<string>(
  HARD_SKILLS as unknown as string[]
);
export const JUNK_TOKENS_SET = new Set<string>(
  JUNK_TOKENS as unknown as string[]
);
