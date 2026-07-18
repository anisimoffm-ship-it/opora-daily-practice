"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Check, Sprout } from "lucide-react";
import { PracticeSettling } from "@/components/ritual/practice-settling";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  RITUAL_STORAGE_CHANGED,
  RITUAL_VIEW_CHANGED,
  completeTodayRitual,
  getLocalDateKey,
  getRitualCompletions,
  getTodaySkill,
  getWeekDays,
  isCompletedToday,
  type RitualCompletion,
  type RitualSkill,
} from "@/lib/daily-ritual";

type RitualStep = "home" | "settling" | "practice" | "complete";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function DailyRitual() {
  const [step, setStep] = useState<RitualStep>("home");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completions, setCompletions] = useState<RitualCompletion[]>([]);
  const todaySkill = useMemo(() => getTodaySkill(), []);

  const syncCompletions = useCallback(() => {
    setCompletions(getRitualCompletions());
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(syncCompletions, 0);
    window.addEventListener("storage", syncCompletions);
    window.addEventListener(RITUAL_STORAGE_CHANGED, syncCompletions);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("storage", syncCompletions);
      window.removeEventListener(RITUAL_STORAGE_CHANGED, syncCompletions);
    };
  }, [syncCompletions]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(RITUAL_VIEW_CHANGED, { detail: step !== "home" }));
    return () => {
      window.dispatchEvent(new CustomEvent(RITUAL_VIEW_CHANGED, { detail: false }));
    };
  }, [step]);

  const completedToday = isCompletedToday(completions);

  const startPractice = () => {
    setAnswers({});
    softHaptic();
    setStep("settling");
  };

  const finishSettling = useCallback(() => {
    softHaptic();
    setStep("practice");
  }, []);

  const finishPractice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    completeTodayRitual(todaySkill.id);
    syncCompletions();
    setStep("complete");
  };

  if (step === "settling") {
    return <PracticeSettling onComplete={finishSettling} />;
  }

  if (step === "practice") {
    return (
      <PracticeScreen
        skill={todaySkill}
        answers={answers}
        onAnswersChange={setAnswers}
        onBack={() => setStep("home")}
        onComplete={finishPractice}
      />
    );
  }

  if (step === "complete") {
    return (
      <CompleteScreen
        completions={completions}
        onClose={() => setStep("home")}
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-3 pt-2">
        <p className="text-sm text-muted-foreground">{getGreeting()}.</p>
        <h1 className="text-3xl font-medium tracking-tight">Две спокойные минуты для себя.</h1>
      </section>

      <section className="space-y-4 rounded-lg bg-card p-5 shadow-sm ring-1 ring-foreground/10">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sprout className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">Сегодня:</p>
          <h2 className="text-2xl font-medium tracking-tight">{todaySkill.name}</h2>
          <p className="text-sm text-muted-foreground">≈ 2 минуты</p>
        </div>
        <Button type="button" size="lg" className="h-12 w-full" onClick={startPractice}>
          {completedToday ? "Пройти ещё раз" : "Начать практику"}
        </Button>
      </section>
    </div>
  );
}

