import { Capacitor, type PermissionState } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { loadJson, saveJson } from "./browser-storage";
import { getRitualCompletions } from "./daily-ritual";

export type NotificationStyle = "calm" | "supportive" | "minimal" | "practical";
export type NotificationSlot = "morning" | "evening";
type NotificationEnergy = "низкая" | "средняя" | "есть силы";

export interface NotificationSettings {
  enabled: boolean;
  morningTime: string;
  eveningTime: string;
  style: NotificationStyle;
}

export interface NotificationMessage {
  id: string;
  style: NotificationStyle;
  slot: NotificationSlot | "any";
  title: string;
  body: string;
  energies?: NotificationEnergy[];
  themes?: string[];
  recency?: "first" | "today" | "recent" | "open";
}

interface NotificationHistoryItem {
  id: string;
  shownAt: string;
  slot: NotificationSlot;
}

interface NotificationContext {
  energy?: NotificationEnergy;
  themes: string[];
  recency: "first" | "today" | "recent" | "open";
}

export const NOTIFICATION_SETTINGS_CHANGED = "notificationSettingsChanged";
export const NOTIFICATION_SETTINGS_KEY = "notificationSettings";
const NOTIFICATION_HISTORY_KEY = "notificationHistory";
const NATIVE_MORNING_NOTIFICATION_ID = 31001;
const NATIVE_EVENING_NOTIFICATION_ID = 31002;
const NATIVE_PREVIEW_NOTIFICATION_ID = 31003;
const NATIVE_IMMEDIATE_MORNING_NOTIFICATION_ID = 31004;
const NATIVE_IMMEDIATE_EVENING_NOTIFICATION_ID = 31005;
const ANDROID_REMINDER_CHANNEL_ID = "opora-reminders";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  morningTime: "09:00",
  eveningTime: "20:30",
  style: "calm",
};

export const NOTIFICATION_STYLE_LABELS: Record<NotificationStyle, string> = {
  calm: "Спокойно",
  supportive: "С теплом",
  minimal: "Коротко",
  practical: "По делу",
};

const CALM_MESSAGES: Omit<NotificationMessage, "id" | "style">[] = [
  { slot: "morning", title: "Мягкое начало", body: "Можно начать с одного спокойного вдоха и выбрать маленькую опору на день.", energies: ["низкая"] },
  { slot: "morning", title: "Небольшой фокус", body: "Сегодня достаточно одного бережного шага в теме, которая сейчас ближе.", recency: "open" },
  { slot: "morning", title: "Опора рядом", body: "Проверь, что телу нужно в первые минуты дня: вода, свет, пауза или тишина.", energies: ["низкая", "средняя"] },
  { slot: "morning", title: "Тихая настройка", body: "Навык дня уже ждет. Даже короткая тренировка может быть достаточной.", recency: "first" },
  { slot: "morning", title: "Спокойный старт", body: "Если внутри шумно, начни с одного выдоха и сегодняшнего навыка.", themes: ["Тревога", "Стресс"] },
  { slot: "morning", title: "Бережное внимание", body: "Тема дня может быть простой: что сейчас поддержит меня на ближайший час?", themes: ["Самосострадание", "Осознанность"] },
  { slot: "morning", title: "Место для себя", body: "Перед делами можно дать себе минуту без оценки и выбрать самый мягкий следующий шаг.", themes: ["Самокритика"] },
  { slot: "morning", title: "Ровный ритм", body: "Выбери один простой шаг и сделай его в своём темпе.", energies: ["средняя"] },
  { slot: "morning", title: "Светлый ориентир", body: "Можно заметить одну ценность, которую хочется взять с собой в день.", themes: ["Ценности"] },
  { slot: "morning", title: "Теплый старт", body: "Найди одну деталь утра, которая ощущается достаточно спокойно.", themes: ["Благодарность", "Осознанность"] },
  { slot: "morning", title: "Простая забота", body: "Если энергии немного, подойдут самые короткие слова поддержки.", energies: ["низкая"] },
  { slot: "morning", title: "Один шаг", body: "Сегодня можно сделать один небольшой шаг без требования к идеальному настроению." },
  { slot: "evening", title: "Мягкий вечер", body: "Проверь вечер без разбора ошибок: что сейчас поможет телу выдохнуть?", energies: ["низкая"] },
  { slot: "evening", title: "Тихое завершение", body: "Можно отметить один момент, который хочется оставить с теплом.", themes: ["Благодарность"] },
  { slot: "evening", title: "Вечерняя опора", body: "Если день был плотным, возьми самое простое действие заботы на ближайшие минуты.", themes: ["Стресс", "Выгорание"] },
  { slot: "evening", title: "Пауза", body: "Сейчас можно ничего не доказывать. Достаточно заметить свое состояние.", themes: ["Самокритика", "Эмоции"] },
  { slot: "evening", title: "Спокойная точка", body: "Назови про себя одну потребность вечера и дай ей маленькое место.", themes: ["Эмоции", "Самосострадание"] },
  { slot: "evening", title: "Нежный финал", body: "Пусть практика будет короткой: один выдох, одно слово о себе, один маленький выбор." },
  { slot: "evening", title: "Без спешки", body: "Можно закрыть день простой фразой: сейчас мне нужно немного бережности.", energies: ["низкая", "средняя"] },
  { slot: "evening", title: "Теплая точка", body: "Вспомни один спокойный или нейтральный момент. Этого достаточно для вечера.", themes: ["Благодарность", "Осознанность"] },
  { slot: "evening", title: "Меньше шума", body: "Если внутри много шума, вернись к одному факту и одному выдоху.", themes: ["Тревога", "Самокритика"] },
  { slot: "evening", title: "На сегодня хватит", body: "Можно уменьшить нагрузку на вечер и оставить место восстановлению.", themes: ["Выгорание"] },
  { slot: "evening", title: "Связь", body: "Если хочется контакта, можно подумать о самом безопасном коротком сообщении.", themes: ["Отношения"] },
  { slot: "evening", title: "Тихая тренировка", body: "Открой навык дня в самом мягком темпе.", recency: "recent" },
  { slot: "evening", title: "Ровное завершение", body: "Положи внимание на дыхание и отметь, что прямо сейчас уже можно отпустить.", energies: ["низкая"] },
];

