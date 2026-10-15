# Caption Formatter — Product and Implementation Plan

## Product specification

A focused, client-side editor for turning raw caption text into clean, ready-to-copy social captions. Users edit source text, apply one deliberate transformation at a time, preview output separately, then copy or download it. Text remains in the browser between visits until the user clears or replaces it.

**Non-goals:** social publishing or platform APIs; accounts, backend, database, or AI; scheduling/analytics; unverified platform limits or automatic enforcement.

## Primary flows and states

1. Choose a platform profile (Instagram, YouTube, LinkedIn, or Generic), enter or paste a caption, and see live character/word counts.
2. Apply whitespace, case, paragraph-spacing, hashtag de-duplication/extraction, prefix, or suffix operations; preview output immediately.
3. Undo the latest transformation, or restore output to the current source text. Editing/replacing the source establishes a new original and clears transformation history.
4. Copy output with success/failure feedback, or download a plain-text file. Clear-all explicitly clears source, output, and history.
5. Handle empty input, empty extracted hashtag results, clipboard denial, long text, and saved drafts without losing content. Provide a keyboard-accessible light/dark theme control.

## Component hierarchy and responsibilities

- `Index` route: page composition and route-specific metadata.
- `CaptionFormatter`: owns editor/output and operation state; wires pure transformations to controls.
- `CaptionEditor`: source textarea, accessible counts, clear/restore actions.
- `FormatterToolbar`: case, whitespace, paragraph, hashtag, prefix/suffix, undo controls.
- `PlatformPicker`: profile selection and clear informational character-count context; no fabricated platform caps.
- `CaptionOutput`: distinct formatted preview, extracted hashtag section, copy/download actions, status feedback.
- `ThemeControl`: keyboard-operable light/dark selection.
- `src/lib/caption-formatters.ts`: deterministic, immutable, separately tested text operations.

## Data and state model

`sourceText: string` is the editable baseline; `outputText: string` is the formatted result; `history: string[]` stores prior outputs for single-step undo; `extractedHashtags: string[]` is the latest extraction result; `preset: 'instagram' | 'youtube' | 'linkedin' | 'generic'`; `copyStatus: 'idle' | 'success' | 'error'`; `theme: 'light' | 'dark'`. Source and output draft are saved locally in the browser and restored after mount; clearing or replacing text is explicit. Editing source resets output/history to the new source. Restore-original resets output to source; clear-all clears both.

## Transformation interfaces and rules

Pure functions accept strings and return new strings/results; none mutate input. Planned operations: `normalizeWhitespace(text)`, `normalizeParagraphSpacing(text, mode: 'add' | 'remove')`, `convertCase(text, mode: 'sentence' | 'lower' | 'upper' | 'title')`, `deduplicateHashtags(text)`, `extractHashtags(text) -> { caption, hashtags }`, and `wrapText(text, { prefix, suffix })`. Unicode-aware case conversion and hashtag matching preserve emoji and non-English letters. Duplicate tags compare case-insensitively while retaining the first spelling. Whitespace cleanup collapses horizontal whitespace and caps blank lines at one paragraph break; paragraph-spacing operations preserve line content and punctuation. Title case handles word boundaries and apostrophes without deleting punctuation. Empty/whitespace-only inputs remain safe. Platform selection never applies a platform character cap; counts are informational until verified limits are specified.

## Error handling and edge cases

Input is retained on transformation errors; clipboard failures show a visible message and leave output intact. Reset/undo always provide a path back to source. Clipboard access is attempted only after the user requests copy. Counts use Unicode code points for characters and whitespace-delimited words. Blank input has zero words; very long text remains in controlled textareas without truncation. Hashtag extraction returns an empty list when none are present. Local storage access is guarded and failures fall back to in-memory state.

## Test plan

- Unit tests: whitespace and paragraph preservation, Unicode/emoji and non-English case behavior, punctuation/apostrophes, mixed-case duplicate tags, hashtag extraction, prefix/suffix, empty input, and immutability.
- UI tests: live counts, source edit/reset behavior, transform/undo/restore/clear, preset selection without limit enforcement, hashtag output, and copy success/failure feedback using mocked clipboard.
- Manual preview checks: mobile and desktop layout, keyboard focus/order and theme control, empty and long input, download, clipboard permission failure, and browser draft restoration.
- Run the project's available test, lint, and production build commands; run a TypeScript check if the repository provides a supported command.

## Implementation steps

1. Add pure transformation helpers and focused unit tests.
2. Define semantic light/dark design tokens and implement the page, editor, presets, operation controls, and separate output panel using existing UI dependencies.
3. Add draft persistence, undo/restore/clear, copy/download feedback, and accessible theme selection.
4. Add interaction tests and route metadata; verify preview at mobile and desktop sizes.
5. Run tests, lint, TypeScript checking where supported, and production build; resolve failures and document actual outcomes and limitations.

## Trade-offs

A browser-only app avoids backend and dependency overhead. Local draft persistence is useful for preserving work but remains device/browser-local. Platform profiles provide count context without invented limits; no platform-specific cap is enforced. Transformations remain opt-in and undoable rather than silently The architecture plan is approved, subject to the four corrections below.

&nbsp;

1. Define safe localStorage hydration and persistence. Do not overwrite an existing saved draft with initial empty state during startup. Gracefully fall back to in-memory operation if storage is unavailable.

2. Specify and test transformation history semantics: every transformation records the previous output, undo restores the previous output, restore-original resets to the current source and clears history, and source edits establish a new baseline.

3. Use Unicode-aware character counting. Prefer Intl.Segmenter for grapheme counting where available and provide a documented fallback. Distinguish grapheme counts from code-point counts in the implementation.

4. Specify hashtag parsing boundaries, punctuation handling, case-insensitive deduplication, and extraction behavior. Preserve the first spelling and do not match email-address fragments.

&nbsp;

Proceed with implementation using the existing repository's framework, dependencies, conventions, and package manager.

&nbsp;

First inspect the actual repository and report the files and commands you intend to use. Then implement in small stages, beginning with pure transformation functions and unit tests. Do not replace working configuration or introduce unnecessary dependencies.

&nbsp;

After implementation, execute the supported tests, lint, type checking, and production build. Inspect the resulting changes, fix defects, and report actual command results. Do not claim browser verification unless you actually perform it.

&nbsp;

The project is complete only when the core behaviors work, critical edge cases are tested, and known limitations are documented. source text.
