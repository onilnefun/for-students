import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface AvatarSceneProps {
  state: 'idle' | 'thinking' | 'happy' | 'speaking';
  theme: 'light' | 'dark';
}

export const AvatarScene: React.FC<AvatarSceneProps> = ({ state, theme }) => {
  const isDark = theme === 'dark';

  // Colors based on theme
  const hairColorStart = isDark ? "#818CF8" : "#F472B6"; // Indigo-400 : Pink-400
  const hairColorEnd = isDark ? "#4F46E5" : "#DB2777";   // Indigo-600 : Pink-600
  const skinStart = "#FFF0E5";
  const skinEnd = "#FFD6C0";
  const eyeColor = isDark ? "#60A5FA" : "#EC4899";
  const uniformBase = isDark ? "#1E293B" : "#FFFFFF";
  const uniformCollar = isDark ? "#64748B" : "#E2E8F0";
  const bowColor = isDark ? "#F43F5E" : "#DB2777";

  return (
    <div className="relative w-80 h-80 mx-auto flex items-center justify-center pointer-events-none">
      {/* Anime Aura / Magic Circle Effect */}
      <div className={`
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] 
        rounded-full opacity-60 transition-all duration-700
        ${state === 'thinking' ? 'animate-spin-slow opacity-60' : ''}
        ${state === 'happy' ? 'scale-110 opacity-40 bg-pink-400/20' : ''}
        ${state === 'idle' ? 'opacity-20' : ''}
        ${state === 'speaking' ? 'scale-105 opacity-30 bg-blue-400/20' : ''}
        ${isDark ? 'border-2 border-dashed border-cyan-400/30' : 'border-2 border-dashed border-pink-400/30'}
      `} />
      
      <div className={`
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 
        rounded-full blur-3xl transition-all duration-1000
        ${isDark 
            ? (state === 'thinking' ? 'bg-cyan-500/30 scale-110' : state === 'happy' ? 'bg-pink-500/30 scale-110' : 'bg-blue-900/40 scale-90') 
            : (state === 'thinking' ? 'bg-pink-400/30 scale-110' : state === 'happy' ? 'bg-rose-300/40 scale-110' : 'bg-purple-200/50 scale-90')
        }
      `} />

      {/* Anime SVG Character */}
      <svg 
        viewBox="0 0 200 240" 
        className={`w-full h-full drop-shadow-2xl transition-transform duration-700 
          ${state === 'thinking' ? 'scale-110' : 'scale-100'}
          ${state === 'happy' ? 'scale-105 animate-bounce-gentle' : ''}
        `}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skinStart} />
            <stop offset="100%" stopColor={skinEnd} />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={hairColorStart} />
            <stop offset="100%" stopColor={hairColorEnd} />
          </linearGradient>
        </defs>

        {/* --- Anime Hair (Back) --- */}
        <g className={`origin-top ${state === 'happy' ? 'animate-hair-wild' : 'animate-hair-back-sway'}`}>
            <path d="M50,80 Q20,160 30,210 Q100,240 170,210 Q180,160 150,80" fill="url(#hairGrad)" />
            <path d="M30,210 Q40,230 60,220" fill="none" stroke={hairColorEnd} strokeWidth="2" opacity="0.3"/>
            <path d="M170,210 Q160,230 140,220" fill="none" stroke={hairColorEnd} strokeWidth="2" opacity="0.3"/>
        </g>

        {/* --- Body Group --- */}
        <g transform="translate(0, 25)" className="animate-body-breathe origin-bottom">
           <path d="M70,165 L130,165 L145,220 L55,220 Z" fill={uniformBase} />
           
           <path d="M70,165 Q100,195 130,165 L115,200 L85,200 Z" fill={uniformCollar} />
           <path d="M75,170 L85,195" stroke="white" strokeWidth="1" opacity="0.5"/>
           <path d="M125,170 L115,195" stroke="white" strokeWidth="1" opacity="0.5"/>
           
           {/* Bow */}
           <g className="animate-bow-bounce">
              <path d="M100,195 L80,210 L100,220 L120,210 Z" fill={bowColor} />
              <circle cx="100" cy="195" r="5" fill={bowColor} />
           </g>
           
           {/* Arms/Hands Holding Item */}
           <g transform="translate(0, 5)">
                <path d="M55,220 L70,180" stroke={uniformBase} strokeWidth="15" strokeLinecap="round"/>
                <path d="M145,220 L130,180" stroke={uniformBase} strokeWidth="15" strokeLinecap="round"/>
                
                <g className="animate-float-item">
                     <rect x="70" y="160" width="60" height="40" rx="4" fill={isDark ? "#334155" : "#FFF"} stroke={isDark ? "#60A5FA" : "#3B82F6"} strokeWidth="2" />
                     <circle cx="100" cy="180" r="4" fill={isDark ? "#60A5FA" : "#3B82F6"} className="animate-pulse" />
                     <circle cx="70" cy="180" r="7" fill={skinEnd} />
                     <circle cx="130" cy="180" r="7" fill={skinEnd} />
                </g>
           </g>
        </g>

        {/* --- Neck --- */}
        <path d="M90,140 L110,140 L110,170 L90,170 Z" fill={skinEnd} />
        <path d="M90,140 Q100,175 110,140" fill="rgba(0,0,0,0.1)" />

        {/* --- Head Group --- */}
        <g className={state === 'thinking' ? 'animate-head-think' : state === 'happy' ? 'animate-head-happy' : 'animate-head-idle'} style={{ transformBox: 'fill-box', transformOrigin: 'center 140px' }}>
            
            <path d="M60,80 Q60,135 75,155 Q100,180 125,155 Q140,135 140,80 Q140,30 100,30 Q60,30 60,80" fill="url(#skinGrad)" />
            
            {/* Nose Shadow (tiny dot for anime look) */}
            <circle cx="100" cy="128" r="1.5" fill="#E59E85" opacity="0.6" />

            {/* Blush */}
            <ellipse cx="75" cy="125" rx="8" ry="4" fill="#FF7878" opacity={state === 'happy' ? "0.6" : "0.3"} className={state === 'happy' ? 'animate-pulse' : 'animate-pulse-slow'} />
            <ellipse cx="125" cy="125" rx="8" ry="4" fill="#FF7878" opacity={state === 'happy' ? "0.6" : "0.3"} className={state === 'happy' ? 'animate-pulse' : 'animate-pulse-slow'} />

            {/* --- Expressions --- */}
            <g transform="translate(0, 8)">
                
                {state === 'happy' ? (
                  /* Happy Eyes (^ ^) */
                  <g>
                    <path d="M68,102 Q80,90 92,102" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                    <path d="M108,102 Q120,90 132,102" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                  </g>
                ) : (
                  <>
                    {/* Anime Eyes */}
                    <g className={state === 'thinking' ? 'animate-eye-scan' : ''}>
                        {/* Eye White */}
                        <path d="M68,100 Q80,85 92,100 Q80,115 68,100 Z" fill="white" />
                        {/* Iris */}
                        <circle cx="80" cy="100" r="7" fill={eyeColor} />
                        <circle cx="80" cy="100" r="3.5" fill="#1E3A8A" />
                        {/* Highlights */}
                        <circle cx="83" cy="96" r="3" fill="white" opacity="0.9" className="animate-twinkle" /> 
                        <circle cx="76" cy="102" r="1.5" fill="white" opacity="0.8" />
                        {/* Top Lash */}
                        <path d="M66,96 Q80,82 94,96" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                    </g>
                    <g className={state === 'thinking' ? 'animate-eye-scan' : ''}>
                        <path d="M108,100 Q120,85 132,100 Q120,115 108,100 Z" fill="white" />
                        <circle cx="120" cy="100" r="7" fill={eyeColor} />
                        <circle cx="120" cy="100" r="3.5" fill="#1E3A8A" />
                        <circle cx="123" cy="96" r="3" fill="white" opacity="0.9" className="animate-twinkle" style={{ animationDelay: '0.5s' }} />
                        <circle cx="116" cy="102" r="1.5" fill="white" opacity="0.8" />
                        <path d="M106,96 Q120,82 134,96" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                    </g>
                    {/* Blinking */}
                     <rect x="60" y="85" width="80" height="30" fill={skinStart} className={state === 'thinking' ? 'animate-blink-cover-rapid opacity-0' : 'animate-blink-cover-natural opacity-0'} />
                  </>
                )}

            </g>

            {/* Eyebrows */}
            <g transform="translate(0, state === 'thinking' ? 2 : state === 'happy' ? -2 : 0)">
                <path d="M70,88 Q80,82 90,88" fill="none" stroke={isDark ? "#A5B4FC" : "#BE185D"} strokeWidth="2" strokeLinecap="round" 
                      className={state === 'thinking' ? 'animate-brow-furrow' : 'animate-brow-happy'} />
                <path d="M110,88 Q120,82 130,88" fill="none" stroke={isDark ? "#A5B4FC" : "#BE185D"} strokeWidth="2" strokeLinecap="round" 
                      className={state === 'thinking' ? 'animate-brow-furrow' : 'animate-brow-happy'} />
            </g>

            {/* Mouth */}
            {state === 'thinking' ? (
                <circle cx="100" cy="140" r="3" fill="#EF4444" opacity="0.8" />
            ) : state === 'happy' ? (
                <path d="M88,138 Q100,155 112,138 Z" fill="#D53F8C" stroke="none" /> 
            ) : state === 'speaking' ? (
                <g className="animate-mouth-talk">
                    <path d="M95,140 Q100,145 105,140" fill="none" stroke="#D53F8C" strokeWidth="2" />
                </g>
            ) : (
                <path d="M92,142 Q100,150 108,142" fill="none" stroke="#D53F8C" strokeWidth="2.5" strokeLinecap="round" className="animate-smile-breathe" />
            )}

            {/* Front Hair */}
            <g className="animate-hair-bangs-sway origin-top">
                <path d="M60,80 Q50,40 100,30 Q150,40 140,80 Q130,60 120,70 Q110,40 100,65 Q90,40 80,70 Q70,60 60,80" fill="url(#hairGrad)" />
                <path d="M100,30 Q90,10 95,5" fill="none" stroke={hairColorStart} strokeWidth="3" className="animate-hair-strand" />
            </g>
        </g>

        {/* --- Particles --- */}
        <g className={`transition-opacity duration-300 ${state !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
            {state === 'thinking' && (
                <>
                    <Sparkles x="160" y="50" size={24} className={isDark ? "text-cyan-400 animate-spin-slow" : "text-yellow-400 animate-spin-slow"} />
                    <Sparkles x="40" y="120" size={16} className={isDark ? "text-cyan-200 animate-pulse" : "text-pink-400 animate-pulse"} />
                </>
            )}
            {state === 'happy' && (
                <>
                    <Heart x="155" y="60" size={20} fill="#F472B6" className="text-pink-500 animate-float-heart-1" />
                    <Heart x="35" y="100" size={16} fill="#F472B6" className="text-pink-400 animate-float-heart-2" />
                    <Heart x="140" y="180" size={12} fill="#F472B6" className="text-pink-300 animate-float-heart-3" />
                </>
            )}
        </g>

      </svg>

      <style>{`
        /* --- Head Animations --- */
        @keyframes head-idle {
            0%, 100% { transform: rotate(0deg) translateY(0); }
            50% { transform: rotate(1.5deg) translateY(-2px); }
        }
        @keyframes head-think {
            0%, 100% { transform: rotate(-3deg) translateY(2px); }
            50% { transform: rotate(3deg) translateY(0px); }
        }
        @keyframes head-happy {
            0%, 100% { transform: rotate(-2deg) translateY(-2px); }
            50% { transform: rotate(2deg) translateY(-5px); }
        }

        /* --- Hair Physics --- */
        @keyframes hair-back-sway {
            0%, 100% { transform: skewX(-1deg) rotate(-1deg); }
            50% { transform: skewX(2deg) rotate(1deg); }
        }
        @keyframes hair-wild {
            0%, 100% { transform: skewX(-2deg) rotate(-2deg); }
            50% { transform: skewX(2deg) rotate(2deg); }
        }
        @keyframes hair-bangs-sway {
            0%, 100% { transform: translateX(0) rotate(0); }
            50% { transform: translateX(1px) rotate(-1deg); }
        }
        @keyframes hair-strand {
            0%, 100% { d: path("M100,30 Q90,10 95,5"); }
            50% { d: path("M100,30 Q92,8 90,5"); }
        }

        /* --- Body & Breathing --- */
        @keyframes body-breathe {
            0%, 100% { transform: scaleY(1) translateY(25px); }
            50% { transform: scaleY(1.015) translateY(24px); }
        }
        @keyframes bounce-gentle {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-5px); }
        }
        @keyframes bow-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1px); }
        }

        /* --- Face Expressions --- */
        @keyframes blink-natural {
            0%, 96%, 100% { opacity: 0; }
            98% { opacity: 1; }
        }
        @keyframes blink-rapid {
            0%, 90%, 100% { opacity: 0; }
            95% { opacity: 1; }
        }
        @keyframes smile-breathe {
            0%, 100% { stroke-width: 2.5; d: path("M92,142 Q100,150 108,142"); }
            50% { stroke-width: 2.2; d: path("M91,141 Q100,148 109,141"); }
        }
        @keyframes mouth-talk {
            0%, 100% { d: path("M95,140 Q100,145 105,140"); }
            50% { d: path("M95,140 Q100,150 105,140"); }
        }
        @keyframes eye-scan {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
        }
        @keyframes twinkle {
            0%, 100% { opacity: 0.9; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes brow-happy {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1px); }
        }
        @keyframes brow-furrow {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(1px) rotate(-2deg); }
        }

        /* --- Hearts --- */
        @keyframes float-heart-1 { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-20px); opacity: 0; } }
        @keyframes float-heart-2 { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-15px); opacity: 0; } }
        @keyframes float-heart-3 { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-10px); opacity: 0; } }

        /* --- Classes --- */
        .animate-head-idle { animation: head-idle 6s ease-in-out infinite; }
        .animate-head-think { animation: head-think 3s ease-in-out infinite; }
        .animate-head-happy { animation: head-happy 2s ease-in-out infinite; }
        
        .animate-hair-back-sway { animation: hair-back-sway 5s ease-in-out infinite; transform-origin: 100px 80px; }
        .animate-hair-wild { animation: hair-wild 3s ease-in-out infinite; transform-origin: 100px 80px; }
        .animate-hair-bangs-sway { animation: hair-bangs-sway 5.5s ease-in-out infinite; transform-origin: 100px 40px; }
        .animate-hair-strand { animation: hair-strand 4s ease-in-out infinite; }
        
        .animate-body-breathe { animation: body-breathe 4s ease-in-out infinite; transform-origin: bottom center; }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .animate-bow-bounce { animation: bow-bounce 4s ease-in-out infinite; }
        
        .animate-blink-cover-natural { animation: blink-natural 5s infinite; }
        .animate-blink-cover-rapid { animation: blink-rapid 1s infinite; }
        
        .animate-smile-breathe { animation: smile-breathe 4s ease-in-out infinite; }
        .animate-mouth-talk { animation: mouth-talk 0.2s infinite; }
        .animate-eye-scan { animation: eye-scan 2s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; transform-origin: center; }
        .animate-brow-happy { animation: brow-happy 3s ease-in-out infinite; }
        .animate-brow-furrow { animation: brow-furrow 2s ease-in-out infinite; }
        
        .animate-float-heart-1 { animation: float-heart-1 2s ease-out infinite; }
        .animate-float-heart-2 { animation: float-heart-2 2.5s ease-out infinite; animation-delay: 0.5s; }
        .animate-float-heart-3 { animation: float-heart-3 3s ease-out infinite; animation-delay: 1s; }
        
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};