function PracticeScreen({
  skill,
  answers,
  onAnswersChange,
  onBack,
  onComplete,
}: {
  skill: RitualSkill;
  answers: Record<string, string>;
  onAnswersChange: (answers: Record<string, string>) => void;
  onBack: () => void;
  onComplete: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [phase, setPhase] = useState(0);
  const questionIndex = phase - 1;
  const currentQuestion = skill.questions[questionIndex];
  const isQuestionPhase = Boolean(currentQuestion);
  const isSupportPhase = phase === skill.questions.length + 1;
  const finalQuestion = skill.questions.at(-1);
  const personalAnswer = finalQuestion ? answers[finalQuestion.id]?.trim() : "";

  useEffect(() => {
    document.querySelector<HTMLElement>("[data-practice-step-heading]")?.focus();
  }, [phase]);

  const updateAnswer = (id: string, value: string) => {
    onAnswersChange({ ...answers, [id]: value });
  };

  const next = () => setPhase((current) => Math.min(current + 1, skill.questions.length + 1));
  const back = () => {
    if (phase === 0) {
      onBack();
      return;
    }
    setPhase((current) => current - 1);
  };

  return (
    <form onSubmit={onComplete} className="practice-screen-enter space-y-5 pb-8">
      <Button type="button" variant="ghost" size="sm" className="-ml-2 h-11" onClick={back}>
        <ArrowLeft className="size-4" />
        Назад
      </Button>

      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Сегодня:</p>
        <h1 className="text-3xl font-medium tracking-tight">{skill.name}</h1>
      </section>

      {phase === 0 && (
        <RitualStepCard
          title="Выбери один момент"
          body={skill.recallPrompt}
          recommendations={skill.recommendations}
          actionLabel="Перейти к вопросам"
          onAction={next}
        />
      )}

      {isQuestionPhase && currentQuestion && (
        <section className="space-y-4 rounded-lg bg-card p-5 shadow-sm ring-1 ring-foreground/10">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Шаг {questionIndex + 1} из {skill.questions.length}
            </p>
            <label
              htmlFor={currentQuestion.id}
              className="block text-xl font-medium leading-snug outline-none"
              data-practice-step-heading
              tabIndex={-1}
            >
              {currentQuestion.label}
            </label>
            <div className="space-y-1 rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed">
              <p className="font-medium">Как ответить</p>
              <p className="text-muted-foreground">{currentQuestion.guidance}</p>
            </div>
            {questionIndex === 0 && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Можно ответить про себя или записать 1–2 фразы. Текст не сохранится.
              </p>
            )}
          </div>
          <Textarea
            id={currentQuestion.id}
            value={answers[currentQuestion.id] ?? ""}
            onChange={(event) => updateAnswer(currentQuestion.id, event.target.value)}
            placeholder={`Например: ${currentQuestion.placeholder}`}
            className="min-h-24 bg-background"
          />
          <Button type="button" size="lg" className="h-12 w-full" onClick={next}>
            {questionIndex === skill.questions.length - 1 ? "Посмотреть итог" : "Следующий вопрос"}
          </Button>
        </section>
      )}

      {isSupportPhase && (
        <section className="space-y-4 rounded-lg bg-secondary/70 p-5">
          <div className="space-y-2">
            <h2
              className="text-sm font-medium outline-none"
              data-practice-step-heading
              tabIndex={-1}
            >
              {personalAnswer ? "Твои слова" : "Можно попробовать"}
            </h2>
            <p className="text-xl font-medium leading-snug">{personalAnswer || skill.support}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Сделай паузу. Что изменилось сейчас — в мыслях, чувствах или теле? Если ничего не изменилось, это тоже нормально.
            </p>
            <div className="space-y-1 rounded-lg bg-background/70 p-3 text-sm leading-relaxed">
              <p className="font-medium">Что можно сделать дальше</p>
              <p className="text-muted-foreground">{skill.nextStep}</p>
            </div>
          </div>
          <Button type="submit" size="lg" className="h-12 w-full">
            Завершить практику
          </Button>
        </section>
      )}
    </form>
  );
}

function RitualStepCard({
  title,
  body,
  recommendations,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  recommendations: string[];
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="space-y-4 rounded-lg bg-card p-5 shadow-sm ring-1 ring-foreground/10">
      <div className="space-y-2">
        <h2
          className="text-sm font-medium outline-none"
          data-practice-step-heading
          tabIndex={-1}
        >
          {title}
        </h2>
        <p className="text-xl font-medium leading-snug">{body}</p>
      </div>
      <div className="space-y-2 rounded-lg bg-secondary/60 p-3">
        <h3 className="text-sm font-medium">Как выполнять</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          {recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </div>
      <Button type="button" size="lg" className="h-12 w-full" onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  );
}

function CompleteScreen({
  completions,
  onClose,
}: {
  completions: RitualCompletion[];
  onClose: () => void;
}) {
  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-3 pt-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-5" />
        </div>
        <h1 className="text-3xl font-medium tracking-tight">На сегодня достаточно.</h1>
      </section>

      <WeekProgress completions={completions} highlightToday />

      <Button type="button" variant="secondary" size="lg" className="h-12 w-full" onClick={onClose}>
        На главную
      </Button>
    </div>
  );
}

function WeekProgress({
  completions,
  highlightToday = false,
}: {
  completions: RitualCompletion[];
  highlightToday?: boolean;
}) {
  const weekDays = getWeekDays();
  const completedDates = new Set(completions.map((completion) => completion.date));
  const todayKey = getLocalDateKey(new Date());

  return (
    <section className="space-y-3 rounded-lg bg-card p-4 shadow-sm ring-1 ring-foreground/10">
      <h2 className="text-sm font-medium">Небольшие паузы на этой неделе</h2>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const key = getLocalDateKey(day);
          const completed = completedDates.has(key);
          const isToday = key === todayKey;
          return (
            <div key={key} className="space-y-2 text-center">
              <p className="text-xs text-muted-foreground">{WEEKDAY_LABELS[index]}</p>
              <span
                className={cn(
                  "mx-auto flex size-8 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                  highlightToday && isToday && "ritual-day-fill",
                )}
                aria-label={completed ? `${WEEKDAY_LABELS[index]} выполнено` : `${WEEKDAY_LABELS[index]} не выполнено`}
              >
                {completed ? "●" : "○"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function softHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
}
