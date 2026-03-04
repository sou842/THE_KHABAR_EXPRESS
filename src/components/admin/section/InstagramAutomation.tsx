import React, { useState, useEffect } from 'react';
import { Instagram, Send, Bot, Info, RefreshCw, Plus, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SearchBlogs from './PosterController';

interface InstagramAutomationProps {
    initialImageAsset?: string | null;
    initialBlog?: any;
}

type PostState = 'idle' | 'uploading' | 'posting' | 'success' | 'error';

const InstagramAutomation: React.FC<InstagramAutomationProps> = ({ initialImageAsset, initialBlog }) => {
    const [selectedBlog, setSelectedBlog] = useState<any>(null);
    const [postState, setPostState] = useState<PostState>('idle');
    const [postResult, setPostResult] = useState<{ success: boolean; message: string } | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState('');
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [profilesWarning, setProfilesWarning] = useState<string | null>(null);
    const [hashtags, setHashtags] = useState<string[]>(['the_khabar_express', 'news', 'india']);
    const [tagInput, setTagInput] = useState('');
    const [customAsset, setCustomAsset] = useState<string | null>(null);
    const isSending = postState === 'uploading' || postState === 'posting';

    const statusLabel = {
        idle: 'Share to Instagram',
        uploading: 'Uploading image...',
        posting: 'Sharing to Instagram...',
        success: 'Shared!',
        error: 'Try Again',
    }[postState];

    const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        setProfilesWarning(null);
        try {
            const response = await fetch(`/api/automation/buffer?action=profiles`);
            const data = await response.json();

            if (Array.isArray(data)) {
                const filtered = data.filter(p => p?.service === 'instagram');
                setProfiles(filtered);
                if (filtered.length > 0) setSelectedProfileId(filtered[0].id);
                else setProfilesWarning('No Instagram accounts found in Buffer.');
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

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ' ') && tagInput.trim()) {
            e.preventDefault();
            const tag = tagInput.trim().replace(/^#/, '').replace(/\s+/g, '_');
            if (tag && !hashtags.includes(tag)) setHashtags(prev => [...prev, tag]);
            setTagInput('');
        }
    };

    const handleSend = async () => {
        if (!selectedProfileId) { toast.error('Please select an Instagram account'); return; }
        if (!selectedBlog) { toast.error('Please select a blog post'); return; }

        setPostState(customAsset ? 'uploading' : 'posting');
        setPostResult(null);

        try {
            const tagString = hashtags.length > 0 ? '\n\n' + hashtags.map(t => `#${t}`).join(' ') : '';
            const text = `${customMessage || `${selectedBlog.title}\n\n${selectedBlog.description || ''}`}\n\nRead more at thekhabarexpress.com/blog/${selectedBlog.url}${tagString}`;

            const payload: Record<string, any> = { profile_id: selectedProfileId, text };

            if (customAsset) {
                payload.image_data = customAsset;
                payload.image_mime_type = 'image/jpeg';
            } else if (selectedBlog.thumbnail) {
                payload.image_url = selectedBlog.thumbnail;
            }

            setPostState('posting');

            const response = await fetch(`/api/automation/buffer?action=create_update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setPostState('success');
                setPostResult({ success: true, message: data.message || 'Successfully shared to Instagram!' });
                toast.success('Post shared to Instagram!');
            } else {
                // API returned a structured error — show it clearly, don't crash
                setPostState('error');
                const msg = data.error || 'Failed to share post. Please try again.';
                setPostResult({ success: false, message: msg });
                toast.error(msg);
            }
        } catch {
            // Network failure — page stays functional
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
        if (initialBlog) setSelectedBlog(initialBlog);
        if (initialImageAsset) {
            setCustomAsset(initialImageAsset);
            toast.info('Loaded custom poster from Image Lab');
        }
    }, [initialBlog, initialImageAsset]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                                    <Instagram className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">Instagram Automation</h2>
                                    <p className="text-xs text-muted-foreground">Via Buffer API</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={fetchProfiles} disabled={isLoadingProfiles} className="h-8 w-8 rounded-lg">
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProfiles ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Account */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">Instagram Account</label>
                                {isLoadingProfiles ? (
                                    <div className="h-11 rounded-xl bg-muted/20 animate-pulse border border-border/50" />
                                ) : profiles.length > 0 ? (
                                    <select
                                        value={selectedProfileId}
                                        onChange={e => setSelectedProfileId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-medium outline-none transition-all"
                                    >
                                        {profiles?.map(p => (
                                            <option key={p?.id} value={p?.id}>{p?.name} ({p?.service})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <p className="text-xs text-amber-600 font-medium">{profilesWarning || 'No Instagram accounts found.'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Blog */}
                            <div className="space-y-2">
                                <SearchBlogs onBlogSelect={setSelectedBlog} showTemplates={false} />
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
                            </div>

                            {/* Caption */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">Caption</label>
                                <textarea
                                    rows={4}
                                    placeholder="Write your Instagram caption..."
                                    value={customMessage}
                                    onChange={e => setCustomMessage(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/20 hover:border-border/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-medium transition-all outline-none resize-none"
                                />
                            </div>

                            {/* Hashtags */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">Hashtags</label>
                                <div className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/20 flex flex-wrap gap-2 min-h-[46px]">
                                    {hashtags?.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 text-[11px] font-bold">
                                            #{tag}
                                            <button onClick={() => setHashtags(p => p?.filter(t => t !== tag))} className="text-pink-400 hover:text-pink-600 ml-0.5">&times;</button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder={hashtags.length === 0 ? 'Type a tag and press Enter...' : 'Add more...'}
                                        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground pl-1">Press Enter or Space to add a tag</p>
                            </div>

                            {/* Result banner */}
                            {postResult && (
                                <div className={`p-4 rounded-xl border flex items-start gap-3 ${postResult.success
                                    ? 'bg-green-500/5 border-green-500/20 text-green-600'
                                    : 'bg-red-500/5 border-red-500/20 text-red-600'
                                    }`}>
                                    {postResult.success
                                        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    }
                                    <p className="text-xs font-medium leading-relaxed">{postResult.message}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleSend}
                                disabled={isSending || !selectedBlog || !selectedProfileId}
                                className="w-full gap-2 rounded-xl h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg shadow-pink-500/20 text-white font-bold disabled:opacity-60"
                            >
                                {isSending ? <Clock className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
                                {statusLabel}
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 bg-pink-500/5 rounded-2xl border border-pink-500/10 flex items-start gap-4">
                        <div className="bg-pink-500/20 p-2 rounded-lg flex-shrink-0">
                            <Info className="w-4 h-4 text-pink-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold">Buffer Integration</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Posts are queued via Buffer. Ensure your Instagram account is connected as a <b>Business or Creator Account</b> for automatic publishing.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <div className="sticky top-6">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-pink-500">
                                <Instagram className="w-3.5 h-3.5" />
                                Instagram Preview
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Mobile Feed View</span>
                        </div>

                        <div className="max-w-[380px] mx-auto bg-card rounded-[2.5rem] border-[8px] border-muted shadow-2xl overflow-hidden aspect-[9/19] relative">
                            <div className="px-4 py-3 flex items-center gap-3 border-b border-border/10">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                                    <div className="w-full h-full rounded-full bg-card border-2 border-card overflow-hidden">
                                        <img src="https://thekhabarexpress.com/favicon.ico" alt="" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold">the_khabar_express</p>
                                    <p className="text-[9px] text-muted-foreground">Sponsored</p>
                                </div>
                                <Bot className="w-4 h-4" />
                            </div>

                            <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                                {customAsset || selectedBlog?.thumbnail ? (
                                    <img src={customAsset || selectedBlog.thumbnail} alt="" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
                                ) : (
                                    <Instagram className="w-12 h-12 text-muted-foreground/20" strokeWidth={1} />
                                )}
                            </div>

                            <div className="p-3 flex items-center gap-4">
                                <Instagram className="w-5 h-5" />
                                <div className="w-5 h-5 rounded-full border-2 border-foreground" />
                                <Send className="w-5 h-5" />
                                <div className="h-5 w-5 rounded border-2 border-foreground" />
                            </div>

                            <div className="px-3 space-y-1">
                                <p className="text-[11px] font-bold">128 likes</p>
                                <div className="text-[11px] leading-relaxed">
                                    <span className="font-bold mr-2">the_khabar_express</span>
                                    {customMessage || (selectedBlog ? `${selectedBlog?.title}...` : 'Select a blog to preview caption.')}
                                    {hashtags?.length > 0 && (
                                        <span className="text-pink-400"> {hashtags?.map(t => `#${t}`)?.join(' ')}</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">View all 12 comments</p>
                                <p className="text-[8px] text-muted-foreground uppercase mt-1 tracking-wider">Just now</p>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-border/10 flex items-center justify-around bg-card">
                                <div className="w-5 h-5 rounded bg-foreground/10" />
                                <div className="w-5 h-5 rounded bg-foreground/10" />
                                <Plus className="w-5 h-5" />
                                <div className="w-5 h-5 rounded bg-foreground/10" />
                                <div className="w-6 h-6 rounded-full border-2 border-foreground/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramAutomation;