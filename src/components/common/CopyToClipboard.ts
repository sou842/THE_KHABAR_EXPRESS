import { useState, useEffect, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How long (ms) the "copied" state stays true before resetting. */
const COPIED_RESET_DELAY_MS = 2_000;

// ---------------------------------------------------------------------------
// Markdown stripping
// ---------------------------------------------------------------------------

/**
 * Ordered list of markdown → plain-text substitutions.
 *
 * Order matters:
 *  1. Fenced code blocks first (multiline, must use `s` flag) so their
 *     content is extracted before inline-code backticks are processed.
 *  2. Headings before bold/italic so `# **title**` collapses cleanly.
 *  3. Inline formatting last.
 */
const MARKDOWN_RULES: Array<[RegExp, string]> = [
  // Fenced code blocks — ```lang\n…\n``` → inner content only.
  // The `s` (dotAll) flag is required so `.` matches newlines inside the block.
  [/```[\w]*\n?([\s\S]*?)```/g, '$1'],

  // Inline code — `code` → code
  [/`([^`]+)`/g, '$1'],

  // Headings — # H1 / ## H2 / ### H3 (up to ######)
  [/^#{1,6}\s+/gm, ''],

  // Bold — **text** or __text__
  [/\*\*(.*?)\*\*/g, '$1'],
  [/__(.*?)__/g, '$1'],

  // Italic — *text* or _text_
  [/\*(.*?)\*/g, '$1'],
  [/_(.*?)_/g, '$1'],

  // Strikethrough — ~~text~~
  [/~~(.*?)~~/g, '$1'],

  // Links — [text](url) → text
  [/\[([^\]]+)\]\([^)]+\)/g, '$1'],

  // Images — ![alt](url) → alt
  [/!\[([^\]]*)\]\([^)]+\)/g, '$1'],

  // Blockquotes — > text → text
  [/^>\s+/gm, ''],

  // Horizontal rules
  [/^[-*_]{3,}\s*$/gm, ''],

  // Unordered list markers — leading - / * / +
  [/^[\s]*[-*+]\s+/gm, ''],

  // Ordered list markers — leading 1. / 2. etc.
  [/^[\s]*\d+\.\s+/gm, ''],

  // Collapse 3+ consecutive newlines to 2 (preserve paragraph breaks)
  [/\n{3,}/g, '\n\n'],
];

/**
 * Strips common markdown syntax from `text` and returns plain text suitable
 * for clipboard output.
 *
 * Intentionally does NOT use a full markdown parser — the goal is a clean
 * plain-text representation, not HTML. Edge cases (nested emphasis, escaped
 * characters) are rare enough in practice that regex rules are sufficient.
 */
export function stripMarkdown(text: string): string {
  return MARKDOWN_RULES
    .reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text)
    .trim();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseCopyToClipboardReturn {
  /** True for `COPIED_RESET_DELAY_MS` ms after a successful copy. */
  copied: boolean;
  /** True while the async clipboard write is in flight. */
  isLoading: boolean;
  /** Non-null when the most recent copy attempt failed. */
  error: Error | null;
  /** Call this with the markdown string to copy. Returns true on success. */
  copy: (content: string) => Promise<boolean>;
}

/**
 * useCopyToClipboard
 *
 * Handles markdown stripping, clipboard API error recovery, rapid-click
 * debouncing, and cleanup on unmount — all in one place.
 *
 * @example
 * const { copy, copied, error } = useCopyToClipboard();
 *
 * <button onClick={() => copy(markdownContent)}>
 *   {copied ? 'Copied!' : 'Copy'}
 * </button>
 * {error && <span>Failed to copy</span>}
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied]     = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<Error | null>(null);

  /**
   * Track the reset timer so we can cancel it if:
   *  - The component unmounts before it fires (prevents state update on
   *    an unmounted component and the associated React warning).
   *  - The user clicks Copy again before the previous timer expires
   *    (prevents stacked timers that cause the "copied" badge to flicker).
   */
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel any pending reset timer on unmount.
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const copy = useCallback(async (content: string): Promise<boolean> => {
    // Debounce: if already showing "copied", cancel the pending reset and
    // restart the timer rather than stacking a second write + timer.
    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    const plainText = stripMarkdown(content);

    setLoading(true);
    setError(null);

    try {
      await navigator.clipboard.writeText(plainText);

      setCopied(true);
      setLoading(false);

      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, COPIED_RESET_DELAY_MS);

      return true;
    } catch (err) {
      const copyError = err instanceof Error
        ? err
        : new Error('Clipboard write failed');

      setError(copyError);
      setLoading(false);
      return false;
    }
  }, []);

  return { copied, isLoading, error, copy };
}