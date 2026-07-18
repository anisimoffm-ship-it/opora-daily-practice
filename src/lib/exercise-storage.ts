import { createStorageId, loadJson, saveJson } from "./browser-storage";
import type { DailyMicroCard } from "./wellbeing-content";

export const DAILY_COMPLETED_DATES_KEY = "dailyCompletedDates";
export const EXERCISE_RESPONSES_KEY = "exerciseResponses";
export const EVIDENCE_BANK_KEY = "evidenceBank";
export const EXERCISE_STORAGE_CHANGED = "exerciseStorageChanged";

export interface ExerciseResponse {
  id: string;
  cardId: string;
  cardTitle: string;
  date: string;
  type: DailyMicroCard["type"];
  prompt: string;
  values: Record<string, string | string[] | boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceBankEntry {
  id: string;
  cardId: string;
  cardTitle: string;
  date: string;
  text: string;
  responseId?: string;
  createdAt: string;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EXERCISE_STORAGE_CHANGED));
}

function normalizeDates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((date): date is string => typeof date === "string"))];
}

function normalizeResponses(value: unknown): ExerciseResponse[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const response = item as Partial<ExerciseResponse>;
    if (typeof response.cardId !== "string" || typeof response.cardTitle !== "string") return [];
    const now = new Date().toISOString();
    return [
      {
        id: typeof response.id === "string" ? response.id : createStorageId(),
        cardId: response.cardId,
        cardTitle: response.cardTitle,
        date: typeof response.date === "string" ? response.date : todayKey(),
        type: response.type ?? "reflection",
        prompt: typeof response.prompt === "string" ? response.prompt : "",
        values: response.values && typeof response.values === "object" ? response.values : {},
        createdAt: typeof response.createdAt === "string" ? response.createdAt : now,
        updatedAt: typeof response.updatedAt === "string" ? response.updatedAt : now,
      },
    ];
  });
}

function normalizeEvidence(value: unknown): EvidenceBankEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Partial<EvidenceBankEntry>;
    if (typeof entry.cardId !== "string" || typeof entry.text !== "string") return [];
    const now = new Date().toISOString();
    return [
      {
        id: typeof entry.id === "string" ? entry.id : createStorageId(),
        cardId: entry.cardId,
        cardTitle: typeof entry.cardTitle === "string" ? entry.cardTitle : "Тренировка",
        date: typeof entry.date === "string" ? entry.date : todayKey(),
        text: entry.text,
        responseId: typeof entry.responseId === "string" ? entry.responseId : undefined,
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : now,
      },
    ];
  });
}

export function getDailyCompletedDates() {
  return normalizeDates(loadJson<unknown>(DAILY_COMPLETED_DATES_KEY, []));
}

export function isDailyCompleted(date = todayKey()) {
  return getDailyCompletedDates().includes(date);
}

export function markDailyCompleted(date = todayKey()) {
  saveJson(DAILY_COMPLETED_DATES_KEY, normalizeDates([date, ...getDailyCompletedDates()]));
  notify();
}

export function getExerciseResponses() {
  return normalizeResponses(loadJson<unknown>(EXERCISE_RESPONSES_KEY, []));
}

export function getTodayExerciseResponse(cardId?: string, date = todayKey()) {
  return getExerciseResponses().find((response) => response.date === date && (!cardId || response.cardId === cardId));
}

export function saveExerciseResponse(
  card: DailyMicroCard,
  values: ExerciseResponse["values"],
  date = todayKey(),
) {
  const now = new Date().toISOString();
  const response: ExerciseResponse = {
    id: createStorageId(),
    cardId: card.id,
    cardTitle: card.title,
    date,
    type: card.type,
    prompt: card.prompt,
    values,
    createdAt: now,
    updatedAt: now,
  };
  saveJson(EXERCISE_RESPONSES_KEY, [response, ...getExerciseResponses()]);
  notify();
  return response;
}

export function getEvidenceBank() {
  return normalizeEvidence(loadJson<unknown>(EVIDENCE_BANK_KEY, []));
}

export function saveEvidenceBankEntry(input: Omit<EvidenceBankEntry, "id" | "createdAt">) {
  const entry: EvidenceBankEntry = {
    ...input,
    id: createStorageId(),
    createdAt: new Date().toISOString(),
  };
  saveJson(EVIDENCE_BANK_KEY, [entry, ...getEvidenceBank()]);
  notify();
  return entry;
}
