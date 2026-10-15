import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Download,
  Eraser,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  convertCase,
  countGraphemes,
  countWords,
  deduplicateHashtags,
  extractHashtags,
  normalizeParagraphSpacing,
  normalizeWhitespace,
  wrapText,
  type CaseMode,
} from "@/lib/caption-formatters";

type Preset = "instagram" | "youtube" | "linkedin" | "generic";
type CopyStatus = "idle" | "success" | "error";
type Theme = "light" | "dark";

interface Draft {
  sourceText: string;
  outputText: string;
  history: string[];
  extractedHashtags: string[];
  preset: Preset;
  theme: Theme;
}

const STORAGE_KEY = "caption-formatter-draft-v1";
const PRESETS: { id: Preset; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "generic", label: "Generic" },
];

function readDraft(): Partial<Draft> {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== "object") return {};
    const draft = value as Partial<Draft>;
    const savedPreset = PRESETS.find(({ id }) => id === draft.preset)?.id;
    return {
      sourceText: typeof draft.sourceText === "string" ? draft.sourceText : "",
      outputText: typeof draft.outputText === "string" ? draft.outputText : "",
      history: Array.isArray(draft.history)
        ? draft.history.filter((item): item is string => typeof item === "string")
        : [],
      extractedHashtags: Array.isArray(draft.extractedHashtags)
        ? draft.extractedHashtags.filter((item): item is string => typeof item === "string")
        : [],
      preset: savedPreset ?? "generic",
      theme: draft.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return {};
  }
}

function CaptionCount({ text }: { text: string }) {
  return (
    <span className="count-copy">
      {countGraphemes(text).toLocaleString()} characters <span aria-hidden="true">·</span>{" "}
      {countWords(text).toLocaleString()} words
    </span>
  );
}

function CaptionEditor({
  value,
  onChange,
  onClear,
  onRestore,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onRestore: () => void;
}) {
  return (
    <section className="work-section" aria-labelledby="original-heading">
      <div className="section-heading">
        <div>
          <p className="section-kicker">
            01 <span>·</span> YOUR WORDS
          </p>
          <h2 id="original-heading">Start with a draft</h2>
        </div>
        <CaptionCount text={value} />
      </div>
      <Textarea
        aria-label="Original caption"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="Drop your caption here…"
        className="caption-input"
        spellCheck
      />
      <div className="editor-footer">
        <span className="micro-copy">Your original stays safe while you edit.</span>
        <div className="inline-actions">
          <Button type="button" variant="ghost" size="sm" onClick={onRestore} disabled={!value}>
            <RotateCcw aria-hidden="true" /> Restore original
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={!value}>
            <Eraser aria-hidden="true" /> Clear
          </Button>
        </div>
      </div>
    </section>
  );
}

function PlatformPicker({
  preset,
  onSelect,
}: {
  preset: Preset;
  onSelect: (value: Preset) => void;
}) {
  return (
    <section className="platform-row" aria-label="Caption profile">
      <div className="platform-copy">
        <span className="section-kicker">A GOOD FIT FOR</span>
        <span className="micro-copy">Counts are informational. No platform limits applied.</span>
      </div>
      <div className="preset-list" role="group" aria-label="Choose a platform profile">
        {PRESETS.map(({ id, label }) => (
          <Button
            type="button"
            size="sm"
            variant={preset === id ? "secondary" : "ghost"}
            aria-pressed={preset === id}
            key={id}
            onClick={() => onSelect(id)}
          >
            {label}
          </Button>
        ))}
      </div>
    </section>
  );
}

