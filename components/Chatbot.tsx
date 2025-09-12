
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types.ts';
import { startChat, streamChat } from '../services/geminiService.ts';
import { ChatIcon, CloseIcon, SendIcon } from './icons.tsx';
import { useTranslation } from '../contexts/LanguageContext.tsx';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();
  const langName = language === 'en' ? 'English' : 'Tamil';

  // Re-initialize chat when language changes
  useEffect(() => {
    startChat(langName);
    // When language changes, clear the chat history for the new conversation context
    setMessages([]);
  }, [langName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let fullResponse = '';
    const newModelMessage: ChatMessage = { role: 'model', text: '' };
    setMessages(prev => [...prev, newModelMessage]);

    try {
      const stream = streamChat(input, langName);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: fullResponse };
          return newMessages;
        });
      }
    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'model', text: t('chatbot.errorMessage') };
            return newMessages;
        });
    } finally {
        setIsLoading(false);
    }
  }, [input, isLoading, langName, t]);

  const ChatBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${isUser ? 'bg-green-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
          <p className="whitespace-pre-wrap text-sm">{message.text}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-transform hover:scale-110 focus:outline-none z-50"
        aria-label={t('chatbot.toggleAria')}
      >
        {isOpen ? <CloseIcon className="h-8 w-8" /> : <ChatIcon className="h-8 w-8" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] sm:w-80 md:w-96 h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border border-slate-200">
          <header className="bg-green-800 text-white p-4 rounded-t-2xl shadow-md">
            <h3 className="font-bold text-lg">{t('chatbot.header')}</h3>
          </header>
          <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
            {isLoading && messages[messages.length - 1]?.role === 'model' && !messages[messages.length - 1]?.text && (
                 <div className="flex justify-start">
                    <div className="bg-slate-200 text-slate-800 rounded-2xl rounded-bl-none p-3 shadow-sm">
                        <div className="flex items-center space-x-1">
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <footer className="p-3 border-t border-slate-200 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('chatbot.placeholder')}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                disabled={isLoading}
              />
              <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-slate-400 transition-all duration-200">
                <SendIcon className="h-5 w-5"/>
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default Chatbot;
