// src/utils/text.ts
export function normalizeText(s: string) {
  return (
    s
      .toLowerCase()
      // convert common separators to spaces
      .replace(/[\u2010-\u2015]/g, "-") // normalize unicode dashes
      .replace(/[\/,;:(){}\[\]|]/g, " ")
      .replace(/[\r\n\t]+/g, " ")
      // keep + and . for things like "c++" / "next.js" if you want; otherwise strip:
      .replace(/[^a-z0-9+.\- ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Builds a regex fragment that matches variants with flexible separators
export function buildVariantRegex(variant: string) {
  const parts = variant.trim().toLowerCase().split(/\s+/).map(escapeRegex);

  if (parts.length === 1) return `\\b${parts[0]}\\b`;

  return `\\b${parts.join("(?:\\s+|\\-|\\/)+")}\\b`;
}
