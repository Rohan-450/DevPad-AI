import { lightColors } from "@/constants/colors";

export type Language = {
  id: string;
  name: string;
  color: string;
};

export const LANGUAGES: Language[] = [
  { id: "javascript", name: "JavaScript", color: lightColors.langJs },
  { id: "typescript", name: "TypeScript", color: lightColors.langTs },
  { id: "python", name: "Python", color: lightColors.langPython },
  { id: "java", name: "Java", color: lightColors.langJava },
  { id: "go", name: "Go", color: lightColors.langGo },
  { id: "rust", name: "Rust", color: lightColors.langRust },
  { id: "swift", name: "Swift", color: lightColors.langSwift },
  { id: "kotlin", name: "Kotlin", color: lightColors.langKotlin },
];

export const getLanguage = (id: string): Language | undefined =>
  LANGUAGES.find((l) => l.id === id);

export const getLanguageColor = (id: string): string | undefined =>
  getLanguage(id)?.color;

// File extensions we can safely read and display as text in-app. The value is
// the highlighter language to pass to <CodeEditor>; "text" = no highlighting.
const EXTENSION_LANGUAGE: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  java: "java",
  go: "go",
  rs: "rust",
  swift: "swift",
  kt: "kotlin",
  json: "json",
  md: "markdown",
  yml: "yaml",
  yaml: "yaml",
  html: "html",
  css: "css",
  xml: "xml",
  sh: "bash",
  txt: "text",
  csv: "text",
  log: "text",
};

const extensionOf = (name: string): string =>
  name.split(".").pop()?.toLowerCase() ?? "";

export const isTextFileName = (name: string): boolean =>
  extensionOf(name) in EXTENSION_LANGUAGE;

export const languageFromFileName = (name: string): string =>
  EXTENSION_LANGUAGE[extensionOf(name)] ?? "text";

// The real source-file extension for a snippet's language (no leading dot).
const LANGUAGE_EXTENSION: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  go: "go",
  rust: "rs",
  swift: "swift",
  kotlin: "kt",
};

export const extensionForLanguage = (id: string): string =>
  LANGUAGE_EXTENSION[id] ?? "txt";
