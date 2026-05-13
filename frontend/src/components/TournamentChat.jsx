import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL, N8N_TRANSLATE_URL } from '../apiConfig';

const TournamentChat = ({ tournamentId }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [translations, setTranslations] = useState({});  // { messageId: "texto traducido" }
  const [translating, setTranslating] = useState({});     // { messageId: true/false }

  const getUser = () => {
    try {
      const u = localStorage.getItem("user");
      if (u && u !== "undefined") return JSON.parse(u);
    } catch(e) {}
    return {};
  };

  const storedUser = getUser();
  const currentUsername = storedUser.username || "Guest";
  const authHeaders = storedUser.token
    ? { 'Authorization': `Bearer ${storedUser.token}` }
    : {};

  // useCallback so the interval always has a stable reference
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/chat`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Error fetching chat messages:", e);
    }
  }, [tournamentId, storedUser.token]);

  // Initial fetch + polling every 3s (same pattern as MatchDetail)
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);


  const handleSend = async (e) => {
    e.preventDefault();
    const content = inputVal.trim();
    if (!content) return;
    setInputVal("");

    try {
      const res = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        // Fetch immediately after sending so sender also sees the message
        fetchMessages();
      }
    } catch (e) {
      console.error("Error sending message:", e);
    }
  };

  const handleTranslate = async (messageId, originalText) => {
    // Si ya está traducido, ocultamos la traducción (toggle)
    if (translations[messageId]) {
      setTranslations(prev => {
        const copy = { ...prev };
        delete copy[messageId];
        return copy;
      });
      return;
    }

    // Detectar el idioma actual de la app
    const currentLang = i18n.language === 'es' ? 'Spanish' : 'English';

    setTranslating(prev => ({ ...prev, [messageId]: true }));
    try {
      const resp = await fetch(N8N_TRANSLATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          targetLang: currentLang
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setTranslations(prev => ({ ...prev, [messageId]: data.translatedText }));
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslating(prev => ({ ...prev, [messageId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 flex flex-col h-[550px] min-h-[500px] text-gray-900 overflow-hidden relative z-0">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 flex justify-between items-center">
        <h3 className="font-black flex items-center gap-2 text-lg text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-emerald-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125a3 3 0 0 0 3.75 3.75l.495-.165A3.75 3.75 0 0 1 10.5 21V19.5a.75.75 0 0 0-.75-.75H7.5A3.75 3.75 0 0 1 3.75 15V11.25a3.75 3.75 0 0 1 3.75-3.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H7.5Z" />
          </svg>
          {t('tournaments.chat.live_chat')}
        </h3>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {t('tournaments.chat.online')}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 relative z-10 custom-scrollbar">
        <AnimatePresence>
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, i) => {
              const senderUsername = msg.sender?.username || 'User';
              const isMe = senderUsername === currentUsername;
              const msgId = msg.id || `msg-${i}`;
              return (
                <motion.div
                  layout
                  key={msgId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  {!isMe && (
                    <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1 tracking-wider uppercase">
                      {senderUsername}
                    </span>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md shadow-emerald-600/20'
                      : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Traducción mostrada debajo */}
                  {translations[msgId] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`mt-1 px-4 py-2 rounded-xl text-xs italic ${
                        isMe
                          ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/20'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}
                    >
                      {translations[msgId]}
                      <span className="block text-[9px] mt-1 opacity-60 not-italic font-bold">
                        ✨ {t('tournaments.chat.translated_by_ai')}
                      </span>
                    </motion.div>
                  )}

                  {/* Fila de timestamp + botón traducir */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-gray-300 font-medium italic">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {!isMe && (
                      <button
                        onClick={() => handleTranslate(msgId, msg.content)}
                        disabled={translating[msgId]}
                        className="text-[9px] text-gray-400 hover:text-blue-500 transition-colors font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title={t('tournaments.chat.translate')}
                      >
                        {translating[msgId] ? (
                          <span className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        )}
                        {translations[msgId] ? '✕' : t('tournaments.chat.translate')}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125a3 3 0 0 0 3.75 3.75l.495-.165A3.75 3.75 0 0 1 10.5 21V19.5a.75.75 0 0 0-.75-.75H7.5A3.75 3.75 0 0 1 3.75 15V11.25a3.75 3.75 0 0 1 3.75-3.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H7.5Z" />
              </svg>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                {t('tournaments.chat.no_messages') || 'No messages yet'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white z-10">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={t('tournaments.chat.cheer_team')}
            className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-gray-900 font-medium placeholder-gray-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-emerald-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-emerald-600/30 flex-shrink-0"
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
