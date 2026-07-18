"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Brain,
  CheckCircle2,
  Footprints,
  Heart,
  Leaf,
  Shield,
  Sprout,
  Sun,
} from "lucide-react";
import { DAILY_MICRO_CARDS, type DailyMicroCard } from "@/lib/wellbeing-content";
import {
  EXERCISE_STORAGE_CHANGED,
  getExerciseResponses,
  getTodayExerciseResponse,
  isDailyCompleted,
  markDailyCompleted,
  saveExerciseResponse,
  type ExerciseResponse,
} from "@/lib/exercise-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type RitualStep = "choose" | "support" | "practice" | "complete";

const CARD_ICONS: Record<string, typeof Shield> = {
  "notice-inner-critic": Shield,
  "check-thought-facts": Brain,
  "support-yourself": Heart,
  "mistakes-without-catastrophe": CheckCircle2,
  "show-up-with-fear": Footprints,
  "inner-support": Leaf,
};

export function HomePageContent() {
  const [step, setStep] = useState<RitualStep>("choose");
  const [selectedCard, setSelectedCard] = useState<DailyMicroCard>();
  const [answer, setAnswer] = useState("");
  const [completedToday, setCompletedToday] = useState(false);
  const [responses, setResponses] = useState<ExerciseResponse[]>([]);
  const [todayResponse, setTodayResponse] = useState<ExerciseResponse>();

  useEffect(() => {
    const syncExerciseState = () => {
      const todayDone = isDailyCompleted();
      const currentResponse = getTodayExerciseResponse();
      setCompletedToday(todayDone);
      setResponses(getExerciseResponses());
      setTodayResponse(currentResponse);
      if (todayDone) {
        const completedCard = DAILY_MICRO_CARDS.find((card) => card.id === currentResponse?.cardId);
        setSelectedCard(completedCard ?? DAILY_MICRO_CARDS[0]);
        setStep("complete");
      }
    };

    syncExerciseState();
    window.addEventListener("storage", syncExerciseState);
    window.addEventListener(EXERCISE_STORAGE_CHANGED, syncExerciseState);
    return () => {
      window.removeEventListener("storage", syncExerciseState);
      window.removeEventListener(EXERCISE_STORAGE_CHANGED, syncExerciseState);
    };
  }, []);

  const currentCard = selectedCard ?? DAILY_MICRO_CARDS[0];

  const chooseCard = (card: DailyMicroCard) => {
    setSelectedCard(card);
    setAnswer("");
    setStep("support");
  };

  const completePractice = (event: FormEvent) => {
    event.preventDefault();
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer || !selectedCard) return;
    saveExerciseResponse(selectedCard, { reflection: trimmedAnswer });
    markDailyCompleted();
    setTodayResponse(getTodayExerciseResponse(selectedCard.id));
    setResponses(getExerciseResponses());
    setCompletedToday(true);
    setStep("complete");
  };

  if (step === "complete" || completedToday) {
    return (
      <div className="space-y-6 pb-8">
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">Сегодня</p>
          <h1 className="text-3xl font-medium tracking-tight">
            {currentCard.completionMessage}
          </h1>
        </section>

        <Card className="bg-card shadow-sm">
          <CardContent className="space-y-5">
            <GrowingLeaf />
            <p className="text-center text-lg font-medium">На сегодня достаточно.</p>
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              Один лист вырос в навыке «{currentCard.leafLabel}».
            </p>
            <SkillTree responses={responses} activeCardId={currentCard.id} />
            {todayResponse && (
              <p className="rounded-lg bg-secondary/70 p-3 text-sm leading-relaxed text-muted-foreground">
                {String(todayResponse.values.reflection ?? "")}
              </p>
            )}
            <Button type="button" size="lg" className="w-full" variant="secondary">
              До завтра
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "support" && selectedCard) {
    return (
      <div className="space-y-6 pb-8">
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">Сегодня</p>
          <h1 className="text-3xl font-medium tracking-tight">
            Сегодня не нужно менять себя.
          </h1>
        </section>

        <Card className="shadow-sm">
          <CardContent className="space-y-5">
            <p className="text-xl leading-relaxed">
              Попробуем потренировать один небольшой навык.
            </p>
            <p className="rounded-lg bg-secondary/70 p-4 text-sm leading-relaxed text-muted-foreground">
              {selectedCard.support}
            </p>
            <Button type="button" size="lg" className="w-full" onClick={() => setStep("practice")}>
              Начать тренировку
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "practice" && selectedCard) {
    return (
      <div className="space-y-6 pb-8">
        <section className="space-y-2">
          <p className="text-sm text-muted-foreground">Сегодня:</p>
          <h1 className="text-3xl font-medium tracking-tight">{selectedCard.skillName}</h1>
          <p className="text-sm text-muted-foreground">
            {selectedCard.duration} · энергия: {selectedCard.energy}
          </p>
        </section>

        <form onSubmit={completePractice}>
          <Card className="shadow-sm">
            <CardContent className="space-y-5">
              <PracticeBlock title="Почему это полезно" text={selectedCard.whyUseful} />
              <PracticeBlock title="Что нужно сделать" text={selectedCard.exercise} />
              <PracticeBlock title="Пример" text={selectedCard.example} />
              <div className="space-y-2">
                <label htmlFor="practice-answer" className="text-sm font-medium">
                  Ответ
                </label>
                <Textarea
                  id="practice-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={selectedCard.fields?.[0]?.placeholder}
                  className="min-h-28 bg-background"
                />
              </div>
              <PracticeBlock title="Подсказка" text={selectedCard.hint} muted />
              <Button type="submit" size="lg" className="w-full" disabled={!answer.trim()}>
                Готово
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Sun className="size-5" />
          <p className="text-sm font-medium">Доброе утро.</p>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">
          Что сегодня тебе нужнее всего?
        </h1>
      </section>

      <section className="grid grid-cols-1 gap-3">
        {DAILY_MICRO_CARDS.map((card) => {
          const Icon = CARD_ICONS[card.id] ?? Sprout;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => chooseCard(card)}
              className="flex min-h-20 items-center gap-4 rounded-xl bg-card p-4 text-left shadow-sm ring-1 ring-foreground/10 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="text-base font-medium leading-snug">{card.choiceTitle}</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}

function PracticeBlock({
  title,
  text,
  muted = false,
}: {
  title: string;
  text: string;
  muted?: boolean;
}) {
  return (
    <section className={muted ? "rounded-lg bg-secondary/60 p-3" : "space-y-1"}>
      <h2 className="text-xs font-medium uppercase text-muted-foreground">{title}</h2>
      <p className="text-sm leading-relaxed">{text}</p>
    </section>
  );
}

function GrowingLeaf() {
  return (
    <div className="flex justify-center py-2" aria-hidden="true">
      <div className="relative flex size-24 items-end justify-center">
        <span className="absolute bottom-3 h-14 w-1 rounded-full bg-primary/50" />
        <span className="leaf-grow absolute bottom-12 h-10 w-7 origin-bottom-left rounded-[70%_0_70%_0] bg-primary/80" />
        <span className="leaf-grow-delayed absolute bottom-8 left-11 h-8 w-6 origin-bottom-right rounded-[0_70%_0_70%] bg-primary/60" />
      </div>
    </div>
  );
}

function SkillTree({
  responses,
  activeCardId,
}: {
  responses: ExerciseResponse[];
  activeCardId?: string;
}) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    responses.forEach((response) => {
      map.set(response.cardId, (map.get(response.cardId) ?? 0) + 1);
    });
    return map;
  }, [responses]);

  return (
    <section className="space-y-3 rounded-lg bg-secondary/50 p-4">
      <div className="flex items-center gap-2">
        <Sprout className="size-4 text-primary" />
        <h2 className="text-sm font-medium">Дерево навыков</h2>
      </div>
      <div className="grid gap-2">
        {DAILY_MICRO_CARDS.map((card) => {
          const count = counts.get(card.id) ?? (card.id === activeCardId ? 1 : 0);
          return (
            <div key={card.id} className="flex items-center justify-between gap-3">
              <span className="text-sm leading-snug">{card.leafLabel}</span>
              <span className="flex min-w-12 justify-end gap-1" aria-label={`${count} листьев`}>
                {Array.from({ length: Math.max(count, 1) }, (_, index) => (
                  <Leaf
                    key={index}
                    className={count > index ? "size-4 text-primary" : "size-4 text-muted-foreground/25"}
                    fill={count > index ? "currentColor" : "none"}
                  />
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
