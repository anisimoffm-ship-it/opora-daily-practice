import { loadJson, saveJson } from "./browser-storage";

export type RitualSkillId =
  | "notice-inner-critic"
  | "self-support"
  | "courage-step"
  | "reality-check"
  | "mistakes-without-catastrophe"
  | "inner-support";

export interface RitualQuestion {
  id: string;
  label: string;
  guidance: string;
  placeholder: string;
}

export interface RitualSkill {
  id: RitualSkillId;
  name: string;
  recallPrompt: string;
  recommendations: string[];
  questions: RitualQuestion[];
  support: string;
  nextStep: string;
}

export interface RitualCompletion {
  date: string;
  skillId: RitualSkillId;
  completedAt: string;
}

export const RITUAL_STORAGE_CHANGED = "dailyRitualStorageChanged";
export const RITUAL_VIEW_CHANGED = "dailyRitualViewChanged";
export const RITUAL_COMPLETIONS_KEY = "oporaDailyRitualCompletions";

export const RITUAL_SKILLS: RitualSkill[] = [
  {
    id: "notice-inner-critic",
    name: "Замечать строгий голос",
    recallPrompt: "Вспомни недавний момент, когда ты мысленно критиковал себя.",
    recommendations: [
      "Выбери эпизод, который сейчас не слишком тяжело вспоминать.",
      "Запиши одну фразу так, как она прозвучала внутри.",
      "Не спорь с мыслью и не заставляй себя думать наоборот.",
    ],
    questions: [
      {
        id: "criticPhrase",
        label: "Что именно ты сказал себе? Назови одну короткую фразу.",
        guidance: "Вспомни точные слова, которые прозвучали в голове. Не объясняй ситуацию и не оценивай себя — достаточно одной фразы.",
        placeholder: "У меня опять ничего не получилось",
      },
      {
        id: "distance",
        label: "Добавь перед ней: «Я замечаю мысль, что…» Как теперь звучит фраза?",
        guidance: "Возьми предыдущую фразу без изменений и поставь перед ней слова «Я замечаю мысль, что…».",
        placeholder: "Я замечаю мысль, что у меня ничего не получается",
      },
    ],
    support: "Строгая мысль может звучать убедительно, но она не обязана быть фактом.",
    nextStep: "Если эта мысль вернётся, снова добавь перед ней: «Я замечаю мысль, что…».",
  },
  {
    id: "self-support",
    name: "Поддержать себя",
    recallPrompt: "Вспомни недавний момент, когда тебе было трудно и ты начал давить на себя.",
    recommendations: [
      "Не ищи идеальные или слишком добрые слова.",
      "Достаточно фразы, которой ты хотя бы немного веришь.",
      "Если фраза звучит неискренне или делает хуже, не используй её.",
    ],
    questions: [
      {
        id: "kindWords",
        label: "Что в тот момент было для тебя самым трудным?",
        guidance: "Назови чувство, нагрузку или обстоятельство, которое сделало момент трудным. Не нужно пересказывать всю ситуацию.",
        placeholder: "Я устал и боялся не справиться",
      },
      {
        id: "selfPhrase",
        label: "Что можно сказать себе без критики и давления?",
        guidance: "Представь, что это произошло с близким человеком. Выбери одну реалистичную фразу без приказов «соберись» и «ты должен».",
        placeholder: "Мне сейчас трудно. Я могу сделать паузу",
      },
    ],
    support: "Поддержка не обязана сразу успокаивать. Иногда достаточно признать: «Мне сейчас трудно».",
    nextStep: "Если твоя фраза подходит, прочитай её один раз в спокойном темпе.",
  },
  {
    id: "courage-step",
    name: "Маленький шаг при волнении",
    recallPrompt: "Вспомни небольшое безопасное дело или разговор, который ты откладываешь из-за волнения.",
    recommendations: [
      "Не бери ситуацию, где есть реальная угроза или давление.",
      "Шаг должен зависеть от тебя и занимать не больше двух минут.",
      "Если напряжение слишком сильное, уменьши шаг или отложи его.",
    ],
    questions: [
      {
        id: "important",
        label: "Что ты хочешь сделать — и почему это важно для тебя?",
        guidance: "Сначала назови конкретное действие. Затем закончи фразу: «Это важно для меня, потому что…».",
        placeholder: "Я хочу поговорить, потому что мне важна ясность",
      },
      {
        id: "smallStep",
        label: "Какой первый шаг займёт не больше двух минут и зависит от тебя?",
        guidance: "Уменьшай задачу, пока не останется одно действие, которое можно начать сразу и завершить за две минуты без участия другого человека.",
        placeholder: "Открыть чат и написать первое предложение",
      },
    ],
    support: "Необязательно ждать полной уверенности. Шаг можно уменьшать, пока он не станет посильным.",
    nextStep: "Если шаг остаётся безопасным и посильным, сделай его сейчас или выбери подходящее время.",
  },
  {
    id: "reality-check",
    name: "Отделить факты от догадок",
    recallPrompt: "Вспомни неоднозначную ситуацию, о которой ты тревожишься или которую снова прокручиваешь в голове.",
    recommendations: [
      "Факт — это то, что можно наблюдать или проверить.",
      "Не нужно убеждать себя, что всё хорошо: цель — описать ситуацию точнее.",
      "Если есть реальный риск, сначала позаботься о безопасности.",
    ],
    questions: [
      {
        id: "knownFact",
        label: "Что произошло на самом деле? Запиши только то, что можно проверить.",
        guidance: "Представь, что ситуацию описывает камера или протокол. Оставь только наблюдаемые действия, слова, даты и сообщения.",
        placeholder: "Ответа на сообщение пока нет",
      },
      {
        id: "unknown",
        label: "Что ты предполагаешь или пока не можешь проверить?",
        guidance: "Отдельно назови выводы о причинах, будущем или мыслях другого человека. Начни с «Я предполагаю, что…» или «Я пока не знаю…».",
        placeholder: "Возможно, человек сердится на меня",
      },
      {
        id: "balancedView",
        label: "Собери одну точную фразу: что известно и что пока неизвестно.",
        guidance: "Возьми факт из первого ответа и добавь неизвестное из второго: «[Факт], но я пока не знаю [причину или что будет дальше]».",
        placeholder: "Ответа пока нет, и я не знаю почему",
      },
    ],
    support: "Необязательно приходить к хорошему или спокойному выводу. Достаточно сформулировать его точнее.",
    nextStep: "Если тревожный сценарий вернётся, назови один факт и один вопрос, на который пока нет ответа.",
  },
  {
    id: "mistakes-without-catastrophe",
    name: "Отделить ошибку от себя",
    recallPrompt: "Вспомни недавнюю небольшую ошибку, после которой ты продолжаешь себя ругать.",
    recommendations: [
      "Опиши один эпизод, а не всю историю.",
      "Нейтральное описание не отменяет последствий и ответственности.",
      "Если исправлять нечего, не придумывай действие ради завершения упражнения.",
    ],
    questions: [
      {
        id: "neutralFact",
        label: "Что произошло? Опиши событие без «я всегда», «я никогда» и оценок себя.",
        guidance: "Назови только своё действие и его результат: «Я сделал или не сделал… В результате…». Не добавляй выводов о своём характере.",
        placeholder: "В отправленном письме осталась ошибка",
      },
      {
        id: "repair",
        label: "Нужно ли что-то исправить? Если да, назови один шаг.",
        guidance: "Спроси себя, можно ли уменьшить последствия конкретным действием. Если да — назови ближайший шаг. Если нет — так и напиши.",
        placeholder: "Отправить исправление / Исправлять ничего не нужно",
      },
    ],
    support: "Ошибка может требовать исправления, но она не описывает человека целиком.",
    nextStep: "Если шаг действительно нужен и зависит от тебя, выбери его минимальную версию. Если нет — можно остановиться.",
  },
  {
    id: "inner-support",
    name: "Вспомнить, что помогает",
    recallPrompt: "Вспомни трудный момент, через который тебе уже удалось пройти — необязательно легко или в одиночку.",
    recommendations: [
      "Подойдёт даже маленький пример.",
      "Учитывай людей, лечение, условия, отдых и свои действия.",
      "Если сейчас ничего не доступно, назови помощь, которая нужна.",
    ],
    questions: [
      {
        id: "pastStrength",
        label: "Что тогда помогло хотя бы немного?",
        guidance: "Перечисли 1–3 конкретные опоры: действие, человека, подходящие условия, лечение или отдых. Необязательно справляться только своими силами.",
        placeholder: "Разговор с другом, прогулка или план действий",
      },
      {
        id: "supportNow",
        label: "Что из этого реально доступно сейчас? Если ничего — какая помощь нужна?",
        guidance: "Сверь каждую опору с сегодняшней ситуацией. Выбери то, что можно сделать или получить в ближайшее время; иначе назови, к кому обратиться.",
        placeholder: "Сейчас мне доступно… / Мне нужна помощь с…",
      },
    ],
    support: "Опора может быть внутренней или внешней. Просить о помощи — тоже способ справляться.",
    nextStep: "Выбери одну доступную опору на ближайшее время: действие, человека или обращение за помощью.",
  },
];

