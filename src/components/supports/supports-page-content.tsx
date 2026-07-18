"use client";

import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";

export function SupportsPageContent() {
  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Sprout className="size-5" />
          <span className="text-xs font-medium uppercase tracking-wider">MVP</span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Одна тренировка в день</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Личные архивы и длинные списки убраны из текущей версии. Главное действие осталось одно: выбрать навык на сегодня.
        </p>
      </section>

      <Link
        href="/"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        <ArrowLeft className="size-4" />
        Вернуться к выбору навыка
      </Link>
    </div>
  );
}
