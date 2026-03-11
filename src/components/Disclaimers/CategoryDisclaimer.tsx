import React, { FC } from "react";
import Link from "next/link";
import { Info, ExternalLink, ShieldCheck } from "lucide-react";

interface CategoryDisclaimerProps {
  category: string;
}

const CategoryDisclaimer: FC<CategoryDisclaimerProps> = ({ category }) => {
  const isHealth = category?.toLowerCase() === "health";
  const isFinance = category?.toLowerCase() === "finance";

  if (!isHealth && !isFinance) return null;

  const config = {
    tag: isHealth ? "Medical Standards" : "Market Standards",
    title: isHealth ? "Healthcare Information Advisory" : "Financial Analysis Advisory",
    body: isHealth
      ? "The healthcare reporting by Khabar Express is synthesized from vetted medical research and public health data. It is intended for categorical informational context and does not constitute professional medical advice, diagnosis, or clinical treatment."
      : "Our financial coverage provides institutional-grade market reviews and macroeconomic context. This data is provided for informational purposes only and does not constitute investment, tax, or legal recommendations to deploy capital.",
    href: isHealth ? "/health-disclaimer" : "/finance-disclaimer",
    emergency: isHealth ? "Emergency Contact: 108" : "Markets involve significant risk",
    code: isHealth ? "REF-HLTH-2026" : "REF-FIN-2026",
  };

  return (
    <section 
      className="w-full mb-12 animate-fade-in group"
      aria-labelledby="disclaimer-title"
    >
      <div className="relative overflow-hidden bg-transparent text-zinc-900 rounded-2xl border border-zinc-200 transition-colors duration-500">

        <div className="relative px-6 py-8 md:px-12 md:py-14">

          {/* Top Metadata Row */}
          <header className="flex items-center justify-between mb-10 border-b border-zinc-200 pb-6">
            <div className="flex items-center gap-4">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary border border-zinc-200 shadow-sm"
                aria-hidden="true"
              >
                <ShieldCheck size={20} className="text-zinc-100" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.4em] text-zinc-500 leading-none mb-1.5">
                  Editorial Protocol
                </p>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 animate-pulse" aria-hidden="true" />
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                    {config.tag} — {config.code}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block text-right">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                The Khabar Express — Public Archive
              </p>
            </div>
          </header>

          <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-start">

            {/* Title Section */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-4">
              <h3 
                id="disclaimer-title"
                className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-zinc-900"
              >
                Official<br />
                <span className="text-transparent [-webkit-text-stroke:1.5px_#18181b] opacity-30">
                  Advisory
                </span>
              </h3>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                {config.title}
              </p>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-8">
              <div className="relative">
                <blockquote className="text-md md:text-lg lg:text-xl font-serif leading-relaxed text-zinc-700 italic border-l-4 border-zinc-900 pl-8 md:pl-10">
                  &ldquo;{config.body}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>

          {/* Footer Section: Metadata & Actions */}
          <footer className="mt-12 md:mt-16 pt-8 border-t border-zinc-200">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">

              {/* Left: Standard Metadata */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-6 md:gap-8 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase">Source: Editorial Board</span>
                  </div>
                  <div className="h-0.5 w-6 bg-zinc-200 hidden sm:block" aria-hidden="true" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase">Verified Cycle: Mar 2026</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-sm text-zinc-900 border border-border">
                  <span className="text-xs font-medium uppercase">
                    {config.emergency}
                  </span>
                </div>
              </div>

              {/* Right: Primary CTA */}
              <Link
                href={config.href}
                className="group inline-flex items-center gap-4 bg-zinc-900 text-white px-10 py-5 rounded-sm text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all active:scale-95 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] shrink-0"
                title={`Read full ${isHealth ? 'health' : 'financial'} disclaimer`}
              >
                See Full Protocol
                <ExternalLink size={16} className="group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform text-white/50" />
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default CategoryDisclaimer;