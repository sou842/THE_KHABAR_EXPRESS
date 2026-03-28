import React, { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TypewriterProps {
  /**
   * The string to animate character-by-character.
   * Changing this prop mid-animation cancels the current run and restarts
   * from the beginning of the new string.
   */
  text: string;

  /**
   * Approximate base delay (ms) between non-punctuation characters for
   * short content. For longer content the component automatically reduces
   * this value so the animation always completes within `maxDurationMs`.
   * @default 8
   */
  speed?: number;

  /**
   * The maximum time (ms) the animation is allowed to run.
   * When `text.length * speed` would exceed this budget the per-character
   * delay is scaled down proportionally so the animation finishes on time.
   * Punctuation pauses are scaled by the same ratio.
   * @default 8000  (8 seconds)
   */
  maxDurationMs?: number;

  /**
   * When `false` the full text is rendered immediately with no animation,
   * and `onComplete` is called synchronously inside the effect.
   * Toggling this from `false` → `true` re-triggers a full animation run.
   * @default true
   */
  shouldAnimate?: boolean;

  /**
   * Called once the animation finishes (or immediately when
   * `shouldAnimate` is `false`). Safe to pass as an inline function —
   * identity changes do not restart the animation.
   */
  onComplete?: () => void;

  /**
   * Optional render prop for full control over how content is displayed.
   * Receives the currently-visible text slice and a boolean that is `true`
   * while typing is in progress (useful for rendering a custom cursor).
   * When omitted a built-in blinking-block cursor is shown.
   */
  render?: (displayedText: string, isTyping: boolean) => React.ReactNode;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Characters that represent the end of a sentence — long pause. */
const SENTENCE_ENDERS = new Set(['.', '?', '!']);

/** Characters that represent a mid-sentence break — medium pause. */
const CLAUSE_BREAKERS = new Set([',', ';', ':']);

/**
 * Baseline pause durations at normal (1×) speed scale.
 * When adaptive scaling kicks in these are multiplied by the same ratio
 * so punctuation rhythm stays proportionally natural.
 */
const BASE_DELAY_SENTENCE_END_MS = 150;
const BASE_DELAY_CLAUSE_BREAK_MS = 50;
const BASE_DELAY_NEWLINE_MS = 80;

/** actual char delay = 2 + Math.random() * (effectiveSpeed * JITTER_MULTIPLIER) */
const JITTER_MULTIPLIER = 2;

/** Default max animation budget in milliseconds. */
const DEFAULT_MAX_DURATION_MS = 8_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the effective per-character speed by capping the animation
 * duration to `maxDurationMs`.
 *
 * Strategy: the worst-case total time for `n` characters is
 *   n * (2 + speed * JITTER_MULTIPLIER)
 * If that exceeds the budget, we solve for the largest `speed` that fits:
 *   effectiveSpeed = (maxDurationMs / n - 2) / JITTER_MULTIPLIER
 * We then clamp to [0, configuredSpeed] so short strings are never sped up.
 */
function computeEffectiveSpeed(
  textLength: number,
  speed: number,
  maxDurationMs: number,
): number {
  if (textLength === 0) return speed;

  const worstCaseTotal = textLength * (2 + speed * JITTER_MULTIPLIER);

  if (worstCaseTotal <= maxDurationMs) {
    // Fits within budget — use the configured speed as-is.
    return speed;
  }

  // Back-calculate the largest speed value that keeps us within budget.
  const scaledSpeed = (maxDurationMs / textLength - 2) / JITTER_MULTIPLIER;

  // Never go negative; clamp to 0 (instant-ish) as the lower bound.
  return Math.max(0, scaledSpeed);
}

/**
 * Computes the per-character typing delay, scaling punctuation pauses by
 * the same ratio used for regular characters so rhythm stays natural.
 *
 * @param char           - The character just typed.
 * @param effectiveSpeed - The already-scaled speed value.
 * @param scale          - Ratio of effectiveSpeed / configuredSpeed (≤ 1).
 */
function getCharDelay(char: string, effectiveSpeed: number, scale: number): number {
  if (SENTENCE_ENDERS.has(char)) return BASE_DELAY_SENTENCE_END_MS * scale;
  if (CLAUSE_BREAKERS.has(char)) return BASE_DELAY_CLAUSE_BREAK_MS * scale;
  if (char === '\n') return BASE_DELAY_NEWLINE_MS * scale;
  return 2 + Math.random() * (effectiveSpeed * JITTER_MULTIPLIER);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Typewriter
 *
 * Progressively reveals `text` one character at a time with a human-like
 * typing cadence. Punctuation characters introduce natural pauses.
 *
 * For large content the component automatically adjusts speed so the
 * animation always completes within `maxDurationMs` (default 8 s).
 *
 * @example
 * // Minimal usage — speed auto-adjusts for any length
 * <Typewriter text="Hello, world!" />
 *
 * @example
 * // Custom budget: finish in at most 5 seconds regardless of length
 * <Typewriter text={longText} maxDurationMs={5000} />
 *
 * @example
 * // Custom render with a styled cursor
 * <Typewriter
 *   text="Hello, world!"
 *   render={(text, isTyping) => (
 *     <p>
 *       {text}
 *       {isTyping && <span className="cursor" />}
 *     </p>
 *   )}
 * />
 */
const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 8,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  shouldAnimate = true,
  onComplete,
  render,
}) => {
  const [displayedText, setDisplayedText] = useState<string>(
    shouldAnimate ? '' : text,
  );
  const [isTyping, setIsTyping] = useState<boolean>(
    shouldAnimate && text.length > 0,
  );

  /**
   * Store `onComplete` in a ref so callers can safely pass inline functions
   * without triggering animation restarts on every parent render.
   */
  const onCompleteRef = useRef<TypewriterProps['onComplete']>(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // ── Fast path: no animation ──────────────────────────────────────────
    if (!shouldAnimate) {
      setDisplayedText(text);
      setIsTyping(false);
      onCompleteRef.current?.();
      return;
    }

    // ── Guard: nothing to type ────────────────────────────────────────────
    if (text.length === 0) {
      setDisplayedText('');
      setIsTyping(false);
      onCompleteRef.current?.();
      return;
    }

    // ── Compute adaptive speed once per animation run ─────────────────────
    //
    // effectiveSpeed is ≤ the configured speed.
    // scale is the ratio applied to punctuation pauses so their feel stays
    // proportional (e.g. a sentence-end pause is still 3× a clause pause).
    const effectiveSpeed = computeEffectiveSpeed(text.length, speed, maxDurationMs);
    const scale = effectiveSpeed / speed; // always in (0, 1]

    // ── Reset for a fresh animation run ──────────────────────────────────
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    let timerId: ReturnType<typeof setTimeout>;

    /**
     * `isCancelled` is set to `true` by the cleanup function.
     * We check it at the top of each recursive call so that no state update
     * fires after the effect has been superseded or the component unmounted.
     *
     * Note: `clearTimeout` alone is insufficient here because it only cancels
     * a *pending* timer — it cannot stop the currently-executing callback.
     */
    let isCancelled = false;

    const typeNextChar = () => {
      if (isCancelled) return;

      if (charIndex < text.length) {
        charIndex++;
        setDisplayedText(text.substring(0, charIndex));

        const currentChar = text[charIndex - 1];
        timerId = setTimeout(typeNextChar, getCharDelay(currentChar, effectiveSpeed, scale));
      } else {
        setIsTyping(false);
        onCompleteRef.current?.();
      }
    };

    typeNextChar();

    return () => {
      isCancelled = true;
      clearTimeout(timerId);
    };

    /**
     * `speed` and `maxDurationMs` are intentionally excluded from dependencies.
     * Including them would restart the animation mid-sentence whenever the
     * parent re-renders with new values, which is almost never desirable.
     * Both are read once at the start of each animation run (when `text` or
     * `shouldAnimate` changes) via the closure, which is the correct behaviour.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, shouldAnimate]);

  // ── Render ──────────────────────────────────────────────────────────────

  if (render) {
    return <>{render(displayedText, isTyping)}</>;
  }

  return (
    <>
      {displayedText}
      {isTyping && (
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-4 ml-1 bg-neutral-400 animate-pulse align-middle"
        />
      )}
    </>
  );
};

export default Typewriter;