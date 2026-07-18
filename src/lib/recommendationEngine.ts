export const APOTHECARY_PROBLEMS = [
  { id: "anxiety", label: "Мне тревожно" },
  { id: "self_criticism", label: "Я ругаю себя" },
  { id: "shame", label: "Мне стыдно" },
  { id: "sadness", label: "Мне грустно" },
  { id: "anger", label: "Я злюсь" },
  { id: "loneliness", label: "Мне одиноко" },
  { id: "burnout", label: "Нет сил" },
  { id: "overload", label: "Слишком много всего" },
] as const;

export type ApothecaryProblem = (typeof APOTHECARY_PROBLEMS)[number]["id"];

const RULES: Record<ApothecaryProblem, string[]> = {
  anxiety: ["check-thought-facts", "inner-support", "support-yourself"],
  self_criticism: ["notice-inner-critic", "support-yourself", "mistakes-without-catastrophe"],
  shame: ["mistakes-without-catastrophe", "support-yourself", "inner-support"],
  sadness: ["support-yourself", "inner-support", "notice-inner-critic"],
  anger: ["notice-inner-critic", "mistakes-without-catastrophe", "support-yourself"],
  loneliness: ["support-yourself", "inner-support", "show-up-with-fear"],
  burnout: ["support-yourself", "inner-support", "check-thought-facts"],
  overload: ["check-thought-facts", "support-yourself", "inner-support"],
};

export const MICRO_ACTIONS: Record<ApothecaryProblem, string> = {
  anxiety: "Найди 3 предмета одного цвета и сделай один длинный выдох.",
  self_criticism: "Скажи себе: «Я замечаю строгую мысль, это не вся правда обо мне».",
  shame: "Положи ладонь на грудь и назови случившееся нейтрально, без ярлыков.",
  sadness: "Назови одну потребность под грустью и дай себе маленькое действие заботы.",
  anger: "Сожми и разожми ладони 5 раз, затем назови: «Мне важно...»",
  loneliness: "Выбери одного человека и отправь короткое сообщение без объяснений.",
  burnout: "Спроси: «Что сегодня можно сделать на 10% проще?»",
  overload: "Запиши только первый следующий шаг и убери один лишний стимул.",
};

const TEXT_PATTERNS: Array<[RegExp, ApothecaryProblem]> = [
  [/тревог|боюсь|страш|паник|волнуюсь/, "anxiety"],
  [/стыд|опозор|неловк/, "shame"],
  [/ругаю себя|ненавижу себя|я плох|самокрит|критик/, "self_criticism"],
  [/груст|печал/, "sadness"],
  [/злюсь|злость|бесит|раздраж/, "anger"],
  [/одинок|никому|одиноко/, "loneliness"],
  [/выгор|нет сил|истощ|устал/, "burnout"],
  [/перегруз|слишком много|не справляюсь/, "overload"],
];

export function recommendExercises(problem: ApothecaryProblem, limit = 3): string[] {
  return RULES[problem].slice(0, limit);
}

export function detectProblem(text: string): ApothecaryProblem {
  const normalized = text.toLocaleLowerCase("ru");
  return TEXT_PATTERNS.find(([pattern]) => pattern.test(normalized))?.[1] ?? "anxiety";
}