const SUPPORTIVE_MESSAGES: Omit<NotificationMessage, "id" | "style">[] = [
  { slot: "morning", title: "Мягкое начало", body: "Выбери то, что поддержит тебя сегодня. Маленький шаг тоже имеет вес.", recency: "first" },
  { slot: "morning", title: "Без лишнего давления", body: "Если внутри строгий голос, попробуй ответить себе человеческим тоном.", themes: ["Самокритика", "Самосострадание"] },
  { slot: "morning", title: "Есть место для тебя", body: "Перед задачами можно заметить себя и спросить: что мне поможет держаться ровнее?", themes: ["Осознанность"] },
  { slot: "morning", title: "Небольшая поддержка", body: "Сегодня не нужно становиться другим человеком. Можно потренировать один навык.", themes: ["Самооценка"] },
  { slot: "morning", title: "Короткая практика", body: "Если энергии мало, выбери самую короткую тренировку.", energies: ["низкая"] },
  { slot: "morning", title: "Сначала опора", body: "Пусть день начнется с вопроса: что сделает ближайший шаг добрее к себе?", themes: ["Самосострадание"] },
  { slot: "morning", title: "Можно не спешить", body: "Тревожный сценарий может подождать, пока ты найдешь один факт и один выдох.", themes: ["Тревога"] },
  { slot: "morning", title: "Не всё сразу", body: "Выбери одну небольшую точку внимания и оставь остальное на потом.", themes: ["Стресс", "Выгорание"] },
  { slot: "morning", title: "Достаточно малого", body: "Один ответ, одна фраза, одна минута. Этого хватает, чтобы поддержать навык." },
  { slot: "morning", title: "Твоя сторона", body: "Попробуй сегодня говорить с собой так, будто ты на своей стороне.", themes: ["Самокритика", "Самооценка"] },
  { slot: "morning", title: "Теплая настройка", body: "Найди маленькое действие, которое добавит заботы в первую часть дня.", energies: ["средняя", "есть силы"] },
  { slot: "morning", title: "Живой ориентир", body: "Если есть силы, можно выбрать тему, которая сейчас действительно важна.", energies: ["есть силы"], themes: ["Ценности"] },
  { slot: "evening", title: "Можно выдохнуть", body: "Что сейчас просит немного внимания?", themes: ["Эмоции"] },
  { slot: "evening", title: "Бережный вечер", body: "Пусть это будет не отчет, а короткий способ услышать себя.", recency: "open" },
  { slot: "evening", title: "Время для отдыха", body: "Если усталость заметна, выбери одно действие, которое немного снизит нагрузку.", energies: ["низкая"], themes: ["Выгорание"] },
  { slot: "evening", title: "Мягкий взгляд", body: "Можно отметить то, что было непросто, без обвинений и лишних выводов.", themes: ["Самосострадание", "Эмоции"] },
  { slot: "evening", title: "Поддержка на ночь", body: "Напиши одну фразу, которую было бы приятно услышать от надежного человека.", themes: ["Отношения", "Самосострадание"] },
  { slot: "evening", title: "Рядом с состоянием", body: "Если эмоции смешались, можно начать с тела: где сейчас больше всего ощущений?", themes: ["Эмоции", "Осознанность"] },
  { slot: "evening", title: "Теплая точка дня", body: "Найди один момент, где ты был к себе хотя бы немного внимателен.", themes: ["Благодарность", "Самооценка"] },
  { slot: "evening", title: "Не нужно идеально", body: "Можно ответить одним предложением или одним словом.", energies: ["низкая"] },
  { slot: "evening", title: "Снижение громкости", body: "Если внутренний критик шумит, можно заметить его голос без спора.", themes: ["Самокритика"] },
  { slot: "evening", title: "Место восстановлению", body: "Возьми один способ сделать вечер проще и теплее для себя.", themes: ["Стресс", "Выгорание"] },
  { slot: "evening", title: "Что нужно сейчас?", body: "Что сейчас нужнее: покой, контакт, ясность или поддержка?", themes: ["Эмоции", "Отношения"] },
  { slot: "evening", title: "Спокойное завершение", body: "Оставь себе фразу, которая поможет мягко закрыть этот день." },
  { slot: "evening", title: "Есть на что опереться", body: "Можно выбрать одну маленькую опору и взять ее с собой в вечер.", recency: "recent" },
];

const MINIMAL_MESSAGES: Omit<NotificationMessage, "id" | "style">[] = [
  { slot: "morning", title: "Одна минута", body: "Навык дня готов.", recency: "first" },
  { slot: "morning", title: "Старт", body: "Один выдох. Один следующий шаг.", energies: ["низкая"] },
  { slot: "morning", title: "Фокус", body: "Что поддержит тебя сейчас?", themes: ["Осознанность"] },
  { slot: "morning", title: "Навык дня", body: "Короткая тренировка готова.", recency: "recent" },
  { slot: "morning", title: "Без спешки", body: "Начни с самого простого.", energies: ["низкая", "средняя"] },
  { slot: "morning", title: "Проверка", body: "Факт, пауза, выдох.", themes: ["Тревога"] },
  { slot: "morning", title: "Мягче", body: "Скажи себе одну спокойную фразу.", themes: ["Самокритика", "Самосострадание"] },
  { slot: "morning", title: "Проще", body: "Выбери действие на 10% проще.", themes: ["Выгорание", "Стресс"] },
  { slot: "morning", title: "Ценность", body: "Что важно взять в день?", themes: ["Ценности"] },
  { slot: "morning", title: "Контакт", body: "Кому можно написать одно короткое сообщение?", themes: ["Отношения"] },
  { slot: "morning", title: "Тело", body: "Плечи ниже. Выдох длиннее.", energies: ["низкая"] },
  { slot: "morning", title: "Шаг", body: "Один маленький шаг для себя." },
  { slot: "evening", title: "Короткая пауза", body: "Что сейчас нужно телу?", energies: ["низкая"] },
  { slot: "evening", title: "Финал", body: "Одно слово о состоянии.", themes: ["Эмоции"] },
  { slot: "evening", title: "Пауза", body: "Вспомни нейтральный факт дня.", themes: ["Самокритика", "Тревога"] },
  { slot: "evening", title: "Тише", body: "Можно закончить одним выдохом.", energies: ["низкая"] },
  { slot: "evening", title: "Тепло", body: "Один момент, который хочется сохранить.", themes: ["Благодарность"] },
  { slot: "evening", title: "Забота", body: "Что сделать проще вечером?", themes: ["Стресс", "Выгорание"] },
  { slot: "evening", title: "Опора", body: "Одна фраза поддержки себе.", themes: ["Самосострадание"] },
  { slot: "evening", title: "Ясность", body: "Назови одну потребность.", themes: ["Эмоции"] },
  { slot: "evening", title: "Связь", body: "Кому можно написать коротко?", themes: ["Отношения"] },
  { slot: "evening", title: "Достаточно", body: "Короткий ответ тоже подходит.", energies: ["низкая"] },
  { slot: "evening", title: "Смысл", body: "Что важное для себя ты сделал сегодня?", themes: ["Ценности"] },
  { slot: "evening", title: "Ровно", body: "Отметь состояние без оценки." },
  { slot: "evening", title: "Ночь", body: "Оставь себе спокойную фразу.", recency: "open" },
];

