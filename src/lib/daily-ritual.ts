import { loadJson, saveJson } from "./browser-storage";

export type RitualSkillId =
  | "notice-inner-critic"
  | "self-support"
  | "courage-step"
  | "reality-check"
  | "mistakes-without-catastrophe"
  | "inner-support"
  | "what-matters-now"
  | "expectation-reality";

export type RitualStateId =
  | "looping-thoughts"
  | "self-pressure"
  | "strict-voice"
  | "mistake"
  | "hard-to-start"
  | "after-action"
  | "need-support"
  | "hard-to-name";

export interface RitualStateOption {
  id: RitualStateId;
  label: string;
  skillId: RitualSkillId;
}

export interface RitualQuestion {
  id: string;
  label: string;
  guidance: string;
  placeholder: string;
  summaryLabel?: string;
  confirmationLabel?: string;
  options?: Array<{
    id: string;
    label: string;
  }>;
}

export interface RitualSkill {
  id: RitualSkillId;
  name: string;
  whyItWorks: string;
  instruction: string;
  example: string;
  psychologistNote: string;
  possibleEffect: string;
  safetyNote: string;
  duration?: string;
  question: RitualQuestion;
  exploration?: RitualQuestion[];
  application: RitualQuestion;
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
export const ONBOARDING_COMPLETED_KEY = "oporaOnboardingV1Completed";

export const RITUAL_STATES: RitualStateOption[] = [
  {
    id: "looping-thoughts",
    label: "Кажется, что всё пойдёт плохо",
    skillId: "reality-check",
  },
  {
    id: "self-pressure",
    label: "Я давлю на себя",
    skillId: "self-support",
  },
  {
    id: "strict-voice",
    label: "Внутри звучит строгий голос",
    skillId: "notice-inner-critic",
  },
  {
    id: "mistake",
    label: "Что-то не получилось, и я делаю вывод о себе",
    skillId: "mistakes-without-catastrophe",
  },
  {
    id: "hard-to-start",
    label: "Страшно или трудно начать",
    skillId: "courage-step",
  },
  {
    id: "after-action",
    label: "После действия прокручиваю, как всё прошло",
    skillId: "expectation-reality",
  },
  {
    id: "need-support",
    label: "Хочется почувствовать опору",
    skillId: "inner-support",
  },
  {
    id: "hard-to-name",
    label: "Трудно понять, чего мне сейчас хочется",
    skillId: "what-matters-now",
  },
];

export const RITUAL_SKILLS: RitualSkill[] = [
  {
    id: "notice-inner-critic",
    name: "Замечать строгий голос",
    whyItWorks:
      "Когда мысль названа мыслью, между её словами и тобой может появиться небольшая дистанция.",
    instruction:
      "Возьми одну строгую фразу и добавь перед ней: «Я замечаю мысль, что…». Затем выбери одно безопасное действие, пока мысль остаётся рядом.",
    example: "Сначала: «Я замечаю мысль, что…» Затем: «Пока она рядом, я могу…»",
    psychologistNote:
      "Цель не в том, чтобы убрать мысль. Сначала достаточно услышать её точнее. Если тебе подходит, можно заметить, чего этот голос опасается, но ответ находить необязательно.",
    possibleEffect:
      "Фраза может прозвучать чуть менее окончательно. Если ничего не изменится, это тоже допустимо.",
    safetyNote:
      "Выбери не самый тяжёлый момент. Остановись, если становится заметно тяжелее.",
    question: {
      id: "distance",
      label: "Как звучит строгая мысль, если добавить перед ней «Я замечаю мысль, что…»?",
      guidance:
        "Запиши одну короткую фразу так, как она прозвучала внутри. Не нужно объяснять всю ситуацию.",
      placeholder: "Я замечаю мысль, что...",
    },
    application: {
      id: "choiceWithThought",
      label: "Что ты выберешь сделать, пока эта мысль рядом?",
      guidance:
        "Назови один маленький шаг, паузу или обращение за помощью. Не нужно доказывать, что мысль неверна.",
      placeholder: "Пока эта мысль рядом, я могу...",
    },
    support:
      "Строгая мысль может звучать убедительно, но это не значит, что она факт.",
    nextStep:
      "Если эта мысль вернётся, снова добавь перед ней: «Я замечаю мысль, что…».",
  },
  {
    id: "self-support",
    name: "Поддержать себя без давления",
    whyItWorks:
      "Более реалистичное ожидание помогает отделить необходимое действие от требования сделать всё идеально или сразу.",
    instruction:
      "Назови требование, которым давишь на себя, и его достаточную версию на сегодня. Учти свои нынешние силы, время, опыт и обстоятельства.",
    example: "Сначала: «Я требую от себя…» Затем: «Сегодня достаточно…»",
    psychologistNote:
      "«Достаточно» не означает сдаться или отказаться от важного. Это реалистичная граница для сегодняшних сил и обстоятельств.",
    possibleEffect:
      "Может стать понятнее, что действительно нужно сделать, а что добавляет внутреннее давление. Если ничего не изменится, это тоже допустимо.",
    safetyNote:
      "Не нужно пересматривать все свои стандарты. Возьми одно требование, которое звучит прямо сейчас.",
    question: {
      id: "selfPhrase",
      label: "Какое требование к себе звучит сейчас?",
      guidance:
        "Назови одно требование как можно точнее. Не нужно объяснять всю ситуацию или сразу искать решение.",
      placeholder: "Я требую от себя...",
    },
    application: {
      id: "enoughStep",
      label: "Что сегодня будет достаточно вместо этого требования?",
      guidance:
        "Учти нынешние силы, время, опыт и обстоятельства. Назови одну достаточную версию или посильный шаг.",
      placeholder: "Сегодня достаточно...",
    },
    support:
      "Достаточная версия задачи учитывает твои нынешние силы, время, опыт и обстоятельства.",
    nextStep:
      "Когда давление вернётся, сравни требование с тем, что действительно посильно сегодня.",
  },
  {
    id: "courage-step",
    name: "Найти маленький шаг",
    whyItWorks:
      "Маленькое действие возвращает внимание от всей задачи к тому, что действительно зависит от тебя сейчас.",
    instruction:
      "Назови, что трудно начать. Затем выбери безопасное начало не больше двух минут, которое не зависит от реакции другого человека.",
    example: "Сначала: «Мне трудно начать…» Затем: «Первый шаг…»",
    psychologistNote:
      "Необязательно ждать уверенности. Этот шаг — способ получить опыт, а не экзамен на то, достаточно ли ты хорош. Если пугает возможный исход, назови первый шаг заботы о себе на случай, если он произойдёт.",
    possibleEffect:
      "Задача может стать немного конкретнее. Выполнять шаг прямо сейчас необязательно.",
    safetyNote:
      "Не используй эту практику в ситуации реальной угрозы или давления. Сначала нужна безопасность и помощь.",
    question: {
      id: "smallStep",
      label: "Что именно тебе трудно начать?",
      guidance:
        "Назови одну конкретную задачу или действие. Не нужно разбирать всё сразу.",
      placeholder: "Мне трудно начать...",
    },
    application: {
      id: "saferStep",
      label: "Какой безопасный первый шаг займёт не больше двух минут?",
      guidance:
        "Уменьшай задачу, пока не останется одно действие, которое зависит от тебя. Если сейчас не время, можно выбрать момент позже.",
      placeholder: "Первый шаг: ...",
    },
    support:
      "Необязательно ждать полной уверенности. Посильное начало уже может быть достаточным.",
    nextStep:
      "Если шаг остаётся безопасным, выбери для него подходящий момент. После действия, если это тоже безопасно, сделай короткую паузу, прежде чем автоматически отменять его или перепроверять.",
  },
  {
    id: "reality-check",
    name: "Увидеть несколько исходов",
    whyItWorks:
      "Когда пугающий исход перестаёт быть единственным, ситуацию можно увидеть точнее и заранее выбрать свою реакцию.",
    instruction:
      "Назови один конкретный пугающий исход, добавь другие правдоподобные варианты и приблизительно оцени его вероятность. Затем выбери, что сделаешь сначала, если он всё-таки произойдёт.",
    example:
      "Сначала: «Пугающий исход…» Затем: «Другие возможные исходы…» В конце: «Если это произойдёт, сначала я…»",
    psychologistNote:
      "Не нужно убеждать себя, что всё будет хорошо. Другие исходы не обязаны быть позитивными, а оценка вероятности не является точным прогнозом. Реальный риск остаётся реальным.",
    possibleEffect:
      "Может стать заметнее, что пугающий исход возможен, но не предрешён. Если спокойнее не стало, это тоже допустимо.",
    safetyNote:
      "Выбери ближайшую ситуацию, но не самый тяжёлый эпизод. Если есть реальная угроза, сначала позаботься о безопасности и помощи.",
    duration: "Около 3–4 минут",
    question: {
      id: "fearedOutcome",
      label: "Что именно, как тебе кажется, может пойти плохо?",
      guidance:
        "Возьми одну ближайшую ситуацию и один конкретный исход. Не нужно разбирать всю цепочку последствий.",
      placeholder: "Пугающий исход: ...",
      summaryLabel: "Пугающий исход",
      confirmationLabel: "Я назвал исход. Дальше",
    },
    exploration: [
      {
        id: "otherOutcomes",
        label: "Что ещё может произойти?",
        guidance:
          "Назови хотя бы один другой правдоподобный исход. Он не обязан быть хорошим или успокаивающим.",
        placeholder: "Другой возможный исход: ...\nЕщё один: ...",
        summaryLabel: "Другие возможные исходы",
        confirmationLabel: "Я добавил варианты. Дальше",
      },
      {
        id: "fearedOutcomeLikelihood",
        label: "Насколько вероятным сейчас кажется пугающий исход?",
        guidance: "Выбери приблизительную оценку. Это не точный прогноз.",
        placeholder: "",
        summaryLabel: "Приблизительная вероятность",
        confirmationLabel: "Я выбрал оценку. Дальше",
        options: [
          { id: "unlikely", label: "Скорее маловероятно" },
          { id: "possible", label: "Возможно" },
          { id: "likely", label: "Скорее вероятно" },
          { id: "very-likely", label: "Очень вероятно" },
          { id: "unknown", label: "Не могу оценить" },
        ],
      },
    ],
    application: {
      id: "responseIfHappens",
      label: "Если пугающий исход всё-таки произойдёт, что ты сделаешь сначала?",
      guidance:
        "Назови один безопасный шаг, паузу или обращение за помощью, которое зависит от тебя.",
      placeholder: "Если это произойдёт, сначала я...",
      summaryLabel: "Что я сделаю сначала",
    },
    support:
      "Пугающий исход остаётся возможным, но он не единственный. У тебя есть собственный вариант на случай, если он произойдёт.",
    nextStep:
      "Когда один исход снова покажется предрешённым, назови ещё один возможный вариант и вспомни свой первый шаг на случай трудного результата.",
  },
  {
    id: "mistakes-without-catastrophe",
    name: "Разобрать исход без ярлыка",
    whyItWorks:
      "Разделение события, вывода о себе и возможных факторов помогает не сводить один исход к оценке всей личности.",
    instruction:
      "Опиши наблюдаемый факт, заметь вывод о себе и рассмотри другие возможные факторы. Отдельно отметь, что известно, а что остаётся предположением.",
    example:
      "Сначала: «Произошло… / Я сделал вывод…» Затем: «Могло повлиять… / Пока неизвестно…»",
    psychologistNote:
      "Другие возможные причины не должны оправдывать или обвинять тебя. Среди факторов может быть и то, что зависело от тебя, но точная причина иногда остаётся неизвестной.",
    possibleEffect:
      "Может стать понятнее, что известно об исходе, что могло на него повлиять и нужен ли сейчас какой-то шаг.",
    safetyNote:
      "Выбери небольшой недавний эпизод. При реальном вреде, угрозе или давлении сначала важны безопасность и помощь.",
    duration: "Около 3–4 минут",
    question: {
      id: "eventFact",
      label: "Что произошло, если оставить только наблюдаемый факт?",
      guidance:
        "Назови событие или результат без объяснения причин и без оценки своей личности.",
      placeholder: "Произошло: ...",
      summaryLabel: "Что произошло",
      confirmationLabel: "Я описал событие. Дальше",
    },
    exploration: [
      {
        id: "selfConclusion",
        label: "Какой вывод о себе появился после этого?",
        guidance:
          "Запиши его как мысль, а не как установленный факт. Если вывода нет, так и ответь.",
        placeholder: "Я заметил мысль, что я...",
        summaryLabel: "Вывод о себе",
        confirmationLabel: "Я заметил вывод. Дальше",
      },
      {
        id: "otherFactors",
        label: "Что ещё могло повлиять на исход?",
        guidance:
          "Назови возможные обстоятельства или факторы. Не нужно искать оправдание или обязательно исключать свою роль.",
        placeholder: "Могло повлиять: ...",
        summaryLabel: "Что ещё могло повлиять",
        confirmationLabel: "Я рассмотрел факторы. Дальше",
      },
      {
        id: "knownAndUnknown",
        label: "Что из возможных причин известно, а что пока остаётся предположением?",
        guidance:
          "Опирайся только на то, что можно проверить. Точная причина может остаться неизвестной.",
        placeholder: "Известно: ...\nПока неизвестно: ...",
        summaryLabel: "Известно и пока неизвестно",
        confirmationLabel: "Я отделил известное. Дальше",
      },
    ],
    application: {
      id: "nextStepAfterOutcome",
      label: "Какой следующий шаг действительно зависит от тебя?",
      guidance:
        "Это может быть исправление, запрос обратной связи, просьба о помощи или решение остановиться, если действие не требуется.",
      placeholder: "Сейчас я могу... / Сейчас действие не требуется",
      summaryLabel: "Что зависит от меня сейчас",
    },
    support:
      "Один исход может зависеть от нескольких факторов. Даже если часть зависела от тебя, событие не описывает тебя целиком.",
    nextStep:
      "Когда событие снова превратится в вывод о себе, отдели наблюдаемый факт, возможные факторы и то, что пока неизвестно.",
  },
  {
    id: "inner-support",
    name: "Вспомнить, что помогает",
    whyItWorks:
      "Конкретная опора из прошлого опыта помогает заметить доступные действия, людей и условия вместо требования справиться силой воли.",
    instruction:
      "Вспомни один не самый тяжёлый момент. Назови, что тогда помогло, и что из этого доступно сейчас.",
    example: "Сначала: «Тогда помогло…» Затем: «Сейчас я воспользуюсь…»",
    psychologistNote:
      "Опора может быть внутренней или внешней. Люди, лечение, отдых и просьба о помощи тоже считаются.",
    possibleEffect:
      "Может обозначиться одна доступная опора. Если ничего не доступно, результатом может стать понимание, какая помощь нужна.",
    safetyNote:
      "Подойдёт даже маленький пример. Необязательно вспоминать тяжёлый опыт или справляться в одиночку.",
    question: {
      id: "supportNow",
      label: "Что помогало в похожий момент раньше?",
      guidance:
        "Назови конкретное действие, человека, помощь или условие, а не только успешный результат.",
      placeholder: "Тогда помогло...",
    },
    application: {
      id: "useSupport",
      label: "Какой опорой ты воспользуешься в ближайшее время?",
      guidance:
        "Выбери одно действие, человека, условие или обращение за помощью, которое сейчас доступно.",
      placeholder: "В ближайшее время я...",
    },
    support:
      "Просить о помощи и опираться на других людей — тоже способ быть на своей стороне.",
    nextStep:
      "Выбери одну доступную опору на ближайшее время: действие, человека или обращение за помощью.",
  },
  {
    id: "what-matters-now",
    name: "Понять, что сейчас важно",
    whyItWorks:
      "Когда внимание занято требованиями или реакциями других людей, один собственный ориентир помогает вернуть его к тому, что нуждается во внимании сейчас.",
    instruction:
      "Назови одну важную для тебя вещь или потребность. Затем выбери маленькое действие, которое доступно сегодня.",
    example: "Сначала: «Мне важно…» Затем: «Сегодня я могу…»",
    psychologistNote:
      "Не нужно находить главное желание или принимать большое решение. Достаточно одного ориентира, которому ты хотя бы немного веришь.",
    possibleEffect:
      "Может стать немного понятнее, на что опереться сегодня. Если ответ пока не появился, это тоже допустимо.",
    safetyNote:
      "Не принимай здесь больших или необратимых решений. Выбери только маленькое действие, которое можно пересмотреть.",
    question: {
      id: "importantNow",
      label: "Что сейчас для тебя важно?",
      guidance:
        "Назови один ориентир. Если он не находится, вспомни недавний момент, когда было хотя бы немного интересно или живо. Это подсказка, а не готовый ответ.",
      placeholder: "Мне важно...",
    },
    application: {
      id: "makeAvailable",
      label: "Какой маленький шаг может поддержать это сегодня?",
      guidance:
        "Уменьши масштаб, выбери доступное действие или назови нужную помощь. Большое решение не требуется.",
      placeholder: "Сегодня я могу...",
    },
    support:
      "Необязательно понимать всё сразу. Один честный ориентир уже может быть достаточным.",
    nextStep:
      "Выбери для маленького действия удобный момент. Если ничего не доступно, назови помощь, которая нужна.",
  },
  {
    id: "expectation-reality",
    name: "Сравнить ожидание с реальностью",
    whyItWorks:
      "Сопоставление прогноза с наблюдаемым событием помогает опираться на полученный опыт, а не только на ожидание или оценку себя.",
    instruction:
      "Возьми одно недавнее действие. Сравни ожидание с произошедшим, а затем назови один факт или действие для следующего раза.",
    example: "Сначала: «Я ожидал… Произошло…» Затем: «В следующий раз я учту…»",
    psychologistNote:
      "Ожидание могло подтвердиться полностью, частично или не подтвердиться. Цель не доказать страху, что он неправ, а описать опыт точнее.",
    possibleEffect:
      "Может стать яснее, что подтвердилось, а что нет. Если разницы не оказалось, это тоже допустимый результат.",
    safetyNote:
      "Выбери не самый тяжёлый эпизод. Если было реальное давление, угроза или вред, сначала важны безопасность и помощь.",
    question: {
      id: "expectedAndHappened",
      label: "Чего ты ожидал и что произошло на самом деле?",
      guidance:
        "В первой части запиши прогноз до действия. Во второй оставь только то, что можно было увидеть, услышать или проверить.",
      placeholder: "Я ожидал...\nПроизошло...",
    },
    application: {
      id: "useExperience",
      label: "Что ты возьмёшь из этого опыта в следующую похожую ситуацию?",
      guidance:
        "Назови один факт или действие для следующего раза. Один опыт не обязан становиться правилом.",
      placeholder: "В следующий раз я учту...",
    },
    support:
      "Прогноз и то, что произошло на самом деле, можно увидеть рядом, не подгоняя одно под другое.",
    nextStep:
      "В следующей похожей ситуации опирайся на один замеченный факт, не превращая один опыт в правило на всё будущее.",
  },
];

export function getSkillForState(stateId: RitualStateId) {
  const state = RITUAL_STATES.find((candidate) => candidate.id === stateId);
  return RITUAL_SKILLS.find((skill) => skill.id === state?.skillId) ?? RITUAL_SKILLS[0];
}

export function getSkillById(skillId: RitualSkillId) {
  return RITUAL_SKILLS.find((skill) => skill.id === skillId);
}

export function hasCompletedOnboarding() {
  return loadJson<boolean>(ONBOARDING_COMPLETED_KEY, false) === true;
}

export function completeOnboarding() {
  saveJson(ONBOARDING_COMPLETED_KEY, true);
}

export function getLocalDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
