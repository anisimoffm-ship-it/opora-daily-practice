"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Sprout } from "lucide-react";
import { PracticeSettling } from "@/components/ritual/practice-settling";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MOBILE_BACK_BUTTON_EVENT } from "@/lib/mobile-navigation";
import {
  RITUAL_STATES,
  RITUAL_STORAGE_CHANGED,
  RITUAL_VIEW_CHANGED,
  completeTodayRitual,
  getLocalDateKey,
  getRitualCompletions,
  getSkillById,
  getSkillForState,
  isCompletedToday,
  type RitualCompletion,
  type RitualSkill,
  type RitualStateId,
} from "@/lib/daily-ritual";

type RitualStep =
  | "home"
  | "settling"
  | "check-in"
  | "guide"
  | "practice"
  | "reflect"
  | "support"
  | "complete";

type RitualOutcomeId = "clearer" | "space" | "next-step" | "same" | "heavier";

const RITUAL_OUTCOMES: Array<{ id: RitualOutcomeId; label: string }> = [
  { id: "clearer", label: "Стало чуть яснее" },
  { id: "space", label: "Появилось немного пространства" },
  { id: "next-step", label: "Обозначился следующий шаг" },
  { id: "same", label: "Ничего не изменилось" },
  { id: "heavier", label: "Стало заметно тяжелее" },
];

export function DailyRitual() {
  const [step, setStep] = useState<RitualStep>("home");
  const [selectedStateId, setSelectedStateId] = useState<RitualStateId>();
  const [answer, setAnswer] = useState("");
  const [answeredMentally, setAnsweredMentally] = useState(false);
  const [outcome, setOutcome] = useState<RitualOutcomeId>();
  const [completions, setCompletions] = useState<RitualCompletion[]>([]);

  const selectedSkill = useMemo(
    () => (selectedStateId ? getSkillForState(selectedStateId) : undefined),
    [selectedStateId],
  );

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

  useEffect(() => {
    document.querySelector<HTMLElement>("[data-ritual-heading]")?.focus({ preventScroll: true });
  }, [step]);

  const goBack = useCallback(() => {
    setStep((current) => {
      if (current === "settling") return "home";
      if (current === "check-in") return "settling";
      if (current === "guide") return "check-in";
      if (current === "practice") return "guide";
      if (current === "reflect") return "practice";
      if (current === "support") return "reflect";
      return "home";
    });
  }, []);

  useEffect(() => {
    if (step === "home") return;

    const handleMobileBack = (event: Event) => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      goBack();
    };

    window.addEventListener(MOBILE_BACK_BUTTON_EVENT, handleMobileBack);
    return () => window.removeEventListener(MOBILE_BACK_BUTTON_EVENT, handleMobileBack);
  }, [goBack, step]);

  const completedToday = isCompletedToday(completions);
  const previousCompletion = completions.find(
    (completion) => completion.date !== getLocalDateKey(new Date()),
  );
  const previousSkill = previousCompletion ? getSkillById(previousCompletion.skillId) : undefined;
  const todayCompletion = completions.find(
    (completion) => completion.date === getLocalDateKey(new Date()),
  );
  const todayCompletedSkill = todayCompletion ? getSkillById(todayCompletion.skillId) : undefined;

  const startRitual = () => {
    setSelectedStateId(undefined);
    setAnswer("");
    setAnsweredMentally(false);
    setOutcome(undefined);
    setStep("settling");
  };

  const finishRitual = () => {
    if (!selectedSkill) return;
    completeTodayRitual(selectedSkill.id);
    syncCompletions();
    setStep("complete");
  };

  if (step === "settling") {
    return <PracticeSettling onComplete={() => setStep("check-in")} onCancel={() => setStep("home")} />;
  }

  if (step === "check-in") {
    return (
      <CheckInScreen
        selectedStateId={selectedStateId}
        onSelect={setSelectedStateId}
        onBack={goBack}
        onContinue={() => setStep("guide")}
      />
    );
  }

  if (step === "guide" && selectedSkill) {
    return (
      <PracticeGuide
        skill={selectedSkill}
        onBack={goBack}
        onContinue={() => setStep("practice")}
      />
    );
  }

  if (step === "practice" && selectedSkill) {
    return (
      <PracticeScreen
        skill={selectedSkill}
        answer={answer}
        answeredMentally={answeredMentally}
        onAnswerChange={setAnswer}
        onAnsweredMentallyChange={setAnsweredMentally}
        onBack={goBack}
        onContinue={() => setStep("reflect")}
      />
    );
  }

  if (step === "reflect" && selectedSkill) {
    return (
      <ReflectionScreen
        answer={answer}
        outcome={outcome}
        onOutcomeChange={setOutcome}
        onBack={goBack}
        onContinue={() => setStep("support")}
      />
    );
  }

  if (step === "support" && selectedSkill && outcome) {
    return (
      <SupportScreen
        skill={selectedSkill}
        outcome={outcome}
        onBack={goBack}
        onComplete={finishRitual}
      />
    );
  }

  if (step === "complete") {
    return <CompleteScreen onClose={() => setStep("home")} />;
  }

  return (
    <HomeScreen
      completedToday={completedToday}
      previousSkill={previousSkill}
      todaySkill={todayCompletedSkill}
      onStart={startRitual}
    />
  );
}

