import { FC, useState } from 'react';
import { Bot, Zap, Sparkles, Activity, Plus, Play, Pause, Trash2, Settings2, Image as ImageIcon, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ImagePosterGenerator from './ImagePosterGenerator';

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
             <TabsTrigger value="overview" className="text-xs rounded-lg gap-2 data-[state=active]:bg-card">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Workflow
             </TabsTrigger>
             <TabsTrigger value="generator" className="text-xs rounded-lg gap-2 data-[state=active]:bg-card">
                <ImageIcon className="w-3.5 h-3.5" />
                Image Lab
             </TabsTrigger>
          </TabsList>
       </Tabs>
    </div>
  </header>
);

interface WorkflowCardProps {
  title: string;
  description: string;
  status: 'active' | 'paused' | 'failed';
  lastRun: string;
}

const WorkflowCard = ({ title, description, status, lastRun }: WorkflowCardProps) => (
  <Card className="bg-card border-border/40 hover:border-border/70 transition-all duration-200">
    <CardHeader className="pb-3 px-5">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Bot className="w-4 h-4 text-primary" strokeWidth={1.5} />
        </div>
        <Badge variant={status === 'active' ? 'default' : status === 'paused' ? 'secondary' : 'destructive'} className="text-[10px] font-medium px-2 py-0 border-0">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
      <CardTitle className="text-sm font-semibold mt-3">{title}</CardTitle>
      <CardDescription className="text-xs line-clamp-2 mt-1">{description}</CardDescription>
    </CardHeader>
    <CardContent className="px-5 pb-5">
      <div className="flex items-center justify-between pt-4 border-t border-border/10">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Last run: {lastRun}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-muted">
            {status === 'active' ? <Pause className="w-3.5 h-3.5 text-muted-foreground" /> : <Play className="w-3.5 h-3.5 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:text-destructive hover:bg-destructive/5">
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground/60" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Automation: FC = () => {
  const [activeTab, setActiveTab] = useState('generator');
  
  const workflows = [
    {
      title: "Blog Auto-Summarizer",
      description: "Automatically generates meta descriptions and summaries for new blog posts using AI.",
      status: 'active' as const,
      lastRun: "2 hours ago"
    },
    {
      title: "Social Media Cross-Poster",
      description: "Shares approved blog posts across Twitter, LinkedIn, and Facebook automatically.",
      status: 'paused' as const,
      lastRun: "1 day ago"
    },
    {
      title: "Spam Comment Filter",
      description: "Analyzes and flags potentially spammy comments on news articles in real-time.",
      status: 'active' as const,
      lastRun: "15 mins ago"
    }
  ];

  return (
    <div className="max-w-[1440px] mx-auto pb-20 px-2 lg:px-4">
      <AutomationHeader activeView={activeTab} onToggle={setActiveTab} />

      {activeTab === 'overview' ? (
        <div className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="group relative bg-card border border-border/40 rounded-2xl p-6 hover:border-border/70 transition-all shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1">Active Workflows</p>
              <p className="text-3xl font-black tracking-tighter">12</p>
              <Zap className="absolute top-6 right-6 w-5 h-5 text-primary/30" />
            </div>
            <div className="group relative bg-card border border-border/40 rounded-2xl p-6 hover:border-border/70 transition-all shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1">Total Executions</p>
              <p className="text-3xl font-black tracking-tighter">1,284</p>
              <Activity className="absolute top-6 right-6 w-5 h-5 text-primary/30" />
            </div>
            <div className="group relative bg-card border border-border/40 rounded-2xl p-6 hover:border-border/70 transition-all shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1">AI Tokens Used</p>
              <p className="text-3xl font-black tracking-tighter">45.2k</p>
              <Sparkles className="absolute top-6 right-6 w-5 h-5 text-primary/30" />
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Workflow Pipeline
            </h2>
            <Button size="sm" variant="ghost" className="text-xs h-8 gap-1 rounded-lg">
              <Plus className="w-3.5 h-3.5" /> New Agent
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((wf, i) => (
              <WorkflowCard key={i} {...wf} />
            ))}
          </div>

          <div className="mt-16 p-12 border border-dashed border-border/40 rounded-[2rem] flex flex-col items-center justify-center text-center bg-muted/5">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border/40 flex items-center justify-center mb-6 shadow-sm">
              <Bot className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight">Advanced Automation Engine</h3>
            <p className="text-sm text-muted-foreground max-w-[400px] leading-relaxed mb-6">
              Our advanced engine can handle complex multi-step workflows. Connect your API keys to unlock full potential.
            </p>
            <div className="flex items-center gap-3">
               <Button variant="default" className="text-xs h-9 rounded-xl px-6">Connect API Keys</Button>
               <Button variant="outline" className="text-xs h-9 rounded-xl px-6">View Docs</Button>
            </div>
          </div>
        </div>
      ) : (
        <ImagePosterGenerator />
      )}
    </div>
  );
};

export default Automation;
