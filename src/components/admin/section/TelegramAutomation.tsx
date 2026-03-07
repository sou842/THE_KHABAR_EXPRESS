import React, { useState } from 'react';
import { Send, Bot, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SearchBlogs from './PosterController'; // Reusing the blog search logic
import { useEffect } from 'react';

interface TelegramAutomationProps {
    initialBlog?: any;
}

const TelegramAutomation: React.FC<TelegramAutomationProps> = ({ initialBlog }) => {
    const [selectedBlog, setSelectedBlog] = useState<any>(null);
    const [channelId, setChannelId] = useState('@the_khabar_express_news');
    const [isSending, setIsSending] = useState(false);
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        if (initialBlog) {
            setSelectedBlog(initialBlog);
        }
    }, [initialBlog]);

    const BOT_TOKEN = '8622451212:AAFGMHRiifGjwgJIcSYon_wyNxT9KRim5qY';

    const handleSend = async () => {
        if (!channelId) {
            toast.error('Please enter a Channel ID (e.g., @yourchannel)');
            return;
        }

        if (!selectedBlog) {
            toast.error('Please select a blog post first');
            return;
        }

        setIsSending(true);
        try {
            const caption = `${customMessage || `<b>${selectedBlog?.title}</b>\n\n${selectedBlog?.description || ''}`}\n\n Read more: https://www.thekhabarexpress.com/blog/${selectedBlog?.url}`;

            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: channelId,
                    photo: selectedBlog.thumbnail,
                    caption: caption,
                    parse_mode: 'HTML',
                }),
            });

            const data = await response.json();

            if (data.ok) {
                toast.success('Message sent to Telegram successfully!');
            } else {
                throw new Error(data.description || 'Failed to send message');
            }
        } catch (err: any) {
            console.error('Telegram Error:', err);
            let errorMessage = err.message;
            if (errorMessage.includes('chat not found')) {
                errorMessage = 'Channel not found. Ensure the ID is correct and the bot is an admin in the channel.';
            } else if (errorMessage.includes('bot was kicked')) {
                errorMessage = 'Bot was removed from the channel. Please add it back as an admin.';
            }
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Configuration */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                    <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight">Telegram Bot</h2>
                                <p className="text-xs text-muted-foreground">Broadcast updates to your subscribers</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Blog Selection */}
                            <div className="space-y-2">
                                <SearchBlogs 
                                    onBlogSelect={setSelectedBlog} 
                                    showTemplates={false}
                                />
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

                            {/* Channel Config */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1 flex items-center justify-between">
                                    Channel ID
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="@username or -100xxxxxxxx"
                                    value={channelId}
                                    disabled={true}
                                    onChange={(e) => setChannelId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/20 hover:border-border/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-medium transition-all outline-none"
                                />
                            </div>

                            {/* Custom Message */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">Description (Optional)</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Add a custom intro or description..."
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/20 hover:border-border/70 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-medium transition-all outline-none resize-none"
                                />
                            </div>

                            <Button 
                                onClick={handleSend}
                                disabled={isSending || !selectedBlog || !channelId}
                                className="w-full gap-2 rounded-xl h-11 bg-blue-500 hover:bg-blue-600 border-0 shadow-lg shadow-blue-500/20"
                            >
                                <Send className="w-4 h-4" />
                                {isSending ? 'Sending...' : 'Broadcast to Channel'}
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-4">
                        <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                            <Info className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold">Bot Permissions</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Your bot must have <span className="text-blue-500 font-semibold">Post Messages</span> permissions in the target channel to function.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <div className="sticky top-6">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-500">
                                <Send className="w-3.5 h-3.5" />
                                Message Preview
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Bot Output</span>
                            </div>
                        </div>

                        <div className="bg-[#1c242f] rounded-[2rem] p-6 border border-[#2a3441] shadow-2xl relative overflow-hidden min-h-[400px]">
                            {/* Mock Telegram Header */}
                            <div className="flex items-center gap-4 border-b border-[#2a3441] pb-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#3096e5] flex items-center justify-center font-bold text-white text-lg">K</div>
                                <div className="flex-1">
                                    <div className="text-[13px] font-bold text-white leading-none">The Khabar Express</div>
                                    <div className="text-[11px] text-[#4ea4e8] mt-1">channel subscriber</div>
                                </div>
                                <button className="p-2 text-[#4ea4e8]">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Message Bubble */}
                            <div className="space-y-4">
                                {selectedBlog ? (
                                    <div className="bg-[#242f3d] rounded-2xl rounded-tl-none p-4 shadow-sm border border-[#2d3a4b] max-w-[85%] animate-in slide-in-from-left-2 fade-in duration-300">
                                        <div className="space-y-3">
                                            {/* Preview Image */}
                                            <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/5 bg-black">
                                                <img src={selectedBlog?.thumbnail || ''} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">New Article</p>
                                                <p className="text-sm font-bold text-white leading-tight">
                                                    {selectedBlog?.title || ''}
                                                </p>
                                                <p className="text-xs text-[#beccd7] leading-relaxed line-clamp-3">{selectedBlog?.description || ''}</p>
                                                <p className="text-xs text-[#beccd7] leading-relaxed line-clamp-3">
                                                    {customMessage || selectedBlog?.subtitle || selectedBlog?.excerpt || "Click the link below to read the full story."}
                                                </p>
                                            </div>

                                            <div className="pt-2 flex items-center gap-2 border-t border-white/5">
                                                <span className="text-[10px] text-blue-400 font-bold">READ FULL STORY ➜</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-1">
                                            <span className="text-[9px] text-white/40">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[200px] text-center gap-4 opacity-30">
                                        <Bot className="w-12 h-12 text-white" strokeWidth={1} />
                                        <p className="text-xs text-white max-w-[150px]">Select a blog post to see how it looks in Telegram</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 px-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[10px] font-medium text-muted-foreground">Premium design applied (HTML supported)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelegramAutomation;
