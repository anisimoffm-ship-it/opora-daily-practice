import type { LibraryCategory, LibraryExercise } from "./types";

export type CheckInStateId =
  | "anxiety"
  | "self_criticism"
  | "stress"
  | "tiredness"
  | "sadness"
  | "anger"
  | "burnout"
  | "loneliness"
  | "unclear"
  | "okay";

export interface StateSupportCard {
  id: CheckInStateId;
  title: string;
  whatHappens: string;
  support: string;
  exercise: string;
  nextStep: string;
}

export type ApothecaryStateId =
  | "anxiety"
  | "panic"
  | "self_criticism"
  | "shame"
  | "loneliness"
  | "burnout"
  | "sadness"
  | "fear"
  | "anger"
  | "overload";

export interface ApothecaryCard {
  id: ApothecaryStateId;
  title: string;
  whatHappens: string;
  support: string;
  exercise: string;
  nextStep: string;
}

export interface DailyMicroCard {
  id: string;
  category: DailyCardCategory;
  choiceTitle: string;
  skillName: string;
  leafLabel: string;
  title: string;
  type: ExerciseType;
  whenHelps: string;
  whyUseful: string;
  support: string;
  prompt: string;
  exercise: string;
  example: string;
  hint: string;
  fields?: ExerciseField[];
  choices?: ExerciseChoice[];
  completionMessage: string;
  reflectionQuestion: string;
  nextStep: string;
  nextSmallStep: string;
  saveToEvidenceBank: boolean;
  difficulty: "легко" | "средне";
  duration: "30 сек" | "1 мин" | "2 мин" | "3 мин";
  energy: "низкая" | "средняя" | "есть силы";
}

export type DailyCardCategory =
  | "Тревога"
  | "Самокритика"
  | "Стресс"
  | "Выгорание"
  | "Эмоции"
  | "Самооценка"
  | "Осознанность"
  | "Благодарность"
  | "Отношения"
  | "Ценности"
  | "Уверенность"
  | "Самосострадание";

export type ExerciseType = "reflection" | "choice" | "breathing" | "grounding" | "evidence";

export interface ExerciseField {
  id: string;
  label: string;
  placeholder?: string;
}

export interface ExerciseChoice {
  id: string;
  label: string;
}

export interface ResilienceDay {
  day: number;
  theme: string;
  title: string;
  practice: string;
  question: string;
  nextStep: string;
}

