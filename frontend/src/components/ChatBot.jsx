import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pachanBotImg from "../assets/PachanBot.png";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "¡Hola! Soy PachanBot ⚽. ¿En qué puedo ayudarte hoy?", 
      sender: "bot",
      options: [
        { id: "reservar", text: "🏟️ ¿Cómo reservo pista?", action: "como_reservar" },
        { id: "unirse", text: "⚽ ¿Cómo me uno a un partido?", action: "como_unirse" },
        { id: "buscar", text: "🔍 Buscar partido libre", action: "buscar_partido" }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ---- URL de n8n ----
  // Local (pruebas):     http://localhost:5678/webhook-test/pachanbot-chat
  // Producción (activo): http://<IP_AWS>:30678/webhook/pachanbot-chat
  // https://n8n.pachangapp.es/webhook-test/pachanbot-chat
  const N8N_WEBHOOK_URL = "https://n8n.pachangapp.es/webhook-test/pachanbot-chat";

  const processBotResponse = async (actionOrText) => {
    // Definimos si es una acción de botón o texto libre
    const isAction = ["buscar_partido", "como_reservar", "como_unirse"].includes(actionOrText);
    
    // Si es una acción, buscamos el texto descriptivo para que la IA tenga contexto
    let chatInput = actionOrText;
    if (actionOrText === "buscar_partido") chatInput = "Busca partidos libres disponibles para jugar";
    if (actionOrText === "como_reservar") chatInput = "¿Cómo puedo reservar una pista?";
    if (actionOrText === "como_unirse") chatInput = "¿Cómo me uno a un partido existente?";

    const payload = {
      action: isAction ? actionOrText : "buscar_partido",
      chatInput: chatInput,
      sessionId: "sesion-pachangueo" // Identificador para la memoria de n8n
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Error en la comunicación con n8n");
      
      const data = await response.json();

      const botResponse = { 
        id: Date.now() + 1, 
        text: data.respuesta || "No he recibido una respuesta clara de mi cerebro central... 🤖", 
        sender: "bot" 
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    } catch (error) {
      console.error("ChatBot Error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Ups, los servidores de PachangApp están calentando. Prueba de nuevo en unos segundos. ⚽", 
        sender: "bot" 
      }]);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), text: inputValue, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    processBotResponse(inputValue);
  };

  const handleOptionClick = (opt) => {
    const userMessage = { id: Date.now(), text: opt.text, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Process the specific action string in n8n
    processBotResponse(opt.action);
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-white shrink-0">
                <img src={pachanBotImg} alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-white font-black text-sm truncate">PachanBot</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                  <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">En línea</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="ml-auto p-1.5 text-white/80 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3 min-h-[300px]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.sender === 'user' 
                      ? "bg-emerald-600 text-white self-end rounded-tr-none" 
                      : "bg-white text-gray-700 self-start rounded-tl-none border border-gray-100"
                  }`}
                >
                  <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</span>
                  {msg.options && (
                    <div className="mt-3 flex flex-col gap-2">
                      {msg.options.map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => handleOptionClick(opt)}
                          className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold py-2.5 px-3 rounded-xl text-left transition-colors shadow-sm active:scale-95 duration-100"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none self-start flex gap-1 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text"
                placeholder="Escribe un mensaje..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-gray-100 border-none rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 font-medium text-gray-900"
              />
              <button 
                onClick={handleSend}
                className="p-2.5 bg-emerald-600 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full shadow-2xl border-4 border-emerald-600 overflow-hidden flex items-center justify-center p-0.5 relative transition-all"
      >
        <img src={pachanBotImg} alt="PachanBot" className="w-full h-full object-cover rounded-full" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
      </motion.button>
    </div>
  );
};

export default ChatBot;