const PRACTICAL_MESSAGES: Omit<NotificationMessage, "id" | "style">[] = [
  { slot: "morning", title: "План на минуту", body: "Открой сегодняшний ритуал и сделай один спокойный шаг.", recency: "first" },
  { slot: "morning", title: "Быстрая настройка", body: "Сегодняшняя тренировка уже готова. Достаточно начать.", energies: ["низкая", "средняя", "есть силы"] },
  { slot: "morning", title: "Один факт", body: "Если тревожно, найди один проверяемый факт и один выдох.", themes: ["Тревога"] },
  { slot: "morning", title: "Меньше нагрузки", body: "Выбери, что сегодня можно сделать на 10% проще.", themes: ["Стресс", "Выгорание"] },
  { slot: "morning", title: "Фраза вместо критики", body: "Заметь строгий голос и ответь себе спокойнее.", themes: ["Самокритика"] },
  { slot: "morning", title: "Следующее действие", body: "Назови один шаг, который займет не больше двух минут.", energies: ["низкая"] },
  { slot: "morning", title: "Короткая практика", body: "Один вопрос поможет выбрать практику на сейчас.", recency: "recent" },
  { slot: "morning", title: "Что нужно сейчас?", body: "Что сейчас нужнее: покой, ясность, контакт или движение?", themes: ["Эмоции", "Отношения"] },
  { slot: "morning", title: "Ценность в действии", body: "Выбери маленькое действие, которое поддержит важное для тебя.", themes: ["Ценности"] },
  { slot: "morning", title: "Точка уверенности", body: "Найди один факт, который подтверждает твою способность справляться.", themes: ["Уверенность", "Самооценка"] },
  { slot: "morning", title: "Короткий старт", body: "Поставь таймер на одну минуту и сделай только первый шаг.", energies: ["низкая"] },
  { slot: "morning", title: "Выбор без шума", body: "Открой список и возьми самую полезную тему на сегодня." },
  { slot: "evening", title: "Вечерний обзор", body: "Заметь одно состояние и одно действие заботы на сейчас.", themes: ["Эмоции"] },
  { slot: "evening", title: "Снять напряжение", body: "Отметь, что можно упростить до конца вечера.", themes: ["Стресс", "Выгорание"] },
  { slot: "evening", title: "Нейтральный взгляд", body: "Вспомни один момент дня без ярлыков и выводов о себе.", themes: ["Самокритика"] },
  { slot: "evening", title: "Факт для тревоги", body: "Если внимание бежит вперед, вернись к тому, что известно точно.", themes: ["Тревога"] },
  { slot: "evening", title: "Перед отдыхом", body: "Выбери одно небольшое дело перед отдыхом.", energies: ["средняя", "есть силы"] },
  { slot: "evening", title: "Минимальная версия", body: "Если энергии мало, ответь одним словом и выбери самый простой способ отдохнуть.", energies: ["низкая"] },
  { slot: "evening", title: "Контакт", body: "Если нужна связь, подготовь короткое сообщение без длинных объяснений.", themes: ["Отношения"] },
  { slot: "evening", title: "Что уже помогало", body: "Вспомни один факт или фразу, которые уже помогали тебе.", themes: ["Уверенность", "Самооценка"] },
  { slot: "evening", title: "Потребность", body: "Назови потребность вечера и возьми действие на пять минут.", themes: ["Эмоции", "Самосострадание"] },
  { slot: "evening", title: "Один итог", body: "Отметь один полезный вывод без оценки всего дня.", recency: "open" },
  { slot: "evening", title: "Тихий порядок", body: "Назови первое, что стоит разгрузить из головы.", themes: ["Стресс"] },
  { slot: "evening", title: "Тренировка на закрытие", body: "Открой ритуал и пройди самую короткую версию." },
  { slot: "evening", title: "Завершение", body: "Сформулируй одну фразу, с которой можно перейти к отдыху.", energies: ["низкая", "средняя"] },
];

