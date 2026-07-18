"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SETTLING_DURATION_MS = 4_000;
const EXIT_DURATION_MS = 480;
const SKIP_EXIT_DURATION_MS = 220;
const PETAL_COUNT = 8;

export function PracticeSettling({ onComplete }: { onComplete: () => void }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const skipTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    document.querySelector<HTMLElement>("[data-settling-heading]")?.focus();

    const leaveTimeout = window.setTimeout(
      () => setIsLeaving(true),
      SETTLING_DURATION_MS - EXIT_DURATION_MS,
    );
    const completeTimeout = window.setTimeout(onComplete, SETTLING_DURATION_MS);

    return () => {
      window.clearTimeout(leaveTimeout);
      window.clearTimeout(completeTimeout);
      if (skipTimeoutRef.current !== null) {
        window.clearTimeout(skipTimeoutRef.current);
      }
    };
  }, [onComplete]);

  const skip = () => {
    if (skipTimeoutRef.current !== null) return;
    setIsLeaving(true);
    skipTimeoutRef.current = window.setTimeout(onComplete, SKIP_EXIT_DURATION_MS);
  };

  return (
    <section
      className={cn(
        "settling-stage flex min-h-[calc(100dvh-9rem)] flex-col pb-8 text-center",
        isLeaving && "settling-stage-leaving",
      )}
      aria-labelledby="settling-title"
    >
      <div className="space-y-1 pt-2">
        <h1
          id="settling-title"
          className="text-xl font-medium tracking-tight outline-none"
          data-settling-heading
          tabIndex={-1}
        >
          Настройка
        </h1>
        <p className="text-sm text-muted-foreground">Ничего делать не нужно</p>
      </div>

      <div className="flex flex-1 items-center justify-center py-8" aria-hidden="true">
        <div className="settling-orb">
          {Array.from({ length: PETAL_COUNT }, (_, index) => (
            <span
              key={index}
              className="settling-petal"
              style={
                {
                  "--petal-angle": `${index * (360 / PETAL_COUNT)}deg`,
                  "--petal-delay": `${index * 45}ms`,
                } as CSSProperties
              }
            />
          ))}
          <span className="settling-core" />
        </div>
      </div>

      <p className="sr-only" role="status">
        Практика начнётся автоматически через несколько секунд.
      </p>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="h-12 w-full text-muted-foreground"
        onClick={skip}
      >
        Пропустить
      </Button>
    </section>
  );
}
