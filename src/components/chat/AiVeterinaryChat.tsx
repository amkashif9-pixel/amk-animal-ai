import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n';
import { useAnimals } from '../../context/AnimalContext';
import { ChatMessage } from '../../types/chat';
import { sendVeterinaryChatMessage } from '../../services/aiService';
import {
  MessageSquareText,
  Send,
  Trash2,
  Paperclip,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  HelpCircle,
  FolderHeart,
} from 'lucide-react';

interface AiVeterinaryChatProps {
  initialCaseSummary?: string;
}

export const AiVeterinaryChat: React.FC<AiVeterinaryChatProps> = ({ initialCaseSummary }) => {
  const { t, language } = useLanguage();
  const isUrdu = language === 'ur';
  const { animals } = useAnimals();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      content: isUrdu
        ? 'خوش آمدید! میں **اے ایم کے اینیمل اے آئی** کا ویٹرنری اسسٹنٹ ہوں۔ آپ مجھ سے جانوروں کی بیماریوں، علاج، خوراک، منڈی ریٹ اور ویکسینیشن کے متعلق اردو یا انگلش میں کوئی بھی سوال پوچھ سکتے ہیں۔'
        : 'Welcome! I am **AMK Animal AI** Virtual Veterinary Specialist. Ask me any inquiry regarding livestock diseases, nutritional formulations, breeding cycles, or mandi pricing.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState(initialCaseSummary || '');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialCaseSummary && initialCaseSummary.trim()) {
      setInputMessage(initialCaseSummary);
    }
  }, [initialCaseSummary]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const query = presetQuery || inputMessage;
    if (!query.trim() || isLoading) return;

    const attachedAnimal = animals.find((a) => a.id === selectedAnimalId);

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedAnimalId: attachedAnimal?.id,
      attachedAnimalName: attachedAnimal?.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build history for Gemini
      const history = messages
        .filter((m) => m.id !== 'msg_welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: m.content }],
        }));

      const animalContextSummary = attachedAnimal
        ? `Animal: ${attachedAnimal.name}, Species: ${attachedAnimal.species}, Breed: ${attachedAnimal.breed}, Age: ${attachedAnimal.dobOrAge}, Latest Milk: ${
            attachedAnimal.milkRecords[attachedAnimal.milkRecords.length - 1]?.totalLiters || 'N/A'
          } L/day`
        : undefined;

      const reply = await sendVeterinaryChatMessage(
        query,
        history,
        animalContextSummary,
        language
      );

      const botMsg: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg_welcome_' + Date.now(),
        sender: 'assistant',
        content: isUrdu
          ? 'چیٹ کی ہسٹری صاف کر دی گئی ہے۔ نیا سوال پوچھیے۔'
          : 'Chat history cleared. You may start a new consultation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold mb-3">
          <Bot className="w-4 h-4 text-brand-600" />
          <span>{isUrdu ? '24/7 اے آئی ویٹرنری کنسلٹنٹ' : '24/7 Bilingual Veterinary AI'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.chat.title}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          {t.chat.subtitle}
        </p>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md flex flex-col h-[75vh] sm:h-[650px] min-h-[440px] overflow-hidden">
        {/* Top Control Bar: Active Animal Attachment + Clear Chat */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FolderHeart className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <select
              value={selectedAnimalId}
              onChange={(e) => setSelectedAnimalId(e.target.value)}
              className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 truncate max-w-xs"
            >
              <option value="">{isUrdu ? 'کوئی جانور منسلک نہیں (عمومی چیٹ)' : 'No Animal Context (General)'}</option>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  Attach: {a.name} ({a.breed})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white transition flex items-center gap-1 font-semibold text-[11px]"
            title={t.chat.clearChat}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.chat.clearChat}</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                    isBot
                      ? 'bg-gradient-to-br from-brand-600 to-forest-900 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-3xl p-4 text-xs leading-relaxed ${
                    isBot
                      ? 'bg-slate-50 border border-slate-200/80 text-slate-800'
                      : 'bg-brand-600 text-white shadow-sm'
                  }`}
                >
                  {msg.attachedAnimalName && (
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 text-brand-200 flex items-center gap-1">
                      <FolderHeart className="w-3 h-3" />
                      <span>{msg.attachedAnimalName}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                    {msg.content}
                  </div>

                  <span
                    className={`block text-[10px] mt-1.5 font-mono ${
                      isBot ? 'text-slate-400' : 'text-brand-100 text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-600 to-forest-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 animate-spin" />
                <span>{isUrdu ? 'اے آئی ڈاکٹر جواب تیار کر رہا ہے...' : 'AI Veterinary Specialist is thinking...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex-shrink-0">
            {isUrdu ? 'تجویز کردہ:' : 'Try:'}
          </span>
          {[t.chat.q1, t.chat.q2, t.chat.q3, t.chat.q4].map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(undefined, q)}
              className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand-700 hover:border-brand-300 transition flex-shrink-0 truncate max-w-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t.chat.placeholder}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm font-medium"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3 rounded-2xl font-bold transition flex items-center justify-center shadow-md ${
              !inputMessage.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/30'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
