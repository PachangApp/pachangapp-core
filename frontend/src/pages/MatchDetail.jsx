import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { API_BASE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";

const MatchDetail = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const authHeaders = currentUser.token ? { "Authorization": `Bearer ${currentUser.token}` } : {};

  const fetchMatch = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/partidos/${id}`, { headers: authHeaders });
      if (!response.ok) throw new Error("Partido no encontrado");
      const data = await response.json();
      setMatch(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/mensajes/partido/${id}`, { headers: authHeaders });
      if (resp.ok) {
        const data = await resp.json();
        setMessages(data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchMatch();
    fetchMessages();
    const interval = setInterval(() => {
        fetchMatch();
        fetchMessages();
    }, 4000); 
    return () => clearInterval(interval);
  }, [id]);

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
        alert("¡Partido finalizado y estadísticas repartidas! 🏆");
      }
    } catch {
      alert("Error al finalizar");
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

  if (loading && !match) return <div className="p-20 text-center">Cargando...</div>;
  if (error) return <div className="p-20 text-center text-red-500">Error: {error}</div>;

  const isOrganizer = currentUser.id === match.organizador.id;
  const teamWhite = match.participaciones.filter(p => p.equipo === 'BLANCO');
  const teamBlack = match.participaciones.filter(p => p.equipo === 'NEGRO');
  const unassigned = match.participaciones.filter(p => p.equipo === 'NINGUNO' || !p.equipo);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32 md:pb-0">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <section className="bg-white rounded-4xl p-8 shadow-xl border border-gray-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
                <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${match.estado === 'FINALIZADO' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600 animate-pulse'}`}>
                    {match.estado}
                </span>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-2">
                Partido en <span className="text-emerald-600">{match.reserva.campo.nombre}</span>
            </h1>
            <p className="text-gray-500 font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {match.reserva.fecha} a las {match.reserva.horaInicio.substring(0,5)}
            </p>

            {match.estado === 'FINALIZADO' && (
                <div className="mt-8 flex items-center justify-center gap-12 bg-gray-900 text-white p-8 rounded-3xl">
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">Equipo Blanco</p>
                        <span className="text-6xl font-black">{match.marcadorA}</span>
                    </div>
                    <div className="text-4xl font-black text-emerald-500">VS</div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">Equipo Negro</p>
                        <span className="text-6xl font-black">{match.marcadorB}</span>
                    </div>
                </div>
            )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-900 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full border border-gray-200 shrink-0 bg-white shadow-sm"></div>
                                Equipo Local
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">{teamWhite.length} jugadores</span>
                        </h3>
                        <div className="space-y-3">
                            {teamWhite.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={p.user.avatar || `https://ui-avatars.com/api/?name=${p.user.username}&background=random`} 
                                            className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                                            alt={p.user.username}
                                        />
                                        <span className="font-bold text-gray-700 text-sm">{p.user.username}</span>
                                    </div>
                                    {isOrganizer && match.estado !== 'FINALIZADO' && (
                                        <button onClick={() => handleAssignTeam(p.user.id, 'NINGUNO')} className="text-xs text-red-500 font-bold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"> Quitar</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-900 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full border border-gray-800 shrink-0 bg-gray-900 shadow-sm"></div>
                                Equipo Visitante
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">{teamBlack.length} jugadores</span>
                        </h3>
                        <div className="space-y-3">
                            {teamBlack.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 bg-gray-900 text-white rounded-2xl shadow-md">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={p.user.avatar || `https://ui-avatars.com/api/?name=${p.user.username}&background=random`} 
                                            className="w-8 h-8 rounded-full object-cover border border-gray-700 shadow-sm"
                                            alt={p.user.username}
                                        />
                                        <span className="font-bold text-sm">{p.user.username}</span>
                                    </div>
                                    {isOrganizer && match.estado !== 'FINALIZADO' && (
                                        <button onClick={() => handleAssignTeam(p.user.id, 'NINGUNO')} className="text-xs text-emerald-400 font-bold px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"> Quitar</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {unassigned.length > 0 && match.estado !== 'FINALIZADO' && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100">
                        <h3 className="font-black text-gray-900 mb-6">Jugadores por asignar ({unassigned.length})</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {unassigned.map(p => (
                                <div key={p.id} className="bg-emerald-50 p-2 rounded-2xl border border-emerald-100 flex items-center justify-between gap-2 shadow-sm">
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
                                            <button 
                                                onClick={() => handleAssignTeam(p.user.id, 'BLANCO')} 
                                                className="w-6 h-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 active:scale-95 group relative bg-white" 
                                                title="Asignar al equipo Local">
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">Local</span>
                                            </button>
                                            <button 
                                                onClick={() => handleAssignTeam(p.user.id, 'NEGRO')} 
                                                className="w-6 h-6 rounded-full border border-gray-800 shadow-sm transition-transform hover:scale-110 active:scale-95 group relative bg-gray-900" 
                                                title="Asignar al equipo Visitante">
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px) py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">Visitante</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-[450px] flex flex-col">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                         Chat del Partido 💬
                    </h3>
                    <div className="flex-1 bg-gray-50 rounded-2xl p-4 overflow-y-auto mb-4 space-y-3">
                        {messages.map(m => (
                            <div key={m.id} className={`flex flex-col ${m.user.id === currentUser.id ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{m.user.username}</span>
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                                    m.user.id === currentUser.id 
                                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                }`}>
                                    {m.contenido}
                                </div>
                                <span className="text-[9px] text-gray-300 mt-1 font-medium italic">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..." 
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 font-medium" 
                        />
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>

                {isOrganizer && match.estado !== 'FINALIZADO' && (
                    <button 
                        onClick={() => setShowFinalizeModal(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-3xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        FINALIZAR PARTIDO
                    </button>
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
              <h2 className="text-2xl font-black text-gray-900 mb-2">Introducir Resultado</h2>
              <div className="flex items-center justify-around gap-6 mb-10 mt-8">
                <div className="text-center">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Blanco</label>
                    <input 
                        type="number" 
                        value={scores.a} 
                        onChange={(e) => setScores({...scores, a: e.target.value})}
                        className="w-20 h-20 text-4xl font-black text-center bg-gray-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-gray-900"
                    />
                </div>
                <div className="text-2xl font-black text-emerald-500 mt-6">-</div>
                <div className="text-center">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Negro</label>
                    <input 
                        type="number" 
                        value={scores.b} 
                        onChange={(e) => setScores({...scores, b: e.target.value})}
                        className="w-20 h-20 text-4xl font-black text-center bg-gray-50 border-none rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-gray-900"
                    />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                    onClick={() => setShowFinalizeModal(false)}
                    className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleFinalize}
                    className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200"
                >
                    Guardar
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
