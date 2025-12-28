// src/utils/guess.ts
import { normalizeText } from "./text";

export function guessCompany(jd: string) {
  const s = jd;

  // Common patterns: "Company: X", "at X", "X · United States"
  const m1 = s.match(/Company:\s*([^\n·|]+)\b/i);
  if (m1?.[1]) return m1[1].trim();

  const m2 = s.match(/\bat\s+([A-Z][A-Za-z0-9&.\- ]{2,})/);
  if (m2?.[1]) return m2[1].trim();

  // Fallback: look for first line-ish org name before "About the job"
  const lines = s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    if (/about the job/i.test(line)) break;
    if (
      line.length > 2 &&
      line.length < 60 &&
      /solutions|inc|llc|corp|partners|technologies|systems/i.test(line)
    ) {
      return line;
    }
  }

  return "";
}

export function guessRole(jd: string) {
  const s = jd;

  // Try first non-empty line
  const lines = s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  const first = lines[0] ?? "";
  if (first && first.length < 80) return first;

  // Try to find "Senior X", "Software Engineer", etc.
  const normalized = normalizeText(jd);
  const roleHints = [
    "senior software engineer",
    "software engineer",
    "frontend engineer",
    "full stack engineer",
    "react developer",
    "senior react developer",
  ];

  for (const r of roleHints) {
    if (normalized.includes(r))
      return r.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return "";
}
