// src/utils/storage.ts
export type StoredInput = {
  jd: string;
  resume: string;
  savedAtISO: string;
};

export function getStoredInput(storageKey: string): StoredInput | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredInput>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      jd: String(parsed.jd ?? ""),
      resume: String(parsed.resume ?? ""),
      savedAtISO: String(parsed.savedAtISO ?? ""),
    };
  } catch {
    return null;
  }
}
