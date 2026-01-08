import React from 'react';

export const AdBanner: React.FC = () => {
  return (
    <div className="w-full my-2 px-4 flex justify-center">
        <div className="w-full max-w-md bg-gray-100 border border-gray-300 border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-gray-400 text-xs h-20 relative overflow-hidden group cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="font-bold uppercase tracking-widest mb-1">Advertisement</span>
            <p className="text-center text-[10px]">Support us by viewing ads</p>
            {/* Shiny effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shiny" />
        </div>
        <style>{`
            @keyframes shiny {
                100% {
                    left: 125%;
                }
            }
            .group-hover\\:animate-shiny {
                animation: shiny 1.5s infinite;
            }
        `}</style>
    </div>
  );
};