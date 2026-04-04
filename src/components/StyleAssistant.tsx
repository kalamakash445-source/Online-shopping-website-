import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function StyleAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Welcome to Bazaar's Style Concierge. How can I help you elevate your wardrobe today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are a luxury fashion concierge for 'Bazaar', a premium boutique. You provide sophisticated, personalized style advice. Keep responses concise, elegant, and helpful. Focus on quality, materials, and timeless trends.",
        }
      });

      const aiText = response.text || "I apologize, but I'm unable to provide styling advice at this moment. Please try again later.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm experiencing a brief connectivity issue. How else can I assist you?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 bg-premium-black text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-premium-gold transition-all duration-500 group"
      >
        <Sparkles className="group-hover:scale-110 transition-transform" size={24} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-premium-gold rounded-full animate-pulse border-2 border-white" />
      </button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 md:bottom-24 md:right-8 z-50 w-[calc(100vw-3rem)] md:w-96 h-[500px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-premium-black text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-premium-gold rounded-lg flex items-center justify-center">
                  <Sparkles className="text-premium-black" size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase">Style Concierge</h3>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Powered by Gemini AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-premium-gold text-white rounded-tr-none' 
                      : 'bg-premium-gray text-premium-black rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-premium-gray p-4 rounded-2xl rounded-tl-none">
                    <Loader2 className="animate-spin text-premium-gold" size={16} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for styling advice..."
                  className="w-full pl-4 pr-12 py-3 bg-premium-gray rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-premium-gold transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-premium-black text-white rounded-lg flex items-center justify-center hover:bg-premium-gold transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
