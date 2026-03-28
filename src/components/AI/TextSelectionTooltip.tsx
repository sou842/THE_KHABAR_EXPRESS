import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TooltipPosition {
  x: number;
  y: number;
}

export interface TextSelectionTooltipProps {
  /** Ref to the element within which selections are considered valid. */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Called with the trimmed selected text when the user clicks "Ask AI". */
  onAskAi: (selectedText: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum character count for a selection to be considered meaningful. */
const MIN_SELECTION_LENGTH = 3;

/**
 * Horizontal padding (px) kept between the tooltip centre and the viewport
 * edges so the tooltip never clips left or right.
 */
const VIEWPORT_HORIZONTAL_MARGIN = 60;

/**
 * Minimum distance (px) from the top of the viewport. Used as a fallback
 * when the selection rect is too close to the top edge.
 */
const VIEWPORT_TOP_MARGIN = 40;

/** Gap (px) between the bottom of the tooltip arrow and the top of the selection rect. */
const TOOLTIP_GAP = 8;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true only when the *entire* selection (both anchor and focus nodes)
 * is contained within `container`. Checking only `anchorNode` misses
 * cross-boundary drag selections where the focus node exits the container.
 */
function isSelectionInsideContainer(
  selection: Selection,
  container: HTMLElement,
): boolean {
  return (
    container.contains(selection.anchorNode) &&
    container.contains(selection.focusNode)
  );
}

/**
 * Calculates a clamped tooltip position from the bounding rect of the
 * current selection range, keeping the tooltip within the visible viewport.
 */
function computeTooltipPosition(rect: DOMRect): TooltipPosition {
  const centerX = rect.left + rect.width / 2;
  const clampedX = Math.min(
    Math.max(centerX, VIEWPORT_HORIZONTAL_MARGIN),
    window.innerWidth - VIEWPORT_HORIZONTAL_MARGIN,
  );

  // Position above the selection. If that would clip the top of the viewport,
  // fall back to placing it below the selection instead.
  const aboveY = rect.top - TOOLTIP_GAP;
  const y = aboveY >= VIEWPORT_TOP_MARGIN ? aboveY : rect.bottom + TOOLTIP_GAP;

  return { x: clampedX, y };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * TextSelectionTooltip
 *
 * Renders a floating "Ask AI" button above any text selection made inside
 * `targetRef`. Safe across all key scenarios:
 *
 * - Stale closure: `position` is NOT in the effect's dep array; the click-
 *   outside handler reads position via a ref instead.
 * - Listener churn: the main effect depends only on `handleSelection` (stable
 *   via useCallback) so listeners are registered exactly once.
 * - Partial selection: both `anchorNode` and `focusNode` are checked against
 *   the container, not just `anchorNode`.
 * - Viewport clamping: tooltip falls below the selection when there is not
 *   enough room above, and is clamped left/right.
 * - AnimatePresence exit: the tooltip is always mounted (returns a wrapper);
 *   visibility is controlled by the `isVisible` key passed to AnimatePresence.
 * - Keyboard noise: keyup listener is filtered to selection-relevant keys only.
 * - selectedText freshness: text is read directly from the Selection object at
 *   click time rather than from a potentially-stale state snapshot.
 * - Scroll / resize drift: `position` is computed from `getBoundingClientRect()`
 *   which is viewport-relative. If the page scrolls or resizes after the tooltip
 *   appears, those coordinates no longer match the selection. The tooltip is
 *   dismissed immediately on any scroll or resize event — the same pattern used
 *   by Google Docs, Notion, and Linear — avoiding the misplacement entirely.
 */
const TextSelectionTooltip: React.FC<TextSelectionTooltipProps> = ({
  targetRef,
  onAskAi,
}) => {
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const isMobile = useIsMobile();

  /**
   * Keep position in a ref so `handleClickOutside` always reads the latest
   * value without needing `position` in the effect's dependency array.
   * (Including `position` in deps would re-register listeners on every
   * tooltip move, causing significant listener churn.)
   */
  const positionRef = useRef<TooltipPosition | null>(null);
  positionRef.current = position;

  /**
   * We store the selected text in a ref rather than state so the button's
   * onClick can always read the freshest value — even if React hasn't
   * flushed a state update between the selection event and the click.
   */
  const selectedTextRef = useRef<string>('');

  const hideTooltip = useCallback(() => setPosition(null), []);

  const handleSelection = useCallback(() => {
    if (isMobile) {
      hideTooltip();
      return;
    }

    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      hideTooltip();
      return;
    }

    const text = selection.toString().trim();

    if (text.length < MIN_SELECTION_LENGTH) {
      hideTooltip();
      return;
    }

    const container = targetRef.current;

    // Both anchor and focus must be inside the container to guard against
    // cross-boundary drag selections that start inside but end outside.
    if (!container || !isSelectionInsideContainer(selection, container)) {
      hideTooltip();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Guard against zero-size rects (e.g. programmatic selections).
    if (rect.width === 0 && rect.height === 0) {
      hideTooltip();
      return;
    }

    selectedTextRef.current = text;
    setPosition(computeTooltipPosition(rect));
  }, [targetRef, isMobile, hideTooltip]);

  useEffect(() => {
    /**
     * Filter keyup to keys that can actually change a selection.
     * Without this, every keystroke in any input on the page triggers
     * a full selection recalculation.
     */
    const SELECTION_KEYS = new Set([
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Shift', 'Home', 'End', 'PageUp', 'PageDown',
    ]);

    const handleKeyUp = (e: KeyboardEvent) => {
      if (SELECTION_KEYS.has(e.key)) handleSelection();
    };

    /**
     * mousedown fires before the selection is cleared, so we check whether
     * the click landed inside the tooltip via the `.ask-ai-tooltip` class.
     * We read `positionRef.current` (not `position`) to avoid a stale closure
     * that would otherwise require `position` in the effect deps.
     */
    const handleClickOutside = (e: MouseEvent) => {
      if (
        positionRef.current !== null &&
        !(e.target as HTMLElement).closest('.ask-ai-tooltip')
      ) {
        hideTooltip();
      }
    };

    /**
     * Dismiss on scroll or resize.
     *
     * `position` is computed from `getBoundingClientRect()`, which returns
     * viewport-relative coordinates at the moment of selection. Any scroll or
     * resize shifts those coordinates relative to the selection, causing the
     * tooltip to visually drift away from where it was opened. Dismissing
     * immediately is the correct UX (matches Notion, Google Docs, Linear) and
     * avoids any need to track scroll deltas or re-query the selection.
     *
     * `{ passive: true }` lets the browser optimise scroll performance by
     * signalling that the handler will never call `preventDefault()`.
     *
     * We listen on `window` for scroll because content scroll containers are
     * often not `document` — a scrollable `<div>` with `overflow: auto` fires
     * its scroll events on itself, not on `document`. Listening on `window`
     * with `{ capture: true }` catches scroll events from any scrollable
     * ancestor in the tree.
     */
    const handleScrollOrResize = () => {
      if (positionRef.current !== null) hideTooltip();
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
    // `position` intentionally excluded — we use positionRef instead.
  }, [handleSelection, hideTooltip]);

  const handleAskAi = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = selectedTextRef.current;
      if (!text) return;
      onAskAi(text);
      hideTooltip();
      window.getSelection()?.removeAllRanges();
    },
    [onAskAi, hideTooltip],
  );

  // ---------------------------------------------------------------------------
  // Render
  //
  // AnimatePresence requires its direct child to always be mounted (or use the
  // `mode` prop). Returning `null` from the component bypasses AnimatePresence
  // entirely — the exit animation never runs. Instead, we keep the wrapper
  // mounted and pass `isVisible` to AnimatePresence so Framer Motion can
  // orchestrate the exit transition correctly.
  // ---------------------------------------------------------------------------

  const isVisible = position !== null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="ask-ai-tooltip"
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="ask-ai-tooltip"
          role="tooltip"
          aria-label="Ask AI about selected text"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y - 30,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          <div className="relative">
            {/* Triangular arrow pointing down toward the selection */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45 border-b border-r border-neutral-800" />

            <button
              onClick={handleAskAi}
              aria-label="Ask AI about selected text"
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl hover:bg-neutral-800 transition-all active:scale-95 group"
            >
              <Sparkles
                width={14}
                height={14}
                className="text-gray-400 group-hover:rotate-12 transition-transform"
              />
              <span className="text-xs font-bold whitespace-nowrap tracking-wide">
                Ask AI
              </span>
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-xl bg-gray-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextSelectionTooltip;