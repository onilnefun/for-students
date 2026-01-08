import React, { useState, useRef, useEffect } from 'react';
import { Subject, Message, ChatSession } from './types';
import { MessageList } from './components/MessageList';
import { generateResponseStream } from './services/geminiService';
import { startLiveSession, stopLiveSession } from './services/liveService';
import { Send, Image as ImageIcon, X, Loader2, Camera, AudioLines, Menu, Mic, Moon, Sun, Sparkles } from 'lucide-react';
import { LiveSession } from './components/LiveSession';
import { HistorySidebar } from './components/HistorySidebar';
import { AvatarScene } from './components/AvatarScene';

// Unique Particle Background Component
const ParticleBackground: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
       {/* Blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob transition-colors duration-1000 ${theme === 'dark' ? 'bg-indigo-900 mix-blend-screen' : 'bg-purple-200'}`}></div>
      <div className={`absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 transition-colors duration-1000 ${theme === 'dark' ? 'bg-cyan-900 mix-blend-screen' : 'bg-blue-200'}`}></div>
      <div className={`absolute bottom-[-10%] left-[20%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 transition-colors duration-1000 ${theme === 'dark' ? 'bg-fuchsia-900 mix-blend-screen' : 'bg-pink-200'}`}></div>
      
      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div 
            key={i}
            className={`absolute rounded-full opacity-30 animate-float-particle transition-colors duration-1000 ${theme === 'dark' ? 'bg-cyan-400' : 'bg-blue-500'}`}
            style={{
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDuration: Math.random() * 10 + 10 + 's',
                animationDelay: Math.random() * 5 + 's'
            }}
        />
      ))}
      <style>{`
        @keyframes float-particle {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        .animate-float-particle { animation-name: float-particle; animation-iteration-count: infinite; animation-timing-function: linear; }
      `}</style>
    </div>
  );
};

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Avatar State
  const [avatarMood, setAvatarMood] = useState<'idle' | 'happy'>('idle');

  // Removed Subject Selector State - Defaulting everything to General logic internally
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gyan_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gyan_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages } : s
      ));
    }
  }, [messages, currentSessionId]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setIsSidebarOpen(false);
    setAvatarMood('idle');
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setIsSidebarOpen(false);
    setAvatarMood('idle');
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      handleNewChat();
    }
  };

  const handleStartLive = async () => {
      try {
          setIsLiveActive(true);
          await startLiveSession(
              () => setIsLiveActive(false),
              (err) => {
                  console.error("Live Error", err);
                  setIsLiveActive(false);
                  alert(`Live session error: ${err.message || 'Unknown error'}`);
              }
          );
      } catch (e: any) {
          console.error("Failed to start live", e);
          setIsLiveActive(false);
          alert(e.message || "Could not start audio session. Check permissions.");
      }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice typing is not supported. Use Chrome or Edge.");
      return;
    }

    // Stop if already listening
    if (isListening && recognitionRef.current) {
        try {
            recognitionRef.current.stop();
        } catch(e) {
            console.warn("Could not stop recognition", e);
        }
        return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      recognitionRef.current = null;
      
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone permissions in your browser settings (click the lock/info icon in the address bar).");
      } else if (event.error === 'service-not-allowed') {
        alert("Voice service unavailable. Please check your internet connection.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Failed to start recognition", e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Determine Avatar Mood based on user input
  const detectMood = (text: string) => {
    const happyKeywords = ['thanks', 'thank you', 'good', 'great', 'love', 'cute', 'amazing', 'smart', 'best'];
    if (happyKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      setAvatarMood('happy');
      // Revert to idle after 5 seconds
      setTimeout(() => setAvatarMood('idle'), 5000);
    } else {
      setAvatarMood('idle');
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    // Detect mood before clearing input
    detectMood(input);

    let sessionId = currentSessionId;

    if (!sessionId) {
      sessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: sessionId,
        title: input.trim().slice(0, 30) || 'Image Query',
        timestamp: Date.now(),
        subject: Subject.GENERAL, 
        messages: []
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
    }

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      image: selectedImage || undefined,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    const initialModelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    
    setMessages((prev) => [...prev, initialModelMsg]);

    try {
      const stream = await generateResponseStream(newUserMsg.text || (currentImage ? "Describe this" : ""), Subject.GENERAL, currentImage || undefined);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        const grounding = chunk.candidates?.[0]?.groundingMetadata;
        
        if (chunkText || grounding) {
            if (chunkText) fullText += chunkText;
            
            setMessages((prev) => 
                prev.map((msg) => 
                msg.id === modelMsgId 
                    ? { ...msg, text: fullText, groundingMetadata: grounding || msg.groundingMetadata } 
                    : msg
                )
            );
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMsgId ? { ...msg, text: "Gomen! (Sorry!) I had a glitch... try again?" } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Styles based on theme
  const bgClass = theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f0f4f8] text-slate-800';
  const panelClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-700/50 text-white shadow-cyan-500/10' 
    : 'bg-white/70 border-white/50 text-slate-800 shadow-blue-900/5';
  const headerText = theme === 'dark' 
    ? 'bg-gradient-to-r from-cyan-400 to-purple-400' 
    : 'bg-gradient-to-r from-blue-700 to-indigo-700';
  
  // Calculate current avatar state
  // If isLoading is true, check if we have text content to decide between "thinking" and "speaking"
  const lastMsg = messages[messages.length - 1];
  const isGeneratingContent = isLoading && lastMsg?.role === 'model' && lastMsg.text.length > 0;
  
  let currentAvatarState: 'idle' | 'thinking' | 'happy' | 'speaking' = 'idle';
  
  if (isGeneratingContent) {
      currentAvatarState = 'speaking';
  } else if (isLoading) {
      currentAvatarState = 'thinking';
  } else {
      currentAvatarState = avatarMood;
  }

  const suggestions = [
      { text: "Help me solve this math problem", icon: "📐" },
      { text: "Explain Newton's Laws", icon: "🍎" },
      { text: "Write a leave application", icon: "📝" },
      { text: "বাংলা ব্যাকরণ বুঝিয়ে দাও", icon: "🇧🇩" },
  ];

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${bgClass}`}>
      
      <LiveSession isActive={isLiveActive} onClose={() => { stopLiveSession(); setIsLiveActive(false); }} />

      {/* Unique Background */}
      <ParticleBackground theme={theme} />

      {/* Sidebar */}
      <HistorySidebar 
        isOpen={isSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Header */}
        <header className={`px-4 py-3 flex items-center justify-between shadow-sm z-30 shrink-0 backdrop-blur-md border-b transition-colors duration-500 ${theme === 'dark' ? 'border-slate-800/50 bg-slate-900/30' : 'border-white/50 bg-white/30'}`}>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`md:hidden p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-white/50'}`}>
                <Menu size={20} />
             </button>
             <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-cyan-500/30' : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'}`}>
                   <Sparkles size={18} />
                </div>
                <h1 className={`text-xl font-bold bg-clip-text text-transparent ${headerText} hidden sm:block font-outfit`}>GyanAI</h1>
             </div>
          </div>

          <div className="flex items-center gap-2">
             <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 text-yellow-300 hover:bg-slate-700' : 'bg-white/50 text-slate-600 hover:bg-white'}`}
             >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             
             <button 
                onClick={handleStartLive}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-md hover:scale-105 transition-all animate-pulse-slow"
             >
                <AudioLines size={14} />
                <span>Live</span>
             </button>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
            
            {/* The 3D Anime Avatar Container */}
            <div className={`
                flex-shrink-0 w-full flex justify-center transition-all duration-500 ease-in-out z-0
                ${messages.length === 0 ? 'mt-8 mb-4' : 'absolute -top-32 left-0 right-0 opacity-0 pointer-events-none'}
            `}>
                <AvatarScene state={currentAvatarState} theme={theme} />
            </div>

            {/* Welcome Text & Suggestions */}
            {messages.length === 0 && (
                <div className="text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 z-10 relative flex flex-col items-center">
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Hey! What are we learning today?</h2>
                    <p className={`text-sm max-w-xs mx-auto mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        Ask me anything about Math, Science, or Bangla! ✨
                    </p>
                    
                    {/* Unique Floating Chips */}
                    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                        {suggestions.map((s, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setInput(s.text)}
                                className={`
                                    p-3 rounded-xl text-xs md:text-sm font-medium text-left flex items-center gap-2 transition-all hover:scale-105
                                    ${theme === 'dark' 
                                        ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700' 
                                        : 'bg-white/60 hover:bg-white text-slate-700 border border-white/60 shadow-sm'
                                    }
                                `}
                            >
                                <span className="text-lg">{s.icon}</span>
                                <span className="truncate">{s.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages - Passing messages to List which implements Lenis */}
            <MessageList messages={messages} />

        </div>

        {/* Input Area */}
        <div className="p-4 z-40 bg-gradient-to-t from-transparent to-transparent">
             <div className="max-w-3xl mx-auto space-y-3">
                
                {/* Input Bar */}
                <div className={`p-2 rounded-[2rem] shadow-xl flex items-end gap-2 relative backdrop-blur-xl transition-all duration-500 ${panelClass}`}>
                    {/* Image Preview */}
                    {selectedImage && (
                        <div className="absolute -top-16 left-4 animate-in fade-in slide-in-from-bottom-2">
                            <img src={selectedImage} alt="Preview" className="h-14 rounded-lg border-2 border-white shadow-md object-cover" />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:scale-110 transition-transform"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Upload Image"
                    >
                        <ImageIcon size={22} />
                    </button>
                    
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 rounded-full transition-colors md:hidden ${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-400 hover:text-blue-600'}`}
                    >
                        <Camera size={22} />
                    </button>

                    {/* Mic Button */}
                    <button
                        onClick={handleVoiceInput}
                        className={`
                            p-3 rounded-full transition-all duration-200
                            ${isListening 
                                ? 'bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50' 
                                : (theme === 'dark' ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50')
                            }
                        `}
                    >
                        <Mic size={22} />
                    </button>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask me anything..."
                        className={`w-full bg-transparent border-none focus:ring-0 resize-none py-3 placeholder-opacity-50 max-h-32 min-h-[48px] ${theme === 'dark' ? 'text-slate-200 placeholder-slate-500' : 'text-gray-700 placeholder-gray-400'}`}
                        rows={1}
                    />

                    <button 
                        onClick={handleSend}
                        disabled={(!input.trim() && !selectedImage) || isLoading}
                        className={`
                            p-3 rounded-full flex-shrink-0 transition-all duration-300 shadow-lg mb-1 mr-1
                            ${(!input.trim() && !selectedImage) || isLoading
                                ? (theme === 'dark' ? 'bg-slate-800 text-slate-600' : 'bg-gray-200 text-gray-400 shadow-none') 
                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-110 shadow-blue-500/30'
                            }
                        `}
                    >
                        {isLoading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                    </button>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}

export default App;