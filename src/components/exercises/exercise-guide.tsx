"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExerciseGuide as ExerciseGuideData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ExerciseGuideProps {
  description: string;
  guide: ExerciseGuideData;
}

export function ExerciseGuide({ description, guide }: ExerciseGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-xl border border-primary/15 bg-accent/30 p-4">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
            className="-ml-2 mt-2 text-primary"
          >
            Как тренировать?
            <ChevronDown
              className={cn("transition-transform", isOpen && "rotate-180")}
            />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-5 border-t border-primary/10 pt-4">
          <GuideSection title="Зачем тренируем?">
            <p>{guide.purpose}</p>
          </GuideSection>
          <GuideSection title="Что сделать?">
            <ol className="list-decimal space-y-1.5 pl-4">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </GuideSection>
          <GuideSection title="Пример">
            <div className="space-y-1.5 rounded-lg bg-background/70 p-3 text-foreground">
              {guide.example.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </GuideSection>
        </div>
      )}
    </section>
  );
}

function GuideSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {children}
    </div>
  );
}
