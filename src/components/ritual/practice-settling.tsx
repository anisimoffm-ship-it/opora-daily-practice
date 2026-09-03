"use client";

import { useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const EXIT_DURATION_SECONDS = 0.22;
const INHALE_DURATION_SECONDS = 4;
const HOLD_DURATION_SECONDS = 4;
const EXHALE_DURATION_SECONDS = 6;

export function PracticeSettling({
  onComplete,
  onSkip,
  onBack,
}: {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const stageRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const breathTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isLeavingRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);

  const { contextSafe } = useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      headingRef.current?.focus({ preventScroll: true });
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const circle = stage.querySelector<HTMLElement>(".breathing-circle");
        if (!circle) return;

        gsap.set(circle, { scale: 1 });
        gsap.set(".breath-cue-inhale", { autoAlpha: 1 });
        gsap.set([".breath-cue-hold", ".breath-cue-exhale"], { autoAlpha: 0 });

        breathTimelineRef.current = gsap
          .timeline({
            paused: true,
            defaults: { ease: "sine.inOut" },
            onComplete,
          })
          .addLabel("inhale", 0)
          .to(
            circle,
            {
              scale: 1.55,
              boxShadow: "0 0 70px 16px rgb(122 168 255 / 0.55)",
              duration: INHALE_DURATION_SECONDS,
            },
            "inhale",
          )
          .addLabel("hold", INHALE_DURATION_SECONDS)
          .to(
            ".breath-cue-inhale",
            { autoAlpha: 0, duration: 0.25, ease: "power1.in" },
            "hold",
          )
          .to(
            ".breath-cue-hold",
            { autoAlpha: 1, duration: 0.25, ease: "power1.out" },
            "hold",
          )
          .to(
            circle,
            { scale: 1.55, duration: HOLD_DURATION_SECONDS, ease: "none" },
            "hold",
          )
          .addLabel("exhale", INHALE_DURATION_SECONDS + HOLD_DURATION_SECONDS)
          .to(
            ".breath-cue-hold",
            { autoAlpha: 0, duration: 0.25, ease: "power1.in" },
            "exhale",
          )
          .to(
            ".breath-cue-exhale",
            { autoAlpha: 1, duration: 0.25, ease: "power1.out" },
            "exhale",
          )
          .to(
            circle,
            {
              scale: 1,
              boxShadow: "0 0 50px 8px rgb(122 168 255 / 0.35)",
              duration: EXHALE_DURATION_SECONDS,
            },
            "exhale",
          );

        gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .fromTo(
            ".settling-copy",
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.45 },
          )
          .fromTo(
            ".breathing-stage",
            { autoAlpha: 0, scale: 0.98 },
            { autoAlpha: 1, scale: 1, duration: 0.55 },
            "<0.08",
          );
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        breathTimelineRef.current = null;
      });

      return () => {
        breathTimelineRef.current = null;
        media.revert();
      };
    },
    { scope: stageRef },
  );

  const leave = useCallback(
    (destination: () => void) => {
      contextSafe(() => {
        if (isLeavingRef.current) return;
        isLeavingRef.current = true;
        breathTimelineRef.current?.kill();

        const stage = stageRef.current;
        if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          destination();
          return;
        }

        gsap.to(stage, {
          autoAlpha: 0,
          scale: 0.985,
          duration: EXIT_DURATION_SECONDS,
          ease: "power2.in",
          onComplete: destination,
        });
      })();
    },
    [contextSafe],
  );

  const startBreathing = () => {
    if (isRunning) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    setIsRunning(true);
    breathTimelineRef.current?.restart();
  };

  return (
    <section
      ref={stageRef}
      className="settling-scene ritual-viewport flex flex-col pb-8 text-center"
      aria-labelledby="settling-title"
      aria-describedby="settling-description"
    >
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="mb-3 h-12 w-fit justify-start gap-1 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        onClick={() => leave(onBack)}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Назад
      </Button>

      <div className="settling-copy space-y-1.5">
        <p className="text-[13px] font-medium text-muted-foreground">Необязательный шаг</p>
        <h1
          ref={headingRef}
          id="settling-title"
          className="text-[22px] font-semibold tracking-tight outline-none"
          tabIndex={-1}
        >
          Подыши немного
        </h1>
        <p
          id="settling-description"
          className="mx-auto max-w-sm px-4 text-sm leading-relaxed text-muted-foreground"
        >
          Следуй за кругом, если тебе подходит. После одного цикла продолжим.
        </p>
      </div>

      <div className="breathing-stage flex flex-1 items-center justify-center py-5">
        <div className="grid place-items-center gap-7">
          <p className="sr-only">
            Круг расширяется четыре секунды, остаётся неподвижным четыре секунды и
            сжимается шесть секунд. Этот шаг можно пропустить.
          </p>
          <div className="breathing-ring" aria-hidden="true">
            <div className="breathing-orb-motion">
              <span className="breathing-circle" />
              <span className="breath-cue breath-cue-inhale">Вдох</span>
              <span className="breath-cue breath-cue-hold">Задержка</span>
              <span className="breath-cue breath-cue-exhale">Выдох</span>
              <span className="breath-cue breath-cue-rest">Свой ритм</span>
            </div>
          </div>

          <dl
            className="grid grid-cols-3 gap-5 text-center"
            aria-label="Ритм движения круга"
          >
            <div className="grid gap-0.5">
              <dt className="order-2 text-xs text-muted-foreground">вдох</dt>
              <dd className="order-1 text-[15px] font-semibold text-base-content">4 с</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="order-2 text-xs text-muted-foreground">задержка</dt>
              <dd className="order-1 text-[15px] font-semibold text-base-content">4 с</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="order-2 text-xs text-muted-foreground">выдох</dt>
              <dd className="order-1 text-[15px] font-semibold text-base-content">6 с</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-2.5">
        <Button
          type="button"
          size="lg"
          className="h-13 w-full rounded-[18px] text-[15.5px] font-semibold"
          disabled={isRunning}
          onClick={startBreathing}
        >
          {isRunning ? "Дышим…" : "Начать"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-[18px] border-base-content/15 bg-transparent text-sm text-muted-foreground hover:border-base-content/25 hover:bg-secondary/55"
          onClick={() => leave(onSkip)}
        >
          Пропустить
        </Button>
      </div>
    </section>
  );
}