export const NOTIFICATION_LIBRARY: NotificationMessage[] = [
  ...withStyle("calm", CALM_MESSAGES),
  ...withStyle("supportive", SUPPORTIVE_MESSAGES),
  ...withStyle("minimal", MINIMAL_MESSAGES),
  ...withStyle("practical", PRACTICAL_MESSAGES),
];

export function getNotificationSettings(): NotificationSettings {
  const stored = loadJson<Partial<NotificationSettings>>(NOTIFICATION_SETTINGS_KEY, {});
  return normalizeSettings(stored);
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  saveJson(NOTIFICATION_SETTINGS_KEY, normalizeSettings(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATION_SETTINGS_CHANGED));
  }
}

export function usesNativeNotifications(): boolean {
  return Capacitor.isNativePlatform();
}

export async function getNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (usesNativeNotifications()) {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      return mapNativePermission(display);
    } catch {
      return "unsupported";
    }
  }

  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (usesNativeNotifications()) {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      return mapNativePermission(display);
    } catch {
      return "unsupported";
    }
  }

  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}

export function selectNotificationMessage(
  style: NotificationStyle,
  slot: NotificationSlot,
  now = new Date(),
  random = Math.random,
): NotificationMessage {
  const context = getNotificationContext(now);
  const history = getNotificationHistory();
  const recentIds = new Set(history.slice(0, 24).map((item) => item.id));
  const styled = NOTIFICATION_LIBRARY.filter((message) => message.style === style);
  const fresh = styled.filter((message) => !recentIds.has(message.id));
  const candidates = fresh.length ? fresh : styled;
  const slotCandidates = candidates.filter((message) => message.slot === slot || message.slot === "any");
  const pool = slotCandidates.length ? slotCandidates : candidates;

  return pickWeightedMessage(pool, slot, context, random) ?? styled[0];
}

export function getStylePreviewMessage(style: NotificationStyle): NotificationMessage {
  return NOTIFICATION_LIBRARY.find((message) => message.style === style && message.slot === "morning")
    ?? NOTIFICATION_LIBRARY.find((message) => message.style === style)
    ?? NOTIFICATION_LIBRARY[0];
}

export async function showConfiguredNotification(slot: NotificationSlot): Promise<boolean> {
  const settings = getNotificationSettings();
  if (!settings.enabled || await getNotificationPermission() !== "granted") return false;

  const message = selectNotificationMessage(settings.style, slot);
  if (usesNativeNotifications()) {
    await ensureAndroidReminderChannel();
    await LocalNotifications.schedule({
      notifications: [{
        id: slot === "morning"
          ? NATIVE_IMMEDIATE_MORNING_NOTIFICATION_ID
          : NATIVE_IMMEDIATE_EVENING_NOTIFICATION_ID,
        title: message.title,
        body: message.body,
        largeBody: message.body,
        channelId: ANDROID_REMINDER_CHANNEL_ID,
        schedule: { at: new Date(Date.now() + 500) },
        extra: { url: "/", slot },
        autoCancel: true,
      }],
    });
    rememberNotification(message.id, slot);
    return true;
  }

  const options: NotificationOptions = {
    body: message.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `opora-${slot}`,
    data: { url: "/" },
  };

  if ("serviceWorker" in navigator) {
    try {
      const registration = await registerNotificationServiceWorker();
      await registration.showNotification(message.title, options);
      rememberNotification(message.id, slot);
      return true;
    } catch {
      // Fall back to the page Notification API below.
    }
  }

  new Notification(message.title, options);
  rememberNotification(message.id, slot);
  return true;
}

