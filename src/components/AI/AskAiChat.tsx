import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Loader2, ArrowUpRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AskAiChatProps {
  blogId: string;
  articleTitle: string;
  initialSummary?: {
    mainIdea: string;
    keyPoints: string[];
    finalTakeaway: string;
    suggestedQuestions?: string[];
  };
  onClose?: () => void;
}

const SUGGESTED_QUESTIONS = [
  "What are the core concepts?",
  "Summarize the key takeaways.",
  "How does this methodology work?",
  "What problem does this solve?",
  "Any counterarguments mentioned?",
];

const AssistantMessage: React.FC<{ content: string }> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <div className="prose prose-sm prose-neutral max-w-none 
        prose-headings:font-bold prose-headings:text-neutral-900 prose-headings:tracking-tight prose-headings:mb-3 prose-headings:mt-6
        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
        prose-p:text-neutral-700 prose-p:leading-[1.7] prose-p:mb-4
        prose-ul:my-4 prose-ul:list-disc prose-li:my-1 prose-li:text-neutral-600
        prose-strong:text-neutral-900 prose-strong:font-bold
        prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-200 prose-pre:rounded-xl">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
      
      <button
        onClick={handleCopy}
        className={`absolute -top-1 -right-1 p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-400 opacity-0 group-hover:opacity-100 transition-all hover:text-neutral-900 shadow-sm z-10 ${copied ? '!bg-green-50 !border-green-500 !text-green-500' : ''}`}
        title="Copy response"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
      </button>
    </div>
  );
};

const AskAiChat: React.FC<AskAiChatProps> = ({ blogId, articleTitle, initialSummary, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const questions = initialSummary?.suggestedQuestions || SUGGESTED_QUESTIONS;
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(questions);


  const handleSend = async (customMessage?: string) => {
    const text = (customMessage || input).trim();
    if (!text || isLoading) return;

    const currentHistory = messages
      ?.slice(-2)
      ?.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      ?.join('\n');

    if (!customMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/blogs/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId, question: text, history: currentHistory }),
      });
      const data = await response.json();
      if (data?.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data?.answer }]);
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
    } catch {
      toast.error('Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = useCallback(async () => {

    try {
      const response = await fetch('/api/blogs/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId }),
      });

      if (!response.ok) {
        console.error(`Request failed: ${response?.status}`);
        return;
      }

      const data = await response?.json();

      if (data?.success && data?.data) {
        if(!!data?.data?.suggestedQuestions?.length) {
          setSuggestedQuestions(data?.data?.suggestedQuestions);
        }
      }
    } catch (err) {
      console.error('[AiSummarySection] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [blogId, isLoading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math?.min(el.scrollHeight, 140)}px`;
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!initialSummary?.suggestedQuestions?.length) {
      handleGenerateSummary();
    }
  }, [initialSummary?.suggestedQuestions]);


  const showSuggestions = messages?.length === 0;
  const canSend = input?.trim()?.length > 0 && !isLoading;

  return (
    <div className="w-full h-full flex flex-col bg-neutral-50 border-l border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-semibold text-neutral-800 tracking-tight">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all font-sans"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

        {/* Empty state with suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center text-center pt-6 pb-4 gap-5"
            >
              {/* Icon + prompt */}
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <p className="text-base font-semibold text-neutral-800">Ask about this article</p>
                <p className="text-sm text-neutral-400 max-w-48 leading-snug">
                  I've read it. Try one of these or write your own.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQuestions && suggestedQuestions?.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                    onClick={() => handleSend(q)}
                    className="w-fit max-w-full flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm text-neutral-600 font-medium hover:border-neutral-900 hover:text-neutral-900 hover:bg-neutral-50 transition-all group"
                  >
                    {q || 'No Question'}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat messages */}
        {messages && messages?.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                  ? 'bg-neutral-900 text-white rounded-br-sm shadow-md shadow-neutral-900/10'
                  : 'bg-white border border-neutral-200 text-neutral-700 rounded-bl-sm shadow-sm'
                }`}
            >
              {m.role === 'assistant' ? (
                <AssistantMessage content={m.content} />
              ) : (
                <div className="font-medium">{m.content}</div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Loading dots */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="px-4 py-3 bg-white border border-neutral-200 rounded-2xl rounded-bl-sm flex gap-1 items-center shadow-sm">
                {[0, 1, 2].map(n => (
                  <span
                    key={n}
                    className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                    style={{ animationDelay: `${n * 120}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pt-2 bg-neutral-50">
        <div
          className={`bg-white rounded-xl border transition-colors duration-200 overflow-hidden shadow-sm ${canSend ? 'border-neutral-400' : 'border-neutral-300'
            }`}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything about this article…"
            rows={1}
            style={{ maxHeight: '140px' }}
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-neutral-800 placeholder:text-neutral-400 font-medium leading-relaxed overflow-y-auto px-4 pt-4 pb-2 block"
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <span className="text-xs text-neutral-400 px-1 select-none tabular-nums">
              {input?.length > 0 ? `${input?.length} chars · ↵ to send` : 'Shift + ↵ for new line'}
            </span>
            <button
              onClick={() => handleSend()}
              disabled={!canSend}
              className={`flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${canSend
                  ? 'bg-neutral-900 text-white hover:bg-neutral-700 shadow-md shadow-neutral-900/10'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAiChat;