"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, CircleCheck, Plus, Sparkles, TimerReset } from "lucide-react";
import { saveAchievementEntry } from "@/lib/achievementStorage";
import {
  markDailyCompleted,
  saveEvidenceBankEntry,
  saveExerciseResponse,
  type ExerciseResponse,
} from "@/lib/exercise-storage";
import type { DailyMicroCard } from "@/lib/wellbeing-content";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ExerciseRunnerState = "idle" | "inProgress" | "completed";
type ExerciseValues = Record<string, string | string[] | boolean>;

export function ExerciseRunner({
  card,
  initialState = "idle",
  variant = "full",
  onCompletedForToday,
  onRequestAnother,
}: {
  card: DailyMicroCard;
  initialState?: ExerciseRunnerState;
  variant?: "full" | "compact";
  onCompletedForToday?: () => void;
  onRequestAnother?: () => void;
}) {
  const [state, setState] = useState<ExerciseRunnerState>(initialState);
  const [values, setValues] = useState<ExerciseValues>({});
  const [response, setResponse] = useState<ExerciseResponse>();
  const [evidenceSaved, setEvidenceSaved] = useState(false);

  const finish = (nextValues: ExerciseValues) => {
    const saved = saveExerciseResponse(card, nextValues);
    setValues(nextValues);
    setResponse(saved);
    setState("completed");
  };

  const saveToEvidence = () => {
    const text = formatExerciseResponse(card, response?.values ?? values);
    if (!text.trim()) return;
    saveEvidenceBankEntry({
      cardId: card.id,
      cardTitle: card.title,
      date: new Date().toISOString().slice(0, 10),
      text,
      responseId: response?.id,
    });
    saveAchievementEntry({
      type: "achievement",
      title: card.title,
      whatHelped: card.prompt,
      evidence: text,
      date: new Date().toISOString().slice(0, 10),
      tags: [card.category.toLocaleLowerCase("ru")],
    });
    setEvidenceSaved(true);
  };

  const completeForToday = () => {
    markDailyCompleted();
    onCompletedForToday?.();
  };

  if (state === "completed") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-primary/10 p-4 ring-1 ring-primary/15">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CircleCheck className="size-5" />
            </span>
            <div className="min-w-0 space-y-2">
              <p className="font-medium">{card.completionMessage}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{card.nextStep}</p>
            </div>
          </div>
        </div>
        <ExerciseResponseSummary card={card} values={response?.values ?? values} />
        <div className="grid gap-2">
          <Button type="button" size="lg" onClick={completeForToday}>
            На сегодня достаточно
          </Button>
          <Button type="button" size="lg" variant={evidenceSaved ? "secondary" : "outline"} onClick={saveToEvidence}>
            {evidenceSaved ? <Check /> : <Plus />}
            {evidenceSaved ? "Сохранено" : "Сохранить как опору"}
          </Button>
          <Button type="button" size="lg" variant="ghost" onClick={onRequestAnother}>
            Вернуться к выбору
          </Button>
        </div>
      </div>
    );
  }

  if (state === "inProgress") {
    return <ExerciseForm card={card} values={values} onChange={setValues} onFinish={finish} />;
  }

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-secondary/70 p-4">
          <p className="text-sm leading-relaxed">{card.exercise}</p>
        </div>
        <Button type="button" size="lg" className="w-full" onClick={() => setState("inProgress")}>
          <Sparkles /> Начать тренировку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SupportLine label="Можно попробовать" value={card.support} />
      <SupportLine label="Что сделать" value={card.exercise} />
      <SupportLine label="Вопрос" value={card.reflectionQuestion} />
      <SupportLine label="Маленький шаг" value={card.nextStep} />
      <Button type="button" size="lg" className="w-full" onClick={() => setState("inProgress")}>
        <Sparkles /> Начать тренировку
      </Button>
    </div>
  );
}