function FormatterToolbar({
  onTransform,
  onExtract,
  onUndo,
  canUndo,
}: {
  onTransform: (transform: (text: string) => string) => void;
  onExtract: () => void;
  onUndo: () => void;
  canUndo: boolean;
}) {
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const cases: { mode: CaseMode; label: string }[] = [
    { mode: "sentence", label: "Sentence case" },
    { mode: "lower", label: "lowercase" },
    { mode: "upper", label: "UPPERCASE" },
    { mode: "title", label: "Title Case" },
  ];

  return (
    <section className="tools-section" aria-labelledby="tools-heading">
      <div className="section-heading compact-heading">
        <div>
          <p className="section-kicker">
            02 <span>·</span> QUICK CLEANUP
          </p>
          <h2 id="tools-heading">Make it yours</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last change"
        >
          <Undo2 aria-hidden="true" /> Undo
        </Button>
      </div>

      <div className="tool-group">
        <span className="tool-label">CASE</span>
        <div className="tool-buttons">
          {cases.map(({ mode, label }) => (
            <Button
              key={mode}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onTransform((text) => convertCase(text, mode))}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="tool-group">
        <span className="tool-label">SPACING</span>
        <div className="tool-buttons">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTransform(normalizeWhitespace)}
          >
            Tidy whitespace
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTransform((text) => normalizeParagraphSpacing(text, "add"))}
          >
            Add paragraph breaks
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTransform((text) => normalizeParagraphSpacing(text, "remove"))}
          >
            Remove line breaks
          </Button>
        </div>
      </div>

      <div className="tool-group">
        <span className="tool-label">HASHTAGS</span>
        <div className="tool-buttons">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTransform(deduplicateHashtags)}
          >
            Remove duplicates
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onExtract}>
            Extract to section
          </Button>
        </div>
      </div>

      <div className="tool-group wrapper-group">
        <label className="tool-label" htmlFor="prefix-input">
          ADD AROUND TEXT
        </label>
        <div className="wrapper-fields">
          <input
            id="prefix-input"
            value={prefix}
            onChange={(event) => setPrefix(event.currentTarget.value)}
            placeholder="Prefix"
            aria-label="Text to add before caption"
          />
          <input
            value={suffix}
            onChange={(event) => setSuffix(event.currentTarget.value)}
            placeholder="Suffix"
            aria-label="Text to add after caption"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onTransform((text) => wrapText(text, { prefix, suffix }))}
            disabled={!prefix && !suffix}
          >
            Apply
          </Button>
        </div>
      </div>
    </section>
  );
}