const WEEKLY_SKILLS: RitualSkillId[] = [
  "self-support",
  "mistakes-without-catastrophe",
  "reality-check",
  "notice-inner-critic",
  "courage-step",
  "inner-support",
  "self-support",
];

export function getTodaySkill(date = new Date()) {
  const day = date.getDay();
  const weekIndex = day === 0 ? 6 : day - 1;
  return RITUAL_SKILLS.find((skill) => skill.id === WEEKLY_SKILLS[weekIndex]) ?? RITUAL_SKILLS[0];
}

export function getLocalDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekDays(date = new Date()) {
  const currentDay = date.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

export function getRitualCompletions() {
  const stored = loadJson<unknown>(RITUAL_COMPLETIONS_KEY, []);
  if (!Array.isArray(stored)) return [];

  return stored.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const completion = item as Partial<RitualCompletion>;
    const skill = RITUAL_SKILLS.find((candidate) => candidate.id === completion.skillId);
    if (!skill || typeof completion.date !== "string" || typeof completion.completedAt !== "string") {
      return [];
    }
    return [{ date: completion.date, skillId: skill.id, completedAt: completion.completedAt }];
  });
}

export function completeTodayRitual(skillId: RitualSkillId, date = new Date()) {
  const dateKey = getLocalDateKey(date);
  const nextCompletion: RitualCompletion = {
    date: dateKey,
    skillId,
    completedAt: date.toISOString(),
  };
  const completions = getRitualCompletions().filter((completion) => completion.date !== dateKey);
  saveJson(RITUAL_COMPLETIONS_KEY, [nextCompletion, ...completions]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RITUAL_STORAGE_CHANGED));
  }
  return nextCompletion;
}

export function isCompletedToday(completions: RitualCompletion[], date = new Date()) {
  const today = getLocalDateKey(date);
  return completions.some((completion) => completion.date === today);
}
