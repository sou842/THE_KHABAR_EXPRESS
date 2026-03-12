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
   { id: 'magazine-cover', name: 'Magazine Cover', style: 'bg-yellow-400', icon: BookOpen },
   { id: 'dark-gradient', name: 'Dark Gradient', style: 'bg-gradient-to-br from-gray-900 to-blue-950', icon: Layout },
   // { id: 'bold-typographic', name: 'Bold Typographic', style: 'bg-white text-black border', icon: Newspaper },
   { id: 'newspaper-classic', name: 'Newspaper Classic', style: 'bg-amber-50 text-black border', icon: FileText },
   { id: 'neon-cyber', name: 'Neon Cyber', style: 'bg-black', icon: Zap },
   { id: 'diagonal-slash', name: 'Diagonal Slash', style: 'bg-zinc-900', icon: Layout },
   { id: 'polaroid-stack', name: 'Polaroid Stack', style: 'bg-stone-100 text-black border', icon: FileText },
   { id: 'ticker-tape', name: 'Ticker Tape', style: 'bg-yellow-300 text-black', icon: Newspaper },
];

interface TemplateRendererProps {
   templateId: string;
   blog: any;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateId, blog }) => {
   if (!blog) return null;

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
               <div className="mt-auto px-8">
                  <div className="inline-block bg-[#E11D48] text-white px-6 py-2 transform -skew-x-12 shadow-xl">
                     <h2 className="text-4xl text-nowrap font-extrabold tracking-tighter uppercase transform skew-x-12 italic">Breaking News</h2>
                  </div>
               </div>
               <div className="mt-0 p-10 z-20 space-y-4">
                  <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                     {blog?.title}
                  </h1>
                  <p className="text-2xl text-gray-200 line-clamp-3 leading-relaxed border-l-2 border-[#E11D48] pl-4 italic">
                     {blog?.description || blog?.subtitle || "Explore the latest developments in this exclusive report from Khabar Express."}
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-white/10">
                     <div className="flex flex-col">
                        <span className="text-base text-[#E11D48] font-bold uppercase tracking-widest">Reporter</span>
                        <span className="text-base text-white font-medium">{blog?.author || "Khabar Team"}</span>
                     </div>
                     <div className="text-md text-gray-400 font-mono">khabarexpress.com</div>
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
                        <div className="text-lg font-bold text-white">khabarexpress</div>
                        <div className="text-base text-nowrap text-white/70"><DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay></div>
                     </div>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-4 bg-gray-900/20 p-6 rounded-xl">
                     <div className="w-fit flex items-center justify-center gap-2 bg-[#E11D48] text-white text-base font-bold py-1 px-3 rounded-full uppercase tracking-wider">
                        {blog?.category || "General"}
                     </div>
                     <h1 className="text-5xl text-center font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                        {blog?.title}
                     </h1>
                  </div>
                  <div className="flex justify-center flex-col items-center gap-3 text-white">
                     <ChevronRight className="w-5 h-5 animate-bounce rotate-90" />
                     <span className="text-base text-nowrap font-bold tracking-[0.3em] uppercase">Read</span>
                  </div>
               </div>
            </div>
         );

      case 'split-profile':
         return (
            <div className="relative w-full h-full flex font-sans overflow-hidden">
               <div className="w-[45%] bg-[#F96D2D] p-8 flex flex-col justify-between text-white relative z-10">
                  <div className="space-y-6">
                     <h1 className="text-4xl font-black leading-[0.9] uppercase tracking-tighter mt-6">
                        {blog?.title}
                     </h1>
                     <p className="text-xl opacity-90 leading-relaxed line-clamp-10 font-medium">
                        {blog?.description || ''}
                     </p>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                        <span className="text-xs text-[#F96D2D] font-bold italic">K</span>
                     </div>
                     <span className="text-sm text-nowrap font-bold uppercase tracking-widest">Khabar Express</span>
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
                  <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
               </div>
               <div className="relative z-10 ml-auto w-[50%] bg-white p-8 flex flex-col h-full shadow-[-20px_0_50px_rgba(0,0,0,0.3)]">
                  <div className="mb-4">
                     <span className="text-sm text-nowrap font-bold text-[#F96D2D] uppercase tracking-widest">Property News</span>
                     <div className="h-0.5 w-8 bg-black mt-1" />
                  </div>
                  <h1 className="text-4xl font-bold text-black leading-tight flex-1 mt-4">
                     {blog?.title}
                  </h1>
                  <div className="space-y-4">
                     <p className="text-lg text-zinc-500 font-sans leading-relaxed line-clamp-8">
                        {blog?.description || blog?.subtitle}
                     </p>
                     <div className="flex flex-col pt-6 border-t border-zinc-100">
                        <span className="text-sm text-nowrap font-bold text-black uppercase tracking-widest">@socialmedia</span>
                        <span className="text-base text-nowrap text-zinc-400 font-sans mt-0.5 whitespace-nowrap overflow-hidden">www.khabarexpress.com</span>
                     </div>
                  </div>
               </div>
            </div>
         );

      case 'accent-sidebar':
         return (
            <div className="relative w-full h-full bg-zinc-900 flex font-sans overflow-hidden">
               <div className="w-16 bg-[#F96D2D] flex items-center justify-center border-r border-white/10 shrink-0">
                  <span className="rotate-[-90deg] text-nowrap text-white text-4xl font-black uppercase tracking-[0.2em] opacity-80">
                     Breaking News
                  </span>
               </div>
               <div className="flex-1 flex flex-col p-10 justify-between">
                  <div className="flex justify-between items-start">
                     <span className="text-base text-nowrap text-white/40 font-bold uppercase tracking-widest italic">@socialmedia</span>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-8">
                        <h1 className="text-5xl text-white font-black leading-[0.9] uppercase tracking-tighter">
                           {blog?.title}
                        </h1>
                        <div className="w-full h-[460px] rounded-xl overflow-hidden relative group">
                           <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                        </div>
                     </div>

                     <div className="flex flex-col justify-between gap-8">
                        <p className="w-full text-base text-white/50 leading-relaxed line-clamp-3">
                           {blog?.description || blog?.subtitle}
                        </p>
                        <div className="flex flex-row align-center items-center gap-2">
                           <span className="text-sm text-nowrap text-white font-bold uppercase tracking-widest">Read More</span>
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
                  <span className="text-md text-nowrap font-black uppercase tracking-[0.3em] text-zinc-900 leading-none">The News</span>
                  <div className="flex items-center gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#F96D2D]" />
                     <span className="text-sm text-nowrap text-zinc-400 font-bold uppercase tracking-widest mt-0.5"><DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay></span>
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
                     <p className="text-base text-zinc-500 font-medium leading-relaxed max-w-[90%] line-clamp-6 italic">
                        {blog?.description || blog?.subtitle}
                     </p>
                     <div className="h-0.5 w-12 bg-zinc-100" />
                     <span className="text-sm text-nowrap font-black uppercase tracking-[0.2em] text-[#F96D2D]">TheKhabarExpress.com</span>
                  </div>
               </div>
            </div>
         );

      // ─── NEW TEMPLATES ───────────────────────────────────────────────────────

      case 'magazine-cover':
         return (
            <div className="relative w-full h-full bg-black flex flex-col overflow-hidden font-sans">
               {/* Full bleed image */}
               <div className="absolute inset-0">
                  <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
               </div>

               {/* Top masthead */}
               <div className="relative z-10 px-8 pt-8 flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-3xl font-black text-white uppercase tracking-[0.15em] leading-none">KHABAR</span>
                     <span className="text-sm font-bold text-[#F96D2D] uppercase tracking-[0.5em]">EXPRESS</span>
                  </div>
                  <div className="text-right">
                     <div className="text-xs text-white/60 uppercase tracking-widest font-bold">
                        <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                     </div>
                     <div className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{blog?.category || "News"}</div>
                  </div>
               </div>

               {/* Bottom content */}
               <div className="relative z-10 mt-auto px-8 pb-8 space-y-5">
                  {/* Category pill */}
                  <div className="flex items-center gap-3">
                     <div className="h-px flex-1 bg-white/20" />
                     <span className="text-xs text-nowrap font-bold text-[#F96D2D] uppercase tracking-[0.3em]">{blog?.category || "Featured"}</span>
                     <div className="h-px flex-1 bg-white/20" />
                  </div>

                  <h1 className="text-5xl font-black text-white leading-[1.0] tracking-tight">
                     {blog?.title}
                  </h1>

                  <p className="text-xl text-white/70 leading-relaxed line-clamp-3 font-light">
                     {blog?.description || blog?.subtitle}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                     <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F96D2D] flex items-center justify-center text-white text-xs font-black">K</div>
                        <span className="text-sm text-white/80 font-semibold">{blog?.author || "Khabar Team"}</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className="text-sm text-white/40 font-medium">khabarexpress.com</span>
                        <ChevronRight className="w-4 h-4 text-[#F96D2D]" />
                     </div>
                  </div>
               </div>
            </div>
         );

      case 'dark-gradient':
         return (
            <div className="relative w-full h-full overflow-hidden font-sans" style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1a4e, #0d1b40)' }}>
               {/* Decorative glow orbs */}
               <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', transform: 'translate(30%, -30%)' }} />
               <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #F96D2D, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

               {/* Image with overlay */}
               <div className="absolute inset-0 opacity-20">
                  <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
               </div>

               <div className="relative z-10 flex flex-col h-full p-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-auto">
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F96D2D] animate-pulse" />
                        <span className="text-xs text-white/70 font-bold uppercase tracking-widest">Live Update</span>
                     </div>
                     <span className="text-xs text-white/40 font-mono uppercase tracking-widest">
                        <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                     </span>
                  </div>

                  {/* Center image card */}
                  <div className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}>
                     <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-64 object-cover" />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <div className="h-px w-6 bg-[#F96D2D]" />
                        <span className="text-sm text-[#F96D2D] font-bold uppercase tracking-[0.25em]">{blog?.category || "Breaking"}</span>
                     </div>

                     <h1 className="text-5xl font-black text-white leading-[1.05] tracking-tight">
                        {blog?.title}
                     </h1>

                     <p className="text-xl text-white/50 leading-relaxed line-clamp-3 font-light">
                        {blog?.description || blog?.subtitle}
                     </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                     <span className="text-sm text-white/40 font-bold uppercase tracking-widest">khabarexpress.com</span>
                     <div className="flex items-center gap-1.5 text-white/60 text-sm font-medium">
                        <span>{blog?.author || "Khabar Team"}</span>
                     </div>
                  </div>
               </div>
            </div>
         );

      case 'bold-typographic':
         return (
            <div className="relative w-full h-full bg-white flex flex-col font-sans overflow-hidden">
               {/* Thick top accent bar */}
               <div className="h-3 w-full bg-zinc-900 shrink-0" />

               <div className="flex flex-col flex-1 px-10 pt-6 pb-8">
                  {/* Masthead row */}
                  <div className="flex items-baseline justify-between border-b-2 border-zinc-900 pb-3 mb-6">
                     <span className="text-2xl font-black text-zinc-900 uppercase tracking-[0.2em]">Khabar Express</span>
                     <span className="text-sm text-zinc-400 font-bold uppercase tracking-widest">
                        <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                     </span>
                  </div>

                  {/* Category tag */}
                  <div className="mb-4">
                     <span className="inline-block bg-[#E11D48] text-white text-sm font-black px-3 py-1 uppercase tracking-widest">
                        {blog?.category || "News"}
                     </span>
                  </div>

                  {/* Giant headline */}
                  <h1 className="text-5xl font-black text-zinc-900 leading-[0.95] tracking-tighter uppercase mb-6">
                     {blog?.title}
                  </h1>

                  {/* Image */}
                  <div className="flex-1 min-h-0 rounded-lg overflow-hidden mb-6">
                     <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                  </div>

                  {/* Description with left rule */}
                  <p className="text-xl text-zinc-600 line-clamp-3 leading-relaxed border-l-4 border-[#E11D48] pl-4">
                     {blog?.description || blog?.subtitle}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-200">
                     <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{blog?.author || "Khabar Team"}</span>
                     <span className="text-sm font-black text-zinc-900 uppercase tracking-wider">khabarexpress.com</span>
                  </div>
               </div>

               {/* Thick bottom accent */}
               <div className="h-2 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #E11D48 0%, #F96D2D 100%)' }} />
            </div>
         );

      case 'newspaper-classic':
         return (
            <div className="relative w-full h-full bg-[#FAF7F0] flex flex-col font-serif overflow-hidden border border-amber-200">
               {/* Ornate top header */}
               <div className="px-8 pt-6 pb-4 border-b-2 border-zinc-800">
                  <div className="text-center space-y-1">
                     <div className="flex items-center justify-center gap-3">
                        <div className="h-px flex-1 bg-zinc-800" />
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] font-sans">Est. 2020</span>
                        <div className="h-px flex-1 bg-zinc-800" />
                     </div>
                     <h2 className="text-4xl font-black text-zinc-900 uppercase tracking-[0.1em]" style={{ fontVariant: 'small-caps' }}>
                        Khabar Express
                     </h2>
                     <div className="flex items-center justify-between text-xs font-sans text-zinc-500 uppercase tracking-widest pt-1">
                        <span>
                           <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                        </span>
                        <span className="font-bold text-[#E11D48]">{blog?.category || "General"}</span>
                        <span>khabarexpress.com</span>
                     </div>
                  </div>
               </div>

               {/* Big headline */}
               <div className="px-8 pt-5 pb-4 border-b border-zinc-300">
                  <h1 className="text-5xl font-black text-zinc-900 leading-[1.0] tracking-tight text-center">
                     {blog?.title}
                  </h1>
               </div>

               {/* Two-column layout */}
               <div className="flex flex-1 min-h-0">
                  {/* Left col: image */}
                  <div className="w-[45%] p-5 border-r border-zinc-300">
                     <div className="h-full overflow-hidden">
                        <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover grayscale-[20%]" />
                     </div>
                  </div>

                  {/* Right col: text */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                     <p className="text-lg text-zinc-700 leading-relaxed line-clamp-10 text-justify">
                        {blog?.description || blog?.subtitle}
                     </p>
                     <div className="pt-4 border-t border-zinc-300">
                        <span className="text-sm text-nowrap font-bold text-zinc-500 uppercase tracking-widest font-sans">
                           {blog?.author || "Khabar Team"}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         );

      // ─── UNIQUE NEW TEMPLATES ────────────────────────────────────────────────

      case 'neon-cyber':
         return (
            <div className="relative w-full h-full bg-black flex flex-col overflow-hidden font-sans">
               {/* Scanline overlay */}
               <div className="absolute inset-0 z-10 pointer-events-none" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,180,0.03) 2px, rgba(0,255,180,0.03) 4px)'
               }} />

               {/* Dim background image */}
               <div className="absolute inset-0">
                  <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover opacity-15" />
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(0,255,180,0.08) 0%, transparent 70%)' }} />
               </div>

               {/* Corner brackets */}
               <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 z-20" style={{ borderColor: '#00FFB4' }} />
               <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 z-20" style={{ borderColor: '#00FFB4' }} />
               <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 z-20" style={{ borderColor: '#00FFB4' }} />
               <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 z-20" style={{ borderColor: '#00FFB4' }} />

               <div className="relative z-20 flex flex-col h-full px-10 pt-10 pb-10 justify-between">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00FFB4', boxShadow: '0 0 8px #00FFB4' }} />
                        <span className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: '#00FFB4' }}>Live Feed</span>
                     </div>
                     <span className="text-xs text-white/30 font-mono uppercase tracking-widest">
                        <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                     </span>
                  </div>

                  {/* Image with neon border */}
                  <div className="rounded-lg overflow-hidden my-6" style={{ border: '1px solid rgba(0,255,180,0.3)', boxShadow: '0 0 30px rgba(0,255,180,0.12), inset 0 0 30px rgba(0,0,0,0.5)' }}>
                     <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-52 object-cover opacity-80" />
                  </div>

                  {/* Content */}
                  <div className="space-y-4 flex-1">
                     <div className="flex items-center gap-2">
                        <div className="h-px w-8" style={{ background: '#00FFB4' }} />
                        <span className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: '#00FFB4' }}>{blog?.category || "Breaking"}</span>
                     </div>
                     <h1 className="text-5xl font-black text-white leading-[1.0] tracking-tighter" style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}>
                        {blog?.title}
                     </h1>
                     <p className="text-xl text-white/40 leading-relaxed line-clamp-3 font-light">
                        {blog?.description || blog?.subtitle}
                     </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-5 mt-4" style={{ borderTop: '1px solid rgba(0,255,180,0.15)' }}>
                     <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'rgba(0,255,180,0.6)' }}>khabarexpress.com</span>
                     <span className="text-xs text-white/30 font-mono">{blog?.author || "Khabar Team"}</span>
                  </div>
               </div>
            </div>
         );

      case 'diagonal-slash':
         return (
            <div className="relative w-full h-full overflow-hidden font-sans bg-zinc-950">
               {/* Top-right image block clipped diagonally */}
               <div className="absolute inset-0">
                  <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950/80 to-transparent" />
               </div>

               {/* Giant diagonal slash accent */}
               <div
                  className="absolute z-10 pointer-events-none"
                  style={{
                     width: '6px',
                     height: '160%',
                     background: 'linear-gradient(180deg, #F96D2D, #E11D48)',
                     top: '-30%',
                     left: '52%',
                     transform: 'rotate(12deg)',
                     opacity: 0.9,
                  }}
               />
               <div
                  className="absolute z-10 pointer-events-none"
                  style={{
                     width: '2px',
                     height: '160%',
                     background: 'linear-gradient(180deg, #F96D2D, #E11D48)',
                     top: '-30%',
                     left: '54.5%',
                     transform: 'rotate(12deg)',
                     opacity: 0.4,
                  }}
               />

               <div className="relative z-20 flex flex-col h-full p-10 justify-between">
                  {/* Top brand */}
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 flex items-center justify-center font-black text-sm" style={{ background: 'linear-gradient(135deg, #F96D2D, #E11D48)', color: 'white', clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)' }}>K</div>
                     <span className="text-base font-black text-white uppercase tracking-[0.25em]">Khabar Express</span>
                  </div>

                  {/* Main content — left side */}
                  <div className="max-w-[55%] space-y-5">
                     <span className="inline-block text-xs font-black uppercase tracking-[0.3em] px-3 py-1" style={{ background: 'linear-gradient(90deg, #F96D2D, #E11D48)', color: 'white' }}>
                        {blog?.category || "Exclusive"}
                     </span>
                     <h1 className="text-5xl font-black text-white leading-[0.95] tracking-tighter">
                        {blog?.title}
                     </h1>
                     <p className="text-xl text-white/55 leading-relaxed line-clamp-4">
                        {blog?.description || blog?.subtitle}
                     </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-end justify-between">
                     <div className="space-y-1">
                        <div className="text-xs text-white/30 uppercase tracking-widest font-bold">Reporter</div>
                        <div className="text-base text-white font-bold">{blog?.author || "Khabar Team"}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-black text-white/50 uppercase tracking-widest">khabarexpress.com</div>
                        <div className="text-xs text-white/25 mt-0.5">
                           <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         );

      case 'polaroid-stack':
         return (
            <div className="relative w-full h-full bg-stone-100 flex flex-col font-sans overflow-hidden">
               {/* Textured paper background */}
               <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)',
                  backgroundSize: '20px 20px'
               }} />

               <div className="relative z-10 flex flex-col h-full px-8 pt-8 pb-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                     <span className="text-2xl font-black text-zinc-900 uppercase tracking-[0.15em]">Khabar</span>
                     <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest font-sans">
                        <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                     </span>
                  </div>

                  {/* Polaroid frame — slightly rotated back image for depth */}
                  <div className="relative mx-auto w-full flex-1 min-h-0 flex items-center justify-center mb-4">
                     {/* Shadow/back card */}
                     <div className="absolute inset-2 bg-white shadow-xl" style={{ transform: 'rotate(3deg)', zIndex: 1 }} />
                     {/* Front polaroid */}
                     <div className="relative bg-white shadow-2xl p-3 pb-14 w-[88%]" style={{ zIndex: 2, transform: 'rotate(-1.5deg)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-56 object-cover" />
                        {/* Handwritten-style caption inside polaroid */}
                        <div className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-center">
                           <span className="text-base text-zinc-500 font-medium italic text-center px-3 line-clamp-1">
                              {blog?.category || "Today's Story"}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Text below */}
                  <div className="space-y-3 mt-2">
                     <div className="flex items-center gap-2">
                        <div className="h-0.5 w-5 bg-[#E11D48]" />
                        <span className="text-xs font-black text-[#E11D48] uppercase tracking-[0.3em]">{blog?.category || "Featured"}</span>
                     </div>
                     <h1 className="text-4xl font-black text-zinc-900 leading-[1.0] tracking-tight">
                        {blog?.title}
                     </h1>
                     <p className="text-lg text-zinc-500 leading-relaxed line-clamp-3">
                        {blog?.description || blog?.subtitle}
                     </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200">
                     <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{blog?.author || "Khabar Team"}</span>
                     <span className="text-sm font-black text-zinc-900 uppercase tracking-wider">khabarexpress.com</span>
                  </div>
               </div>
            </div>
         );

      case 'ticker-tape':
         return (
            <div className="relative w-full h-full bg-[#FFE600] flex flex-col overflow-hidden font-sans">
               {/* Bold black diagonal stripe pattern top-right */}
               <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 30px)',
               }} />

               {/* Top bar */}
               <div className="bg-zinc-900 px-8 py-3 flex items-center justify-between shrink-0">
                  <span className="text-lg font-black text-[#FFE600] uppercase tracking-[0.2em]">Khabar Express</span>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                     <span className="text-xs text-white/60 font-bold uppercase tracking-widest">Breaking</span>
                  </div>
               </div>

               <div className="flex flex-col flex-1 px-8 pt-6 pb-6 justify-between">
                  {/* Category stamp */}
                  <div className="inline-flex self-start">
                     <span className="text-sm font-black uppercase tracking-[0.25em] bg-zinc-900 text-[#FFE600] px-4 py-1.5">
                        {blog?.category || "News Alert"}
                     </span>
                  </div>

                  {/* Giant headline — black on yellow */}
                  <div className="space-y-2 my-4">
                     <h1 className="text-6xl font-black text-zinc-900 leading-[0.9] tracking-tighter uppercase">
                        {blog?.title}
                     </h1>
                  </div>

                  {/* Image */}
                  <div className="flex-1 min-h-0 overflow-hidden" style={{ outline: '4px solid #000', outlineOffset: '-1px' }}>
                     <img src={blog?.thumbnail} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                  </div>

                  {/* Description */}
                  <p className="text-xl text-zinc-800 leading-snug line-clamp-2 mt-4 font-semibold">
                     {blog?.description || blog?.subtitle}
                  </p>
               </div>

               {/* Bottom ticker bar */}
               <div className="bg-zinc-900 px-8 py-3 flex items-center justify-between shrink-0">
                  <span className="text-sm text-white/50 font-mono uppercase tracking-widest">
                     <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                  </span>
                  <span className="text-sm font-black text-[#FFE600] uppercase tracking-widest">{blog?.author || "Khabar Team"}</span>
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
                  <h1 className="text-5xl font-bold mb-4 leading-tight">{blog?.title}</h1>
                  <div className="w-12 h-1 bg-orange-500 mx-auto mb-4" />
                  <p className="text-xl text-gray-300 leading-relaxed font-serif italic line-clamp-6">
                     "{blog?.description || blog?.subtitle}"
                  </p>
               </div>
            </div>
         );
   }
};