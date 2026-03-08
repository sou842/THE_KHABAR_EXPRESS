import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Youtube, 
  Wand2, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  LayoutTemplate,
  Code2,
  UploadCloud,
  Loader2,
  Settings
} from 'lucide-react';

// Editor.js Block Types
type BlockType = 'header' | 'paragraph' | 'list' | 'inlineImage';

interface EditorJsBlock {
  id?: string;
  type: BlockType;
  data: any;
}

interface TkeArticlePayload {
  author: string;
  authorId: string;
  title: string;
  url: string;
  category: string;
  language: string;
  tags: string[];
  editorType: string;
  views: number;
  videoUrl: string;
  thumbnail: {
    title: string;
    description: string;
    image: string;
  };
  body: EditorJsBlock[];
}

export default function AutoBlogger() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [apiToken, setApiToken] = useState('fallback_development_token_change_me');
  const [showSettings, setShowSettings] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [result, setResult] = useState<TkeArticlePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
  const [copied, setCopied] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const checkImageValid = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setResult(parsed);
    } catch(err) {
      // Allow typing invalid json momentarily
    }
  };

  const handleGenerate = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setPublishStatus('idle');

    try {
let prompt = `SYSTEM ROLE:
You are a JSON-only response generator and professional blog writer.
You NEVER output markdown.
You NEVER output links in markdown format.
Your output is parsed directly by JSON.parse().

INPUT:
YouTube URL: "${youtubeUrl}"
Transcript: "${transcript}"
Language: "en"
Author: "sourav samanta"
AuthorId: "67effa37a489e2e948024db3"

PRIMARY OBJECTIVE:
Analyze the provided transcript (or YouTube URL if transcript is absent) and return ONE valid JSON object representing a full-length, publish-ready blog post for "The Khabar Express" — a professional tech news and analysis website.

The JSON must be safe for direct database insertion and production use.

---

HARD FAIL CONDITIONS:
- Any text outside JSON → FAIL
- Invalid JSON syntax → FAIL
- Markdown-style links like [text](url) → FAIL
- Image URL not matching topic → FAIL
- Image URL containing brackets, parentheses, or query params → FAIL
- Content below 300 words → FAIL
- Repetitive, robotic, or AI-patterned writing → FAIL
- Missing or empty required fields → FAIL

---

TRANSCRIPT HANDLING RULES:
- If a transcript is provided, it is your PRIMARY and AUTHORITATIVE source.
- Extract the real topic, key arguments, facts, examples, and conclusions from it.
- Do NOT hallucinate facts not present in the transcript.
- If no transcript is provided, use the YouTube URL and your googleSearch tool to find accurate, up-to-date information about the video before writing.
- Never fabricate statistics, quotes, or product claims.

---

HUMAN WRITING RULES (CRITICAL):
- Write like an experienced human journalist or blogger.
- Mix short punchy sentences with longer analytical ones naturally.
- BANNED phrases (instant FAIL if used):
  "In today's fast-paced world"
  "It is worth noting"
  "Moreover"
  "Furthermore"
  "In conclusion"
  "Delve into"
  "Game-changer"
  "Revolutionize"
  "It goes without saying"
- Use context-aware wording, subtle opinions, and grounded explanations.
- Do NOT sound promotional, padded, or overly formal.
- Every paragraph must add new information or perspective — no filler.
- Writing must feel intentional, informative, and naturally flowing.

---

INLINE IMAGE (CRITICAL — READ CAREFULLY):
The image MUST:
1. Be directly and visually relevant to the blog topic.
2. Come ONLY from Unsplash.
3. Use a CLEAN, RAW URL string — nothing else.

INLINE IMAGE URL RULES:
- Must start exactly with: https://images.unsplash.com/photo-
- Must NOT contain: [ ] ( ) markdown formatting, query descriptions, or extra parameters
- CORRECT example: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e"
- WRONG example: "[image](https://images.unsplash.com/photo-...)" → FAIL

IMAGE–TOPIC MATCHING RULE:
Identify the CORE VISUAL THEME of the topic before selecting an image.
- Smartphone / hardware → device, signal, satellite
- AI / ML → data centers, robotics, neural visuals
- Politics / policy → government buildings, flags, leaders
- Business / finance → offices, charts, working people
- Space / science → rockets, cosmos, labs
- Food → the actual dish, ingredients, cooking
- Do NOT use random landscapes, vague abstract images, or generic people photos unless the topic is itself abstract.

INLINE IMAGE BLOCK STRUCTURE (EXACT — NO DEVIATION):
{
  "type": "inlineImage",
  "data": {
    "caption": "",
    "stretched": false,
    "url": "https://images.unsplash.com/photo-XXXXXXXXXXXXXXXX",
    "withBackground": false,
    "withBorder": false
  }
}

THUMBNAIL RULE:
- thumbnail.image MUST be the exact same URL as inlineImage.data.url.
- thumbnail.title should be a punchy, SEO-friendly version of the article title.
- thumbnail.description should be a single sentence summarizing the article for social sharing.

---

EDITORJS BODY RULES:
Allowed block types ONLY:
- "header"
- "paragraph"
- "inlineImage"

Any other block type → FAIL

HEADER LEVEL RULES:
- level 2 → Blog title (used ONCE at the very top of body)
- level 3 → Section subheadings only (used multiple times throughout)

MANDATORY CONTENT STRUCTURE (follow this sequence):
1. header (level 2) — Article title
2. paragraph — Strong opening: immediately explain why this topic matters, based on transcript
3. inlineImage — Topic-matched Unsplash image
4. header (level 3) — Background or context section
5. paragraph — Context, history, or setup drawn from transcript
6. header (level 3) — Core topic / What was discussed or announced
7. paragraph — Main substance: key points, findings, or arguments from transcript
8. header (level 3) — How it works / Technical or practical details
9. paragraph — Explanation of mechanism, process, or details
10. header (level 3) — Why it matters / Real-world impact
11. paragraph — Implications, use cases, or industry relevance
12. header (level 3) — Limitations or open questions
13. paragraph — Honest critique, caveats, or unknowns
14. paragraph — Closing take: a grounded, opinionated wrap-up without sounding like a summary

---

STRICT RESPONSE SCHEMA:
{
  "author": "sourav samanta",
  "authorId": "67effa37a489e2e948024db3",
  "body": [ /* EditorJS blocks array */ ],
  "category": /* inferred from transcript topic, e.g. "technology" */,
  "editorType": "EDITORJS",
  "language": "en",
  "tags": [ /* 4–7 lowercase, relevant tags inferred from transcript */ ],
  "thumbnail": {
    "title": /* punchy SEO title */,
    "description": /* one-sentence social description */,
    "image": /* same URL as inlineImage */
  },
  "title": /* full SEO-optimized article title */,
  "url": /* kebab-case slug derived from title, no special characters */,
  "videoUrl": "${youtubeUrl}",
  "views": 0
}

---

FINAL INTERNAL CHECK (DO NOT OUTPUT — verify silently before responding):
✓ Output is valid JSON parseable by JSON.parse()
✓ No text, explanation, or markdown outside the JSON object
✓ inlineImage.url is a clean raw string starting with https://images.unsplash.com/photo-
✓ thumbnail.image matches inlineImage.url exactly
✓ All content is grounded in the transcript (no hallucinated facts)
✓ Word count naturally exceeds 300 words
✓ Writing reads like a human journalist, not an AI
✓ No banned phrases used
✓ All required fields present and non-empty
✓ Ready for direct database insertion`;

      const response = await fetch('/api/admin/auto-blogger/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiToken,
        },
        body: JSON.stringify({ prompt, model: selectedModel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content from AI');
      }

      const text = data.text;
      if (text) {
        try {
          // Clean up markdown code blocks if present
          const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
          const parsed = JSON.parse(jsonStr) as TkeArticlePayload;
          // Basic validation
          if (parsed.body && Array.isArray(parsed.body)) {
            // Ensure the videoUrl is set correctly if the AI missed it
            if (!parsed.videoUrl || parsed.videoUrl === "THE_YOUTUBE_URL_PROVIDED") {
              parsed.videoUrl = youtubeUrl;
            }
            
            // Image validation fallback logic
            if (parsed.thumbnail?.image) {
              const originalImage = parsed.thumbnail.image;
              const isValid = await checkImageValid(originalImage);
              if (!isValid) {
                 const fallback = "https://images.unsplash.com/photo-1504609813442-a8924e83f76e"; // Tech news fallback
                 parsed.thumbnail.image = fallback;
                 parsed.body = parsed.body.map(block => {
                    if (block.type === 'inlineImage' && block.data.url === originalImage) {
                       return { ...block, data: { ...block.data, url: fallback }};
                    }
                    return block;
                 });
              }
            }

            setResult(parsed);
            setJsonText(JSON.stringify(parsed, null, 2));
          } else {
            throw new Error('Invalid JSON structure returned from AI. Missing body array.');
          }
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          console.log('Raw response:', text);
          setError('Failed to parse the generated content. Please try again.');
        }
      } else {
        setError('No content generated. Please try again.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      // More helpful error for common SDK issues
      if (err.message?.includes('API key')) {
        setError('API Key configuration error: Ensure NEXT_PUBLIC_SUMMERY_API_KEY is set correctly in your environment.');
      } else {
        setError(err.message || 'An error occurred during generation.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!result) return;
    
    setIsPublishing(true);
    setPublishStatus('idle');
    setError(null);

    try {
      // Calling the external ingest-blog directly from the frontend
      const response = await fetch('/api/external/ingest-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': apiToken,
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Publish failed with status: ${response.status}`);
      }

      setPublishStatus('success');
      setTimeout(() => setPublishStatus('idle'), 5000);
    } catch (err: any) {
      console.error('Publish error:', err);
      setError(err.message || 'Failed to publish the blog post. Check your API token and network connection.');
      setPublishStatus('error');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderBlock = (block: EditorJsBlock, index: number) => {
    switch (block.type) {
      case 'header':
        const HeaderTag = `h${block.data.level || 2}` as any;
        const className = block.data.level === 1 
          ? "text-3xl font-bold text-foreground mt-8 mb-4 font-serif"
          : "text-2xl font-semibold text-foreground mt-6 mb-3 font-serif";
        return (
          <HeaderTag key={index} className={className} dangerouslySetInnerHTML={{ __html: block.data.text }} />
        );
      case 'paragraph':
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: block.data.text }} />
        );
      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
        const listClass = block.data.style === 'ordered' ? 'list-decimal' : 'list-disc';
        return (
          <ListTag key={index} className={`${listClass} pl-6 mb-4 text-muted-foreground space-y-2`}>
            {block.data.items.map((item: string, i: number) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ListTag>
        );
      case 'inlineImage':
        return (
          <figure key={index} className="my-6">
            <img 
              src={block.data.url} 
              alt={block.data.caption || 'Article image'} 
              className="w-full rounded-xl shadow-sm object-cover max-h-[400px]"
              referrerPolicy="no-referrer"
            />
            {block.data.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto w-full selection:bg-primary/20 selection:text-primary">
      <div className="max-w-8xl mx-auto space-y-6 pb-20">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                        Automation
                    </span>
                </div>
                <h1 className="text-[22px] font-bold tracking-tight">Auto Blogger</h1>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${showSettings ? 'bg-primary/10 text-primary border-primary/20' : 'bg-card text-foreground border-border/60 hover:bg-muted/50'}`}
              >
                <Settings className="w-4 h-4" />
                <span>Configuration</span>
              </button>
            </div>
        </header>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">TKE API Token</label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full rounded-lg border border-border/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="Enter your x-api-token"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used for authenticating with the ingest-blog endpoint.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">AI Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-lg border border-border/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-background text-foreground"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Default)</option>
                    <option value="qwen/qwen3-next-80b-a3b-instruct:free">qwen/qwen3-next-80b-a3b-instruct:free</option>
                    <option value="nvidia/nemotron-nano-9b-v2:free">nvidia/nemotron-nano-9b-v2:free</option>
                    <option value="stepfun/step-3.5-flash:free">stepfun/step-3.5-flash:free</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Select the AI model for generation.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-border/40 bg-muted/30">
                <h2 className="text-sm font-semibold text-foreground flex items-center">
                  <Youtube className="w-4 h-4 mr-2 text-red-500" />
                  Source Video
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Paste a YouTube URL to generate an article.</p>
              </div>
              
              <div className="p-6 flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-border/60 p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-foreground">Transcript (Optional)</label>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                  </div>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste the video transcript here for accurate summaries..."
                    className="w-full rounded-xl border border-border/60 p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none h-32 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    YouTube blocks automatic transcript fetching. For the most accurate blog post, please paste the transcript manually. Otherwise, the AI will try to search the web for information.
                  </p>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !youtubeUrl.trim()}
                  className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Video...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Generate Article</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metadata Preview Card */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-border/40 bg-muted/30">
                    <h2 className="text-sm font-semibold text-foreground">Article Metadata</h2>
                  </div>
                  <div className="p-6 space-y-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">Title</span>
                      <span className="font-medium text-foreground">{result.title}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">Slug</span>
                      <span className="text-muted-foreground font-mono text-xs bg-muted/80 px-2 py-1 rounded">{result.url}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">Category</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {result.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">Author</span>
                        <span className="text-foreground">{result.author}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider font-semibold mb-1">Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted/80 text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-8">
            <div className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden xl:min-h-[calc(100vh-8rem)] flex flex-col">
              
              {/* Output Header */}
              <div className="px-6 py-4 border-b border-border/40 bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center space-x-2 ${
                      activeTab === 'preview' 
                        ? 'bg-card text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutTemplate className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center space-x-2 ${
                      activeTab === 'json' 
                        ? 'bg-card text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Payload JSON</span>
                  </button>
                </div>

                {result && (
                  <div className="flex items-center space-x-3">
                    {activeTab === 'json' && (
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-card border border-border/60 px-3 py-1.5 rounded-lg shadow-sm hover:border-primary/30"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing || publishStatus === 'success'}
                      className={`flex items-center space-x-2 text-sm font-medium px-4 py-1.5 rounded-lg shadow-sm transition-all ${
                        publishStatus === 'success' 
                          ? 'bg-green-500 text-white'
                          : publishStatus === 'error'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isPublishing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : publishStatus === 'success' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      <span>
                        {isPublishing ? 'Publishing...' : publishStatus === 'success' ? 'Published!' : 'Publish to TKE'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Output Content */}
              <div className="flex-1 overflow-auto bg-card min-h-[400px] relative">
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 flex items-center justify-center p-8"
                    >
                      <div className="text-center max-w-md">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Operation Failed</h3>
                        <p className="text-muted-foreground text-sm">{error}</p>
                      </div>
                    </motion.div>
                  ) : !result && !isGenerating ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center p-8"
                    >
                      <div className="text-center max-w-sm">
                        <div className="w-16 h-16 bg-background border border-border/40 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                          <Youtube className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Auto-Blog</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Paste a YouTube URL and click generate to create a perfectly structured TKE blog post payload.
                        </p>
                      </div>
                    </motion.div>
                  ) : isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-card/80 backdrop-blur-sm z-10"
                    >
                      <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Analyzing Video</h3>
                      <p className="text-muted-foreground text-sm animate-pulse">Crafting article payload...</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full"
                    >
                      {activeTab === 'preview' ? (
                        <div className="p-8 max-w-3xl mx-auto">
                          {/* Thumbnail Preview */}
                          {result.thumbnail && result.thumbnail.image && (
                            <div className="mb-8 rounded-2xl overflow-hidden border border-border/60 shadow-sm">
                              <img 
                                src={result.thumbnail.image} 
                                alt={result.thumbnail.title}
                                className="w-full h-64 object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="p-4 bg-card">
                                <p className="text-sm font-medium text-foreground">{result.thumbnail.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{result.thumbnail.description}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="max-w-none">
                            {result.body.map((block, index) => renderBlock(block, index))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-0 h-full flex flex-col min-h-[500px]">
                          <textarea 
                            className="bg-slate-900 text-muted-foreground p-6 w-full h-full min-h-[500px] text-sm font-mono shadow-inner focus:outline-none focus:ring-0 rounded-b-2xl resize-y"
                            value={jsonText}
                            onChange={handleJsonChange}
                            spellCheck={false}
                          />
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
