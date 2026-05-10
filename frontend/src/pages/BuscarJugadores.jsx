import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Dropdown from "../components/Dropdown";
import { API_BASE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";

// Componente para mostrar la información del jugador en cuadrícula
const PlayerCard = ({ player, onShowProfile, onInvite }) => {
  const { t } = useTranslation();
  
  // Función para traducir la posición que viene de la BD
  const getTranslatedPosition = (pos) => {
    if (!pos) return t("search_players.all_positions");
    
    // Mapeo de nombres en BD (español) a claves de traducción
    const positionMap = {
      "Portero": "goalkeeper",
      "Defensa Central": "center_back",
      "Lateral": "fullback",
      "Mediocentro": "midfielder",
      "Extremo": "winger",
      "Delantero Centro": "striker",
      "Polivalente": "versatile"
    };
    
    const key = positionMap[pos];
    return key ? t(`profile.positions.${key}`) : pos;
  };

  const mainPosition = getTranslatedPosition(player.posicion1);
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
            <img 
              src={player.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + player.username} 
              alt={player.username} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + player.username; }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-lg border-2 border-white shadow-sm">
            Lv.{Math.floor(player.ranking / 100)}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 text-lg truncate max-w-[150px]">@{player.username}</h3>
          <p className="text-emerald-600 font-medium text-xs mt-1 bg-emerald-50 inline-block px-2 py-1 rounded-md">
            {mainPosition}
          </p>
        </div>

        <div className="w-full flex flex-row gap-2 border-t border-gray-50 pt-4 mt-2">
          <button 
            onClick={() => onShowProfile(player)}
            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[11px] hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            {t("search_players.view_profile")}
          </button>
          <button 
            onClick={() => onInvite(player)}
            className="flex-1 py-2 bg-white border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold text-[11px] hover:bg-emerald-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            {t("search_players.invite")}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente Modal para el Perfil Público
const PlayerProfileModal = ({ player, isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen || !player) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
        >
          {/* Cabecera decorativa */}
          <div className="h-28 bg-gradient-to-br from-emerald-500 to-teal-600 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors z-30 cursor-pointer"
            >
              ✕
            </button>
            
            {/* Foto flotante */}
            <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white z-20">
              <img 
                src={player.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + player.username} 
                alt={player.username} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Username en la parte del gradiente */}
            <div className="absolute bottom-4 left-[120px] right-6">
              <h2 className="text-xl font-black text-white drop-shadow-sm truncate">
                @{player.username}
              </h2>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 relative">
            {/* Ranking y Nivel en la parte blanca */}
            <div className="ml-[96px] flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-lg">
                {t("search_players.ranking")} {player.ranking}
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                Lv.{Math.floor(player.ranking / 100)}
              </span>
            </div>

            <div className="space-y-6">
              {/* Estadísticas Reales */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                  <span className="block text-2xl font-black text-gray-900">{player.partidosJugados}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{t("search_players.matches")}</span>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
                  <span className="block text-2xl font-black text-emerald-700">{player.victorias}</span>
                  <span className="text-[10px] font-bold text-emerald-600/70 uppercase">{t("search_players.wins")}</span>
                </div>
                <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-100">
                  <span className="block text-2xl font-black text-red-700">{player.derrotas}</span>
                  <span className="text-[10px] font-bold text-red-600/70 uppercase">{t("search_players.losses")}</span>
                </div>
              </div>

              {/* Posiciones preferidas */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">{t("search_players.preferred_positions")}</h3>
                <div className="flex flex-wrap gap-2">
                  {player.posicion1 && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200">
                      {t(`profile.positions.${{
                        "Portero": "goalkeeper",
                        "Defensa Central": "center_back",
                        "Lateral": "fullback",
                        "Mediocentro": "midfielder",
                        "Extremo": "winger",
                        "Delantero Centro": "striker",
                        "Polivalente": "versatile"
                      }[player.posicion1] || "versatile"}`)}
                    </span>
                  )}
                  {player.posicion2 && (
                    <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-100">
                      {t(`profile.positions.${{
                        "Portero": "goalkeeper",
                        "Defensa Central": "center_back",
                        "Lateral": "fullback",
                        "Mediocentro": "midfielder",
                        "Extremo": "winger",
                        "Delantero Centro": "striker",
                        "Polivalente": "versatile"
                      }[player.posicion2] || "versatile"}`)}
                    </span>
                  )}
                  {player.posicion3 && (
                    <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-100">
                      {t(`profile.positions.${{
                        "Portero": "goalkeeper",
                        "Defensa Central": "center_back",
                        "Lateral": "fullback",
                        "Mediocentro": "midfielder",
                        "Extremo": "winger",
                        "Delantero Centro": "striker",
                        "Polivalente": "versatile"
                      }[player.posicion3] || "versatile"}`)}
                    </span>
                  )}
                  
                  {!player.posicion1 && !player.posicion2 && !player.posicion3 && (
                    <span className="text-sm text-gray-400 italic">{t("search_players.no_preferences")}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Componente Modal para Invitar a Partido
const InviteModal = ({ player, isOpen, onClose, userMatches, onSendInvite }) => {
  const { t } = useTranslation();
  if (!isOpen || !player) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Cabecera con estilo PachangApp */}
          <div className="p-8 bg-gradient-to-br from-emerald-500 to-teal-600 relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black text-white drop-shadow-sm">
              {t("search_players.invite_to", { username: player.username })}
            </h2>
            <p className="text-emerald-50 font-medium mt-1 opacity-90">
              {t("search_players.select_match_invite")}
            </p>
          </div>

          <div className="p-6 overflow-y-auto grow">
            {userMatches && userMatches.length > 0 ? (
              <div className="space-y-4">
                {userMatches.map(match => (
                  <div key={match.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-emerald-200 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900">{match.reserva?.campo?.nombre || t("search_players.match_fallback")}</h4>
                      <p className="text-sm text-gray-500">{match.reserva?.fecha} • {match.reserva?.horaInicio?.substring(0,5)}</p>
                    </div>
                    <button 
                      onClick={() => onSendInvite(match.id)}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                    >
                      {t("search_players.invite")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="text-4xl mb-3 block">🏟️</span>
                <p className="text-gray-500 font-medium">{t("search_players.no_user_matches")}</p>
                <Link to="/crear-partido" className="inline-block mt-4 text-emerald-600 font-bold hover:underline">{t("search_players.create_new_match")}</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const BuscarJugadores = () => {
  const { t } = useTranslation();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [invitePlayer, setInvitePlayer] = useState(null);
  const [userMatches, setUserMatches] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const [selectedPosition, setSelectedPosition] = useState("all");

  const fetchPlayers = async (position, pageNum = 0, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = storedUser.token;

      if (!token) {
        console.error("No token found in localStorage");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const url = position === "all" 
        ? `${API_BASE_URL}/users/buscar?page=${pageNum}&size=8` 
        : `${API_BASE_URL}/users/buscar?posicion=${encodeURIComponent(position)}&page=${pageNum}&size=8`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (isLoadMore) {
          setPlayers(prev => [...prev, ...data.content]);
        } else {
          setPlayers(data.content);
        }
        setHasMore(!data.last);
      } else {
        console.error("Failed to fetch players:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPlayers(selectedPosition, nextPage, true);
  };

  const fetchUserMatches = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!storedUser.id || !storedUser.token) return;
      const resp = await fetch(`${API_BASE_URL}/partidos/mis-partidos?userId=${storedUser.id}&page=0&size=20`, {
        headers: { 'Authorization': `Bearer ${storedUser.token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setUserMatches(data.content || []);
      }
    } catch (err) {
      console.error("Error fetching user matches:", err);
    }
  };

  const handleSendInvitation = async (matchId) => {
    if (!invitePlayer) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const resp = await fetch(`${API_BASE_URL}/invitaciones`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedUser.token}` 
        },
        body: JSON.stringify({
          partidoId: matchId,
          invitadorId: storedUser.id,
          invitadoId: invitePlayer.id
        })
      });

      if (resp.ok) {
        showToast(t("search_players.invitation_sent", { username: invitePlayer.username }), "success");
        setInvitePlayer(null);
      } else {
        const errorMsg = await resp.text();
        // Si el backend devuelve una clave de error, la traducimos
        const translatedError = t(`search_players.${errorMsg}`);
        const finalMessage = translatedError !== `search_players.${errorMsg}` 
          ? translatedError 
          : (errorMsg || t("search_players.invitation_error"));
        
        showToast(finalMessage, "error");
      }
    } catch (err) {
      showToast(t("search_players.invitation_error"), "error");
    }
  };

  useEffect(() => {
    setPage(0);
    fetchPlayers(selectedPosition, 0, false);
    fetchUserMatches();
  }, [selectedPosition]);

  const positionOptions = [
    { value: "all", label: t("search_players.all_positions") },
    { value: t("profile.positions.goalkeeper"), label: t("profile.positions.goalkeeper") },
    { value: t("profile.positions.center_back"), label: t("profile.positions.center_back") },
    { value: t("profile.positions.fullback"), label: t("profile.positions.fullback") },
    { value: t("profile.positions.midfielder"), label: t("profile.positions.midfielder") },
    { value: t("profile.positions.winger"), label: t("profile.positions.winger") },
    { value: t("profile.positions.striker"), label: t("profile.positions.striker") },
    { value: t("profile.positions.versatile"), label: t("profile.positions.versatile") }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-10 pb-32 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {t("search_players.title")}
            </h1>
            <p className="text-gray-500 font-medium">
              {t("explore_hub.search_players_desc")}
            </p>
          </div>
          
          <div className="w-full md:w-64 shrink-0 relative z-20">
            <Dropdown
              value={selectedPosition}
              onChange={setSelectedPosition}
              options={positionOptions}
            />
          </div>
        </div>

        {/* Cuadrícula de jugadores */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner text-emerald-500 w-10"></span>
          </div>
        ) : players.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {players.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                onShowProfile={setSelectedPlayer} 
                onInvite={setInvitePlayer}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <span className="text-5xl mb-4 block">👻</span>
            <h3 className="text-xl font-bold text-gray-900">{t("search_players.no_players")}</h3>
            <p className="text-gray-500 mt-1">{t("search_players.no_players_desc")}</p>
          </div>
        )}

        {/* Botón Ver Más */}
        {hasMore && players.length > 0 && (
          <div className="flex justify-center mt-12">
            <button 
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-10 py-4 bg-white border-2 border-emerald-600 text-emerald-600 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all flex items-center gap-3 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loadingMore ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              )}
              {t("search_players.load_more")}
            </button>
          </div>
        )}

        {/* Modal de Perfil */}
        <PlayerProfileModal 
          isOpen={!!selectedPlayer} 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />

        {/* Modal de Invitación */}
        <InviteModal
          isOpen={!!invitePlayer}
          player={invitePlayer}
          onClose={() => setInvitePlayer(null)}
          userMatches={userMatches}
          onSendInvite={handleSendInvitation}
        />

        <Toast 
          show={toast.show} 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />

      </div>
    </div>
    </>
  );
};

export default BuscarJugadores;
