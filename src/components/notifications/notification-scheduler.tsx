"use client";

import { useEffect } from "react";
import {
  getNextNotificationDelay,
  getNotificationPermission,
  getNotificationSettings,
  NOTIFICATION_SETTINGS_CHANGED,
  showConfiguredNotification,
  type NotificationSlot,
} from "@/lib/notifications";
import { RITUAL_STORAGE_CHANGED } from "@/lib/daily-ritual";

export function NotificationScheduler() {
  useEffect(() => {
    const timeouts: number[] = [];

    const clearScheduled = () => {
      while (timeouts.length) {
        window.clearTimeout(timeouts.pop());
      }
    };

    const schedule = () => {
      clearScheduled();
      const settings = getNotificationSettings();
      const permission = getNotificationPermission();
      if (!settings.enabled || permission === "denied" || permission === "unsupported") return;

      scheduleSlot("morning", settings.morningTime);
      scheduleSlot("evening", settings.eveningTime);
    };

    const scheduleSlot = (slot: NotificationSlot, time: string) => {
      const delay = getNextNotificationDelay(time);
      const timeout = window.setTimeout(() => {
        void showConfiguredNotification(slot).finally(schedule);
      }, delay);
      timeouts.push(timeout);
    };

    schedule();
    window.addEventListener("storage", schedule);
    window.addEventListener(NOTIFICATION_SETTINGS_CHANGED, schedule);
    window.addEventListener(RITUAL_STORAGE_CHANGED, schedule);

    return () => {
      clearScheduled();
      window.removeEventListener("storage", schedule);
      window.removeEventListener(NOTIFICATION_SETTINGS_CHANGED, schedule);
      window.removeEventListener(RITUAL_STORAGE_CHANGED, schedule);
    };
  }, []);

  return null;
}
