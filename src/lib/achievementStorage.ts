import { createStorageId, loadJson, saveJson } from "./browser-storage";
import type { AchievementEntry } from "./types";

const KEY = "achievementEntries";
export const ACHIEVEMENT_ENTRIES_CHANGED = "achievementEntriesChanged";

const entryTypes = new Set(["achievement", "win", "compliment", "hard_situation", "change"]);

function normalize(value: unknown): AchievementEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || !("title" in item) || typeof item.title !== "string") return [];
    const title = item.title;
    const entry = item as Partial<AchievementEntry>;
    const now = new Date().toISOString();
    return [{
      id: typeof entry.id === "string" ? entry.id : createStorageId(),
      type: typeof entry.type === "string" && entryTypes.has(entry.type)
        ? entry.type as AchievementEntry["type"]
        : "achievement",
      title,
      before: typeof entry.before === "string" ? entry.before : undefined,
      after: typeof entry.after === "string" ? entry.after : undefined,
      whatHelped: typeof entry.whatHelped === "string" ? entry.whatHelped : "",
      evidence: typeof entry.evidence === "string" ? entry.evidence : "",
      date: typeof entry.date === "string" ? entry.date : now.slice(0, 10),
      tags: Array.isArray(entry.tags) ? entry.tags.filter((tag): tag is string => typeof tag === "string") : [],
      createdAt: typeof entry.createdAt === "string" ? entry.createdAt : now,
      updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : now,
    }];
  });
}

function notify() {
  window.dispatchEvent(new Event(ACHIEVEMENT_ENTRIES_CHANGED));
}

export function getAchievementEntries(): AchievementEntry[] {
  return normalize(loadJson<unknown>(KEY, []));
}

export function saveAchievementEntry(input: Omit<AchievementEntry, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const entry: AchievementEntry = { ...input, id: createStorageId(), createdAt: now, updatedAt: now };
  saveJson(KEY, [entry, ...getAchievementEntries()]);
  notify();
  return entry;
}

export function updateAchievementEntry(id: string, updates: Partial<Omit<AchievementEntry, "id" | "createdAt">>) {
  const next = getAchievementEntries().map((entry) =>
    entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
  );
  saveJson(KEY, next);
  notify();
  return next;
}

export function deleteAchievementEntry(id: string) {
  const next = getAchievementEntries().filter((entry) => entry.id !== id);
  saveJson(KEY, next);
  notify();
  return next;
}

export function getRandomAchievementEntry(): AchievementEntry | undefined {
  const entries = getAchievementEntries();
  return entries[Math.floor(Math.random() * entries.length)];
}
