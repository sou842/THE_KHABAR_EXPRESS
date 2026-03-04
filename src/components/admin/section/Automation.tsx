import { FC, useState } from 'react';
import { Bot, Zap, Sparkles, Activity, Plus, Play, Pause, Trash2, Settings2, Image as ImageIcon, Send, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ImagePosterGenerator from './ImagePosterGenerator';
import TelegramAutomation from './TelegramAutomation';
import InstagramAutomation from './InstagramAutomation';

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
          </TabsList>
       </Tabs>
    </div>
  </header>
);


const Automation: FC = () => {
  const [activeTab, setActiveTab] = useState('generator'); // default to generator
  const [sharedImageAsset, setSharedImageAsset] = useState<string | null>(null);
  const [sharedBlog, setSharedBlog] = useState<any | null>(null);

  const handleShareToInstagram = (image: string, blog: any) => {
    setSharedImageAsset(image);
    setSharedBlog(blog);
    setActiveTab('instagram');
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-20 px-2 lg:px-4">
      <AutomationHeader activeView={activeTab} onToggle={setActiveTab} />
      {activeTab === 'telegram' ? (
        <TelegramAutomation />
      ) : activeTab === 'instagram' ? (
        <InstagramAutomation 
          initialImageAsset={sharedImageAsset} 
          initialBlog={sharedBlog} 
        />
      ) : (
        <ImagePosterGenerator onShareToInstagram={handleShareToInstagram} />
      )}
    </div>
  );
};

export default Automation;