export async function showPreviewNotification(style: NotificationStyle): Promise<boolean> {
  const permission = await getNotificationPermission();
  if (permission !== "granted") return false;
  const slot = getCurrentNotificationSlot();
  const message = selectNotificationMessage(style, slot);

  if (usesNativeNotifications()) {
    await ensureAndroidReminderChannel();
    await LocalNotifications.schedule({
      notifications: [{
        id: NATIVE_PREVIEW_NOTIFICATION_ID,
        title: message.title,
        body: message.body,
        largeBody: message.body,
        channelId: ANDROID_REMINDER_CHANNEL_ID,
        schedule: { at: new Date(Date.now() + 500) },
        extra: { url: "/notifications/", slot },
        autoCancel: true,
      }],
    });
    rememberNotification(message.id, slot);
    return true;
  }

  const options: NotificationOptions = {
    body: message.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "opora-preview",
    data: { url: "/notifications/" },
  };

  if ("serviceWorker" in navigator) {
    const registration = await registerNotificationServiceWorker();
    await registration.showNotification(message.title, options);
    rememberNotification(message.id, slot);
    return true;
  }

  new Notification(message.title, options);
  rememberNotification(message.id, slot);
  return true;
}

export async function syncNativeNotificationSchedule(
  settings = getNotificationSettings(),
): Promise<void> {
  if (!usesNativeNotifications()) return;

  await LocalNotifications.cancel({
    notifications: [
      { id: NATIVE_MORNING_NOTIFICATION_ID },
      { id: NATIVE_EVENING_NOTIFICATION_ID },
    ],
  });

  if (!settings.enabled || await getNotificationPermission() !== "granted") return;

  await ensureAndroidReminderChannel();

  const morningMessage = selectNotificationMessage(settings.style, "morning");
  const eveningMessage = selectNotificationMessage(settings.style, "evening");
  const [morningHour, morningMinute] = parseTime(settings.morningTime);
  const [eveningHour, eveningMinute] = parseTime(settings.eveningTime);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: NATIVE_MORNING_NOTIFICATION_ID,
        title: morningMessage.title,
        body: morningMessage.body,
        largeBody: morningMessage.body,
        channelId: ANDROID_REMINDER_CHANNEL_ID,
        schedule: { on: { hour: morningHour, minute: morningMinute } },
        extra: { url: "/", slot: "morning" },
        autoCancel: true,
      },
      {
        id: NATIVE_EVENING_NOTIFICATION_ID,
        title: eveningMessage.title,
        body: eveningMessage.body,
        largeBody: eveningMessage.body,
        channelId: ANDROID_REMINDER_CHANNEL_ID,
        schedule: { on: { hour: eveningHour, minute: eveningMinute } },
        extra: { url: "/", slot: "evening" },
        autoCancel: true,
      },
    ],
  });
}

export function getNextNotificationDelay(time: string, now = new Date()): number {
  const [hours, minutes] = parseTime(time);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

export function isValidNotificationTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value) && value >= "00:00" && value <= "23:59";
}

export function notificationLibrarySize(): number {
  return NOTIFICATION_LIBRARY.length;
}

async function ensureAndroidReminderChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== "android") return;

  try {
    await LocalNotifications.createChannel({
      id: ANDROID_REMINDER_CHANNEL_ID,
      name: "Напоминания",
      description: "Короткие утренние и вечерние напоминания",
      importance: 3,
      visibility: 0,
      vibration: false,
      lights: false,
    });
  } catch {
    // Android below API 26 does not use notification channels.
  }
}

async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  return registration;
}

