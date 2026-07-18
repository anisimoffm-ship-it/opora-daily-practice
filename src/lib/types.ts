export type LibraryCategory =
  | "daily_anxiety"
  | "daily_self_criticism"
  | "daily_stress"
  | "daily_burnout"
  | "daily_emotions"
  | "daily_self_esteem"
  | "daily_mindfulness"
  | "daily_gratitude"
  | "daily_relationships"
  | "daily_values"
  | "daily_confidence"
  | "daily_self_compassion"
  | "support";

export type EntryFieldType = "text" | "textarea" | "number" | "checkboxes";

export interface EntryFieldDefinition {
  id: string;
  label: string;
  type?: EntryFieldType;
  placeholder?: string;
  options?: string[];
}

export interface ExerciseGuide {
  purpose: string;
  steps: string[];
  example: string[];
}

export interface LibraryExercise {
  id: string;
  title: string;
  description: string;
  category: LibraryCategory;
  fields: EntryFieldDefinition[];
  guide: ExerciseGuide;
}

export interface LibraryEntry {
  id: string;
  exerciseId: string;
  createdAt: string;
  values: Record<string, string | number | string[]>;
}

export interface SupportPhrase {
  id: string;
  text: string;
  context?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementEntry {
  id: string;
  type: "achievement" | "win" | "compliment" | "hard_situation" | "change";
  title: string;
  before?: string;
  after?: string;
  whatHelped: string;
  evidence: string;
  date: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
