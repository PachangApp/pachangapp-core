import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';

const TournamentChat = ({ tournamentId }) => {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef(null);

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
    
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = { 
        'Content-Type': 'application/json',
        ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
      };
      
      const res = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: inputVal })
      });
      if (res.ok) {
        setInputVal("");
        fetchMessages();
      }
    } catch (e) {
      console.error("Error sending message", e);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[500px] text-gray-900">
      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-3xl">
        <h3 className="font-bold flex items-center gap-2">
          💬 Chat Live
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        </h3>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex flex-col bg-gray-50 max-w-[85%] p-3 rounded-2xl rounded-tl-sm self-start`}
          >
            <span className="text-xs font-bold text-gray-500 mb-1">{msg.sender?.username || 'User'}</span>
            <span className="text-sm text-gray-800">{msg.content}</span>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Anima a tu equipo..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 placeholder-gray-400"
          />
          <button 
            type="submit"
            className="bg-primary text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentChat;