function normalizeSettings(settings: Partial<NotificationSettings>): NotificationSettings {
  const style = isNotificationStyle(settings.style) ? settings.style : DEFAULT_NOTIFICATION_SETTINGS.style;
  return {
    enabled: typeof settings.enabled === "boolean" ? settings.enabled : DEFAULT_NOTIFICATION_SETTINGS.enabled,
    morningTime: isValidNotificationTime(settings.morningTime ?? "")
      ? settings.morningTime as string
      : DEFAULT_NOTIFICATION_SETTINGS.morningTime,
    eveningTime: isValidNotificationTime(settings.eveningTime ?? "")
      ? settings.eveningTime as string
      : DEFAULT_NOTIFICATION_SETTINGS.eveningTime,
    style,
  };
}

function isNotificationStyle(value: unknown): value is NotificationStyle {
  return value === "calm" || value === "supportive" || value === "minimal" || value === "practical";
}

function withStyle(
  style: NotificationStyle,
  messages: Omit<NotificationMessage, "id" | "style">[],
): NotificationMessage[] {
  return messages.map((message, index) => ({
    ...message,
    style,
    id: `${style}-${String(index + 1).padStart(2, "0")}`,
  }));
}

function getNotificationContext(now: Date): NotificationContext {
  const completions = getRitualCompletions();
  const latestDate = completions
    .map((completion) => Date.parse(completion.completedAt))
    .filter((time) => Number.isFinite(time))
    .sort((a, b) => b - a)[0];
  const daysSinceLastUse = typeof latestDate === "number"
    ? Math.floor((startOfDay(now).getTime() - startOfDay(new Date(latestDate)).getTime()) / 86400000)
    : undefined;

  return {
    themes: [],
    recency: daysSinceLastUse === undefined
      ? "first"
      : daysSinceLastUse <= 0
        ? "today"
        : daysSinceLastUse <= 3
          ? "recent"
          : "open",
  };
}

function scoreMessage(message: NotificationMessage, slot: NotificationSlot, context: NotificationContext): number {
  let score = message.slot === slot ? 8 : 1;
  if (message.energies?.includes(context.energy ?? "средняя")) score += 4;
  if (message.themes?.some((theme) => context.themes.includes(theme))) score += 4;
  if (message.recency === context.recency) score += 3;
  return score;
}

function pickWeightedMessage(
  messages: NotificationMessage[],
  slot: NotificationSlot,
  context: NotificationContext,
  random: () => number,
): NotificationMessage | undefined {
  const weighted = messages.map((message) => ({
    message,
    weight: Math.max(1, scoreMessage(message, slot, context)) ** 2,
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return messages[0];

  let threshold = clampRandom(random()) * totalWeight;
  for (const item of weighted) {
    threshold -= item.weight;
    if (threshold <= 0) return item.message;
  }

  return weighted.at(-1)?.message;
}

function clampRandom(value: number): number {
  return Number.isFinite(value) && value >= 0 && value < 1 ? value : Math.random();
}

function getNotificationHistory(): NotificationHistoryItem[] {
  const history = loadJson<NotificationHistoryItem[]>(NOTIFICATION_HISTORY_KEY, []);
  if (!Array.isArray(history)) return [];
  return history.filter((item) => item && typeof item.id === "string" && typeof item.shownAt === "string").slice(0, 60);
}

function rememberNotification(id: string, slot: NotificationSlot): void {
  saveJson<NotificationHistoryItem[]>(NOTIFICATION_HISTORY_KEY, [
    { id, shownAt: new Date().toISOString(), slot },
    ...getNotificationHistory().filter((item) => item.id !== id),
  ].slice(0, 60));
}

function parseTime(value: string): [number, number] {
  if (!isValidNotificationTime(value)) return [9, 0];
  const [hours, minutes] = value.split(":").map(Number);
  return [hours, minutes];
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getCurrentNotificationSlot(now = new Date()): NotificationSlot {
  return now.getHours() < 15 ? "morning" : "evening";
}

function mapNativePermission(permission: PermissionState): NotificationPermission {
  if (permission === "granted") return "granted";
  if (permission === "denied") return "denied";
  return "default";
}