function ExerciseForm({
  card,
  values,
  onChange,
  onFinish,
}: {
  card: DailyMicroCard;
  values: ExerciseValues;
  onChange: (values: ExerciseValues) => void;
  onFinish: (values: ExerciseValues) => void;
}) {
  const updateValue = (id: string, value: string | string[] | boolean) => {
    onChange({ ...values, [id]: value });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onFinish(values);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-xl bg-secondary/70 p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">{card.duration}</p>
        <h4 className="mt-1 text-lg font-medium">{card.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.prompt}</p>
      </div>
      {card.type === "reflection" && (
        <ReflectionFields card={card} values={values} onChange={updateValue} />
      )}
      {card.type === "choice" && (
        <ChoiceFields card={card} values={values} onChange={updateValue} />
      )}
      {card.type === "breathing" && <BreathingExercise values={values} onChange={updateValue} />}
      {card.type === "grounding" && (
        <GroundingChecklist card={card} values={values} onChange={updateValue} />
      )}
      {card.type === "evidence" && (
        <EvidenceFields card={card} values={values} onChange={updateValue} />
      )}
      <Button type="submit" size="lg" className="w-full" disabled={!canFinish(card, values)}>
        {card.type === "breathing" ? "Я сделал" : "Готово"}
      </Button>
    </form>
  );
}

function ReflectionFields({
  card,
  values,
  onChange,
}: {
  card: DailyMicroCard;
  values: ExerciseValues;
  onChange: (id: string, value: string) => void;
}) {
  const fields = card.fields ?? [];
  const requiredTask = String(values.requiredTask ?? "").trim();
  const optionalTask = String(values.optionalTask ?? "").trim();
  const shouldDelaySimplify = fields.some((field) => field.id === "simplify");
  const visibleFields = fields.filter((field) => {
    if (field.id !== "simplify") return true;
    return !shouldDelaySimplify || Boolean(requiredTask && optionalTask);
  });

  return (
    <div className="space-y-3">
      {visibleFields.map((field) => {
        const value = String(values[field.id] ?? "");
        const control =
          field.id === "simplify" || field.id === "reflection" ? (
            <Textarea
              value={value}
              onChange={(event) => onChange(field.id, event.target.value)}
              placeholder={field.placeholder}
            />
          ) : (
            <Input
              value={value}
              onChange={(event) => onChange(field.id, event.target.value)}
              placeholder={field.placeholder}
            />
          );
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            {control}
          </div>
        );
      })}
    </div>
  );
}

function ChoiceFields({
  card,
  values,
  onChange,
}: {
  card: DailyMicroCard;
  values: ExerciseValues;
  onChange: (id: string, value: string[]) => void;
}) {
  const selected = Array.isArray(values.choices) ? values.choices : [];
  const choices = card.choices ?? [
    { id: "small-step", label: "Маленький шаг" },
    { id: "pause", label: "Пауза" },
    { id: "support", label: "Поддержка" },
  ];

  const toggle = (id: string) => {
    onChange("choices", selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  };

  return (
    <div className="grid gap-2">
      {choices.map((choice) => (
        <Button
          key={choice.id}
          type="button"
          variant={selected.includes(choice.id) ? "default" : "outline"}
          size="lg"
          className="justify-start whitespace-normal"
          onClick={() => toggle(choice.id)}
        >
          {choice.label}
        </Button>
      ))}
    </div>
  );
}

function BreathingExercise({
  values,
  onChange,
}: {
  values: ExerciseValues;
  onChange: (id: string, value: boolean) => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onChange("breathingDone", true);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [onChange, secondsLeft]);

  const done = Boolean(values.breathingDone);

  return (
    <div className="rounded-xl bg-secondary/70 p-5 text-center">
      <TimerReset className="mx-auto size-6 text-primary" />
      <p className="mt-2 text-3xl font-medium">{secondsLeft}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Медленный вдох и длинный выдох. Просто побудь с этим.
      </p>
      <Button type="button" variant={done ? "secondary" : "outline"} className="mt-4" onClick={() => onChange("breathingDone", true)}>
        {done ? "Отмечено" : "Я сделал"}
      </Button>
    </div>
  );
}

function GroundingChecklist({
  card,
  values,
  onChange,
}: {
  card: DailyMicroCard;
  values: ExerciseValues;
  onChange: (id: string, value: string[]) => void;
}) {
  const selected = Array.isArray(values.grounding) ? values.grounding : [];
  const actions = card.choices ?? [
    { id: "feet", label: "Почувствовать стопы" },
    { id: "look", label: "Назвать 3 предмета" },
    { id: "exhale", label: "Сделать длинный выдох" },
  ];

  const toggle = (id: string) => {
    onChange("grounding", selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <label key={action.id} className="flex items-center gap-3 rounded-xl bg-secondary/70 p-3 text-sm">
          <Checkbox checked={selected.includes(action.id)} onCheckedChange={() => toggle(action.id)} />
          {action.label}
        </label>
      ))}
    </div>
  );
}

