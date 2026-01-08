import React, { useEffect, useState } from 'react';
import { Mic, X, Disc } from 'lucide-react';

interface LiveSessionProps {
  isActive: boolean;
  onClose: () => void;
}

export const LiveSession: React.FC<LiveSessionProps> = ({ isActive, onClose }) => {
  const [volume, setVolume] = useState(0);

  // Fake volume visualizer effect for the demo
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
        setVolume(Math.random());
    }, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="relative">
             {/* Pulsating Circles */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/30 transition-all duration-100 ease-out ${isActive ? 'animate-pulse' : ''}`} 
                 style={{ width: `${100 + volume * 50}px`, height: `${100 + volume * 50}px` }} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/20 transition-all duration-100 ease-out ${isActive ? 'animate-pulse' : ''}`}
                 style={{ width: `${160 + volume * 100}px`, height: `${160 + volume * 100}px`, animationDelay: '0.1s' }} />
            
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50">
                <Mic size={48} className="text-white" />
            </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold text-white tracking-wide">GyanAI Live</h2>
        <p className="text-blue-200 mt-2 text-sm">Listening & Speaking...</p>

        <button 
            onClick={onClose}
            className="mt-12 bg-red-500/20 hover:bg-red-500/40 text-red-100 px-6 py-3 rounded-full flex items-center gap-2 border border-red-500/50 transition-all backdrop-blur-md"
        >
            <X size={20} />
            <span>End Session</span>
        </button>
    </div>
  );
};