// src/utils/skillsSection.ts
import { normalizeText } from "./text";

export function extractFromSkillsSection(jd: string) {
  const raw = jd;
  const lower = raw.toLowerCase();

  const startIdx = lower.indexOf("skills");
  if (startIdx === -1) return "";

  // grab a chunk after "skills" up to next heading-ish
  const slice = raw.slice(startIdx, startIdx + 1200);

  // stop at common heading delimiters
  const stop = slice.search(
    /\n\s*(responsibilities|requirements|preferred|about|benefits)\b/i
  );
  const chunk = stop > 0 ? slice.slice(0, stop) : slice;

  return normalizeText(chunk);
}
