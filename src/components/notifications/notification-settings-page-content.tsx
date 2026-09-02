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
    let active = true;
    const timeout = window.setTimeout(() => {
      setSettings(getNotificationSettings());
      void getNotificationPermission().then((nextPermission) => {
        if (active) setPermission(nextPermission);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  const updateSettings = (nextSettings: NotificationSettings) => {
    setSettings(nextSettings);
    saveNotificationSettings(nextSettings);
  };

  const toggleEnabled = async (enabled: boolean) => {
    setNotice("");

    if (!enabled) {
      updateSettings({ ...settings, enabled: false });
      setPermission(await getNotificationPermission());
      return;
    }

    const currentPermission = await getNotificationPermission();
    const nextPermission = currentPermission === "granted"
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
    const currentPermission = await getNotificationPermission();
    const nextPermission = currentPermission === "granted"
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
        <h1 className="text-3xl font-medium tracking-tight">Напоминания</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          На iOS и Android напоминания работают по расписанию. В браузере они появляются, пока вкладка открыта.
        </p>
      </section>

      <Card className="shadow-sm">
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-base font-medium">Напоминания</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {settings.enabled
                  ? "Включены на этом устройстве."
                  : PERMISSION_COPY[permission]}
              </p>
            </div>
            <label className="flex min-h-12 min-w-14 shrink-0 cursor-pointer items-center justify-center">
              <span className="sr-only">Включить напоминания</span>
              <input
                type="checkbox"
                role="switch"
                aria-label="Включить напоминания"
                aria-checked={settings.enabled}
                checked={settings.enabled}
                onChange={(event) => void toggleEnabled(event.target.checked)}
                className="toggle toggle-primary toggle-lg focus-visible:ring-3 focus-visible:ring-ring"
              />
            </label>
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

      <fieldset className="fieldset space-y-3">
        <legend className="fieldset-legend text-lg font-medium tracking-tight text-foreground">
          Как писать
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((style) => {
            const selected = settings.style === style;
            return (
              <label
                key={style}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-field border px-3 py-2 text-sm font-medium transition-colors focus-within:ring-3 focus-within:ring-ring ${
                  selected
                    ? "border-primary bg-primary/8"
                    : "border-border bg-background hover:bg-secondary/60"
                }`}
              >
                <input
                  type="radio"
                  name="notification-style"
                  value={style}
                  checked={selected}
                  onChange={() => updateStyle(style)}
                  className="radio radio-primary radio-sm"
                />
                <span>{NOTIFICATION_STYLE_LABELS[style]}</span>
              </label>
            );
          })}
        </div>
        <div
          className="rounded-lg bg-secondary/60 p-4"
          aria-label="Предпросмотр напоминания"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm font-medium">{activePreview.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{activePreview.body}</p>
        </div>
        <Button type="button" variant="secondary" size="lg" className="w-full" onClick={sendPreview}>
          <Send className="size-4" />
          Показать тестовое уведомление
        </Button>
        {notice && (
          <p className="text-sm leading-relaxed text-muted-foreground" role="status" aria-live="polite">
            {notice}
          </p>
        )}
      </fieldset>
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
        className="h-12 bg-background"
      />
    </div>
  );
}
