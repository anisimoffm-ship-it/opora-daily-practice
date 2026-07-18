import { createStorageId, loadJson, saveJson } from "./browser-storage";
import type { LibraryEntry } from "./types";

const KEY = "mindful-practice-entries";
export const EXERCISE_ENTRIES_CHANGED = "exerciseEntriesChanged";

export function loadExerciseEntries(): LibraryEntry[] {
  return loadJson(KEY, []);
}

export function saveExerciseEntry(
  exerciseId: string,
  values: LibraryEntry["values"]
): LibraryEntry[] {
  const entries = loadExerciseEntries();
  const next = [
    ...entries,
    { id: createStorageId(), exerciseId, values, createdAt: new Date().toISOString() },
  ];
  saveJson(KEY, next);
  window.dispatchEvent(new Event(EXERCISE_ENTRIES_CHANGED));
  return next;
}
