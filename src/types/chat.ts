export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachedAnimalId?: string;
  attachedAnimalName?: string;
  suggestedQuestions?: string[];
  suggestedQuestionsUr?: string[];
  isEmergencyAlert?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  activeAnimalId?: string;
}
