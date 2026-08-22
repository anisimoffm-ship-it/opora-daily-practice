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
  completeOnboarding,
  completeTodayRitual,
  getLocalDateKey,
  getRitualCompletions,
  getSkillById,
  getSkillForState,
  hasCompletedOnboarding,
  isCompletedToday,
  type RitualCompletion,
  type RitualQuestion,
  type RitualSkill,
  type RitualStateId,
} from "@/lib/daily-ritual";

type RitualStep =
  | "loading"
  | "onboarding-intro"
  | "onboarding-control"
  | "home"
  | "settling"
  | "check-in"
  | "guide"
  | "practice"
  | "explore"
  | "apply"
  | "reflect"
  | "support"
  | "complete";

type RitualOutcomeId = "clearer" | "space" | "next-step" | "same" | "heavier";

interface RitualReflectionItem {
  label: string;
  value: string;
  answeredMentally: boolean;
}

const RITUAL_OUTCOMES: Array<{ id: RitualOutcomeId; label: string }> = [
  { id: "clearer", label: "Ситуация стала чуть яснее" },
  { id: "space", label: "Появилось немного пространства" },
  { id: "next-step", label: "Понятнее, что делать дальше" },
  { id: "same", label: "Ничего не изменилось" },
  { id: "heavier", label: "Стало заметно тяжелее" },
];

