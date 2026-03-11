import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TextToSpeechProps {
  title: string;
  contentBlocks: any[];
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ title, contentBlocks }) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Create a ref to store full text so we don't recalculate
  const textRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Extract text from Editor.js blocks
    const extractText = () => {
      let fullText = `${title}. \n\n`;
      
      contentBlocks?.forEach(block => {
        if (!block || !block.data) return;
        
        switch (block.type) {
          case 'header':
          case 'paragraph':
          case 'quote':
            if (block.data.text) {
              // Strip HTML tags (e.g., <b>, <i>, <a>)
              const textValue = String(block.data.text);
              const plainText = textValue.replace(/<[^>]*>?/gm, '');
              fullText += plainText + ' \n\n';
            }
            break;
          case 'list':
            if (block.data.items && Array.isArray(block.data.items)) {
              block.data.items.forEach((item: any) => {
                const textValue = typeof item === 'string' ? item : (item?.content || String(item || ''));
                const plainText = textValue.replace(/<[^>]*>?/gm, '');
                fullText += plainText + ' \n';
              });
              fullText += '\n';
            }
            break;
          default:
            break;
        }
      });
      
      return fullText;
    };

    textRef.current = extractText();

    const u = new SpeechSynthesisUtterance(textRef.current);
    u.rate = 0.85; // Slightly slower than 1, faster than 0.85
    u.pitch = 1;

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to pick a high-quality, human-sounding voice first
        const preferredVoices = voices.filter(v => 
          v.lang.startsWith('en') && 
          (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha') || v.name.includes('Siri'))
        );
        
        if (preferredVoices.length > 0) {
          // Prefer a Google US or UK voice if available over others
          const topVoice = preferredVoices.find(v => v.name.includes('Google US')) || preferredVoices[0];
          u.voice = topVoice;
        } else {
          // Fallback to any English voice
          const englishVoices = voices.filter(v => v.lang.startsWith('en'));
          if (englishVoices.length > 0) {
            u.voice = englishVoices[0];
          }
        }
      }
    };

    // Voices might not be loaded immediately in some browsers
    setVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    u.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    u.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    setUtterance(u);

    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [title, contentBlocks]);

  const handlePlay = () => {
    if (!utterance || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Cancel any ongoing speech before starting new
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3 py-2 rounded-full border border-border">
        <AlertCircle className="w-3 h-3" />
        <span>Text-to-speech not supported in this browser.</span>
      </div>
    );
  }

  return (
    <div className="sm:w-fit w-full flex items-center justify-center gap-2 bg-background border border-border shadow-sm rounded-full p-1">
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 hover:bg-muted px-4 py-1.5 rounded-full text-foreground text-xs font-semibold transition-all duration-200"
          aria-label={isPaused ? "Resume listening" : "Listen to article"}
        >
          <Volume2 className="w-4 h-4 text-primary" />
          <span>{isPaused ? "Resume" : "Listen to article"}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1 px-1">
          <motion.div 
            className="flex items-center gap-1 pr-3 pl-2"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
          >
            {/* Audio equalizer animation */}
            <div className="flex items-end h-4 gap-[2px]">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-t-sm"
                  animate={{
                    height: ['20%', '100%', '40%', '80%', '20%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary ml-2">Playing</span>
          </motion.div>

          <button
            onClick={handlePause}
            className="p-1.5 rounded-full hover:bg-muted text-foreground transition-colors"
            title="Pause"
            aria-label="Pause"
          >
            <Pause className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleStop}
            className="p-1.5 rounded-full hover:bg-destructive/10 text-destructive transition-colors ml-1 mr-1"
            title="Stop"
            aria-label="Stop"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TextToSpeech;
