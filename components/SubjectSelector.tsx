import React from 'react';
import { Subject } from '../types';
import { BookOpen, Calculator, FlaskConical, Globe, GraduationCap, Languages, ScrollText, Search, BrainCircuit } from 'lucide-react';

interface SubjectSelectorProps {
  selected: Subject;
  onSelect: (subject: Subject) => void;
}

const icons: Record<Subject, React.ReactNode> = {
  [Subject.GENERAL]: <GraduationCap size={18} />,
  [Subject.WEB_SEARCH]: <Search size={18} />,
  [Subject.DEEP_THINK]: <BrainCircuit size={18} />,
  [Subject.BANGLA]: <span className="font-bold text-lg leading-none">অ</span>,
  [Subject.ENGLISH]: <Languages size={18} />,
  [Subject.MATH]: <Calculator size={18} />,
  [Subject.PHYSICS]: <span className="font-serif italic font-bold text-lg leading-none">E=mc²</span>,
  [Subject.CHEMISTRY]: <FlaskConical size={18} />,
  [Subject.BIOLOGY]: <span className="text-xl leading-none">🧬</span>,
  [Subject.HISTORY]: <ScrollText size={18} />,
  [Subject.BANGLADESH_STUDIES]: <Globe size={18} />,
};

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 px-1 hide-scrollbar">
      <div className="flex space-x-3 px-2">
        {Object.values(Subject).map((sub) => (
          <button
            key={sub}
            onClick={() => onSelect(sub)}
            className={`
              flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-300 transform whitespace-nowrap border backdrop-blur-sm
              ${
                selected === sub
                  ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-500/25 scale-105 border-blue-500'
                  : 'bg-white/60 text-slate-600 hover:bg-white/80 hover:text-blue-600 border-white/40 hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            <span className={selected === sub ? 'text-white' : 'text-blue-500 opacity-80'}>
                {icons[sub]}
            </span>
            <span className="font-medium text-sm tracking-wide">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};