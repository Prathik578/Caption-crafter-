export type CaseMode = "sentence" | "lower" | "upper" | "title";
export type ParagraphMode = "add" | "remove";

export interface ExtractedHashtags {
  caption: string;
  hashtags: string[];
}

export interface TextWrapper {
  prefix?: string;
  suffix?: string;
}

const hashtagPattern = /(^|[^\p{L}\p{N}_.@])#([\p{L}\p{N}_]+)/gu;

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/[\t\f\v\u00a0 ]+/gu, " ")
    .replace(/ *\r?\n */gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

export function normalizeParagraphSpacing(text: string, mode: ParagraphMode): string {
  const normalized = text.replace(/\r\n?/gu, "\n");
  if (mode === "remove") return normalized.replace(/\n{2,}/gu, "\n");
  return normalized.replace(/(?<!\n)\n(?!\n)/gu, "\n\n");
}

export function convertCase(text: string, mode: CaseMode): string {
  if (mode === "lower") return text.toLocaleLowerCase();
  if (mode === "upper") return text.toLocaleUpperCase();

  if (mode === "sentence") {
    const lower = text.toLocaleLowerCase();
    let capitalizeNext = true;
    return Array.from(lower, (character) => {
      if (capitalizeNext && /[\p{L}]/u.test(character)) {
        capitalizeNext = false;
        return character.toLocaleUpperCase();
      }
      if (/[.!?。！？\n]/u.test(character)) capitalizeNext = true;
      return character;
    }).join("");
  }

  let startOfWord = true;
  return Array.from(text.toLocaleLowerCase(), (character) => {
    if (/[\p{L}\p{N}]/u.test(character)) {
      const output = startOfWord ? character.toLocaleUpperCase() : character;
      startOfWord = false;
      return output;
    }
    if (character !== "'" && character !== "’") startOfWord = true;
    return character;
  }).join("");
}

function mapHashtags(text: string, onMatch: (whole: string, tag: string) => string): string {
  return text.replace(
    hashtagPattern,
    (whole, boundary: string, tag: string) => `${boundary}${onMatch(whole, tag)}`,
  );
}

export function deduplicateHashtags(text: string): string {
  const seen = new Set<string>();
  const deduplicated = mapHashtags(text, (whole, tag) => {
    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) return "";
    seen.add(key);
    return whole;
  });
  return deduplicated.replace(/[ \t]{2,}/gu, " ").replace(/ +([,.;!?])/gu, "$1");
}

export function extractHashtags(text: string): ExtractedHashtags {
  const hashtags: string[] = [];
  const seen = new Set<string>();
  const caption = mapHashtags(text, (whole, tag) => {
    const key = tag.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      hashtags.push(`#${tag}`);
    }
    return "";
  })
    .replace(/[ \t]{2,}/gu, " ")
    .replace(/ +([,.;!?])/gu, "$1")
    .trim();

  return { caption, hashtags };
}

export function wrapText(text: string, { prefix = "", suffix = "" }: TextWrapper): string {
  return `${prefix}${text}${suffix}`;
}

export function countGraphemes(text: string): number {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text))
      .length;
  }
  return Array.from(text).length;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}
