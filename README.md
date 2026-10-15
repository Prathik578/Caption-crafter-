# Caption Crafter

A focused, client-side caption formatting tool for social media. Paste in a rough caption, clean it up with one-click transformations, preview the result, then copy or download it — all in your browser, no account required.

## Features

### Caption editor

- Large text input with live character and word counts (Unicode-aware grapheme counting)
- Clear-all and restore-original controls
- Your text stays saved on your device between visits

### Formatting operations

- **Whitespace cleanup** — collapses extra spaces and caps blank lines at one paragraph break
- **Paragraph spacing** — add or remove line breaks between paragraphs
- **Case conversion** — Sentence case, lowercase, UPPERCASE, or Title Case (preserves punctuation, apostrophes, and Unicode)
- **Hashtag deduplication** — removes duplicate tags (case-insensitive, keeps first spelling)
- **Hashtag extraction** — pulls hashtags into a separate section
- **Prefix / suffix** — wrap your caption with custom text
- **Undo** — reverse the last transformation; **Restore** — reset to original input

### Platform presets

- Instagram, YouTube, LinkedIn, and Generic profiles
- Character counts are informational only — no platform limits are enforced

### Output panel

- Separate preview of your formatted caption
- One-tap copy with success/error feedback
- Download as plain-text file
- Dedicated hashtags section when extracted

### User experience

- Light and dark themes with keyboard-accessible toggle
- Mobile-first responsive design
- Visible focus states and ARIA labels throughout
- Helpful empty states and error messages

## Getting started

```sh
npm install
npm run dev
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run all tests |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## Architecture

- **`src/lib/caption-formatters.ts`** — Pure, deterministic text transformation functions. No side effects, no mutation of inputs. Tested independently.
- **`src/components/caption-formatter.tsx`** — Main UI component composing the editor, toolbar, platform picker, and output panel. Owns all state and wires transformations to controls.
- **`src/routes/index.tsx`** — Page route with SEO metadata.
- **`src/styles.css`** — Design system with oklch color tokens, light/dark themes, and responsive layout.

### State model

- `sourceText` — the editable baseline text
- `outputText` — the formatted result
- `history` — prior outputs for single-step undo
- `extractedHashtags` — latest extraction result
- `preset` — selected platform profile
- `copyStatus` — idle, success, or error
- `theme` — light or dark

Drafts persist to `localStorage` and are restored on page load. Storage failures fall back gracefully to in-memory state.

## Tests

- **Unit tests** (`src/lib/caption-formatters.test.ts`) — whitespace, paragraph spacing, Unicode/emoji case conversion, hashtag deduplication and extraction, text wrapping, grapheme/word counting, immutability.
- **UI tests** (`src/test/caption-formatter.test.tsx`) — live counts, source edit/reset, transform/undo/restore/clear, hashtag extraction, copy success/failure feedback, preset selection, localStorage persistence.
- **Routing test** (`src/test/app-routing.test.tsx`) — verifies the home route resolves correctly.

## Known limitations

- No backend, accounts, or cloud sync — drafts are device-local only.
- Platform character limits are not enforced; counts are informational.
- No AI-powered caption generation or suggestions.
- No social media publishing or API integration.
- Download is plain-text only (no rich format export).
