import React, { useState, useEffect } from 'react';
import { Twitter, Info, RefreshCw, CheckCircle2, AlertCircle, Clock, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SearchBlogs from './PosterController';

interface XAutomationProps {
    initialBlog?: any;
    initialImageUrl?: string | null;
}

type PostState = 'idle' | 'posting' | 'success' | 'error';

const X_URL_CHARS = 23; // Twitter t.co shortens all URLs to 23 chars
const X_MAX_CHARS = 260;

const XAutomation: React.FC<XAutomationProps> = ({ initialBlog, initialImageUrl }) => {
    const [selectedBlog, setSelectedBlog] = useState<any>(null);
    const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
    const [postState, setPostState] = useState<PostState>('idle');
    const [postResult, setPostResult] = useState<{ success: boolean; message: string } | null>(null);
    const [tweetText, setTweetText] = useState('');
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState('');
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [profilesWarning, setProfilesWarning] = useState<string | null>(null);

    const BLOG_URL = selectedBlog ? `https://www.thekhabarexpress.com/blog/${selectedBlog.url}` : '';

    // Character count: tweet text + space + link (counted as 23 chars by Twitter)
    const usedChars = tweetText.length + (BLOG_URL ? 1 + X_URL_CHARS : 0);
    const remainingChars = X_MAX_CHARS - usedChars;
    const isOverLimit = remainingChars < 0;
    const charColor = remainingChars <= 20 ? (isOverLimit ? 'text-red-500' : 'text-amber-400') : 'text-muted-foreground';

    const isSending = postState === 'posting';

    const statusLabel = {
        idle: 'Post to X',
        posting: 'Posting...',
        success: 'Posted!',
        error: 'Try Again',
    }[postState];

    const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        setProfilesWarning(null);
        try {
            const response = await fetch(`/api/automation/buffer?action=profiles`);
            const data = await response.json();

            if (Array.isArray(data)) {
                const filtered = data.filter(p => p?.service === 'twitter');
                setProfiles(filtered);
                if (filtered.length > 0) setSelectedProfileId(filtered[0].id);
                else setProfilesWarning('No X accounts found in Buffer. Connect your @khabar_express_ profile.');
            } else if (data.warning) {
                setProfilesWarning(data.warning);
            } else if (data.error) {
                setProfilesWarning(data.error);
            }
        } catch {
            setProfilesWarning('Could not connect to Buffer. Check your network.');
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    const handleSend = async () => {
        if (!selectedProfileId) { toast.error('Please select an X account'); return; }
        if (!selectedBlog) { toast.error('Please select a blog post'); return; }
        if (!tweetText.trim()) { toast.error('Tweet text cannot be empty'); return; }
        if (isOverLimit) { toast.error(`Tweet is ${Math.abs(remainingChars)} chars over the limit`); return; }

        setPostState('posting');
        setPostResult(null);

        try {
            const fullText = `${tweetText}\n\n Read: ${BLOG_URL}`;

            const payload: Record<string, any> = {
                profile_id: selectedProfileId,
                text: fullText,
            };

            // Use poster image (CDN URL) if available, fallback to blog thumbnail
            const imageToUse = customImageUrl || selectedBlog.thumbnail;
            if (imageToUse) {
                payload.image_url = imageToUse;
            }

            const response = await fetch(`/api/automation/buffer?action=create_update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setPostState('success');
                setPostResult({ success: true, message: data.message || 'Successfully posted to X!' });
                toast.success('Published to X!');
            } else {
                setPostState('error');
                const msg = data.error || 'Failed to post. Please try again.';
                setPostResult({ success: false, message: msg });
                toast.error(msg);
            }
        } catch {
            setPostState('error');
            const msg = 'Network error. Please check your connection and try again.';
            setPostResult({ success: false, message: msg });
            toast.error(msg);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    useEffect(() => {
        if (initialBlog) {
            setSelectedBlog(initialBlog);
            // Auto-generate tweet text from blog description
            if (!tweetText) {
                const text = initialBlog.description || initialBlog.subtitle || initialBlog.title || '';
                const maxLen = X_MAX_CHARS - X_URL_CHARS - 4;
                setTweetText(text.length <= maxLen ? text : text.slice(0, maxLen - 3) + '...');
            }
        }
    }, [initialBlog]);

    useEffect(() => {
        if (initialImageUrl) {
            setCustomImageUrl(initialImageUrl);
        }
    }, [initialImageUrl]);

    // Also auto-fill when blog is selected manually
    const handleBlogSelect = (blog: any) => {
        setSelectedBlog(blog);
        const text = blog?.description || blog?.title || '';
        if (text) {
            const maxLen = X_MAX_CHARS - X_URL_CHARS - 4;
            setTweetText(text.length <= maxLen ? text : text.slice(0, maxLen - 3) + '...');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Configuration */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-black/10 text-foreground border border-border/40">
                                    <Twitter className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">X (Twitter)</h2>
                                    <p className="text-xs text-muted-foreground">Publish to @khabar_express_</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={fetchProfiles} disabled={isLoadingProfiles} className="h-8 w-8 rounded-lg">
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProfiles ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Account Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">X Account</label>
                                {isLoadingProfiles ? (
                                    <div className="h-11 rounded-xl bg-muted/20 animate-pulse border border-border/50" />
                                ) : profiles.length > 0 ? (
                                    <select
                                        value={selectedProfileId}
                                        onChange={e => setSelectedProfileId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-medium outline-none transition-all"
                                    >
                                        {profiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.service})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <p className="text-xs text-amber-600 font-medium">{profilesWarning || 'No X accounts found.'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Blog Selection */}
                            <div className="space-y-2">
                                <SearchBlogs onBlogSelect={handleBlogSelect} showTemplates={false} />
                                {selectedBlog && (
                                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                                            <img src={selectedBlog.thumbnail} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{selectedBlog.title}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{selectedBlog.author}</p>
                                        </div>
                                    </div>
                                )}
                                {customImageUrl && (
                                    <div className="mt-2 p-3 rounded-lg bg-black/5 border border-black/10 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-black overflow-hidden flex-shrink-0">
                                            <img src={customImageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold">Image Lab poster</p>
                                            <button onClick={() => setCustomImageUrl(null)} className="text-[10px] text-muted-foreground hover:text-red-500 transition-colors">Remove → use blog thumbnail</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tweet Text */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Tweet Text</label>
                                    <span className={`text-xs font-bold tabular-nums transition-colors ${charColor}`}>
                                        {remainingChars}
                                    </span>
                                </div>
                                <textarea
                                    rows={4}
                                    placeholder="Write your tweet..."
                                    value={tweetText}
                                    onChange={e => setTweetText(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/20 hover:border-border/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-medium transition-all outline-none resize-none"
                                />
                                {selectedBlog && (
                                    <div className="flex items-center gap-2 pl-1">
                                        <LinkIcon className="w-3 h-3 text-muted-foreground/50" />
                                        <span className="text-[10px] text-muted-foreground/60 truncate">
                                            Link auto-appended (~{X_URL_CHARS} chars via t.co)
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Result */}
                            {postResult && (
                                <div className={`p-4 rounded-xl border flex items-start gap-3 ${postResult.success
                                    ? 'bg-green-500/5 border-green-500/20 text-green-600'
                                    : 'bg-red-500/5 border-red-500/20 text-red-600'}`}
                                >
                                    {postResult.success
                                        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    }
                                    <p className="text-xs font-medium leading-relaxed">{postResult.message}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleSend}
                                disabled={isSending || !selectedBlog || !selectedProfileId || isOverLimit || !tweetText.trim()}
                                className="w-full gap-2 rounded-xl h-11 bg-black hover:bg-black/80 border-0 shadow-lg text-white font-bold disabled:opacity-60"
                            >
                                {isSending ? <Clock className="w-4 h-4 animate-pulse" /> : <Twitter className="w-4 h-4" />}
                                {statusLabel}
                            </Button>
                        </div>
                    </div>

                    {/* Info tip */}
                    <div className="p-6 bg-foreground/5 rounded-2xl border border-border/30 flex items-start gap-4">
                        <div className="bg-foreground/10 p-2 rounded-lg flex-shrink-0">
                            <Info className="w-4 h-4 text-foreground/60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold">Buffer Integration</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Tweets are queued via <b>Buffer</b>. Ensure your X account is connected at{' '}
                                <a
                                    href="https://publish.buffer.com/channels/69ac33f23f3b94a121268e08/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline underline-offset-2"
                                >
                                    Buffer → Channels
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <div className="sticky top-6">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Twitter className="w-3.5 h-3.5" />
                                Tweet Preview
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">X Feed View</span>
                        </div>

                        {/* Twitter-style preview card */}
                        <div className="bg-black rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-w-[700px]">
                            {/* Header */}
                            <div className="px-5 pt-5 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex-shrink-0 overflow-hidden border border-white/10">
                                    <img src="https://thekhabarexpress.com/favicon.ico" alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[13px] font-bold text-white">The Khabar Express</span>
                                        <svg className="w-3.5 h-3.5 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1-2.52-1.27-3.91-.81-.67-1.31-1.91-2.19-3.34-2.19-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1 1.01-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1 2.52 1.27 3.91.81.67 1.31 1.91 2.19 3.34 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1-1.01 1.27-2.52.81-3.91 1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/>
                                        </svg>
                                    </div>
                                    <div className="text-[11px] text-white/50">@khabar_express_</div>
                                </div>
                                <div className="text-white/30">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </div>
                            </div>

                            {/* Tweet body */}
                            <div className="px-5 pt-3 pb-3">
                                {tweetText ? (
                                    <p className="text-[14px] text-white leading-relaxed whitespace-pre-wrap break-words">
                                        {tweetText}
                                        {BLOG_URL && (
                                            <><br /><br /><span className="text-[#1d9bf0]">thekhabarexpress.com/blog/…</span></>
                                        )}
                                    </p>
                                ) : (
                                    <p className="text-[14px] text-white/30 italic">Your tweet will appear here...</p>
                                )}
                            </div>

                            {/* Link card preview — shows custom poster or blog thumbnail */}
                            {(customImageUrl || selectedBlog) && (
                                <div className="mx-5 mb-4 rounded-2xl border border-white/10 overflow-hidden">
                                    {(customImageUrl || selectedBlog?.thumbnail) && (
                                        <div className="aspect-[2/1] overflow-hidden relative">
                                            <img src={customImageUrl || selectedBlog.thumbnail} alt="" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
                                            {customImageUrl && (
                                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">IMAGE LAB</div>
                                            )}
                                        </div>
                                    )}
                                    {selectedBlog && (
                                        <div className="px-4 py-3 bg-white/5">
                                            <p className="text-[11px] text-white/40 uppercase tracking-wider mb-0.5">thekhabarexpress.com</p>
                                            <p className="text-[13px] font-semibold text-white line-clamp-2 leading-snug">{selectedBlog?.title}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-5 pb-4 flex items-center justify-between text-white/30">
                                <div className="flex items-center gap-5 text-[12px]">
                                    {/* Reply icon */}
                                    <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
                                        <span>Reply</span>
                                    </button>
                                    {/* Repost icon */}
                                    <button className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>
                                        <span>Repost</span>
                                    </button>
                                    {/* Like icon */}
                                    <button className="flex items-center gap-1.5 hover:text-pink-400 transition-colors">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                                        <span>Like</span>
                                    </button>
                                </div>
                                <span className="text-[11px]">Just now</span>
                            </div>
                        </div>

                        <p className="text-[10px] text-center text-muted-foreground/40 mt-4 italic">
                            Preview may differ slightly from the live tweet. Link card depends on X's crawler.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default XAutomation;
