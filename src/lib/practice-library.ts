import { DAILY_CARD_EXERCISES } from "./wellbeing-content";
import type { LibraryCategory, LibraryExercise } from "./types";

export const PRACTICE_CATEGORIES = [
  "daily_self_criticism",
  "daily_anxiety",
  "daily_self_compassion",
  "daily_confidence",
  "daily_mindfulness",
] as const satisfies readonly LibraryCategory[];

export type PracticeCategory = (typeof PRACTICE_CATEGORIES)[number];

export const PRACTICE_CATEGORY_DETAILS: Record<
  PracticeCategory,
  { title: string; description: string }
> = {
  daily_self_criticism: {
    title: "Замечать критика",
    description: "Один навык: отделять строгую мысль от себя.",
  },
  daily_anxiety: {
    title: "Реалистичное мышление",
    description: "Один навык: проверять тревожные мысли фактами.",
  },
  daily_self_compassion: {
    title: "Самоподдержка и ошибки",
    description: "Короткие тренировки бережного отношения к себе.",
  },
  daily_confidence: {
    title: "Смелость",
    description: "Один маленький шаг, который можно сделать со страхом.",
  },
  daily_mindfulness: {
    title: "Внутренняя опора",
    description: "Один навык: замечать факты устойчивости.",
  },
};

const SUPPORT_EXERCISES: LibraryExercise[] = [];

export const ALL_PRACTICES: LibraryExercise[] = [
  ...DAILY_CARD_EXERCISES,
  ...SUPPORT_EXERCISES,
];

export const CBT_EXERCISE_IDS = new Set<string>();

export function getUnifiedPractice(id: string) {
  return ALL_PRACTICES.find((exercise) => exercise.id === id);
}
