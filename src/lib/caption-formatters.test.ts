import { describe, expect, it } from "vitest";
import {
  convertCase,
  countGraphemes,
  countWords,
  deduplicateHashtags,
  extractHashtags,
  normalizeParagraphSpacing,
  normalizeWhitespace,
  wrapText,
} from "./caption-formatters";

describe("caption text transformations", () => {
  it("normalizes horizontal whitespace and caps blank lines without mutating text", () => {
    const input = "  Hello   world\n\n\nNext line  ";
    expect(normalizeWhitespace(input)).toBe("Hello world\n\nNext line");
    expect(input).toBe("  Hello   world\n\n\nNext line  ");
    expect(normalizeWhitespace(" \n  \t ")).toBe("");
  });

  it("adds one blank line between lines and removes excess paragraph spacing", () => {
    expect(normalizeParagraphSpacing("one\ntwo\n\nthree", "add")).toBe("one\n\ntwo\n\nthree");
    expect(normalizeParagraphSpacing("one\n\n\nthree", "remove")).toBe("one\nthree");
  });

  it("converts case while retaining punctuation, apostrophes, and Unicode", () => {
    expect(convertCase("hELLO!  l'été. добро мир 🌿", "sentence")).toBe(
      "Hello!  L'été. Добро мир 🌿",
    );
    expect(convertCase("they're READY — déjà vu", "title")).toBe("They're Ready — Déjà Vu");
    expect(convertCase("Straße", "upper")).toBe("STRASSE");
    expect(convertCase("ÉMOJI 🌸", "lower")).toBe("émoji 🌸");
  });

  it("deduplicates hashtag tokens case-insensitively and preserves first spelling", () => {
    expect(deduplicateHashtags("#Travel #travel, email@#work #Travel_2026")).toBe(
      "#Travel, email@#work #Travel_2026",
    );
  });

  it("extracts unique hashtags, retaining punctuation and avoiding email fragments", () => {
    expect(extractHashtags("Hello, #Travel! email@#work #travel and #東京.")).toEqual({
      caption: "Hello,! email@#work and.",
      hashtags: ["#Travel", "#東京"],
    });
  });

  it("wraps text without changing it and counts graphemes/words", () => {
    expect(wrapText("Hi 🌿", { prefix: "✨ ", suffix: " ✨" })).toBe("✨ Hi 🌿 ✨");
    expect(countGraphemes("👨‍👩‍👧‍👦é🌿")).toBe(3);
    expect(countWords("  one\n two  ")).toBe(2);
    expect(countWords(" \n ")).toBe(0);
  });
});
