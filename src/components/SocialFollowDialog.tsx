"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

const STORAGE_KEY = "social_follow_dismissed";
const DISPLAY_DELAY = 30000;
const DAYS_TO_SKIP = 7;

export default function SocialFollowDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check persistence early to prevent unnecessary timer
    try {
      const lastDismissed = localStorage.getItem(STORAGE_KEY);
      if (lastDismissed) {
        const diffInDays =
          (Date.now() - parseInt(lastDismissed)) / (1000 * 3600 * 24);
        if (diffInDays < DAYS_TO_SKIP) return;
      }
    } catch (e) {
      console.warn("localStorage is not available for SocialFollowDialog persistence.");
    }

    const timer = setTimeout(() => setIsOpen(true), DISPLAY_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const handleMouse = useCallback((e: MouseEvent) => {
    if (!dialogRef.current) return;
    const rect = dialogRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [isOpen, handleMouse]);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch (e) {}
    setIsOpen(false);
  }, []);

  const handleFollow = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch (e) {}
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Deeper blur for stronger focus */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-50 bg-zinc-950/25 backdrop-blur-[6px]"
          />

          {/* Dialog Positioner */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 md:p-6">
            <motion.div
              key="dialog"
              ref={dialogRef}
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 24,
                delay: 0.1
              }}
              className="group relative pointer-events-auto w-[min(500px,94vw)] rounded-[2.5rem] overflow-hidden bg-white/95 border border-zinc-200/60 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.18)]"
            >
              {/* Micro-shimmer sweep on entrance */}
              <motion.div
                initial={{ transform: "translateX(-100%) translateY(-100%) rotate(-45deg)" }}
                animate={{ transform: "translateX(200%) translateY(200%) rotate(-45deg)" }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-30"
              />

              {/* Refined Atmospheric Spotlight */}
              <div
                className="absolute inset-0 pointer-events-none z-0 transition-[background] duration-150 ease-out opacity-60"
                style={{
                  background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(124,58,237,0.08), transparent 70%)`,
                }}
              />

              {/* Decorative Multi-layered border effects */}
              <div className="absolute inset-0 rounded-[2.5rem] border-[1.5px] border-white/50 pointer-events-none z-20" />
              <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none z-0" />

              {/* Main Content Area - Reduced Padding */}
              <div className="relative z-10 px-8 py-8 md:px-10 md:py-10">
                
                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={handleDismiss}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100/50 text-zinc-400 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-all duration-300 pointer-events-auto"
                >
                  <X size={14} strokeWidth={2.5} />
                </motion.button>

                <div className="flex flex-col items-center text-center mt-4">
                  {/* Headline */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="mb-3"
                  >
                    <h2 className="font-serif-display text-2xl md:text-4xl leading-[1.1] font-normal text-zinc-950 tracking-[-0.03em]">
                      Keep up with the latest stories.
                    </h2>
                  </motion.div>

                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="text-sm text-zinc-500 leading-relaxed mb-8 font-normal"
                  >
                    Join our vibrant community across platforms for exclusive insights and instant updates.
                  </motion.p>
                </div>

                {/* Staggered Social Links - Persistent Brand Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SOCIAL_LINKS?.map(({ icon: Icon, label, href }, i) => {
                    const brandColors: Record<string, string> = {
                      Facebook: "#1877F2",
                      Instagram: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                      Twitter: "#000000",
                      Telegram: "#26A5E4",
                    };
                    const brandColor = brandColors[label] || "#7c3aed";
                    const isInstagram = label === "Instagram";

                    return (
                      <motion.a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleFollow}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.5 + i * 0.08,
                          ease: "easeOut"
                        }}
                        className={`
                          group relative flex items-center gap-3.5 p-4 rounded-[1.25rem]
                          transition-all duration-500 no-underline cursor-pointer overflow-hidden
                          ${hoveredIndex === i
                            ? "bg-white shadow-[0_12px_24px_-8px_rgba(0,0,0,0.12)] -translate-y-1"
                            : "bg-white/50 border-zinc-200/50 hover:bg-white"
                          }
                        `}
                        style={{
                          borderColor: hoveredIndex === i ? (isInstagram ? "#dc2743" : brandColor) : undefined,
                        }}
                      >
                        {/* Subtle inner tint corresponding to brand color */}
                        <div 
                          className="absolute inset-0 opacity-[0.03] pointer-events-none"
                          style={{ background: brandColor }}
                        />

                        {/* Icon container - Always active brand color */}
                        <div
                          className={`
                            relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 text-white
                            ${hoveredIndex === i ? "rotate-[360deg] shadow-lg scale-110" : "shadow-sm"}
                          `}
                          style={{
                            background: brandColor,
                            boxShadow: hoveredIndex === i ? `0 0 20px ${isInstagram ? 'rgba(220,39,67,0.4)' : brandColor + '55'}` : undefined
                          }}
                        >
                          <Icon size={18} strokeWidth={2.5} />
                          
                          {/* Pulse effect on hover */}
                          {hoveredIndex === i && (
                            <motion.span 
                              layoutId="pulse"
                              className="absolute inset-0 rounded-full bg-white/20 animate-pulse" 
                            />
                          )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          <span 
                            className={`text-[9px] font-bold uppercase tracking-[0.12em] mb-0.5 transition-colors duration-300 ${hoveredIndex === i ? 'opacity-100' : 'opacity-70'}`}
                            style={{ color: isInstagram ? "#dc2743" : brandColor }}
                          >
                            {label}
                          </span>
                          <div className="flex items-center justify-between">
                            <span 
                              className={`text-[14px] font-bold tracking-tight truncate transition-colors duration-300 ${hoveredIndex === i ? 'text-zinc-950' : 'text-zinc-700'}`}
                            >
                              Connect
                            </span>
                            <ArrowUpRight
                              size={14}
                              className={`transition-all duration-500 ${hoveredIndex === i ? "opacity-100 translate-x-0" : "opacity-30 -translate-x-1"}`}
                              style={{ color: isInstagram ? "#dc2743" : brandColor }}
                              strokeWidth={3}
                            />
                          </div>
                        </div>
                        
                        {/* Soft Hover Bloom */}
                        <div 
                          className={`absolute -right-4 -bottom-4 w-12 h-12 rounded-full blur-xl transition-opacity duration-500 ${hoveredIndex === i ? "opacity-30" : "opacity-0"}`}
                          style={{ background: brandColor }}
                        />
                      </motion.a>
                    );
                  })}
                </div> 

                {/* Refined Footer - Compacted */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-8 flex flex-col items-center gap-4"
                >

                  <button
                    onClick={handleDismiss}
                    className="text-sm font-semibold text-zinc-400 hover:text-primary transition-all duration-300"
                  >
                    Maybe later
                  </button>
                </motion.div>
              </div>

              {/* Atmospheric Background Blurs */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-40" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-400/10 blur-[80px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3 opacity-40" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}