export const CHECK_IN_STATES: StateSupportCard[] = [
  {
    id: "anxiety",
    title: "Тревога",
    whatHappens: "Организм включает сигнал осторожности и пытается заранее просчитать опасность.",
    support: "Это тревога говорит со мной. Я могу вернуться к тому, что происходит прямо сейчас.",
    exercise: "Найди вокруг 3 предмета одного цвета и медленно назови их про себя.",
    nextStep: "Сделай один длинный выдох и отложи следующее решение на 2 минуты.",
  },
  {
    id: "self_criticism",
    title: "Самокритика",
    whatHappens: "Внутренний критик пытается защитить от ошибки, но делает это жестким голосом.",
    support: "Слова критика не определяют мою ценность.",
    exercise: "Скажи себе: «Я замечаю мысль, что я недостаточно хорош».",
    nextStep: "Ответь себе так, как ответил бы близкому человеку.",
  },
  {
    id: "stress",
    title: "Стресс",
    whatHappens: "Система нагрузки активна: внимания мало, задач кажется слишком много.",
    support: "Мне не нужно решать всё сразу. Сейчас достаточно одного следующего шага.",
    exercise: "Положи ладонь на грудь или живот и почувствуй 3 спокойных выдоха.",
    nextStep: "Выбери самую маленькую задачу на ближайшие 5 минут.",
  },
  {
    id: "tiredness",
    title: "Усталость",
    whatHappens: "Тело сообщает, что ресурс снижен и ему нужна бережность.",
    support: "Усталость не слабость. Это сигнал позаботиться о себе.",
    exercise: "Расслабь плечи, челюсть и кисти на 10 секунд.",
    nextStep: "Убери один необязательный пункт из сегодняшнего вечера.",
  },
  {
    id: "sadness",
    title: "Грусть",
    whatHappens: "Психика замедляется, чтобы прожить потерю, разочарование или нехватку тепла.",
    support: "Мне грустно, и я могу быть к себе мягче в этот момент.",
    exercise: "Назови одну вещь, которой сейчас не хватает.",
    nextStep: "Сделай маленькое действие заботы: вода, плед, сообщение, душ.",
  },
  {
    id: "anger",
    title: "Злость",
    whatHappens: "Злость часто появляется там, где нарушены границы или важная потребность.",
    support: "Злость может быть сигналом о важном. Я могу слушать ее без резких действий.",
    exercise: "Сожми и разожми ладони 5 раз, замечая силу в руках.",
    nextStep: "Запиши одну фразу: «Мне важно...»",
  },
  {
    id: "burnout",
    title: "Выгорание",
    whatHappens: "Длительная нагрузка забрала чувство смысла, энергии и выбора.",
    support: "Со мной не что-то не так. Мне долго было слишком много.",
    exercise: "Спроси себя: «Что сегодня можно сделать на 10% проще?»",
    nextStep: "Сними одну лишнюю обязанность или уменьши ее объем.",
  },
  {
    id: "loneliness",
    title: "Одиночество",
    whatHappens: "Потребность в контакте стала заметной, даже если рядом есть люди.",
    support: "Одиночество говорит о важности связи, а не о моей ненужности.",
    exercise: "Вспомни одного человека, рядом с которым тебе бывает немного спокойнее.",
    nextStep: "Отправь короткое сообщение без необходимости объяснять всё.",
  },
  {
    id: "unclear",
    title: "Не понимаю что чувствую",
    whatHappens: "Эмоции могут смешиваться, особенно после нагрузки или долгого напряжения.",
    support: "Мне не нужно сразу точно понимать себя. Можно начать с телесного сигнала.",
    exercise: "Выбери: в теле больше напряжение, пустота, тяжесть или тепло?",
    nextStep: "Назови состояние одним простым словом: «мне сейчас непросто».",
  },
  {
    id: "okay",
    title: "Всё нормально",
    whatHappens: "Сейчас есть достаточно устойчивости, чтобы заметить ресурс и сохранить его.",
    support: "Я могу не ждать кризиса, чтобы заботиться о себе.",
    exercise: "Найди одну деталь дня, которую хочется запомнить.",
    nextStep: "Сделай маленькое действие в сторону важного для тебя.",
  },
];