function HomeScreen({
  completedToday,
  previousSkill,
  todaySkill,
  onStart,
}: {
  completedToday: boolean;
  previousSkill?: RitualSkill;
  todaySkill?: RitualSkill;
  onStart: () => void;
}) {
  if (completedToday) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] flex-col justify-between gap-12 pb-8">
        <section className="space-y-5 pt-6">
          <p className="text-sm text-muted-foreground">Сегодня</p>
          <h1
            className="max-w-sm text-4xl font-medium leading-tight tracking-tight outline-none"
            data-ritual-heading
            tabIndex={-1}
          >
            На сегодня достаточно.
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            {todaySkill
              ? `Сегодня ты уделил время практике «${todaySkill.name}». Больше ничего делать не нужно.`
              : "Сегодня ты уже уделил себе немного времени. Больше ничего делать не нужно."}
          </p>
        </section>

        <Button type="button" variant="secondary" size="lg" className="h-12 w-full" onClick={onStart}>
          Повторить, если хочется
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col justify-between gap-12 pb-8">
      <section className="space-y-6 pt-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{getGreeting()}.</p>
          <h1
            className="max-w-sm text-4xl font-medium leading-tight tracking-tight outline-none"
            data-ritual-heading
            tabIndex={-1}
          >
            Что сейчас больше всего занимает твои мысли?
          </h1>
        </div>

        {previousSkill && (
          <div className="max-w-sm border-l-2 border-primary/35 pl-4 text-sm leading-relaxed">
            <p className="text-muted-foreground">В прошлый раз была практика</p>
            <p className="mt-1 font-medium">{previousSkill.name}</p>
            <p className="mt-2 text-muted-foreground">Как сейчас?</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <Button type="button" size="lg" className="h-12 w-full" onClick={onStart}>
          Начать с паузы
        </Button>
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          Около минуты. Можно остановиться в любой момент.
        </p>
      </section>
    </div>
  );
}

