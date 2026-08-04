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
  question: RitualQuestion;
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

export const RITUAL_STATES: RitualStateOption[] = [
  {
    id: "looping-thoughts",
    label: "Мысли снова и снова возвращаются",
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
    label: "Не отпускает ошибка",
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
      "Строгая мысль может звучать убедительно, но она не обязана быть фактом.",
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
      "Достаточная версия задачи не делает твои усилия менее значимыми. Она помогает учитывать реальные силы и обстоятельства.",
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
        "Назови одну конкретную задачу или действие. Не нужно разбирать всю ситуацию.",
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
      "Если шаг остаётся безопасным, выбери для него подходящий момент. После действия, если это тоже безопасно, сделай короткую паузу перед автоматической отменой или перепроверкой.",
  },
  {
    id: "reality-check",
    name: "Отделить факты от догадок",
    whyItWorks:
      "Разделение наблюдаемого и неизвестного помогает не принимать тревожный сценарий за уже случившийся факт.",
    instruction:
      "Назови один проверяемый факт. Отдельно запиши неизвестное, а затем выбери действие, которое опирается на факт.",
    example: "Сначала: «Факт… Пока неизвестно…» Затем: «Сейчас я могу…»",
    psychologistNote:
      "Не нужно убеждать себя, что всё хорошо. Реальный риск остаётся реальным. Если один исход кажется предрешённым, оставь место и другим возможным исходам, не назначая ни один верным заранее.",
    possibleEffect:
      "Ситуация может стать точнее, даже если спокойнее не стало.",
    safetyNote:
      "Если есть реальная угроза, сначала позаботься о безопасности. Упражнение не заменяет помощь.",
    question: {
      id: "factAndUnknown",
      label: "Что здесь факт, а что пока неизвестно?",
      guidance:
        "Факт можно наблюдать или проверить. Мысли о причинах, будущем и реакции другого человека оставь в части «пока неизвестно».",
      placeholder: "Факт: ...\nПока неизвестно: ...",
    },
    application: {
      id: "actWithUnknown",
      label: "Что можно сделать сейчас, пока остальное неизвестно?",
      guidance:
        "Опирайся на один факт. Выбери действие, паузу или проверку, которая зависит от тебя и не выдаёт догадку за факт.",
      placeholder: "Пока остальное неизвестно, я могу...",
    },
    support:
      "Необязательно приходить к хорошему выводу. Достаточно описать ситуацию точнее.",
    nextStep:
      "Если сценарий вернётся как единственно возможный, назови один факт и ещё один возможный исход. Ни один исход не нужно считать гарантированным.",
  },
  {
    id: "mistakes-without-catastrophe",
    name: "Отделить ошибку от себя",
    whyItWorks:
      "Нейтральное описание сохраняет ответственность, но не превращает один поступок в оценку всей личности.",
    instruction:
      "Опиши событие без «я всегда» и «я никогда». Затем отметь один нужный шаг или честно напиши, что исправлять нечего.",
    example: "Сначала: «Произошло…» Затем: «Ближайший шаг…»",
    psychologistNote:
      "Иногда поступок оказывается неудачным способом справиться с состоянием или добиться желаемого. Понять это не значит отменить последствия: способ можно изменить, не превращая его в глобальный ярлык о себе.",
    possibleEffect:
      "Может стать понятнее, что действительно требует действия, а что добавляет самокритика.",
    safetyNote:
      "Выбери небольшой недавний эпизод. Не придумывай исправление только ради завершения практики.",
    question: {
      id: "eventAndRepair",
      label: "Что произошло, если описать это без оценки себя?",
      guidance:
        "Назови действие и наблюдаемый результат, а не качество своей личности. Решение появится на следующем шаге.",
      placeholder: "Произошло: ...",
    },
    application: {
      id: "repairStep",
      label: "Какой ближайший шаг тебе действительно нужен?",
      guidance:
        "Это может быть исправление, извинение, просьба о помощи или решение остановиться, если исправлять нечего.",
      placeholder: "Ближайший шаг: ... / Сейчас можно остановиться",
    },
    support:
      "Ошибка может требовать исправления, но она не описывает человека целиком.",
    nextStep:
      "Если шаг действительно нужен и зависит от тебя, выбери его минимальную версию. Если нет, можно остановиться.",
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
      "Просить о помощи и опираться на других людей тоже способ быть на своей стороне.",
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
      label: "Что возьмёшь из этого опыта в следующую похожую ситуацию?",
      guidance:
        "Назови один факт или действие для следующего раза. Один опыт не обязан становиться правилом.",
      placeholder: "В следующий раз я учту...",
    },
    support:
      "Теперь рядом есть два описания: прежний прогноз и то, что произошло. Их не нужно подгонять друг под друга.",
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
