"use client";

import { useSyncExternalStore } from "react";
import { ACHIEVEMENT_ENTRIES_CHANGED, getAchievementEntries } from "@/lib/achievementStorage";
import { getSupportPhrases, SUPPORT_PHRASES_CHANGED } from "@/lib/supportStorage";

const EMPTY = "[]";

function subscribe(event: string) {
  return (callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener(event, callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener(event, callback);
    };
  };
}

export function useSupportPhrases() {
  const raw = useSyncExternalStore(subscribe(SUPPORT_PHRASES_CHANGED), () => JSON.stringify(getSupportPhrases()), () => EMPTY);
  return JSON.parse(raw) as ReturnType<typeof getSupportPhrases>;
}

export function useAchievementEntries() {
  const raw = useSyncExternalStore(subscribe(ACHIEVEMENT_ENTRIES_CHANGED), () => JSON.stringify(getAchievementEntries()), () => EMPTY);
  return JSON.parse(raw) as ReturnType<typeof getAchievementEntries>;
}
