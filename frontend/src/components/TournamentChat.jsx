import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../apiConfig';

const TournamentChat = ({ tournamentId }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef(null);

  const getUser = () => {
    try {
      const u = localStorage.getItem("user");
      if (u && u !== "undefined") return JSON.parse(u);
    } catch(e) {}
    return {};
  };

  const storedUser = getUser();
  const currentUsername = storedUser.username || "Guest";

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling cada 3s
    return () => clearInterval(interval);
  }, [tournamentId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    const content = inputVal;
    setInputVal("");

    // Optimistic Update
    const tempMsg = {
      id: Date.now(),
      content: content,
      sender: { username: currentUsername },
      timestamp: new Date().toISOString(),
      isOptimistic: true
    };
    setMessages(prev => [...prev, tempMsg]);
    
    try {
      const u = localStorage.getItem("user");
      const headers = { 
        'Content-Type': 'application/json'
      };
      if (u && u !== "undefined") {
        const parsed = JSON.parse(u);
        if (parsed.token) headers['Authorization'] = `Bearer ${parsed.token}`;
      }
      
      const res = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (e) {
      console.error("Error sending message", e);
      // Remove optimistic message if failed
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-gray-100 flex flex-col h-[550px] min-h-[500px] text-gray-900 overflow-hidden relative z-0">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="p-5 border-b border-gray-100/50 bg-white/50 backdrop-blur-md z-10 flex justify-between items-center">
        <h3 className="font-black flex items-center gap-2 text-lg">
          💬 {t('tournaments.chat.live_chat')}
        </h3>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          {t('tournaments.chat.online')}
        </div>
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 hide-scrollbar relative z-10">
        <AnimatePresence>
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, i) => {
              const isMe = msg.sender?.username === currentUsername;
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id || `msg-${i}`} 
                  className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'} drop-shadow-sm`}
                >
                  {!isMe && <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1 tracking-wider uppercase">{msg.sender?.username || 'User'}</span>}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-tr-sm shadow-md shadow-primary/20' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                    {msg.content}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-30">
              <span className="text-5xl mb-4">💬</span>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('tournaments.chat.no_messages') || 'No hay mensajes aún'}</p>
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-1" />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-100/50 bg-white/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-200/60 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-primary/40 transition-shadow shadow-inner">
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={t('tournaments.chat.cheer_team')}
            className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-gray-900 placeholder-gray-400 font-medium"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:shadow-lg transition-all shadow-md shadow-primary/30 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default TournamentChat;

