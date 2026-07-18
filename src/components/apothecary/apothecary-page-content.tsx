import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";

export function ApothecaryPageContent() {
  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Sprout className="size-5" />
          <span className="text-xs font-medium uppercase tracking-wider">MVP</span>
        </div>
        <h1 className="text-3xl font-medium tracking-tight">Фокус на сегодня</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Этот раздел убран из основного продукта. Сейчас в «Опоре» есть один ежедневный выбор и одна короткая тренировка.
        </p>
      </section>

      <Link
        href="/"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        <ArrowLeft className="size-4" />
        Вернуться к сегодняшнему навыку
      </Link>
    </div>
  );
}
