"use client";

import Link from "next/link";
import { ArrowRight, Sprout } from "lucide-react";
import { DAILY_MICRO_CARDS } from "@/lib/wellbeing-content";

export function PracticesPageContent() {
  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Sprout className="size-5" />
          <span className="text-xs font-medium uppercase tracking-wider">Шесть навыков</span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Тренировки опоры</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          В MVP остается только один ежедневный выбор. Здесь видны шесть навыков, из которых растет дерево.
        </p>
      </section>

      <section className="grid gap-3">
        {DAILY_MICRO_CARDS.map((card) => (
          <Link
            key={card.id}
            href={`/practices/${card.id}`}
            className="flex items-center justify-between gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-foreground/10 transition-colors hover:bg-secondary"
          >
            <div>
              <h2 className="font-medium">{card.skillName}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {card.duration} · энергия: {card.energy}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-primary" />
          </Link>
        ))}
      </section>
    </div>
  );
}
