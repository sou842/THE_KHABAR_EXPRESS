import DateTimeDisplay from '@/components/DateTimeDisplay';
import { ChevronRight, Quote, Instagram, Zap, Layout, BookOpen, Newspaper, Users, Columns, LayoutGrid, FileText } from 'lucide-react';

export interface PosterTemplate {
  id: string;
  name: string;
  style: string;
  icon: any;
}

export const posterTemplates: PosterTemplate[] = [
  { id: 'breaking-news', name: 'Breaking News', style: 'bg-red-700', icon: Zap },
  { id: 'instagram-story', name: 'Instagram Story', style: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500', icon: Instagram },
  { id: 'split-profile', name: 'Split Profile', style: 'bg-orange-500', icon: Users },
  { id: 'editorial-panel', name: 'Editorial Panel', style: 'bg-white', icon: Columns },
  { id: 'accent-sidebar', name: 'Accent Sidebar', style: 'bg-zinc-900', icon: LayoutGrid },
  { id: 'modern-minimal', name: 'Modern Minimal', style: 'bg-zinc-50 text-black border', icon: FileText },
  { id: 'quote-style', name: 'Quote Style', style: 'bg-slate-800', icon: Quote },
];

interface TemplateRendererProps {
  templateId: string;
  blog: any;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateId, blog }) => {
  if (!blog) return null;

  console.log(blog, "tara")

  switch (templateId) {
    case 'breaking-news':
      return (
        <div className="relative w-full h-full bg-black flex flex-col overflow-hidden font-sans group">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={blog?.thumbnail} 
              alt="" 
              crossOrigin="anonymous"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
          <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                <span className="text-xs text-white font-bold tracking-normal uppercase">Unlimited</span>
             </div>
          </div>
          <div className="absolute top-1/2 -translate-y-24 left-0 right-0 z-20 px-8">
              <div className="inline-block bg-[#E11D48] text-white px-6 py-2 transform -skew-x-12 shadow-xl">
                 <h2 className="text-4xl font-extrabold tracking-tighter uppercase transform skew-x-12 italic">Breaking News</h2>
              </div>
          </div>
          <div className="mt-auto p-10 z-20 space-y-4">
             <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
               {blog?.title}
             </h1>
             <p className="text-sm text-gray-200 line-clamp-3 leading-relaxed border-l-2 border-[#E11D48] pl-4 italic">
               {blog?.subtitle || blog?.excerpt || "Explore the latest developments in this exclusive report from Khabar Express."}
             </p>
             <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#E11D48] font-bold uppercase tracking-widest">Reporter</span>
                  <span className="text-xs text-white font-medium">{blog?.author || "Khabar Team"}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">khabarexpress.com</div>
             </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#E11D48]" />
        </div>
      );
    
    case 'instagram-story':
      return (
        <div className="relative w-full h-full bg-slate-100 flex flex-col overflow-hidden font-sans">
           <div className="absolute inset-0 w-full h-full">
             <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
           </div>
           <div className="p-8 flex flex-col h-full z-10 justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full border-2 border-[#E11D48] p-0.5">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-[#E11D48] text-xs">K</div>
                 </div>
                 <div>
                    <div className="text-sm font-bold text-white">khabarexpress</div>
                    <div className="text-[10px] text-white/70">Jakarta, Indonesia</div>
                 </div>
              </div>
              <div className="space-y-4 text-center">
                 <div className="bg-[#E11D48] text-white text-[12px] font-bold py-1 px-3 inline-block rounded-sm uppercase tracking-wider">
                    {blog?.category || "General"}
                 </div>
                 <h1 className="text-5xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                    {blog?.title}
                 </h1>
              </div>
              <div className="flex justify-center flex-col items-center gap-3 text-white">
                 <ChevronRight className="w-5 h-5 animate-bounce rotate-90" />
                 <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Swipe Up to Read</span>
              </div>
           </div>
        </div>
      );

    case 'split-profile':
      return (
        <div className="relative w-full h-full flex font-sans overflow-hidden">
           <div className="w-[45%] bg-[#F96D2D] p-8 flex flex-col justify-between text-white relative z-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                       <span className="text-[10px] text-[#F96D2D] font-bold italic">K</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Khabar Express</span>
                 </div>
                 <h1 className="text-3xl font-black leading-[0.9] uppercase tracking-tighter mt-12">
                   {blog?.title}
                 </h1>
                 <p className="text-xs opacity-90 leading-relaxed line-clamp-6 font-medium">
                   {blog?.description || ''}
                 </p>
              </div>
              <div className="flex flex-col gap-1 border-t border-white/20 pt-4">
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{blog?.author || "Khabar Team"}</span>
                 <span className="text-[8px] opacity-60 uppercase tracking-widest">Khabar Editor-in-Chief</span>
              </div>
           </div>
           <div className="flex-1 relative">
              <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F96D2D]/20 to-transparent" />
           </div>
        </div>
      );

    case 'editorial-panel':
      return (
        <div className="relative w-full h-full overflow-hidden flex font-serif">
           <div className="absolute inset-0">
              <img src={blog.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30" />
           </div>
           <div className="relative z-10 ml-auto w-[40%] bg-white p-8 flex flex-col h-full shadow-[-20px_0_50px_rgba(0,0,0,0.3)]">
              <div className="mb-4">
                 <span className="text-[10px] font-bold text-[#F96D2D] uppercase tracking-widest">Property News</span>
                 <div className="h-0.5 w-8 bg-black mt-1" />
              </div>
              <h1 className="text-3xl font-bold text-black leading-tight flex-1 mt-4">
                 {blog?.title}
              </h1>
              <div className="space-y-4">
                 <p className="text-xs text-zinc-500 font-sans leading-relaxed line-clamp-5">
                   {blog?.description || blog?.subtitle}
                 </p>
                 <div className="flex flex-col pt-6 border-t border-zinc-100">
                    <span className="text-[10px] font-bold text-black uppercase tracking-widest">@socialmedia</span>
                    <span className="text-[10px] text-zinc-400 font-sans mt-0.5 whitespace-nowrap overflow-hidden">www.khabarexpress.com</span>
                 </div>
              </div>
           </div>
        </div>
      );

    case 'accent-sidebar':
      return (
        <div className="relative w-full h-full bg-zinc-900 flex font-sans overflow-hidden">
           <div className="w-16 bg-[#F96D2D] flex items-center justify-center border-r border-white/10 shrink-0">
              <span className="rotate-[-90deg] whitespace-nowrap text-white text-3xl font-black uppercase tracking-[0.2em] opacity-40">
                 Breaking News
              </span>
           </div>
           <div className="flex-1 flex flex-col p-10 justify-between">
              <div className="flex justify-between items-start">
                 <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                 </div>
                 <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest italic">@socialmedia</span>
              </div>
              
              <div className="space-y-12">
                 <div className="space-y-6">
                    <h1 className="text-4xl text-white font-black leading-[0.9] uppercase tracking-tighter">
                       {blog?.title}
                    </h1>
                    <div className="w-full h-[300px] rounded-xl overflow-hidden relative group">
                       <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                    </div>
                 </div>
                 
                 <div className="flex items-end justify-between">
                    <p className="text-xs text-white/50 leading-relaxed max-w-[200px] line-clamp-3">
                       {blog?.description || blog?.subtitle}
                    </p>
                    <div className="flex flex-row align-center items-center gap-2">
                       <span className="text-[10px] text-white font-bold uppercase tracking-widest">Read More</span>
                       <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      );

    case 'modern-minimal':
      return (
        <div className="relative w-full h-full bg-white flex flex-col p-10 font-sans border-[1px] border-zinc-200">
           <div className="flex justify-between items-center mb-10 border-b border-zinc-100 pb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 leading-none">The News</span>
              <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#F96D2D]" />
                 <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-0.5"><DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay></span>
              </div>
           </div>
           
           <div className="flex-1 flex flex-col justify-center gap-8">
              <h1 className="text-4xl font-black text-center text-zinc-900 leading-[0.95] tracking-tighter uppercase mb-2">
                 {blog?.title}
              </h1>
              
              <div className="relative">
                 <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-[#F96D2D]/5">
                    <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                 </div>
              </div>

              <div className="flex flex-col items-center text-center gap-4 mt-4">
                 <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-[80%] line-clamp-3 italic">
                    {blog?.description || blog?.subtitle}
                 </p>
                 <div className="h-0.5 w-12 bg-zinc-100" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F96D2D]">TheKhabarExpress.com</span>
              </div>
           </div>
        </div>
      );

    default:
      return (
        <div className="relative w-full h-full bg-slate-900 p-12 flex flex-col justify-center text-center text-white">
           <div className="absolute inset-0 opacity-30">
              <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover grayscale" />
           </div>
           <div className="z-10 bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <h1 className="text-3xl font-bold mb-4 leading-tight">{blog?.title}</h1>
              <div className="w-12 h-1 bg-primary mx-auto mb-4" />
              <p className="text-sm text-gray-300 leading-relaxed font-serif italic line-clamp-4">
                "{blog?.description || blog?.subtitle}"
              </p>
           </div>
        </div>
      );
  }
};
