import React, { useState, useRef, FC, RefObject } from 'react';
import { Bot, Image as ImageIcon, Download, Layout, Sparkles, X, Instagram } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TemplateRenderer } from './PosterTemplates';


import PosterController from './PosterController';

interface TemplateRendererProps {
  blog: any;
  templateId: string;
  previewRef: RefObject<HTMLDivElement | null>;
}

const PosterPreview: FC<TemplateRendererProps> = ({ blog, templateId, previewRef }) => {
  if (!blog) return (
    <div className="w-full aspect-[4/5] bg-muted/20 border border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center text-center p-8">
      <ImageIcon className="w-12 h-12 text-muted-foreground/20 mb-4" strokeWidth={1} />
      <p className="text-sm font-medium text-muted-foreground/40">Select a blog post to preview</p>
    </div>
  );

  return (
    <div 
      ref={previewRef}
      className="w-full aspect-[4/5] bg-black shadow-2xl rounded-xl overflow-hidden"
    >
      <TemplateRenderer blog={blog} templateId={templateId} />
    </div>
  );
};


interface ImagePosterGeneratorProps {
  onShareToInstagram?: (image: string, blog: any) => void;
}

const ImagePosterGenerator: FC<ImagePosterGeneratorProps> = ({ onShareToInstagram }) => {
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState('breaking-news');
  const previewRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = async () => {
    if (!previewRef.current || !selectedBlog) return;
    
    setIsGenerating(true);
    try {
      // Small delay to ensure any pending renders are complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        // Critical for cross-domain images
        includeQueryParams: true,
        // BUGFIX: Skips font embedding to avoid "font is undefined" runtime error
        skipFonts: true,
        // Ensure standard fonts are used as fallback
        style: {
          fontFamily: 'sans-serif',
        },
      });
      
      const link = document.createElement('a');
      link.download = `poster-${selectedBlog.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Professional poster downloaded!');
    } catch (err: any) {
      console.error('Image Generation Error:', err);
      toast.error(`Export failed: ${err.message || 'Possible CORS issue'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!previewRef.current || !selectedBlog || !onShareToInstagram) return;
    
    setIsSharing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toJpeg(previewRef.current, {
        quality: 0.8,
        pixelRatio: 2,
        cacheBust: true,
        includeQueryParams: true,
        skipFonts: true,
        style: {
          fontFamily: 'sans-serif',
        },
      });
      
      if (dataUrl) {
        onShareToInstagram(dataUrl, selectedBlog);
      } else {
        throw new Error('Failed to generate image data url');
      }
    } catch (err: any) {
      console.error('Share to Instagram Error:', err);
      toast.error(`Share failed: ${err.message || 'Possible CORS issue'}`);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex gap-8 items-start">
        {/* Left Side: Controls */}
        <div className="max-w-[400px] space-y-8">
           <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                   <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Design Lab</h2>
                  <p className="text-xs text-muted-foreground">Configure your blog poster assets</p>
                </div>
              </div>

              <PosterController 
                onBlogSelect={setSelectedBlog} 
                onTemplateChange={setCurrentTemplate}
                currentTemplate={currentTemplate}
              />
           </div>

           <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                 <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-sm font-bold">Pro Tip</h3>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   Use the "Breaking News" template for urgent alerts and "Instagram Story" for high-engagement social updates.
                 </p>
              </div>
           </div>
        </div>

        {/* Right Side: Preview & Download */}
        <div className="w-full lg:col-span-7 space-y-6">
           <div className="sticky top-6">
              <div className="flex items-center justify-between mb-4 px-2">
                 <h3 className="text-sm font-semibold flex items-center gap-2">
                   Live Preview
                   <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                 </h3>
                 <div className="flex gap-2">
                   <Button 
                     onClick={handleShare} 
                     disabled={!selectedBlog || isGenerating || isSharing}
                     className="gap-2 rounded-xl h-9 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:from-purple-600 focus:to-pink-600 text-white border-0"
                   >
                     <Instagram className="w-3.5 h-3.5" />
                     {isSharing ? 'Preparing...' : 'Share to Instagram'}
                   </Button>
                   <Button 
                     onClick={handleDownload} 
                     disabled={!selectedBlog || isGenerating || isSharing}
                     variant="outline"
                     className="gap-2 rounded-xl h-9 text-xs bg-card hover:bg-muted"
                   >
                     <Download className="w-3.5 h-3.5" />
                     {isGenerating ? 'Exporting...' : 'Save PNG'}
                   </Button>
                 </div>
              </div>

              <div className="relative group p-4 bg-muted/30 border border-border/40 rounded-2xl">
                <PosterPreview 
                  blog={selectedBlog} 
                  templateId={currentTemplate} 
                  previewRef={previewRef}
                />
                
                {selectedBlog && (
                  <button 
                    onClick={() => setSelectedBlog(null)}
                    className="absolute top-8 right-8 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <p className="text-[10px] text-center text-muted-foreground/60 mt-4 italic">
                Rendered at 2x resolution for printing and high-quality social sharing.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePosterGenerator;
