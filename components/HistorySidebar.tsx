import React from 'react';
import { ChatSession } from '../types';
import { MessageSquare, Clock, Plus, Trash2, X } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onCloseMobile: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl border-r border-white/50 shadow-2xl z-50 transition-all duration-300 ease-in-out
        w-72 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-80 md:shadow-none md:bg-transparent md:border-r-0
      `}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100/50">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            History
          </h2>
          <button onClick={onCloseMobile} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] font-medium"
          >
            <Plus size={20} />
            New Question
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2 custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 text-sm">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p>No history yet.</p>
              <p>Start a conversation!</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`
                  group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border
                  ${currentSessionId === session.id
                    ? 'bg-white border-blue-200 shadow-md'
                    : 'hover:bg-white/60 border-transparent hover:border-gray-100'
                  }
                `}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className={`text-sm font-medium truncate ${currentSessionId === session.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {session.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(session.timestamp).toLocaleDateString()} • {session.subject}
                  </p>
                </div>
                <button
                  onClick={(e) => onDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};