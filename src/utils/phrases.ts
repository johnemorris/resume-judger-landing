// src/utils/phrases.ts
import { PHRASE_ALIASES } from "../constants/keywords";
import { buildVariantRegex, normalizeText } from "./text";

export function extractPhraseMatches(jd: string) {
  const text = normalizeText(jd);
  const found = new Set<string>();

  for (const [canonical, variants] of Object.entries(PHRASE_ALIASES)) {
    for (const v of variants) {
      const re = new RegExp(buildVariantRegex(v), "i");
      if (re.test(text)) {
        found.add(canonical);
        break;
      }
    }
  }

  return found;
}

export function removePhrasesFromText(
  text: string,
  matchedCanonicals: Set<string>
) {
  let out = text;

  for (const canonical of matchedCanonicals) {
    const variants = PHRASE_ALIASES[canonical] ?? [];
    for (const v of variants) {
      const re = new RegExp(buildVariantRegex(v), "gi");
      out = out.replace(re, " ");
    }
  }

  return out.replace(/\s+/g, " ").trim();
}
