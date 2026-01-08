export enum Subject {
  GENERAL = 'General',
  WEB_SEARCH = 'Web Search',
  DEEP_THINK = 'Deep Think',
  BANGLA = 'Bangla',
  ENGLISH = 'English',
  MATH = 'Math',
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology',
  HISTORY = 'History',
  BANGLADESH_STUDIES = 'BD Studies'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  isStreaming?: boolean;
  timestamp: number;
  groundingMetadata?: {
    groundingChunks?: Array<{
      web?: { uri: string; title: string };
    }>;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  subject: Subject;
  messages: Message[];
}
