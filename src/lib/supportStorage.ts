import { createStorageId, loadJson, saveJson } from "./browser-storage";
import type { SupportPhrase } from "./types";

const KEY = "supportPhrases";
export const SUPPORT_PHRASES_CHANGED = "supportPhrasesChanged";

const STARTER_PHRASES = [
  "Мне не нужно быть идеальным, чтобы иметь ценность.",
  "Ошибка не доказывает, что со мной что-то не так.",
  "Я могу чувствовать тревогу и всё равно действовать.",
  "Мне можно занимать место.",
  "Я могу нравиться не всем, и это нормально.",
  "Я уже справлялся раньше.",
  "Маленький шаг всё равно считается шагом.",
];

function normalize(value: unknown): SupportPhrase[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || !("text" in item) || typeof item.text !== "string") {
      return [];
    }
    const text = item.text;
    const phrase = item as Partial<SupportPhrase>;
    const now = new Date().toISOString();
    return [{
      id: typeof phrase.id === "string" ? phrase.id : createStorageId(),
      text,
      context: typeof phrase.context === "string" ? phrase.context : undefined,
      tags: Array.isArray(phrase.tags) ? phrase.tags.filter((tag): tag is string => typeof tag === "string") : [],
      isFavorite: phrase.isFavorite === true,
      createdAt: typeof phrase.createdAt === "string" ? phrase.createdAt : now,
      updatedAt: typeof phrase.updatedAt === "string" ? phrase.updatedAt : now,
    }];
  });
}

function notify() {
  window.dispatchEvent(new Event(SUPPORT_PHRASES_CHANGED));
}

export function getSupportPhrases(): SupportPhrase[] {
  if (typeof window === "undefined") return [];
  if (localStorage.getItem(KEY) === null) {
    const now = new Date().toISOString();
    const starter = STARTER_PHRASES.map((text) => ({
      id: createStorageId(), text, tags: [], isFavorite: false, createdAt: now, updatedAt: now,
    }));
    saveJson(KEY, starter);
    return starter;
  }
  return normalize(loadJson<unknown>(KEY, []));
}

export function saveSupportPhrase(input: Pick<SupportPhrase, "text"> & Partial<Pick<SupportPhrase, "context" | "tags" | "isFavorite">>) {
  const now = new Date().toISOString();
  const phrase: SupportPhrase = {
    id: createStorageId(),
    text: input.text.trim(),
    context: input.context?.trim() || undefined,
    tags: input.tags ?? [],
    isFavorite: input.isFavorite ?? false,
    createdAt: now,
    updatedAt: now,
  };
  saveJson(KEY, [phrase, ...getSupportPhrases()]);
  notify();
  return phrase;
}

export function updateSupportPhrase(id: string, updates: Partial<Omit<SupportPhrase, "id" | "createdAt">>) {
  const next = getSupportPhrases().map((phrase) =>
    phrase.id === id ? { ...phrase, ...updates, updatedAt: new Date().toISOString() } : phrase
  );
  saveJson(KEY, next);
  notify();
  return next;
}

export function deleteSupportPhrase(id: string) {
  const next = getSupportPhrases().filter((phrase) => phrase.id !== id);
  saveJson(KEY, next);
  notify();
  return next;
}

export function getRandomSupportPhrase(tag?: string): SupportPhrase | undefined {
  const phrases = getSupportPhrases().filter((phrase) => !tag || phrase.tags.includes(tag));
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function toggleFavoriteSupportPhrase(id: string) {
  const phrase = getSupportPhrases().find((item) => item.id === id);
  return phrase ? updateSupportPhrase(id, { isFavorite: !phrase.isFavorite }) : getSupportPhrases();
}
