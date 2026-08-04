"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { RITUAL_VIEW_CHANGED } from "@/lib/daily-ritual";
import { MOBILE_BACK_BUTTON_EVENT } from "@/lib/mobile-navigation";

export function NativeNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [ritualActive, setRitualActive] = useState(false);

  useEffect(() => {
    const handleRitualViewChange = (event: Event) => {
      setRitualActive(Boolean((event as CustomEvent<boolean>).detail));
    };
    window.addEventListener(RITUAL_VIEW_CHANGED, handleRitualViewChange);
    return () => window.removeEventListener(RITUAL_VIEW_CHANGED, handleRitualViewChange);
  }, []);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    const listener = App.addListener("backButton", ({ canGoBack }) => {
      const internalBack = new Event(MOBILE_BACK_BUTTON_EVENT, { cancelable: true });
      window.dispatchEvent(internalBack);

      if (internalBack.defaultPrevented) return;

      const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
      if (pathname !== "/") {
        if (canGoBack) {
          window.history.back();
        } else {
          router.replace("/");
        }
      }
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [router]);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    const shouldHandleInApp = ritualActive || pathname !== "/";
    void App.toggleBackButtonHandler({ enabled: shouldHandleInApp });
  }, [pathname, ritualActive]);

  return null;
}