export function DailyRitual() {
  const [step, setStep] = useState<RitualStep>("loading");
  const [selectedStateId, setSelectedStateId] = useState<RitualStateId>();
  const [answer, setAnswer] = useState("");
  const [answeredMentally, setAnsweredMentally] = useState(false);
  const [explorationAnswers, setExplorationAnswers] = useState<string[]>([]);
  const [explorationAnsweredMentally, setExplorationAnsweredMentally] = useState<boolean[]>([]);
  const [explorationIndex, setExplorationIndex] = useState(0);
  const [applicationAnswer, setApplicationAnswer] = useState("");
  const [applicationAnsweredMentally, setApplicationAnsweredMentally] = useState(false);
  const [outcome, setOutcome] = useState<RitualOutcomeId>();
  const [completions, setCompletions] = useState<RitualCompletion[]>([]);

  const selectedSkill = useMemo(
    () => (selectedStateId ? getSkillForState(selectedStateId) : undefined),
    [selectedStateId],
  );

  const reflectionItems = useMemo(() => {
    if (!selectedSkill) return [];

    const explorationItems = (selectedSkill.exploration ?? []).map((question, index) => ({
      label: question.summaryLabel ?? question.label,
      value: getQuestionAnswer(question, explorationAnswers[index] ?? ""),
      answeredMentally: explorationAnsweredMentally[index] ?? false,
    }));

    return [
      {
        label: selectedSkill.question.summaryLabel ?? "Что ты заметил",
        value: answer,
        answeredMentally,
      },
      ...explorationItems,
      {
        label: selectedSkill.application.summaryLabel ?? "Что делать дальше",
        value: applicationAnswer,
        answeredMentally: applicationAnsweredMentally,
      },
    ];
  }, [
    answer,
    answeredMentally,
    applicationAnswer,
    applicationAnsweredMentally,
    explorationAnsweredMentally,
    explorationAnswers,
    selectedSkill,
  ]);

  const syncCompletions = useCallback(() => {
    setCompletions(getRitualCompletions());
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setStep(hasCompletedOnboarding() ? "home" : "onboarding-intro");
    }, 0);
    return () => window.clearTimeout(timeout);
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
    const isFocusedFlow = step !== "home" && step !== "loading";
    window.dispatchEvent(new CustomEvent(RITUAL_VIEW_CHANGED, { detail: isFocusedFlow }));
    return () => {
      window.dispatchEvent(new CustomEvent(RITUAL_VIEW_CHANGED, { detail: false }));
    };
  }, [step]);

  useEffect(() => {
    document.querySelector<HTMLElement>("[data-ritual-heading]")?.focus({ preventScroll: true });
  }, [step]);

  const goBack = useCallback(() => {
    if (step === "onboarding-intro") {
      completeOnboarding();
      setStep("home");
      return;
    }

    if (step === "explore") {
      if (explorationIndex > 0) {
        setExplorationIndex((current) => current - 1);
      } else {
        setStep("practice");
      }
      return;
    }

    if (step === "apply" && selectedSkill?.exploration?.length) {
      setExplorationIndex(selectedSkill.exploration.length - 1);
      setStep("explore");
      return;
    }

    setStep((current) => {
      if (current === "onboarding-control") return "onboarding-intro";
      if (current === "settling") return "home";
      if (current === "check-in") return "settling";
      if (current === "guide") return "check-in";
      if (current === "practice") return "guide";
      if (current === "apply") return "practice";
      if (current === "reflect") return "apply";
      if (current === "support") return "reflect";
      return "home";
    });
  }, [explorationIndex, selectedSkill, step]);

  useEffect(() => {
    if (step === "home" || step === "loading") return;

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
    setExplorationAnswers([]);
    setExplorationAnsweredMentally([]);
    setExplorationIndex(0);
    setApplicationAnswer("");
    setApplicationAnsweredMentally(false);
    setOutcome(undefined);
    setStep("settling");
  };

  const skipOnboarding = () => {
    completeOnboarding();
    setStep("home");
  };

  const startFirstRitual = () => {
    completeOnboarding();
    startRitual();
  };

  const finishRitual = () => {
    if (!selectedSkill) return;
    completeTodayRitual(selectedSkill.id);
    syncCompletions();
    setStep("complete");
  };

  if (step === "loading") {
    return <div className="min-h-[calc(100dvh-9rem)]" aria-hidden="true" />;
  }

  if (step === "onboarding-intro") {
    return (
      <OnboardingIntroScreen
        onContinue={() => setStep("onboarding-control")}
        onSkip={skipOnboarding}
      />
    );
  }

  if (step === "onboarding-control") {
    return <OnboardingControlScreen onBack={goBack} onStart={startFirstRitual} />;
  }

  if (step === "settling") {
    return <PracticeSettling onComplete={() => setStep("check-in")} onCancel={() => setStep("home")} />;
  }

  if (step === "check-in") {
    return (
      <CheckInScreen
        selectedStateId={selectedStateId}
        onSelect={(stateId) => {
          if (stateId !== selectedStateId) {
            setAnswer("");
            setAnsweredMentally(false);
            setExplorationAnswers([]);
            setExplorationAnsweredMentally([]);
            setExplorationIndex(0);
            setApplicationAnswer("");
            setApplicationAnsweredMentally(false);
            setOutcome(undefined);
          }
          setSelectedStateId(stateId);
        }}
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
        progress={
          selectedSkill.exploration?.length
            ? `1 из ${selectedSkill.exploration.length + 2}`
            : undefined
        }
        onContinue={() => {
          if (selectedSkill.exploration?.length) {
            setExplorationIndex(0);
            setStep("explore");
            return;
          }
          setStep("apply");
        }}
      />
    );
  }

  if (step === "explore" && selectedSkill?.exploration?.[explorationIndex]) {
    const question = selectedSkill.exploration[explorationIndex];
    const questionCount = selectedSkill.exploration.length + 2;

    return (
      <ExplorationScreen
        skill={selectedSkill}
        question={question}
        answer={explorationAnswers[explorationIndex] ?? ""}
        answeredMentally={explorationAnsweredMentally[explorationIndex] ?? false}
        progress={`${explorationIndex + 2} из ${questionCount}`}
        onAnswerChange={(nextAnswer) => {
          setExplorationAnswers((current) => {
            const next = [...current];
            next[explorationIndex] = nextAnswer;
            return next;
          });
        }}
        onAnsweredMentallyChange={(nextAnsweredMentally) => {
          setExplorationAnsweredMentally((current) => {
            const next = [...current];
            next[explorationIndex] = nextAnsweredMentally;
            return next;
          });
        }}
        onBack={goBack}
        onContinue={() => {
          if (explorationIndex < selectedSkill.exploration!.length - 1) {
            setExplorationIndex((current) => current + 1);
            return;
          }
          setStep("apply");
        }}
      />
    );
  }

  if (step === "apply" && selectedSkill) {
    return (
      <ApplicationScreen
        skill={selectedSkill}
        answer={answer}
        applicationAnswer={applicationAnswer}
        answeredMentally={applicationAnsweredMentally}
        onApplicationAnswerChange={setApplicationAnswer}
        onAnsweredMentallyChange={setApplicationAnsweredMentally}
        onBack={goBack}
        progress={
          selectedSkill.exploration?.length
            ? `${selectedSkill.exploration.length + 2} из ${selectedSkill.exploration.length + 2}`
            : undefined
        }
        onContinue={() => setStep("reflect")}
      />
    );
  }

  if (step === "reflect" && selectedSkill) {
    return (
      <ReflectionScreen
        items={reflectionItems}
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
        applicationAnswer={applicationAnswer}
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

function OnboardingIntroScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="ritual-screen-enter flex min-h-[calc(100dvh-9rem)] flex-col justify-between gap-12 pb-8">
      <section className="space-y-7 pt-8">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Знакомство · 1 из 2</p>
          <h1
            className="max-w-sm text-4xl font-medium leading-tight tracking-tight outline-none"
            data-ritual-heading
            tabIndex={-1}
          >
            Короткая опора на сейчас
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            За несколько минут можно заметить, что происходит, и выбрать, что делать дальше.
          </p>
        </div>

        <ol className="divide-y divide-border border-y border-border" aria-label="Как проходит практика">
          <li className="flex items-center gap-4 py-4">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground"
              aria-hidden="true"
            >
              1
            </span>
            <span className="text-base leading-snug">Назвать, что сейчас занимает мысли</span>
          </li>
          <li className="flex items-center gap-4 py-4">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground"
              aria-hidden="true"
            >
              2
            </span>
            <span className="text-base leading-snug">Выбрать свой безопасный следующий шаг</span>
          </li>
        </ol>

        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Необязательно, чтобы после практики стало легче.
        </p>
      </section>

      <div className="space-y-2">
        <Button type="button" size="lg" className="h-12 w-full" onClick={onContinue}>
          Продолжить
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-12 w-full text-muted-foreground"
          onClick={onSkip}
        >
          Пропустить знакомство
        </Button>
      </div>
    </div>
  );
}

function OnboardingControlScreen({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <div className="ritual-screen-enter flex min-h-[calc(100dvh-9rem)] flex-col justify-between gap-12 pb-8">
      <div className="space-y-8">
        <BackButton onClick={onBack} />

        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">Знакомство · 2 из 2</p>
          <h1
            className="max-w-sm text-4xl font-medium leading-tight tracking-tight outline-none"
            data-ritual-heading
            tabIndex={-1}
          >
            В своём темпе
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            Можно отвечать письменно или про себя. Личные ответы не сохраняются.
          </p>
        </section>

        <div className="space-y-2 border-l-2 border-primary/35 pl-4 text-sm leading-relaxed text-muted-foreground">
          <p>Практику можно остановить в любой момент.</p>
          <p>Если становится заметно тяжелее, лучше остановиться.</p>
        </div>
      </div>

      <Button type="button" size="lg" className="h-12 w-full" onClick={onStart}>
        Начать первую практику
      </Button>
    </div>
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
          Обычно 2–4 минуты. Можно остановиться в любой момент.
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
          {skill.duration ?? "Около двух минут"}. Здесь нет правильного ответа.
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
  progress,
  onContinue,
}: {
  skill: RitualSkill;
  answer: string;
  answeredMentally: boolean;
  onAnswerChange: (answer: string) => void;
  onAnsweredMentallyChange: (answered: boolean) => void;
  onBack: () => void;
  progress?: string;
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
        <p className="text-sm text-muted-foreground">
          {skill.name}{progress ? ` · ${progress}` : ""}
        </p>
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
        {skill.question.confirmationLabel ?? "Я ответил. Что дальше?"}
      </Button>
    </form>
  );
}

function ExplorationScreen({
  skill,
  question,
  answer,
  answeredMentally,
  progress,
  onAnswerChange,
  onAnsweredMentallyChange,
  onBack,
  onContinue,
}: {
  skill: RitualSkill;
  question: RitualQuestion;
  answer: string;
  answeredMentally: boolean;
  progress: string;
  onAnswerChange: (answer: string) => void;
  onAnsweredMentallyChange: (answered: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const isChoiceQuestion = Boolean(question.options?.length);
  const canContinue = Boolean(answer.trim() || (!isChoiceQuestion && answeredMentally));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canContinue) onContinue();
  };

  return (
    <form onSubmit={submit} className="ritual-screen-enter space-y-6 pb-8">
      <BackButton onClick={onBack} />

      {isChoiceQuestion ? (
        <fieldset className="space-y-5">
          <legend className="sr-only">{question.label}</legend>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {skill.name} · {progress}
            </p>
            <h1
              className="text-3xl font-medium leading-tight tracking-tight outline-none"
              data-ritual-heading
              tabIndex={-1}
            >
              {question.label}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{question.guidance}</p>
          </div>

          <div className="list gap-2 bg-transparent" role="radiogroup">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="list-row min-h-14 cursor-pointer grid-cols-[1fr_auto] items-center rounded-box border border-border bg-base-200/55 px-4 py-3 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-secondary focus-within:ring-3 focus-within:ring-ring active:bg-secondary/80"
              >
                <span className="text-base leading-snug">{option.label}</span>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  className="radio radio-sm"
                  checked={answer === option.id}
                  onChange={() => onAnswerChange(option.id)}
                />
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <>
          <section className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {skill.name} · {progress}
            </p>
            <label
              htmlFor={question.id}
              className="block text-3xl font-medium leading-tight tracking-tight outline-none"
              data-ritual-heading
              tabIndex={-1}
            >
              {question.label}
            </label>
            <p
              id={`${question.id}-guidance`}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {question.guidance}
            </p>
          </section>

          <Textarea
            id={question.id}
            name={question.id}
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder={question.placeholder}
            aria-describedby={`${question.id}-guidance ${question.id}-privacy`}
            className="min-h-32 resize-none bg-base-200/55 px-4 py-3"
          />

          <p id={`${question.id}-privacy`} className="text-sm leading-relaxed text-muted-foreground">
            Запиши одну-две фразы или ответь про себя. «Не знаю» тоже подходит. Личный текст не сохранится.
          </p>

          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-box border border-border bg-secondary/45 px-4 py-3 text-sm font-medium focus-within:ring-3 focus-within:ring-ring">
            <input
              type="checkbox"
              name={`${question.id}-answered-mentally`}
              className="checkbox checkbox-sm"
              checked={answeredMentally}
              onChange={(event) => onAnsweredMentallyChange(event.target.checked)}
            />
            Я ответил про себя
          </label>
        </>
      )}

      <Button type="submit" size="lg" className="h-12 w-full" disabled={!canContinue}>
        {question.confirmationLabel ?? "Я ответил. Дальше"}
      </Button>
    </form>
  );
}

function ApplicationScreen({
  skill,
  answer,
  applicationAnswer,
  answeredMentally,
  onApplicationAnswerChange,
  onAnsweredMentallyChange,
  onBack,
  progress,
  onContinue,
}: {
  skill: RitualSkill;
  answer: string;
  applicationAnswer: string;
  answeredMentally: boolean;
  onApplicationAnswerChange: (answer: string) => void;
  onAnsweredMentallyChange: (answered: boolean) => void;
  onBack: () => void;
  progress?: string;
  onContinue: () => void;
}) {
  const canContinue = Boolean(applicationAnswer.trim() || answeredMentally);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canContinue) onContinue();
  };

  return (
    <form onSubmit={submit} className="ritual-screen-enter space-y-6 pb-8">
      <BackButton onClick={onBack} />

      <section className="space-y-2 border-l-2 border-primary/35 pl-4">
        <p className="text-sm text-muted-foreground">Что ты заметил</p>
        <p className="text-base font-medium leading-relaxed">
          {answer.trim() || "Первый ответ был про себя."}
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {progress ? `${skill.name} · ${progress}` : "Теперь — что с этим делать"}
        </p>
        <label
          htmlFor={skill.application.id}
          className="block text-3xl font-medium leading-tight tracking-tight outline-none"
          data-ritual-heading
          tabIndex={-1}
        >
          {skill.application.label}
        </label>
        <p
          id={`${skill.application.id}-guidance`}
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {skill.application.guidance}
        </p>
      </section>

      <Textarea
        id={skill.application.id}
        name={skill.application.id}
        value={applicationAnswer}
        onChange={(event) => onApplicationAnswerChange(event.target.value)}
        placeholder={skill.application.placeholder}
        aria-describedby={`${skill.application.id}-guidance ${skill.application.id}-privacy`}
        className="min-h-32 resize-none bg-base-200/55 px-4 py-3"
      />

      <p
        id={`${skill.application.id}-privacy`}
        className="text-sm leading-relaxed text-muted-foreground"
      >
        Запиши одну фразу или выбери вариант про себя. «Пока не знаю» тоже подходит. Этот текст не сохранится.
      </p>

      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-box border border-border bg-secondary/45 px-4 py-3 text-sm font-medium focus-within:ring-3 focus-within:ring-ring">
        <input
          type="checkbox"
          name="application-answered-mentally"
          className="checkbox checkbox-sm"
          checked={answeredMentally}
          onChange={(event) => onAnsweredMentallyChange(event.target.checked)}
        />
        Я выбрал вариант про себя
      </label>

      <Button type="submit" size="lg" className="h-12 w-full" disabled={!canContinue}>
        {progress ? "Увидеть свои ответы" : "Увидеть оба ответа"}
      </Button>
    </form>
  );
}