export const APOTHECARY_CARDS: ApothecaryCard[] = [
  {
    id: "anxiety",
    title: "Тревога",
    whatHappens: "Мозг ищет угрозу и предлагает сценарии будущего.",
    support: "Даже если мне тревожно, я могу позаботиться о себе прямо сейчас.",
    exercise: "Найди 3 предмета одного цвета.",
    nextStep: "Сделай несколько медленных выдохов.",
  },
  {
    id: "panic",
    title: "Паника",
    whatHappens: "Тело переживает сильную волну адреналина. Это неприятно, но волна проходит.",
    support: "Сильные ощущения могут пугать. Такая волна обычно проходит; новые или необычные симптомы лучше проверить с врачом.",
    exercise: "Поставь обе стопы на пол и назови 5 предметов вокруг.",
    nextStep: "Выбери точку перед собой и дыши с длинным выдохом 30 секунд.",
  },
  {
    id: "self_criticism",
    title: "Самокритика",
    whatHappens: "Внутри звучит строгий голос, который путает ошибку с личной ценностью.",
    support: "Я могу признавать ошибки без нападения на себя.",
    exercise: "Замени «я ужасный» на «мне сейчас трудно, и я учусь».",
    nextStep: "Сделай одно исправимое действие, если оно есть.",
  },
  {
    id: "shame",
    title: "Стыд",
    whatHappens: "Стыд просит спрятаться и часто преувеличивает опасность отвержения.",
    support: "Один момент не равен всей моей личности.",
    exercise: "Положи ладонь на грудь и скажи: «Это болезненное чувство, не приговор».",
    nextStep: "Напиши одну нейтральную фразу о случившемся без ярлыков.",
  },
  {
    id: "loneliness",
    title: "Одиночество",
    whatHappens: "Потребность в связи стала особенно заметной.",
    support: "Мне нужна связь, и это человеческая потребность.",
    exercise: "Вспомни человека, с кем контакт ощущается безопаснее всего.",
    nextStep: "Отправь короткое сообщение или сохрани идею для завтра.",
  },
  {
    id: "burnout",
    title: "Выгорание",
    whatHappens: "Нервная система долго работала без достаточного восстановления.",
    support: "Снижение энергии не делает меня слабым.",
    exercise: "Спроси: «Что можно не делать сегодня?»",
    nextStep: "Уменьши одну задачу до минимальной версии.",
  },
  {
    id: "sadness",
    title: "Грусть",
    whatHappens: "Психика замедляется и просит тепла, смысла или поддержки.",
    support: "Грусть можно проживать бережно, без спешки.",
    exercise: "Назови одну потребность под грустью.",
    nextStep: "Дай себе один простой источник заботы.",
  },
  {
    id: "fear",
    title: "Страх",
    whatHappens: "Внимание сузилось вокруг возможной опасности.",
    support: "Я могу отличать реальную угрозу от предположения.",
    exercise: "Спроси себя: «Что я точно знаю, а что додумываю?»",
    nextStep: "Сделай один шаг, который повышает безопасность.",
  },
  {
    id: "anger",
    title: "Злость",
    whatHappens: "Злость показывает границу, потребность или чувство несправедливости.",
    support: "Я могу уважать свою злость и выбирать действие.",
    exercise: "Медленно сожми кулаки на вдохе и расслабь на выдохе 5 раз.",
    nextStep: "Сформулируй просьбу или границу одной фразой.",
  },
  {
    id: "overload",
    title: "Перегрузка",
    whatHappens: "Слишком много стимулов или задач одновременно.",
    support: "Мне можно уменьшить поток и вернуться к одному делу.",
    exercise: "Закрой глаза на 10 секунд или посмотри на спокойную поверхность.",
    nextStep: "Запиши только первый следующий шаг.",
  },
];

