// src/utils/keywordMatch.ts
import { normalizeText } from "./text";

export function splitMatchedMissing(keywords: string[], resume: string) {
  const r = normalizeText(resume);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const k of keywords) {
    if (!k) continue;
    // phrase match uses includes (since phrase is canonical, already normalized)
    if (r.includes(k)) matched.push(k);
    else missing.push(k);
  }

  return { matched, missing };
}
