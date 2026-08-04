"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  getNextNotificationDelay,
  getNotificationPermission,
  getNotificationSettings,
  NOTIFICATION_SETTINGS_CHANGED,
  showConfiguredNotification,
  syncNativeNotificationSchedule,
  type NotificationSlot,
  usesNativeNotifications,
} from "@/lib/notifications";
import { RITUAL_STORAGE_CHANGED } from "@/lib/daily-ritual";

export function NotificationScheduler() {
  const router = useRouter();

  useEffect(() => {
    const timeouts: number[] = [];
    const nativeNotifications = usesNativeNotifications();

    const clearScheduled = () => {
      while (timeouts.length) {
        window.clearTimeout(timeouts.pop());
      }
    };

    const schedule = async () => {
      clearScheduled();
      const settings = getNotificationSettings();
      if (nativeNotifications) {
        await syncNativeNotificationSchedule(settings);
        return;
      }

      const permission = await getNotificationPermission();
      if (!settings.enabled || permission === "denied" || permission === "unsupported") return;

      scheduleSlot("morning", settings.morningTime);
      scheduleSlot("evening", settings.eveningTime);
    };

    const scheduleSlot = (slot: NotificationSlot, time: string) => {
      const delay = getNextNotificationDelay(time);
      const timeout = window.setTimeout(() => {
        void showConfiguredNotification(slot).finally(() => void schedule());
      }, delay);
      timeouts.push(timeout);
    };

    const handleScheduleChange = () => {
      void schedule();
    };

    const actionListener = nativeNotifications
      ? LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
        const target = typeof notification.extra?.url === "string"
          ? notification.extra.url
          : "/";
        if (target.startsWith("/") && !target.startsWith("//")) {
          router.push(target);
        }
      })
      : undefined;

    void schedule();
    window.addEventListener("storage", handleScheduleChange);
    window.addEventListener(NOTIFICATION_SETTINGS_CHANGED, handleScheduleChange);
    window.addEventListener(RITUAL_STORAGE_CHANGED, handleScheduleChange);

    return () => {
      clearScheduled();
      window.removeEventListener("storage", handleScheduleChange);
      window.removeEventListener(NOTIFICATION_SETTINGS_CHANGED, handleScheduleChange);
      window.removeEventListener(RITUAL_STORAGE_CHANGED, handleScheduleChange);
      if (actionListener) {
        void actionListener.then((handle) => handle.remove());
      }
    };
  }, [router]);

  return null;
}
