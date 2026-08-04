"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bell, Sprout } from "lucide-react";
import { NativeNavigation } from "@/components/layout/native-navigation";
import { NotificationScheduler } from "@/components/notifications/notification-scheduler";
import { RITUAL_VIEW_CHANGED } from "@/lib/daily-ritual";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [ritualActive, setRitualActive] = useState(false);

  useEffect(() => {
    const handleRitualViewChange = (event: Event) => {
      setRitualActive(Boolean((event as CustomEvent<boolean>).detail));
    };
    window.addEventListener(RITUAL_VIEW_CHANGED, handleRitualViewChange);
    return () => window.removeEventListener(RITUAL_VIEW_CHANGED, handleRitualViewChange);
  }, []);

  const brand = (
    <>
      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sprout className="size-4" />
      </span>
      <span className="text-lg font-medium tracking-tight text-foreground">Опора</span>
    </>
  );

  return (
    <div className="app-shell mx-auto flex w-full max-w-lg flex-col">
      <NativeNavigation />
      <NotificationScheduler />
      <header className="app-header sticky top-0 z-20 mb-8 flex items-center justify-between gap-4 bg-background/95 pb-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-1">
          {!isHome && !ritualActive && (
            <button
              type="button"
              aria-label="Вернуться на главную"
              className="flex size-12 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] active:bg-secondary"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="size-6" />
            </button>
          )}
          {ritualActive || !isHome ? (
            <div className="inline-flex min-h-12 items-center gap-2" aria-label="Опора">
              {brand}
            </div>
          ) : (
            <Link href="/" className="inline-flex min-h-12 items-center gap-2">
              {brand}
            </Link>
          )}
        </div>
        {isHome && !ritualActive && (
          <nav className="flex items-center gap-2" aria-label="Основная навигация">
            <Link
              href="/notifications/"
              aria-label="Настройки уведомлений"
              className="flex size-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] active:bg-secondary"
            >
              <Bell className="size-6" />
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
