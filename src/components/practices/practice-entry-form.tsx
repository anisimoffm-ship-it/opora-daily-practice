"use client";

import { EntryForm } from "@/components/library/entry-form";
import { saveExerciseEntry } from "@/lib/exercise-entries-storage";
import type { LibraryExercise } from "@/lib/types";

export function PracticeEntryForm({ exercise }: { exercise: LibraryExercise }) {
  return (
    <EntryForm
      exercise={exercise}
      backPath="/practices"
      onSave={saveExerciseEntry}
    />
  );
}
