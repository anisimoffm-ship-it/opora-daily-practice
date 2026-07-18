"use client";

import { useEffect, useState } from "react";
import { Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationPermission,
  getNotificationSettings,
  getStylePreviewMessage,
  NOTIFICATION_STYLE_LABELS,
  requestNotificationPermission,
  saveNotificationSettings,
  showPreviewNotification,
  type NotificationSettings,
  type NotificationStyle,
} from "@/lib/notifications";

const STYLES = Object.keys(NOTIFICATION_STYLE_LABELS) as NotificationStyle[];

const PERMISSION_COPY: Record<NotificationPermission | "unsupported", string> = {
  default: "Сейчас выключены. При включении устройство попросит разрешение.",
  denied: "Выключены в настройках устройства.",
  granted: "Разрешены на этом устройстве.",
  unsupported: "На этом устройстве недоступны.",
};

export function NotificationSettingsPageContent() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSettings(getNotificationSettings());
      setPermission(getNotificationPermission());
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const updateSettings = (nextSettings: NotificationSettings) => {
    setSettings(nextSettings);
    saveNotificationSettings(nextSettings);
  };

  const toggleEnabled = async (enabled: boolean) => {
    setNotice("");

    if (!enabled) {
      updateSettings({ ...settings, enabled: false });
      setPermission(getNotificationPermission());
      return;
    }

    const nextPermission = getNotificationPermission() === "granted"
      ? "granted"
      : await requestNotificationPermission();
    setPermission(nextPermission);

    if (nextPermission === "granted") {
      updateSettings({ ...settings, enabled: true });
      setNotice("Напоминания включены.");
      return;
    }

    updateSettings({ ...settings, enabled: false });
    setNotice(nextPermission === "unsupported"
      ? "На этом устройстве уведомления недоступны."
      : "Уведомления остались выключены.");
  };

  const updateTime = (key: "morningTime" | "eveningTime", value: string) => {
    updateSettings({ ...settings, [key]: value });
  };

  const updateStyle = (style: NotificationStyle) => {
    updateSettings({ ...settings, style });
  };

  const sendPreview = async () => {
    setNotice("");
    const nextPermission = getNotificationPermission() === "granted"
      ? "granted"
      : await requestNotificationPermission();
    setPermission(nextPermission);

    if (nextPermission !== "granted") {
      setNotice("Чтобы показать тестовое уведомление, нужно разрешение устройства.");
      return;
    }

    await showPreviewNotification(settings.style);
    setNotice("Тестовое уведомление показано.");
  };

  const activePreview = getStylePreviewMessage(settings.style);

  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-medium tracking-tight">Уведомления</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Напоминания появятся утром и вечером, пока приложение открыто.
        </p>
      </section>

      <Card className="shadow-sm">
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-base font-medium">Напоминания</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {settings.enabled
                  ? "Включены. Работают, пока приложение открыто."
                  : PERMISSION_COPY[permission]}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Включить напоминания"
              aria-checked={settings.enabled}
              onClick={() => void toggleEnabled(!settings.enabled)}
              className="flex h-11 w-14 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${
                  settings.enabled ? "bg-primary" : "bg-input"
                }`}
                aria-hidden="true"
              >
                <span
                  className={`size-6 rounded-full bg-white shadow-sm transition-transform ${
                    settings.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-3">
            <TimeField
              id="morning-time"
              label="Утро"
              value={settings.morningTime}
              disabled={!settings.enabled}
              onChange={(value) => updateTime("morningTime", value)}
            />
            <TimeField
              id="evening-time"
              label="Вечер"
              value={settings.eveningTime}
              disabled={!settings.enabled}
              onChange={(value) => updateTime("eveningTime", value)}
            />
          </div>

        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-medium tracking-tight">Как писать</h2>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Тон уведомлений">
          {STYLES.map((style) => {
            const selected = settings.style === style;
            return (
              <button
                key={style}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => updateStyle(style)}
                className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected ? "ring-primary" : "ring-foreground/10 hover:bg-secondary/60"
                }`}
              >
                {NOTIFICATION_STYLE_LABELS[style]}
              </button>
            );
          })}
        </div>
        <div className="rounded-lg bg-secondary/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Пример</p>
          <p className="mt-2 text-sm font-medium">{activePreview.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{activePreview.body}</p>
        </div>
        <Button type="button" size="lg" className="w-full" onClick={sendPreview}>
          <Send className="size-4" />
          Показать тестовое уведомление
        </Button>
        {notice && (
          <p className="text-sm leading-relaxed text-muted-foreground" role="status" aria-live="polite">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}

function TimeField({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="gap-1.5">
        <Clock className="size-4 text-primary" />
        {label}
      </Label>
      <Input
        id={id}
        type="time"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 bg-background"
      />
    </div>
  );
}
