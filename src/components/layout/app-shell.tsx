"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Sprout } from "lucide-react";
import { NotificationScheduler } from "@/components/notifications/notification-scheduler";
import { RITUAL_VIEW_CHANGED } from "@/lib/daily-ritual";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-5 pb-8 sm:px-6">
      <NotificationScheduler />
      <header className="sticky top-0 z-20 -mx-5 mb-8 flex items-center justify-between gap-4 bg-background/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        {ritualActive ? (
          <div className="inline-flex min-h-11 items-center gap-2" aria-label="Опора">
            {brand}
          </div>
        ) : (
          <Link href="/" className="inline-flex min-h-11 items-center gap-2">
            {brand}
          </Link>
        )}
        {isHome && !ritualActive && (
          <nav className="flex items-center gap-2" aria-label="Основная навигация">
            <Link
              href="/notifications/"
              aria-label="Настройки уведомлений"
              className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Bell className="size-4" />
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
