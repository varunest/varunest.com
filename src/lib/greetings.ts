export interface Greeting {
  text: string;
  lang: string;
}

export const GREETINGS: Greeting[] = [
  { text: "Hello!", lang: "en" },
  { text: "Hola!", lang: "es" },
  { text: "Bonjour!", lang: "fr" },
  { text: "Ciao!", lang: "it" },
  { text: "Hallo!", lang: "de" },
  { text: "Olá!", lang: "pt" },
  { text: "Hej!", lang: "sv" },
  { text: "Merhaba!", lang: "tr" },
  { text: "Привет!", lang: "ru" },
  { text: "Γεια σου!", lang: "el" },
  { text: "नमस्ते!", lang: "hi" },
  { text: "வணக்கம்!", lang: "ta" },
  { text: "こんにちは!", lang: "ja" },
  { text: "안녕하세요!", lang: "ko" },
  { text: "你好!", lang: "zh" },
  { text: "Jambo!", lang: "sw" },
  { text: "Aloha!", lang: "haw" },
];

/** Pick a random greeting that differs from the one currently shown. */
export function pickGreeting(currentText: string | null, random: () => number = Math.random): Greeting {
  const pool = GREETINGS.filter((g) => g.text !== currentText);
  return pool[Math.floor(random() * pool.length) % pool.length];
}