function EvidenceFields({
  card,
  values,
  onChange,
}: {
  card: DailyMicroCard;
  values: ExerciseValues;
  onChange: (id: string, value: string) => void;
}) {
  const field = card.fields?.[0] ?? {
    id: "situation",
    label: "Ситуация",
    placeholder: "Что произошло и что говорит в твою пользу?",
  };
  return (
    <div className="space-y-2">
      <Label>{field.label}</Label>
      <Textarea
        value={String(values[field.id] ?? "")}
        onChange={(event) => onChange(field.id, event.target.value)}
        placeholder={field.placeholder}
      />
    </div>
  );
}

export function ExerciseResponseSummary({
  card,
  values,
}: {
  card: DailyMicroCard;
  values: ExerciseValues;
}) {
  const lines = useMemo(() => getResponseLines(card, values), [card, values]);

  if (lines.length === 0) {
    return (
      <div className="rounded-xl bg-secondary/70 p-4 text-sm text-muted-foreground">
        Ответ сохранен локально.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl bg-secondary/70 p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">Сохраненный ответ</p>
      {lines.map((line) => (
        <div key={line.label} className="text-sm leading-relaxed">
          <span className="text-muted-foreground">{line.label}: </span>
          {line.value}
        </div>
      ))}
    </div>
  );
}

function canFinish(card: DailyMicroCard, values: ExerciseValues) {
  if (card.type === "breathing") return Boolean(values.breathingDone);
  if (card.type === "choice") return Array.isArray(values.choices) && values.choices.length > 0;
  if (card.type === "grounding") return Array.isArray(values.grounding) && values.grounding.length >= 3;
  const fields = card.fields ?? [];
  if (fields.length === 0) return true;
  return fields.every((field) => String(values[field.id] ?? "").trim().length > 0);
}

function getResponseLines(card: DailyMicroCard, values: ExerciseValues) {
  const fields = card.fields ?? [];
  if (fields.length > 0) {
    return fields.flatMap((field) => {
      const value = values[field.id];
      if (!value || Array.isArray(value) || typeof value === "boolean") return [];
      return [{ label: field.label, value }];
    });
  }
  const choiceMap = new Map((card.choices ?? []).map((choice) => [choice.id, choice.label]));
  const selected = Object.values(values).find((value): value is string[] => Array.isArray(value)) ?? [];
  return selected.map((id) => ({ label: "Выбор", value: choiceMap.get(id) ?? id }));
}

function formatExerciseResponse(card: DailyMicroCard, values: ExerciseValues) {
  const lines = getResponseLines(card, values);
  if (lines.length === 0) return card.prompt;
  return lines.map((line) => `${line.label}: ${line.value}`).join("\n");
}

function SupportLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-lg bg-secondary/70 p-3">
      <p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}