function CaptionOutput({
  text,
  hashtags,
  status,
  onCopy,
  onDownload,
}: {
  text: string;
  hashtags: string[];
  status: CopyStatus;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const fullCaption = [text, hashtags.join(" ")].filter(Boolean).join("\n\n");
  return (
    <section className="output-section" aria-labelledby="output-heading">
      <div className="output-heading">
        <div>
          <p className="section-kicker">
            03 <span>·</span> READY WHEN YOU ARE
          </p>
          <h2 id="output-heading">Your caption</h2>
        </div>
        <div className="output-actions">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onDownload}
            disabled={!fullCaption}
            aria-label="Download caption as text"
            title="Download as text"
          >
            <Download aria-hidden="true" />
          </Button>
          <Button type="button" onClick={onCopy} disabled={!fullCaption}>
            {status === "success" ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
            {status === "success" ? "Copied" : "Copy caption"}
          </Button>
        </div>
      </div>
      <div className={`output-preview${fullCaption ? " has-content" : ""}`} aria-live="polite">
        {text ? (
          <p className="caption-preview">{text}</p>
        ) : (
          <div className="empty-output">
            <Sparkles aria-hidden="true" />
            <span>Your polished caption will show up here.</span>
          </div>
        )}
        {hashtags.length > 0 && (
          <div className="hashtags-block" aria-label="Extracted hashtags">
            <span className="tool-label">HASHTAGS</span>
            <p>{hashtags.join("  ")}</p>
          </div>
        )}
      </div>
      <div className="output-footer">
        <CaptionCount text={fullCaption} />
        <span className="copy-feedback" role="status">
          {status === "success"
            ? "Caption copied to clipboard."
            : status === "error"
              ? "Copy failed. Check clipboard permission and try again."
              : ""}
        </span>
      </div>
    </section>
  );
}

export function CaptionFormatter() {
  const [sourceText, setSourceText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [extractedHashtags, setExtractedHashtags] = useState<string[]>([]);
  const [preset, setPreset] = useState<Preset>("generic");
  const [theme, setTheme] = useState<Theme>("light");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft.sourceText !== undefined) setSourceText(draft.sourceText);
    if (draft.outputText !== undefined) setOutputText(draft.outputText);
    if (draft.history !== undefined) setHistory(draft.history);
    if (draft.extractedHashtags !== undefined) setExtractedHashtags(draft.extractedHashtags);
    if (draft.preset !== undefined) setPreset(draft.preset);
    if (draft.theme !== undefined) setTheme(draft.theme);
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!hydrated) return;
    const draft: Draft = { sourceText, outputText, history, extractedHashtags, preset, theme };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Keep the current session usable when storage is full or disabled.
    }
  }, [hydrated, sourceText, outputText, history, extractedHashtags, preset, theme]);

  const extractedText = useMemo(() => extractedHashtags.join(" "), [extractedHashtags]);

  function applyTransformation(transform: (text: string) => string, hashtags?: string[]) {
    setHistory((previous) => [...previous, outputText]);
    const nextOutput = transform(outputText);
    setOutputText(nextOutput);
    if (hashtags) setExtractedHashtags(hashtags);
    setCopyStatus("idle");
  }

  function updateSource(nextSource: string) {
    setSourceText(nextSource);
    setOutputText(nextSource);
    setHistory([]);
    setExtractedHashtags([]);
    setCopyStatus("idle");
  }

  function clearAll() {
    updateSource("");
    setHistory([]);
  }

  function restoreOriginal() {
    setOutputText(sourceText);
    setHistory([]);
    setExtractedHashtags([]);
    setCopyStatus("idle");
  }

  function undo() {
    const previousOutput = history.at(-1);
    if (previousOutput === undefined) return;
    setOutputText(previousOutput);
    setHistory((previous) => previous.slice(0, -1));
    setExtractedHashtags([]);
    setCopyStatus("idle");
  }

  function runExtractHashtags() {
    const result = extractHashtags(outputText);
    applyTransformation(() => result.caption, result.hashtags);
  }

  async function copyCaption() {
    const caption = [outputText, extractedText].filter(Boolean).join("\n\n");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(caption);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  }

  function downloadCaption() {
    const caption = [outputText, extractedText].filter(Boolean).join("\n\n");
    if (!caption) return;
    const blob = new Blob([caption], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "caption.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Caption Studio home">
          <span className="brand-mark">c.</span> caption studio
        </a>
        <div className="topbar-right">
          <span className="local-badge">
            <span aria-hidden="true" /> Saved on this device
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="theme-button"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          </Button>
        </div>
      </header>

      <div className="page-content">
        <section className="page-intro">
          <div className="intro-note">
            <Sparkles aria-hidden="true" /> A LITTLE POLISH, A LOT MORE YOU
          </div>
          <h1>
            Good words,
            <br />
            <span>better spacing.</span>
          </h1>
          <p>Clean up the little things. Keep the words that sound like you.</p>
        </section>

        <PlatformPicker preset={preset} onSelect={setPreset} />
        <div className="workspace">
          <div className="editor-column">
            <CaptionEditor
              value={sourceText}
              onChange={updateSource}
              onClear={clearAll}
              onRestore={restoreOriginal}
            />
            <FormatterToolbar
              onTransform={(transform) => applyTransformation(transform)}
              onExtract={runExtractHashtags}
              onUndo={undo}
              canUndo={history.length > 0}
            />
          </div>
          <CaptionOutput
            text={outputText}
            hashtags={extractedHashtags}
            status={copyStatus}
            onCopy={copyCaption}
            onDownload={downloadCaption}
          />
        </div>
        <footer className="page-footer">
          <span>Made for the words worth sharing.</span>
          <span>{PRESETS.find(({ id }) => id === preset)?.label} profile</span>
        </footer>
      </div>
    </main>
  );
}
