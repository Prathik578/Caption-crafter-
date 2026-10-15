import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CaptionFormatter } from "@/components/caption-formatter";

function renderFormatter() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <CaptionFormatter />
    </QueryClientProvider>,
  );
}

const STORAGE_KEY = "caption-formatter-draft-v1";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function typeText(text: string) {
  const textarea = screen.getByLabelText("Original caption") as HTMLTextAreaElement;
  fireEvent.change(textarea, { target: { value: text } });
  return textarea;
}

function outputSection() {
  return screen.getByText(/Your caption/i).closest("section")!;
}

describe("CaptionFormatter UI", () => {
  it("renders the editor, toolbar, and output sections", () => {
    renderFormatter();
    expect(screen.getByText(/Start with a draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Make it yours/i)).toBeInTheDocument();
    expect(screen.getByText(/Your caption/i)).toBeInTheDocument();
  });

  it("updates character and word counts as the user types", () => {
    renderFormatter();
    typeText("Hello world");
    const counts = screen.getAllByText(/11 characters/i);
    expect(counts.length).toBeGreaterThan(0);
    const wordCounts = screen.getAllByText(/2 words/i);
    expect(wordCounts.length).toBeGreaterThan(0);
  });

  it("reflects typed text in the output preview", () => {
    renderFormatter();
    typeText("Hello world");
    const preview = within(outputSection()).getByText("Hello world");
    expect(preview).toBeInTheDocument();
  });

  it("applies UPPERCASE transformation and supports undo", () => {
    renderFormatter();
    typeText("hello world");

    fireEvent.click(screen.getByRole("button", { name: /UPPERCASE/i }));
    expect(within(outputSection()).getByText("HELLO WORLD")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Undo last change/i }));
    expect(within(outputSection()).getByText("hello world")).toBeInTheDocument();
  });

  it("restores original after transformations", () => {
    renderFormatter();
    typeText("Hello World");

    fireEvent.click(screen.getByRole("button", { name: /lowercase/i }));
    expect(within(outputSection()).getByText("hello world")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Restore original/i }));
    expect(within(outputSection()).getByText("Hello World")).toBeInTheDocument();
  });

  it("clears all text with the Clear button", () => {
    renderFormatter();
    const textarea = typeText("Some text");

    fireEvent.click(screen.getByRole("button", { name: /Clear/i }));
    expect(textarea.value).toBe("");
    expect(screen.getByText(/polished caption will show up here/i)).toBeInTheDocument();
  });

  it("extracts hashtags into a separate section", () => {
    renderFormatter();
    typeText("Great day! #travel #food");

    fireEvent.click(screen.getByRole("button", { name: /Extract to section/i }));
    const hashtagsBlock = within(outputSection()).getByLabelText(/Extracted hashtags/i);
    expect(within(hashtagsBlock).getByText(/#travel/i)).toBeInTheDocument();
    expect(within(hashtagsBlock).getByText(/#food/i)).toBeInTheDocument();
    expect(within(outputSection()).getByText("Great day!")).toBeInTheDocument();
  });

  it("shows copied feedback on successful copy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderFormatter();
    typeText("Hello world");

    fireEvent.click(screen.getByRole("button", { name: /Copy caption/i }));
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: /Copied/i })).toBeInTheDocument();
    });
    expect(writeText).toHaveBeenCalledWith("Hello world");
  });

  it("shows error feedback when clipboard fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    renderFormatter();
    typeText("Hello world");

    fireEvent.click(screen.getByRole("button", { name: /Copy caption/i }));
    await vi.waitFor(() => {
      expect(screen.getByText(/Copy failed/i)).toBeInTheDocument();
    });
  });

  it("selects a platform preset", () => {
    renderFormatter();
    const instagramBtn = screen.getByRole("button", { name: /Instagram/i });
    fireEvent.click(instagramBtn);
    expect(instagramBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("persists draft to localStorage", () => {
    renderFormatter();
    typeText("Persisted text");

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const draft = JSON.parse(stored!);
    expect(draft.sourceText).toBe("Persisted text");
  });
});
