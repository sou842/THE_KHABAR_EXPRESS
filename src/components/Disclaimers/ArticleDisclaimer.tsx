import React, { FC } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

interface ArticleDisclaimerProps {
  category: string;
}

const ArticleDisclaimer: FC<ArticleDisclaimerProps> = ({ category }) => {
  const isHealth = category?.toLowerCase() === "health";
  const isFinance = category?.toLowerCase() === "finance";

  if (!isHealth && !isFinance) return null;

  return (
    <aside 
      className="w-full mb-10 overflow-hidden animate-fade-in py-6"
      aria-label="Editorial Advisory"
    >
      <div className="flex items-start gap-4">
        <div 
          className={`shrink-0 p-2 rounded-full bg-primary/10 text-foreground dark:bg-foreground/10`}
          aria-hidden="true"
        >
          <Info size={16} />
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Editorial Advisory
          </p>
          <blockquote className="text-[15px] md:text-base font-serif text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4">
            &ldquo;{isHealth 
              ? "This report summarizes medical research and is intended for informational purposes only. It is not professional advice."
              : "This analysis is for general market context and does not constitute investment advice or professional recommendation."
            }&rdquo;
            {" "}
            <Link 
              href={isHealth ? "/health-disclaimer" : "/finance-disclaimer"}
              className="not-italic font-sans text-xs font-bold uppercase tracking-widest text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all ml-2"
              title={`Read full ${isHealth ? 'health' : 'financial'} disclaimer`}
            >
              Learn More
            </Link>
          </blockquote>
        </div>
      </div>
    </aside>
  );
};

export default ArticleDisclaimer;
