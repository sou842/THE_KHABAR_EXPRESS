import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AiSummary {
  mainIdea: string;
  keyPoints: string[];
  finalTakeaway: string;
}

interface AiSummarySectionProps {
  blogId: string;
  initialSummary?: AiSummary;
}

const AiSummarySection: React.FC<AiSummarySectionProps> = ({ blogId, initialSummary }) => {
  const [summary, setSummary] = useState<AiSummary | undefined>(initialSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateSummary = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/blogs/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId }),
      });

      if (!response.ok) {
        console.error(`Request failed: ${response?.status}`);
        toast.error('Failed to generate summary');
        return;
      }

      const data = await response?.json();

      if (data?.success && data?.data) {
        setSummary(data.data);
        setIsExpanded(true);
      } else {
        toast.error(data?.message || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('[AiSummarySection] fetch error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [blogId, isLoading]);

  const handleToggle = useCallback(() => {
    if (!summary?.finalTakeaway) {
      handleGenerateSummary();
    } else {
      setIsExpanded(prev => !prev);
    }
  }, [summary, handleGenerateSummary]);

  return (
    <div className="rounded-2xl border border-border hover:border-transparent hover:bg-gray-100 transition-colors overflow-hidden">
      {/* Header row */}
      <div
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 group text-left ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-900 leading-tight tracking-tight">
              AI Summary
            </p>
            <p className="text-sm text-neutral-400 font-normal mt-0.5">
              {!!summary?.finalTakeaway ? 'Key insights from this article' : 'Generate a summary with AI'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking…</span>
            </div>
          )}

          {!summary?.finalTakeaway && !isLoading && (
            <div className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-none group-hover:bg-neutral-900 transition-all duration-200">
              <Sparkles className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
            </div>
          )}

          {summary?.finalTakeaway && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-none transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && summary?.finalTakeaway && (
          <motion.div
            key="summary-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-200 px-6 py-6 space-y-6">

              {/* Main idea */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex gap-4"
              >
                <div className="w-0.5 bg-neutral-900 rounded-full flex-shrink-0 self-stretch" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                    Main Idea
                  </p>
                  <p className="text-base font-semibold text-neutral-800 leading-relaxed">
                    {summary.mainIdea}
                  </p>
                </div>
              </motion.div>

              {/* Key points */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                  Key Points
                </p>
                <ul className="space-y-2.5">
                  {summary?.keyPoints?.map((point, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.06 }}
                      className="flex items-start gap-3 text-sm text-neutral-600 leading-snug"
                    >
                      <span className="mt-[6px] w-1 h-1 rounded-full bg-neutral-400 flex-shrink-0" />
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Final takeaway */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="bg-white rounded-xl px-5 py-4"
              >
                <p className="text-xs font-bold tracking-widest text-gray-600 mb-2">
                  Takeaway
                </p>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">
                  {summary?.finalTakeaway}
                </p>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiSummarySection;