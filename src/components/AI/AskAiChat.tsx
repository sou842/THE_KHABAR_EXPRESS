import React, { useState, useRef, useEffect, useCallback, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, X, Loader2, ArrowUpRight, Copy, Check, ThumbsUp, ThumbsDown, Trash2, Ellipsis, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import localforage from 'localforage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Typewriter from '../common/Typewriter';
import { useCopyToClipboard } from '../common/CopyToClipboard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  feedback?: 'like' | 'dislike' | null;
  shouldAnimate?: boolean;
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
  initialQuestion?: string | { id: string | number; text: string };
}

interface AssistantMessageProps {
  content: string;
  id: string;
  initialFeedback?: 'like' | 'dislike' | null;
  onFeedback: (id: string, type: 'like' | 'dislike') => void;
  shouldAnimate?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What are the core concepts?",
  "Summarize the key takeaways.",
  "How does this methodology work?",
  "What problem does this solve?",
  "Any counterarguments mentioned?",
];


const AssistantMessage: FC<AssistantMessageProps> = ({ content, id, initialFeedback, onFeedback, shouldAnimate = false }) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(initialFeedback || null);
  const { copy, copied, error } = useCopyToClipboard();

  const handleCopy = () => {
    copy(content);
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(prev => prev === type ? null : type);
    onFeedback(id, type);
    if (feedback !== type && type === 'dislike') {
      toast.success('Thanks for the feedback. I\'ll try to improve.');
    }
  };

  return (
    <div className="group relative flex flex-col gap-3 w-full">
      <div id="ai-chat-markdown" className="prose prose-sm prose-neutral max-w-none 
        prose-headings:font-bold prose-headings:text-neutral-900 prose-headings:tracking-tight prose-headings:mb-3 prose-headings:mt-6
        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
        prose-p:text-neutral-700 prose-p:leading-[1.7] prose-p:mb-4
        prose-ul:my-4 prose-ul:list-disc prose-li:my-1 prose-li:text-neutral-600
        prose-strong:text-neutral-900 prose-strong:font-bold
        prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-200 prose-pre:rounded-xl">
        <Typewriter 
          text={content} 
          shouldAnimate={shouldAnimate} 
          render={(text, isTyping) => (
            <>
              <Markdown  remarkPlugins={[remarkGfm]}>{text}</Markdown>
              {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-neutral-400 animate-pulse align-middle" />}
            </>
          )} 
        />
      </div>
      
      <div className="flex items-center gap-1 -ml-1">
        <button
          onClick={handleCopy}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 ${
            copied ? 'text-gray-600 bg-green-50' : ''
          }`}
          title="Copy response"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        
        <div className="w-px h-4 bg-neutral-200 mx-1" />

        <button
          onClick={() => handleFeedback('like')}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-neutral-100 ${
            feedback === 'like' ? 'text-gray-900' : 'text-neutral-400 hover:text-neutral-900'
          }`}
          title="Helpful"
        >
          <ThumbsUp className={`w-4 h-4`} />
        </button>

        <button
          onClick={() => handleFeedback('dislike')}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-neutral-100 ${
            feedback === 'dislike' ? 'text-gray-900' : 'text-neutral-400 hover:text-neutral-900'
          }`}
          title="Not helpful"
        >
          <ThumbsDown className={`w-4 h-4`} />
        </button>
      </div>
    </div>
  );
};

const AskAiChat: React.FC<AskAiChatProps> = ({ blogId, articleTitle, initialSummary, onClose, initialQuestion }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const lastProcessedQuestionRef = useRef<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('thinking...');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const questions = !!initialSummary?.suggestedQuestions?.length ? initialSummary?.suggestedQuestions : SUGGESTED_QUESTIONS;
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(questions);

  const STORAGE_KEY = `khabar_ask_ai_${blogId}`;

  useEffect(() => {
    const loadChat = async () => {
      try {
        const stored = await localforage.getItem<string>(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const withDates = parsed.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
            shouldAnimate: false // Ensure historical messages don't re-animate
          }));
          setMessages(withDates);
        }
      } catch (e) {
        console.error("Failed to load chat history from IndexedDB", e);
      }
    };
    loadChat();
  }, [blogId, STORAGE_KEY]);

  useEffect(() => {
    localforage.setItem(STORAGE_KEY, JSON.stringify(messages))
      .catch(e => console.error("Failed to save chat to IndexedDB", e));
  }, [messages, STORAGE_KEY]);

  const handleDeletePair = (index: number) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[index + 1]?.role === 'assistant') {
        newMessages.splice(index, 2);
      } else {
        newMessages.splice(index, 1);
      }
      return newMessages;
    });
  };

  const handleRetry = (index: number, content: string) => {
    handleDeletePair(index);
    setTimeout(() => {
      handleSend(content);
    }, 100);
  };

  const handleMessageFeedback = (id: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, feedback: m.feedback === type ? null : type };
      }
      return m;
    }));
  };

  const handleSend = useCallback(async (customMessage?: string, retryCount = 0, passedHistory?: string) => {
    const text = (customMessage || input).trim();
    if (!text || (isLoading && retryCount === 0)) return;

    let historyToUse = passedHistory;

    if (retryCount === 0) {
      historyToUse = messages
        ?.slice(-2)
        ?.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        ?.join('\n');

      if (!customMessage) setInput('');
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text, timestamp: new Date() }]);
      setLoadingMessage('thinking...');
      setIsLoading(true);
    } else {
      setLoadingMessage(`The AI took too long to think, retrying... (Attempt ${retryCount + 1}/3)`);
    }

    try {
      const response = await fetch('/api/blogs/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId, question: text, history: historyToUse }),
      });

      if (!response.ok) {
        if (response.status === 504 || response.status === 500) {
          if (retryCount < 2) {
            console.log(`[AskAiChat] Server timeout (${response.status}). Retrying (${retryCount + 1}/2)...`);
            await handleSend(text, retryCount + 1, historyToUse);
            return;
          } else {
            toast.error("The AI took too long to think. Please try again.");
            return;
          }
        } else {
          toast.error(`Error: ${response.status} - Something went wrong.`);
          return;
        }
      }

      const data = await response.json();
      if (data?.success) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data?.answer, timestamp: new Date(), shouldAnimate: true }]);
      } else {
        toast.error(data?.message || 'Something went wrong');
      }
    } catch (err) {
      console.log(`[AskAiChat] Network error:`, err);
      if (retryCount < 2) {
        setLoadingMessage(`Network error, retrying... (Attempt ${retryCount + 1}/3)`);
        await handleSend(text, retryCount + 1, historyToUse);
      } else {
        toast.error('Failed to connect to AI service');
      }
    } finally {
      if (retryCount === 0) {
        setIsLoading(false);
      }
    }
  }, [blogId, input, isLoading, messages]);

  useEffect(() => {
    if (!initialQuestion) return;

    const queryText = typeof initialQuestion === 'string' ? initialQuestion : initialQuestion.text;
    const queryId = typeof initialQuestion === 'string' ? initialQuestion : initialQuestion.id;

    if (queryId !== lastProcessedQuestionRef.current) {
      handleSend(queryText);
      lastProcessedQuestionRef.current = queryId;
    }
  }, [initialQuestion, handleSend]);

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
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all font-sans"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
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
              className="flex flex-col items-center text-center pt-8 pb-4 gap-6"
            >
              {/* Icon + prompt */}
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center mx-auto shadow-lg shadow-neutral-900/10 ring-4 ring-neutral-900/5">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 tracking-tight">Ask about this article</h3>
                  <p className="text-sm text-neutral-500 mt-1 max-w-[240px] leading-relaxed mx-auto">
                    I've analyzed the content. Choose a suggested question below or ask your own.
                  </p>
                </div>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-2.5 max-w-[90%]">
                {suggestedQuestions && suggestedQuestions?.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.2 }}
                    onClick={() => handleSend(q)}
                    className="w-fit max-w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-neutral-200/80 text-sm text-neutral-600 font-medium hover:border-neutral-400 hover:text-neutral-900 hover:bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group text-left"
                  >
                    <span className="line-clamp-2 text-center">{q || 'No Question'}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat messages */}
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages && messages?.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} mb-2 w-full group`}
              >
              <div className={`flex items-center gap-2 w-full ${m.role === 'user' ? 'justify-end flex-row' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] sm:max-w-[80%] min-w-[60px] px-4 py-3.5 rounded-2xl text-[15px] leading-relaxed transition-all ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-br-sm shadow-neutral-900/15 shadow-sm'
                      : 'max-w-full sm:max-w-full w-full text-neutral-800 w-full'
                    }`}
                >
                  {m.role === 'assistant' ? (
                    <AssistantMessage 
                      content={m.content} 
                      id={m.id} 
                      initialFeedback={m.feedback} 
                      onFeedback={handleMessageFeedback} 
                      shouldAnimate={m.shouldAnimate}
                    />
                  ) : (
                    <div className="font-medium tracking-tight text-neutral-50 whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
              </div>
              
              {(m.role !== 'assistant' && m.timestamp) && (
                <div className="flex items-center gap-1 mt-1.5">
                  {m.role === 'user' && (
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors outline-none cursor-pointer">
                            <Ellipsis className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => handleRetry(i, m.content)} className="cursor-pointer gap-2 focus:bg-gray-100">
                            <RefreshCcw className="w-4 h-4" />
                            <span>Retry</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePair(i)} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 gap-2">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  <span className={`text-[11px] font-medium text-neutral-400 px-1 tracking-wide ${m.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                    {m?.timestamp?.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
          </AnimatePresence>

          {/* Loading status indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className="flex justify-start"
              >
                <div className="px-2 py-3.5 rounded-2xl rounded-bl-sm flex gap-2 items-center">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <Loader2 className="w-4 h-4 text-neutral-400 animate-spin absolute" />
                  </div>
                  <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-neutral-500 to-neutral-400 animate-pulse tracking-wide">
                    {loadingMessage}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input area */}
      <div className="px-5 pb-5 pt-3 bg-gradient-to-t from-neutral-50 via-neutral-50 to-transparent">
        <div
          className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
            canSend 
              ? 'border-neutral-400 shadow-md shadow-neutral-200/50' 
              : 'border-neutral-200 shadow-sm'
            } focus-within:border-neutral-400 focus-within:shadow-md focus-within:ring-4 focus-within:ring-neutral-100`}
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
            className="w-full bg-transparent border-none outline-none resize-none text-[15px] text-neutral-800 placeholder:text-neutral-400 font-medium leading-relaxed overflow-y-auto px-5 pt-4 pb-2 block"
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <span className="text-[11px] font-medium text-neutral-400 px-2 tracking-wide uppercase select-none">
              {input?.length > 0 ? `${input?.length} chars · ↵ to send` : 'Shift + ↵ for new line'}
            </span>
            <button
              onClick={() => handleSend()}
              disabled={!canSend}
              className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  canSend
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-md shadow-neutral-900/20 active:scale-[0.97]'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAiChat;