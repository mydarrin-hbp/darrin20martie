import "server-only";

export type Locale = "ro" | "en";

export const SUPPORTED_LOCALES: Locale[] = ["ro", "en"];

export function resolveLocale(value: string | undefined | null): Locale {
  if (!value) return "ro";
  const normalized = value.toLowerCase();
  if (normalized.startsWith("en")) return "en";
  return "ro";
}

export async function getDictionary(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import("./dictionaries/en.json")).default;
    case "ro":
    default:
      return (await import("./dictionaries/ro.json")).default;
  }
}