export const DAILY_MICRO_CARDS: DailyMicroCard[] = [
  {
    id: "notice-inner-critic",
    category: "Самокритика",
    choiceTitle: "Успокоить внутреннего критика",
    skillName: "Замечать внутреннего критика",
    leafLabel: "Замечать критика",
    title: "Замечать внутреннего критика",
    type: "reflection",
    whenHelps: "Когда внутри звучит жесткий голос.",
    whyUseful: "Когда ты называешь критика, его слова становятся мыслью, а не приговором.",
    support: "Сегодня не нужно спорить с собой. Достаточно заметить строгий голос.",
    prompt: "Запиши одну фразу внутреннего критика.",
    exercise: "Запиши одну фразу внутреннего критика и начни ее словами: «Я замечаю мысль, что...»",
    example: "Я замечаю мысль, что я всё испортил.",
    hint: "Возьми самую короткую фразу. Даже два слова подойдут.",
    fields: [
      {
        id: "reflection",
        label: "Фраза критика",
        placeholder: "Я замечаю мысль, что...",
      },
    ],
    completionMessage: "Сегодня ты потренировал навык замечать внутреннего критика.",
    reflectionQuestion: "Фраза критика",
    nextStep: "Скажи про себя: «Это мысль, а не вся правда».",
    nextSmallStep: "Скажи про себя: «Это мысль, а не вся правда».",
    saveToEvidenceBank: false,
    difficulty: "легко",
    duration: "2 мин",
    energy: "низкая",
  },
  {
    id: "check-thought-facts",
    category: "Тревога",
    choiceTitle: "Проверить тревожную мысль",
    skillName: "Проверять мысли фактами",
    leafLabel: "Реалистичное мышление",
    title: "Проверять мысли фактами",
    type: "reflection",
    whenHelps: "Когда тревожная мысль звучит убедительно.",
    whyUseful: "Факт возвращает внимание из сценария будущего в то, что известно сейчас.",
    support: "Сегодня не нужно убеждать себя в хорошем. Найдем один факт.",
    prompt: "Запиши одну тревожную мысль и один факт, который ты точно знаешь.",
    exercise: "Запиши тревожную мысль. Ниже запиши один проверяемый факт.",
    example: "Мысль: меня точно осудят. Факт: пока мне никто этого не сказал.",
    hint: "Факт можно проверить глазами, словами другого человека или прошлым опытом.",
    fields: [
      {
        id: "reflection",
        label: "Мысль и факт",
        placeholder: "Мысль: ... Факт: ...",
      },
    ],
    completionMessage: "Сегодня ты потренировал навык проверять мысли фактами.",
    reflectionQuestion: "Мысль и факт",
    nextStep: "Выбери один спокойный шаг на ближайшие 10 минут.",
    nextSmallStep: "Выбери один спокойный шаг на ближайшие 10 минут.",
    saveToEvidenceBank: false,
    difficulty: "легко",
    duration: "2 мин",
    energy: "средняя",
  },
  {
    id: "support-yourself",
    category: "Самосострадание",
    choiceTitle: "Поддержать себя",
    skillName: "Поддерживать себя",
    leafLabel: "Самоподдержка",
    title: "Поддерживать себя",
    type: "reflection",
    whenHelps: "Когда хочется тепла вместо давления.",
    whyUseful: "Короткая фраза поддержки снижает внутреннее напряжение и помогает не бросать себя.",
    support: "Сегодня не нужно становиться сильнее. Можно сказать себе одну человеческую фразу.",
    prompt: "Запиши одну фразу поддержки, которую можно сказать себе сейчас.",
    exercise: "Запиши одну фразу, которая признает трудность и не давит.",
    example: "Мне сейчас непросто, и я могу сделать один маленький шаг.",
    hint: "Пиши так, как сказал бы близкому человеку в такой же ситуации.",
    fields: [
      {
        id: "reflection",
        label: "Фраза поддержки",
        placeholder: "Мне сейчас...",
      },
    ],
    completionMessage: "Сегодня ты потренировал навык поддерживать себя.",
    reflectionQuestion: "Фраза поддержки",
    nextStep: "Повтори эту фразу один раз медленно.",
    nextSmallStep: "Повтори эту фразу один раз медленно.",
    saveToEvidenceBank: false,
    difficulty: "легко",
    duration: "1 мин",
    energy: "низкая",
  },
  {
    id: "mistakes-without-catastrophe",
    category: "Самосострадание",
    choiceTitle: "Перестать требовать идеальности",
    skillName: "Спокойно относиться к ошибкам",
    leafLabel: "Ошибки без катастрофы",
    title: "Спокойно относиться к ошибкам",
    type: "reflection",
    whenHelps: "Когда ошибка кажется доказательством, что с тобой что-то не так.",
    whyUseful: "Нейтральное описание ошибки отделяет событие от твоей ценности.",
    support: "Сегодня не нужно исправлять всё. Достаточно назвать ошибку без нападения на себя.",
    prompt: "Запиши одну ошибку нейтральными словами.",
    exercise: "Запиши одну ошибку как факт, без слов «ужасно», «всегда» и «никогда».",
    example: "Я отправил файл позже, чем планировал.",
    hint: "Представь, что пишешь короткую строку в календаре, а не оценку себя.",
    fields: [
      {
        id: "reflection",
        label: "Нейтральная формулировка",
        placeholder: "Я...",
      },
    ],
    completionMessage: "Сегодня ты потренировал навык спокойно относиться к ошибкам.",
    reflectionQuestion: "Нейтральная формулировка",
    nextStep: "Назови одно исправимое действие, если оно правда нужно.",
    nextSmallStep: "Назови одно исправимое действие, если оно правда нужно.",
    saveToEvidenceBank: false,
    difficulty: "легко",
    duration: "2 мин",
    energy: "низкая",
  },
  {
    id: "show-up-with-fear",
    category: "Уверенность",
    choiceTitle: "Сделать маленький смелый шаг",
    skillName: "Проявляться несмотря на страх",
    leafLabel: "Смелость",
    title: "Проявляться несмотря на страх",
    type: "reflection",
    whenHelps: "Когда хочется дождаться полной уверенности.",
    whyUseful: "Смелость растет через маленькие действия, а не через идеальную готовность.",
    support: "Сегодня не нужно прыгать выше головы. Выберем один безопасный шаг.",
    prompt: "Запиши один маленький шаг, который можно сделать даже со страхом.",
    exercise: "Запиши действие на 2 минуты: написать, спросить, уточнить, показать черновик.",
    example: "Отправить один короткий вопрос вместо длинного объяснения.",
    hint: "Шаг должен быть настолько маленьким, чтобы его можно было сделать сегодня.",
    fields: [
      {
        id: "reflection",
        label: "Маленький смелый шаг",
        placeholder: "Я могу...",
      },
    ],
    completionMessage: "Сегодня ты потренировал навык проявляться несмотря на страх.",
    reflectionQuestion: "Маленький смелый шаг",
    nextStep: "Сделай его в минимальной версии или оставь как первый шаг на завтра.",
    nextSmallStep: "Сделай его в минимальной версии или оставь как первый шаг на завтра.",
    saveToEvidenceBank: false,
    difficulty: "средне",
    duration: "2 мин",
    energy: "средняя",
  },
  {
    id: "inner-support",
    category: "Осознанность",
    choiceTitle: "Найти внутреннюю опору",
    skillName: "Формировать внутреннюю опору",
    leafLabel: "Внутренняя опора",
    title: "Формировать внутреннюю опору",
    type: "reflection",
    whenHelps: "Когда хочется почувствовать, что внутри есть точка устойчивости.",
    whyUseful: "Опора становится заметнее, когда ты связываешь ее с конкретным фактом, а не с настроением.",
    support: "Сегодня не нужно быть уверенным во всем. Найдем одну точку, на которую можно опереться.",
    prompt: "Вспомни один случай, где ты уже справился с чем-то непростым.",
    exercise: "Запиши один короткий факт: с чем ты уже справлялся раньше.",
    example: "Я уже проходил сложные разговоры и оставался в контакте.",
    hint: "Подойдет маленький бытовой пример. Не ищи героический момент.",
    fields: [
      {
        id: "reflection",
        label: "Один факт опоры",
        placeholder: "Я уже...",
      },
    ],
    completionMessage: "Сегодня ты сделал ещё один шаг к внутренней опоре.",
    reflectionQuestion: "Один факт опоры",
    nextStep: "Скажи: «У меня уже есть опыт справляться».",
    nextSmallStep: "Скажи: «У меня уже есть опыт справляться».",
    saveToEvidenceBank: false,
    difficulty: "легко",
    duration: "2 мин",
    energy: "низкая",
  },
];

const categoryMap: Record<DailyCardCategory, LibraryCategory> = {
  "Тревога": "daily_anxiety",
  "Самокритика": "daily_self_criticism",
  "Стресс": "daily_stress",
  "Выгорание": "daily_burnout",
  "Эмоции": "daily_emotions",
  "Самооценка": "daily_self_esteem",
  "Осознанность": "daily_mindfulness",
  "Благодарность": "daily_gratitude",
  "Отношения": "daily_relationships",
  "Ценности": "daily_values",
  "Уверенность": "daily_confidence",
  "Самосострадание": "daily_self_compassion",
};

export const DAILY_CARD_EXERCISES: LibraryExercise[] = DAILY_MICRO_CARDS.map((card) => ({
  id: card.id,
  title: card.title,
  description: card.whenHelps,
  category: categoryMap[card.category],
  fields: [
    {
      id: "reflection",
      label: card.reflectionQuestion,
      type: "textarea",
      placeholder: "Одной короткой фразы достаточно.",
    },
  ],
  guide: {
    purpose: card.support,
    steps: [card.exercise, card.nextStep],
    example: [`Сложность: ${card.difficulty}. Длительность: ${card.duration}. Энергия: ${card.energy}.`],
  },
}));
