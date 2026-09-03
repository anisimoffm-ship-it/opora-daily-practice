"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NativeNavigation } from "@/components/layout/native-navigation";
import { NotificationScheduler } from "@/components/notifications/notification-scheduler";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  return (
    <div className="app-shell mx-auto flex w-full max-w-lg flex-col">
      <NativeNavigation />
      <NotificationScheduler />
      {!isHome && (
        <header className="mb-8 flex min-h-12 items-center">
          <button
            type="button"
            aria-label="Вернуться на главную"
            className="flex size-12 shrink-0 items-center justify-center rounded-field text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px active:bg-secondary"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="size-6" />
          </button>
        </header>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}
