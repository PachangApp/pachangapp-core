import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { API_BASE_URL, N8N_TRANSLATE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import { formatDate } from "../utils/dateFormatter";
import Counter from "../components/Counter";
import { useToast } from "../context/ToastContext";

const MatchDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { showToast } = useToast();
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState({});

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const authHeaders = useMemo(() => currentUser.token ? { "Authorization": `Bearer ${currentUser.token}` } : {}, [currentUser.token]);

  const fetchMatch = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/partidos/${id}`, { headers: authHeaders });
      if (!response.ok) throw new Error(t('match_detail.not_found'));
      const data = await response.json();
      setMatch(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, authHeaders]);

  const fetchMessages = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/mensajes/partido/${id}`, { headers: authHeaders });
      if (resp.ok) {
        const data = await resp.json();
        setMessages(data);
      }
    } catch (err) { console.error(err); }
  }, [id, authHeaders]);

  useEffect(() => {
    fetchMatch();
    fetchMessages();
    const interval = setInterval(() => {
        fetchMatch();
        fetchMessages();
    }, 4000); 
    return () => clearInterval(interval);
  }, [fetchMatch, fetchMessages]);

  const handleAssignTeam = async (userId, equipo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/partidos/${id}/asignar-equipo?userId=${userId}&equipo=${equipo}`, {
        method: "POST",
        headers: authHeaders
      });
      if (response.ok) fetchMatch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalize = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/partidos/${id}/finalizar?marcadorA=${scores.a}&marcadorB=${scores.b}`, {
        method: "POST",
        headers: authHeaders
      });
      if (response.ok) {
        setShowFinalizeModal(false);
        fetchMatch();
        showToast(t('match_detail.finalize_success'), "success");
      } else {
        const errorMsg = await response.text();
        showToast(errorMsg || t('match_detail.finalize_error'), "error");
      }
    } catch (err) {
      showToast(t('match_detail.finalize_error'), "error");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/mensajes`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...authHeaders 
        },
        body: JSON.stringify({
          partidoId: id,
          userId: currentUser.id,
          contenido: newMessage
        })
      });
      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) { console.error(err); }
  };

  const handleTranslate = async (messageId, originalText) => {
    if (translations[messageId]) {
      setTranslations(prev => {
        const copy = { ...prev };
        delete copy[messageId];
        return copy;
      });
      return;
    }

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

  if (loading && !match) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-32 md:pb-0">
        <Navbar />
        <LoadingScreen text={t('match_detail.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-4xl shadow-xl border border-red-50 text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight italic">Error</h2>
          <p className="text-gray-500 font-medium mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-all uppercase tracking-widest text-xs"
          >
            Reintentar
          </button>
        </motion.div>
      </div>
    );
  }

  const isOrganizer = currentUser.id === match.organizador.id;
  const teamWhite = match.participaciones.filter(p => p.equipo === 'BLANCO').sort((a, b) => a.user.username.localeCompare(b.user.username));
  const teamBlack = match.participaciones.filter(p => p.equipo === 'NEGRO').sort((a, b) => a.user.username.localeCompare(b.user.username));
  const unassigned = match.participaciones.filter(p => p.equipo === 'NINGUNO' || !p.equipo).sort((a, b) => a.user.username.localeCompare(b.user.username));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32 md:pb-0">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="bg-white rounded-4xl p-8 shadow-xl border border-gray-100 mb-8 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-6">
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${match.estado === 'FINALIZADO' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600 animate-pulse'}`}
                >
                    {match.estado === 'FINALIZADO' ? t('match_detail.status_finished') : t('match_detail.status_open')}
                </motion.span>
            </div>
            
            <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black text-gray-900 mb-2 flex items-center flex-wrap"
            >
                {t('match_detail.match_at')} <span className="text-emerald-600 ml-2">{match.reserva.campo.nombre}</span>
                {match.reserva.campo.locationUrl && (
                    <a 
                      href={match.reserva.campo.locationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-4 inline-flex items-center gap-1.5 text-[10px] font-black text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {t('match_detail.view_location') || "Ver Ubicación"}
                    </a>
                )}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 font-bold flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {formatDate(match.reserva.fecha)} {t('match_detail.at_time')} {match.reserva.horaInicio.substring(0,5)}
            </motion.p>

            {match.estado === 'FINALIZADO' && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-8 flex items-center justify-center gap-12 bg-gray-900 text-white p-8 rounded-3xl"
                >
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">{t('match_detail.team_white')}</p>
                        <span className="text-6xl font-black">{match.marcadorA}</span>
                    </div>
                    <div className="text-4xl font-black text-emerald-500">VS</div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">{t('match_detail.team_black')}</p>
                        <span className="text-6xl font-black">{match.marcadorB}</span>
                    </div>
                </motion.div>
            )}
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <h3 className="font-black text-gray-900 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full border border-gray-200 shrink-0 bg-white shadow-sm"></div>
                                {t('match_detail.local_team')}
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">{t('match_detail.players_count', { count: teamWhite.length })}</span>
                        </h3>
                        <div className="space-y-3">
                            {teamWhite.map((p, idx) => (
                                <motion.div 
                                    key={p.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-2xl border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={p.user.avatar || `https://ui-avatars.com/api/?name=${p.user.username}&background=random`} 
                                            className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                                            alt={p.user.username}
                                        />
                                        <span className="font-bold text-gray-700 text-sm">{p.user.username}</span>
                                    </div>
                                    {isOrganizer && match.estado !== 'FINALIZADO' && (
                                        <button onClick={() => handleAssignTeam(p.user.id, 'NINGUNO')} className="text-xs text-red-500 font-bold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors">{t('match_detail.remove_player')}</button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <h3 className="font-black text-gray-900 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full border border-gray-800 shrink-0 bg-gray-900 shadow-sm"></div>
                                {t('match_detail.visitor_team')}
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">{t('match_detail.players_count', { count: teamBlack.length })}</span>
                        </h3>
                        <div className="space-y-3">
                            {teamBlack.map((p, idx) => (
                                <motion.div 
                                    key={p.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                    className="flex items-center justify-between p-2 bg-gray-900 text-white rounded-2xl shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={p.user.avatar || `https://ui-avatars.com/api/?name=${p.user.username}&background=random`} 
                                            className="w-8 h-8 rounded-full object-cover border border-gray-700 shadow-sm"
                                            alt={p.user.username}
                                        />
                                        <span className="font-bold text-sm">{p.user.username}</span>
                                    </div>
                                    {isOrganizer && match.estado !== 'FINALIZADO' && (
                                        <button onClick={() => handleAssignTeam(p.user.id, 'NINGUNO')} className="text-xs text-emerald-400 font-bold px-2 py-1 hover:bg-white/10 rounded-lg transition-colors">{t('match_detail.remove_player')}</button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {unassigned.length > 0 && match.estado !== 'FINALIZADO' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100"
                    >
                        <h3 className="font-black text-gray-900 mb-6">{t('match_detail.unassigned_players', { count: unassigned.length })}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {unassigned.map((p, idx) => (
                                <motion.div 
                                    key={p.id} 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.7 + (idx * 0.1) }}
                                    className="bg-emerald-50 p-2 rounded-2xl border border-emerald-100 flex items-center justify-between gap-2 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden px-1">
                                        <img 
                                            src={p.user.avatar || `https://ui-avatars.com/api/?name=${p.user.username}&background=10b981&color=fff`} 
                                            className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0"
                                            alt={p.user.username}
                                        />
                                        <span className="font-bold text-emerald-900 text-sm truncate">{p.user.username}</span>
                                    </div>
                                    {isOrganizer && (
                                        <div className="flex gap-1.5 shrink-0 pr-1">
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleAssignTeam(p.user.id, 'BLANCO')} 
                                                className="w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform group relative bg-white" 
                                                title="Asignar al equipo Local">
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">{t('match_detail.white')}</span>
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleAssignTeam(p.user.id, 'NEGRO')} 
                                                className="w-6 h-6 rounded-full border border-gray-800 shadow-sm transition-transform group relative bg-gray-900" 
                                                title="Asignar al equipo Visitante">
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">{t('match_detail.black')}</span>
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="space-y-6">
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-[450px] flex flex-col"
                >
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                         {t('match_chat.title')}
                    </h3>
                    <div className="flex-1 bg-gray-50 rounded-2xl p-4 overflow-y-auto mb-4 space-y-3">
                        <AnimatePresence>
                            {messages.map(m => {
                                const isMe = m.user.id === currentUser.id;
                                const msgId = m.id;
                                return (
                                    <motion.div 
                                        key={msgId} 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1 px-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{m.user.username}</span>
                                        </div>
                                        <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                                            isMe 
                                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                        }`}>
                                            {m.contenido}
                                        </div>

                                        {/* Traducción */}
                                        {translations[msgId] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className={`mt-1 px-3 py-2 rounded-xl text-xs italic max-w-[85%] ${
                                                    isMe
                                                        ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/20'
                                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                                }`}
                                            >
                                                {translations[msgId]}
                                                <span className="block text-[9px] mt-1 opacity-60 not-italic font-bold">
                                                    ✨ {t('match_chat.translated_by_ai')}
                                                </span>
                                            </motion.div>
                                        )}

                                        {/* Timestamp + Traducir */}
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] text-gray-300 font-medium italic">
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {!isMe && (
                                                <button
                                                    onClick={() => handleTranslate(msgId, m.contenido)}
                                                    disabled={translating[msgId]}
                                                    className="text-[9px] text-gray-400 hover:text-blue-500 transition-colors font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                >
                                                    {translating[msgId] ? (
                                                        <span className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
                                                    ) : (
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                                        </svg>
                                                    )}
                                                    {translations[msgId] ? '✕' : t('match_chat.translate')}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('match_chat.placeholder')}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 font-medium" 
                        />
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </motion.button>
                    </form>
                </motion.div>

                {isOrganizer && match.estado !== 'FINALIZADO' && (
                    <motion.button 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowFinalizeModal(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-3xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        {t('match_detail.finalize_btn')}
                    </motion.button>
                )}
            </div>
        </div>
      </main>

      <AnimatePresence>
        {showFinalizeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm bg-black/40">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-4xl p-10 max-w-md w-full shadow-2xl overflow-hidden relative"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">{t('match_detail.enter_result')}</h2>
              <div className="flex items-center justify-around gap-6 mb-10 mt-8">
                <Counter 
                    label={t('match_detail.white')}
                    value={scores.a} 
                    onChange={(val) => setScores({...scores, a: val})}
                    size="lg"
                    min={0}
                    labelAlign="center"
                />
                <div className="text-4xl font-black text-emerald-500 mt-6">-</div>
                <Counter 
                    label={t('match_detail.black')}
                    value={scores.b} 
                    onChange={(val) => setScores({...scores, b: val})}
                    size="lg"
                    min={0}
                    color="black"
                    labelAlign="center"
                />
              </div>

              <div className="flex gap-4">
                <button 
                    onClick={() => setShowFinalizeModal(false)}
                    className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {t('match_detail.cancel')}
                </button>
                <button 
                    onClick={handleFinalize}
                    className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200"
                >
                    {t('match_detail.save')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MatchDetail;
