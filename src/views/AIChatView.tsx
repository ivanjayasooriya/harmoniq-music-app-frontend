import React, { useState } from 'react';
import {
  Bot,
  MessageSquareHeart,
  Music,
  Play,
  Send,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  recommendedTrackId?: string;
}

export const AIChatView: React.FC = () => {
  const { playTrack, queue } = useAudio();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hey there! I am your HarmoniQ AI Music Assistant. Looking for a mood, discovering fresh artists, or wanting a personalized playlist recommendation? Just ask me!',
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await api.chat.sendPrompt(userText);
      const aiMsg: ChatMessage = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedTrackId: queue[0]?.id,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Fallback
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    'Recommend atmospheric synthwave tracks for coding',
    'Suggest calm lo-fi rain songs for studying',
    'What are the trending hits on HarmoniQ today?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-zinc-900 to-zinc-950 border border-cyan-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              HarmoniQ AI DJ & Sound Assistant
            </h1>
            <p className="text-xs text-zinc-400">
              Powered by Spring Boot ChatController & generative music intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 min-h-[460px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[440px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-lg rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-black font-medium'
                    : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/60'
                }`}
              >
                <p>{msg.text}</p>

                {msg.recommendedTrackId && queue[0] && (
                  <div className="mt-3 pt-3 border-t border-zinc-700/60 flex items-center justify-between gap-3 bg-zinc-900/80 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={queue[0].coverUrl}
                        alt="Art"
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{queue[0].title}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{queue[0].artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => playTrack(queue[0])}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      Play Now
                    </button>
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-black/60' : 'text-zinc-500'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-zinc-800 text-xs text-zinc-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInputValue(prompt)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <form onSubmit={handleSend} className="relative flex items-center gap-2 pt-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask HarmoniQ for recommendations, playlist ideas, or music trivia..."
            className="flex-1 bg-zinc-950 border border-zinc-800 text-xs md:text-sm text-white placeholder-zinc-500 px-4 py-3 rounded-2xl focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-bold disabled:opacity-40 transition hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
