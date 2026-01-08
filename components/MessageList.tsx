import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { User, Link as LinkIcon } from 'lucide-react';
import Lenis from 'lenis';

interface MessageListProps {
  messages: Message[];
}

// Mini Face Icon for the Chat Bubble
const GirlIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
     <circle cx="50" cy="50" r="50" fill="#FFDAB9" />
     <path d="M20,40 Q50,20 80,40 Q85,70 80,40 Q70,30 50,35 Q30,30 20,40" fill="#2D3748" />
     <circle cx="35" cy="55" r="5" fill="#2D3748" />
     <circle cx="65" cy="55" r="5" fill="#2D3748" />
     <path d="M40,75 Q50,80 60,75" fill="none" stroke="#D53F8C" strokeWidth="3" strokeLinecap="round" />
     <path d="M20,40 Q15,60 20,70" fill="#2D3748" opacity="0.8" />
     <path d="M80,40 Q85,60 80,70" fill="#2D3748" opacity="0.8" />
  </svg>
);

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis on the container
  useEffect(() => {
    if (!containerRef.current) return;

    const lenis = new Lenis({
      wrapper: containerRef.current,
      content: containerRef.current.firstElementChild as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential Out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    // Small delay to allow DOM to update
    const timeout = setTimeout(() => {
      if (lenisRef.current && bottomRef.current) {
         // Lenis scrollTo
         lenisRef.current.scrollTo(bottomRef.current, { immediate: false, duration: 1.5 });
      } else {
         // Fallback
         bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages]);

  // If no messages, render nothing (the AvatarScene handles the main visual)
  if (messages.length === 0) {
      return null;
  }

  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-y-auto p-4 space-y-8 pb-32 h-full"
      style={{ scrollBehavior: 'auto' }} // Disable native smooth scroll for Lenis
    >
      <div> {/* Inner wrapper for Lenis content */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500 mb-8`}
          >
            <div className={`flex max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
              
              {/* Avatar Icon */}
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white/50 overflow-hidden
                ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-pink-100'}
              `}>
                {msg.role === 'user' ? <User size={18} /> : <GirlIcon />}
              </div>

              {/* Bubble */}
              <div
                className={`
                  px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed break-words relative flex flex-col gap-2 shadow-sm
                  ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none shadow-indigo-200/50'
                      : 'bg-white/90 backdrop-blur-md text-slate-700 rounded-bl-none border border-white/60 shadow-slate-200/50'
                  }
                `}
              >
                {/* Image Preview in Chat */}
                {msg.image && (
                  <div className="mb-2 rounded-xl overflow-hidden shadow-sm border border-white/20">
                    <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-60 object-cover" />
                  </div>
                )}

                {/* Text Content */}
                {msg.role === 'model' ? (
                   <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-100 prose-pre:text-slate-700 prose-code:text-pink-600">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                   </div>
                ) : (
                  <p className="whitespace-pre-wrap font-light">{msg.text}</p>
                )}

                {/* Grounding Sources (Search Results) */}
                {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <LinkIcon size={10} /> Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingMetadata.groundingChunks.map((chunk, idx) => 
                        chunk.web ? (
                          <a 
                            key={idx} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs bg-slate-50 text-slate-500 border border-slate-100 px-2 py-1 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors truncate max-w-[150px]"
                          >
                            {chunk.web.title || "Link"}
                          </a>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};