function ReflectionScreen({
  items,
  outcome,
  onOutcomeChange,
  onBack,
  onContinue,
}: {
  items: RitualReflectionItem[];
  outcome?: RitualOutcomeId;
  onOutcomeChange: (outcome: RitualOutcomeId) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const observationItems = items.slice(0, -1);
  const applicationItem = items.at(-1);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (outcome) onContinue();
  };

  return (
    <form onSubmit={submit} className="ritual-screen-enter space-y-7 pb-8">
      <BackButton onClick={onBack} />

      <div className="space-y-4">
        <div className="divide-y divide-border border-y border-border">
          {observationItems.map((item, index) => (
            <section key={`${item.label}-${index}`} className="space-y-1.5 py-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-base font-medium leading-relaxed">
                {item.value.trim() ||
                  (item.answeredMentally
                    ? "Ответ был про себя."
                    : "Необязательно записывать ответ для приложения.")}
              </p>
            </section>
          ))}
        </div>

        {applicationItem && (
          <section className="space-y-2 rounded-box bg-secondary/55 p-4">
            <p className="text-sm text-muted-foreground">{applicationItem.label}</p>
            <p className="text-xl font-medium leading-relaxed">
              {applicationItem.value.trim() ||
                (applicationItem.answeredMentally
                  ? "Следующий вариант выбран про себя."
                  : "Необязательно записывать его для приложения.")}
            </p>
          </section>
        )}
      </div>

      <fieldset className="space-y-4">
        <legend
          className="text-3xl font-medium leading-tight tracking-tight outline-none"
          data-ritual-heading
          tabIndex={-1}
        >
          Что ты замечаешь сейчас?
        </legend>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Не нужно, чтобы стало легче. Отметь, что сейчас ближе всего.
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
  applicationAnswer,
  outcome,
  onBack,
  onComplete,
}: {
  skill: RitualSkill;
  applicationAnswer: string;
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
          <div className="space-y-4">
            <section className="space-y-2 rounded-box bg-secondary/55 p-4">
              <h2 className="text-sm font-medium">Твой следующий шаг</h2>
              <p className="text-base leading-relaxed">
                {applicationAnswer.trim() || "Шаг был выбран про себя."}
              </p>
            </section>

            <section className="space-y-2 border-l-2 border-primary/35 pl-4">
              <h2 className="text-sm font-medium">Ориентир</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{skill.nextStep}</p>
            </section>
          </div>
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

function getQuestionAnswer(question: RitualQuestion, answer: string) {
  return question.options?.find((option) => option.id === answer)?.label ?? answer;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}
