"use client";

import { useCallback, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const EXIT_DURATION_SECONDS = 0.22;
const INHALE_DURATION_SECONDS = 5;
const EXHALE_DURATION_SECONDS = 7;

export function PracticeSettling({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const stageRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sequenceRef = useRef<gsap.core.Animation | null>(null);
  const hasFinishedRef = useRef(false);

  const finish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onComplete();
  }, [onComplete]);

  const { contextSafe } = useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      headingRef.current?.focus({ preventScroll: true });

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const circle = stage.querySelector<HTMLElement>(".breathing-circle");
        if (!circle) return;

        gsap.set(circle, { scale: 0.72 });
        gsap.set(".breath-cue-inhale", { autoAlpha: 1, y: 0 });
        gsap.set(".breath-cue-exhale", { autoAlpha: 0, y: 4 });

        const breathCycle = gsap.timeline({
          repeat: -1,
          defaults: { ease: "sine.inOut" },
        });

        breathCycle
          .addLabel("inhale", 0)
          .to(
            ".breath-cue-inhale",
            { autoAlpha: 1, y: 0, duration: 0.35, ease: "power1.out" },
            "inhale",
          )
          .to(
            ".breath-cue-exhale",
            { autoAlpha: 0, y: -4, duration: 0.35, ease: "power1.in" },
            "inhale",
          )
          .to(
            circle,
            {
              scale: 1.04,
              duration: INHALE_DURATION_SECONDS,
            },
            "inhale",
          )
          .addLabel("exhale", INHALE_DURATION_SECONDS)
          .to(
            ".breath-cue-inhale",
            { autoAlpha: 0, y: -4, duration: 0.35, ease: "power1.in" },
            "exhale",
          )
          .to(
            ".breath-cue-exhale",
            { autoAlpha: 1, y: 0, duration: 0.35, ease: "power1.out" },
            "exhale",
          )
          .to(
            circle,
            {
              scale: 0.72,
              duration: EXHALE_DURATION_SECONDS,
            },
            "exhale",
          );

        const timeline = gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .addLabel("intro", 0)
          .fromTo(
            ".settling-copy",
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.45 },
            "intro",
          )
          .fromTo(
            ".breathing-stage",
            { autoAlpha: 0, scale: 0.98 },
            { autoAlpha: 1, scale: 1, duration: 0.55 },
            "intro+=0.08",
          )
          .add(breathCycle, "intro+=0.58");

        sequenceRef.current = timeline;
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        sequenceRef.current = null;
      });

      return () => {
        sequenceRef.current = null;
        media.revert();
      };
    },
    { dependencies: [finish], revertOnUpdate: true, scope: stageRef },
  );

  const continuePractice = useCallback(() => {
    contextSafe(() => {
      if (hasFinishedRef.current) return;
      const stage = stageRef.current;
      if (!stage) return;

      sequenceRef.current?.kill();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }

      sequenceRef.current = gsap
        .timeline({ onComplete: finish })
        .to(stage, {
          autoAlpha: 0,
          scale: 0.985,
          duration: EXIT_DURATION_SECONDS,
          ease: "power2.in",
        });
    })();
  }, [contextSafe, finish]);

  return (
    <section
      ref={stageRef}
      className="settling-scene flex min-h-[calc(100dvh-9rem)] flex-col pb-8 text-center"
      aria-labelledby="settling-title"
    >
      <div className="settling-copy space-y-2 pt-2">
        <h1
          ref={headingRef}
          id="settling-title"
          className="text-xl font-medium tracking-tight outline-none"
          tabIndex={-1}
        >
          Небольшая пауза
        </h1>
        <p className="text-sm text-muted-foreground">
          Побудь здесь около 15 секунд, если тебе подходит
        </p>
      </div>

      <div className="breathing-stage flex flex-1 items-center justify-center py-6">
        <div className="grid place-items-center gap-5">
          <div className="relative h-8 w-full" aria-hidden="true">
            <span className="breath-cue breath-cue-inhale">Вдох</span>
            <span className="breath-cue breath-cue-exhale">Выдох</span>
            <span className="breath-cue breath-cue-rest">Дыши в своём ритме</span>
          </div>
          <p className="sr-only">Круг мягко расширяется и сужается. Можно дышать в своём ритме.</p>
          <div
            className="breathing-orb-motion"
            role="img"
            aria-label="Мягкий ритм: круг расширяется и сужается"
          >
            <span className="breathing-circle" />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Расслабляться необязательно — можно заметить дыхание в своём ритме или предметы
            вокруг, а затем продолжить или вернуться позже.
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full"
          onClick={continuePractice}
        >
          Я здесь
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-12 w-full text-muted-foreground"
          onClick={onCancel}
        >
          Вернуться
        </Button>
      </div>
    </section>
  );
}