function CheckInScreen({
  selectedStateId,
  onSelect,
  onBack,
  onContinue,
}: {
  selectedStateId?: RitualStateId;
  onSelect: (stateId: RitualStateId) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedStateId) onContinue();
  };

  return (
    <form onSubmit={submit} className="ritual-screen-enter space-y-6 pb-8">
      <BackButton onClick={onBack} />
      <fieldset className="space-y-5">
        <legend className="sr-only">Что происходит с тобой сейчас?</legend>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Не нужно подбирать точное слово</p>
          <h1
            className="text-3xl font-medium leading-tight tracking-tight outline-none"
            data-ritual-heading
            tabIndex={-1}
          >
            Что происходит с тобой сейчас?
          </h1>
        </div>

        <div className="list gap-2 bg-transparent" role="radiogroup">
          {RITUAL_STATES.map((state) => (
            <label
              key={state.id}
              className="list-row min-h-14 cursor-pointer grid-cols-[1fr_auto] items-center rounded-box border border-border bg-base-200/55 px-4 py-3 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-secondary focus-within:ring-3 focus-within:ring-ring active:bg-secondary/80"
            >
              <span className="text-base leading-snug">{state.label}</span>
              <input
                type="radio"
                name="current-state"
                value={state.id}
                className="radio radio-sm"
                checked={selectedStateId === state.id}
                onChange={() => onSelect(state.id)}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="h-12 w-full" disabled={!selectedStateId}>
        Продолжить
      </Button>
    </form>
  );
}

function PracticeGuide({
  skill,
  onBack,
  onContinue,
}: {
  skill: RitualSkill;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="ritual-screen-enter space-y-6 pb-8">
      <BackButton onClick={onBack} />
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">По твоему выбору</p>
        <h1
          className="text-3xl font-medium leading-tight tracking-tight outline-none"
          data-ritual-heading
          tabIndex={-1}
        >
          {skill.name}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Одна короткая практика. Здесь нет правильного ответа.
        </p>
      </section>

      <dl className="divide-y divide-border border-y border-border">
        <GuideItem title="Зачем это может помочь" body={skill.whyItWorks} />
        <GuideItem title="Что сделать" body={skill.instruction} />
        <GuideItem title="Пример формы" body={skill.example} />
        <GuideItem title="Комментарий психолога" body={skill.psychologistNote} />
        <GuideItem title="Что можно заметить" body={skill.possibleEffect} />
      </dl>

      <div className="rounded-box bg-secondary/60 p-4 text-sm leading-relaxed text-muted-foreground">
        {skill.safetyNote}
      </div>

      <Button type="button" size="lg" className="h-12 w-full" onClick={onContinue}>
        Перейти к вопросу
      </Button>
    </div>
  );
}

function GuideItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-1.5 py-4">
      <dt className="text-sm font-medium">{title}</dt>
      <dd className="text-sm leading-relaxed text-muted-foreground">{body}</dd>
    </div>
  );
}

function PracticeScreen({
  skill,
  answer,
  answeredMentally,
  onAnswerChange,
  onAnsweredMentallyChange,
  onBack,
  onContinue,
}: {
  skill: RitualSkill;
  answer: string;
  answeredMentally: boolean;
  onAnswerChange: (answer: string) => void;
  onAnsweredMentallyChange: (answered: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const canContinue = Boolean(answer.trim() || answeredMentally);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canContinue) onContinue();
  };

  return (
    <form onSubmit={submit} className="ritual-screen-enter space-y-6 pb-8">
      <BackButton onClick={onBack} />
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">{skill.name}</p>
        <label
          htmlFor={skill.question.id}
          className="block text-3xl font-medium leading-tight tracking-tight outline-none"
          data-ritual-heading
          tabIndex={-1}
        >
          {skill.question.label}
        </label>
        <p id={`${skill.question.id}-guidance`} className="text-sm leading-relaxed text-muted-foreground">
          {skill.question.guidance}
        </p>
      </section>

      <Textarea
        id={skill.question.id}
        name={skill.question.id}
        value={answer}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder={skill.question.placeholder}
        aria-describedby={`${skill.question.id}-guidance ${skill.question.id}-privacy`}
        className="min-h-36 resize-none bg-base-200/55 px-4 py-3"
      />

      <p id={`${skill.question.id}-privacy`} className="text-sm leading-relaxed text-muted-foreground">
        Запиши одну-две фразы или ответь про себя. «Не знаю» тоже подходит. Личный текст не сохранится.
      </p>

      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-box border border-border bg-secondary/45 px-4 py-3 text-sm font-medium focus-within:ring-3 focus-within:ring-ring">
        <input
          type="checkbox"
          name="answered-mentally"
          className="checkbox checkbox-sm"
          checked={answeredMentally}
          onChange={(event) => onAnsweredMentallyChange(event.target.checked)}
        />
        Я ответил про себя
      </label>

      <Button type="submit" size="lg" className="h-12 w-full" disabled={!canContinue}>
        Увидеть свой ответ
      </Button>
    </form>
  );
}

function ReflectionScreen({
  answer,
  outcome,
  onOutcomeChange,
  onBack,
  onContinue,
}: {
  answer: string;
  outcome?: RitualOutcomeId;
  onOutcomeChange: (outcome: RitualOutcomeId) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (outcome) onContinue();
  };

  return (
    <form onSubmit={submit} className="ritual-screen-enter space-y-7 pb-8">
      <BackButton onClick={onBack} />

      <section className="space-y-3 border-l-2 border-primary/40 pl-4">
        <p className="text-sm text-muted-foreground">{answer.trim() ? "Твои слова" : "Ответ был про себя"}</p>
        <p className="text-xl font-medium leading-relaxed">
          {answer.trim() || "Не нужно подбирать правильную фразу или записывать её для приложения."}
        </p>
      </section>

      <fieldset className="space-y-4">
        <legend
          className="text-3xl font-medium leading-tight tracking-tight outline-none"
          data-ritual-heading
          tabIndex={-1}
        >
          Что изменилось?
        </legend>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Любой ответ подходит. Это не оценка практики.
        </p>
        <div className="grid gap-2" role="radiogroup">
          {RITUAL_OUTCOMES.map((option) => (
            <label
              key={option.id}
              className="flex min-h-13 cursor-pointer items-center justify-between gap-4 rounded-box border border-border bg-base-200/55 px-4 py-3 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-secondary focus-within:ring-3 focus-within:ring-ring active:bg-secondary/80"
            >
              <span className="text-sm leading-snug">{option.label}</span>
              <input
                type="radio"
                name="ritual-outcome"
                value={option.id}
                className="radio radio-sm"
                checked={outcome === option.id}
                onChange={() => onOutcomeChange(option.id)}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="h-12 w-full" disabled={!outcome}>
        Продолжить
      </Button>
    </form>
  );
}

function SupportScreen({
  skill,
  outcome,
  onBack,
  onComplete,
}: {
  skill: RitualSkill;
  outcome: RitualOutcomeId;
  onBack: () => void;
  onComplete: () => void;
}) {
  const isHeavier = outcome === "heavier";

  return (
    <div className="ritual-screen-enter flex min-h-[calc(100dvh-9rem)] flex-col justify-between gap-10 pb-8">
      <div className="space-y-8">
        <BackButton onClick={onBack} />
        <section className="space-y-4">
          <h1
            className="text-3xl font-medium leading-tight tracking-tight outline-none"
            data-ritual-heading
            tabIndex={-1}
          >
            {isHeavier ? "Сейчас лучше остановиться." : "Можно оставить это здесь."}
          </h1>
          <p className="text-lg leading-relaxed">
            {isHeavier
              ? "Верни внимание к тому, что находится вокруг. Если есть реальная угроза, сначала ищи безопасность и помощь."
              : skill.support}
          </p>
        </section>

        {!isHeavier && (
          <section className="space-y-2 border-l-2 border-primary/35 pl-4">
            <h2 className="text-sm font-medium">В реальной жизни</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{skill.nextStep}</p>
          </section>
        )}
      </div>

      <Button type="button" size="lg" className="h-12 w-full" onClick={onComplete}>
        Завершить
      </Button>
    </div>
  );
}

function CompleteScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="ritual-screen-enter flex min-h-[calc(100dvh-9rem)] flex-col justify-between gap-12 pb-8">
      <section className="space-y-5 pt-14">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
          <Sprout className="size-5" />
        </div>
        <h1
          className="max-w-sm text-4xl font-medium leading-tight tracking-tight outline-none"
          data-ritual-heading
          tabIndex={-1}
        >
          На сегодня достаточно.
        </h1>
        <p className="max-w-xs text-base leading-relaxed text-muted-foreground">
          Практика закончена. Больше ничего делать не нужно.
        </p>
      </section>

      <Button type="button" variant="secondary" size="lg" className="h-12 w-full" onClick={onClose}>
        До завтра
      </Button>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="-ml-2 h-12" onClick={onClick}>
      <ArrowLeft className="size-4" />
      Назад
    </Button>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}
