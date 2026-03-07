import { FC, useState, useEffect } from 'react';
import { Image as ImageIcon, Send, Instagram, Twitter } from 'lucide-react';
import { useRouter } from 'next/router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImagePosterGenerator from './ImagePosterGenerator';
import TelegramAutomation from './TelegramAutomation';
import InstagramAutomation from './InstagramAutomation';
import XAutomation from './XAutomation';

interface AutomationHeaderProps {
  activeView: string;
  onToggle: (val: string) => void;
}

const AutomationHeader = ({ activeView, onToggle }: AutomationHeaderProps) => (
  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
          Internal Systems
        </span>
      </div>
      <h1 className="text-[22px] font-bold tracking-tight">Automation</h1>
    </div>

    <div className="flex items-center gap-3">
      <Tabs value={activeView} onValueChange={onToggle} className="bg-muted/40 p-1 rounded-xl border border-border/30">
        <TabsList className="bg-transparent border-0 h-9">
          <TabsTrigger value="generator" className="text-xs rounded-lg gap-2 data-[state=active]:bg-card">
            <ImageIcon className="w-3.5 h-3.5" />
            Image Lab
          </TabsTrigger>
          <TabsTrigger value="telegram" className="text-xs rounded-lg gap-2 data-[state=active]:bg-card">
            <Send className="w-3.5 h-3.5" />
            Telegram
          </TabsTrigger>
          <TabsTrigger value="instagram" className="text-xs rounded-lg gap-2 data-[state=active]:bg-card">
            <Instagram className="w-3.5 h-3.5" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="x" className="text-xs rounded-lg gap-2 data-[state=active]:bg-card">
            <Twitter className="w-3.5 h-3.5" />
            Twitter
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </header>
);


const Automation: FC = () => {
  const router = useRouter();
  const { blogId, tab } = router.query;
  const [activeTab, setActiveTab] = useState('generator'); // default to generator
  const [sharedImageAsset, setSharedImageAsset] = useState<string | null>(null);
  const [sharedBlog, setSharedBlog] = useState<any | null>(null);
  const [sharedImageUrl, setSharedImageUrl] = useState<string | null>(null);
  const [fetchedBlog, setFetchedBlog] = useState<any | null>(null);

  useEffect(() => {
    if (tab && typeof tab === 'string' && ['generator', 'telegram', 'instagram', 'x'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (blogId && !fetchedBlog) {
      const fetchBlog = async () => {
        try {
          const res = await fetch(`/api/blogs/${blogId}`);
          const result = await res.json();
          if (result.success && result.data) {
            setFetchedBlog({
              ...result.data,
              thumbnail: result.data?.thumbnail?.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000',
              description: result.data?.thumbnail?.description || result.data?.subtitle
            });
          }
        } catch (error) {
          console.error('Failed to fetch blog for Automation:', error);
        }
      };
      fetchBlog();
    }
  }, [blogId]);

  // Upload image to CDN once and cache the URL for reuse across channels
  const uploadSharedImage = async (base64: string): Promise<string | null> => {
    if (sharedImageUrl && sharedImageAsset === base64) return sharedImageUrl; // same image, already uploaded
    try {
      const res = await fetch('/api/automation/buffer?action=upload_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: base64, image_mime_type: 'image/jpeg' }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        setSharedImageAsset(base64);
        setSharedImageUrl(data.url);
        return data.url;
      }
    } catch (e) {
      console.error('[Automation] CDN upload failed:', e);
    }
    return null;
  };

  const handleShareToInstagram = async (image: string, blog: any) => {
    const cdnUrl = await uploadSharedImage(image);
    setSharedBlog(blog);
    // Pass cdnUrl – if upload failed fall back to raw base64
    setSharedImageUrl(cdnUrl);
    setSharedImageAsset(cdnUrl ?? image);
    setActiveTab('instagram');
  };

  const handleShareToX = async (image: string, blog: any) => {
    const cdnUrl = await uploadSharedImage(image);
    setSharedBlog(blog);
    setSharedImageUrl(cdnUrl);
    setSharedImageAsset(cdnUrl ?? image);
    setActiveTab('x');
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-20 px-2 lg:px-4">
      <AutomationHeader activeView={activeTab} onToggle={setActiveTab} />
      {activeTab === 'telegram' ? (
        <TelegramAutomation initialBlog={fetchedBlog} />
      ) : activeTab === 'instagram' ? (
        <InstagramAutomation
          initialImageAsset={sharedImageUrl ?? sharedImageAsset}
          initialBlog={sharedBlog || fetchedBlog}
        />
      ) : activeTab === 'x' ? (
        <XAutomation initialBlog={sharedBlog || fetchedBlog} initialImageUrl={sharedImageUrl} />
      ) : (
        <ImagePosterGenerator
          onShareToInstagram={handleShareToInstagram}
          onShareToX={handleShareToX}
          initialBlog={fetchedBlog}
        />
      )}
    </div>
  );
};

export default Automation;
