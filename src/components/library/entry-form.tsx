"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ExerciseGuide } from "@/components/exercises/exercise-guide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LibraryEntry, LibraryExercise } from "@/lib/types";

interface EntryFormProps {
  exercise: LibraryExercise;
  backPath: string;
  onSave: (exerciseId: string, values: LibraryEntry["values"]) => void;
}

export function EntryForm({ exercise, backPath, onSave }: EntryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<LibraryEntry["values"]>({});

  const setValue = (id: string, value: string | number | string[]) => {
    setValues((current) => ({ ...current, [id]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave(exercise.id, values);
    router.push(backPath);
  };

  return (
    <form onSubmit={submit} className="space-y-6 pb-8">
      <section className="space-y-3">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft /> Назад
        </Button>
        <div>
          <h1 className="text-2xl font-medium tracking-tight">{exercise.title}</h1>
        </div>
        <ExerciseGuide description={exercise.description} guide={exercise.guide} />
      </section>

      {exercise.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          {field.type === "number" ? (
            <Input
              id={field.id}
              type="number"
              min={0}
              max={100}
              value={(values[field.id] as number | undefined) ?? ""}
              onChange={(event) => setValue(field.id, Number(event.target.value))}
              className="h-11"
            />
          ) : field.type === "checkboxes" ? (
            <div className="space-y-2">
              {field.options?.map((option) => {
                const selected = (values[field.id] as string[] | undefined) ?? [];
                return (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 text-sm"
                  >
                    <Checkbox
                      checked={selected.includes(option)}
                      onCheckedChange={() =>
                        setValue(
                          field.id,
                          selected.includes(option)
                            ? selected.filter((item) => item !== option)
                            : [...selected, option]
                        )
                      }
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          ) : (
            <Textarea
              id={field.id}
              value={(values[field.id] as string | undefined) ?? ""}
              onChange={(event) => setValue(field.id, event.target.value)}
              placeholder={field.placeholder}
              className="min-h-28 resize-none"
            />
          )}
        </div>
      ))}

      <Button type="submit" size="lg" className="w-full">
        Готово
      </Button>
    </form>
  );
}
