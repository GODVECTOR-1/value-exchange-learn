export type Question =
  | { type: "choice"; prompt: string; options: string[]; answer: number }
  | { type: "translate"; prompt: string; answer: string; alts?: string[] }
  | { type: "match"; prompt: string; pairs: { a: string; b: string }[] };

export type Lesson = { id: string; title: string; questions: Question[] };
export type Course = { id: string; name: string; flag: string; lessons: Lesson[] };

export const COURSES: Course[] = [
  {
    id: "es",
    name: "Spanish",
    flag: "🇪🇸",
    lessons: [
      {
        id: "es-1",
        title: "Greetings",
        questions: [
          { type: "choice", prompt: 'How do you say "Hello"?', options: ["Adiós", "Hola", "Gracias", "Por favor"], answer: 1 },
          { type: "choice", prompt: 'What does "Buenos días" mean?', options: ["Good night", "Good morning", "Goodbye", "Thank you"], answer: 1 },
          { type: "translate", prompt: "Thank you", answer: "gracias" },
          { type: "match", prompt: "Match the words", pairs: [{ a: "Hola", b: "Hello" }, { a: "Adiós", b: "Bye" }, { a: "Sí", b: "Yes" }, { a: "No", b: "No" }] },
          { type: "translate", prompt: "Goodbye", answer: "adiós", alts: ["adios"] },
        ],
      },
      {
        id: "es-2",
        title: "Numbers 1–5",
        questions: [
          { type: "choice", prompt: '"Tres" means…', options: ["1", "2", "3", "4"], answer: 2 },
          { type: "translate", prompt: "Five", answer: "cinco" },
          { type: "match", prompt: "Match numbers", pairs: [{ a: "uno", b: "1" }, { a: "dos", b: "2" }, { a: "cuatro", b: "4" }] },
          { type: "choice", prompt: '"Two" in Spanish?', options: ["Uno", "Dos", "Tres", "Cuatro"], answer: 1 },
        ],
      },
    ],
  },
  {
    id: "fr",
    name: "French",
    flag: "🇫🇷",
    lessons: [
      {
        id: "fr-1",
        title: "Greetings",
        questions: [
          { type: "choice", prompt: '"Bonjour" means…', options: ["Goodbye", "Hello", "Thanks", "Please"], answer: 1 },
          { type: "translate", prompt: "Thank you", answer: "merci" },
          { type: "match", prompt: "Match", pairs: [{ a: "Salut", b: "Hi" }, { a: "Au revoir", b: "Goodbye" }, { a: "Oui", b: "Yes" }] },
          { type: "translate", prompt: "Yes", answer: "oui" },
        ],
      },
    ],
  },
  {
    id: "ja",
    name: "Japanese",
    flag: "🇯🇵",
    lessons: [
      {
        id: "ja-1",
        title: "Basics",
        questions: [
          { type: "choice", prompt: '"こんにちは" means…', options: ["Goodbye", "Hello", "Yes", "No"], answer: 1 },
          { type: "translate", prompt: "Thank you (romaji)", answer: "arigatou", alts: ["arigato"] },
          { type: "match", prompt: "Match", pairs: [{ a: "はい", b: "Yes" }, { a: "いいえ", b: "No" }, { a: "さようなら", b: "Goodbye" }] },
        ],
      },
    ],
  },
];
