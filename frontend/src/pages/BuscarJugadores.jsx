import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Dropdown from "../components/Dropdown";

import Navbar from "../components/Navbar";

// Componente para mostrar la información del jugador en cuadrícula
const PlayerCard = ({ player, onClick }) => {
  const { t } = useTranslation();
  
  // Posición principal a mostrar en la tarjeta
  const mainPosition = player.posicion1 || t("search_players.all_positions");
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={() => onClick(player)}
      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer relative overflow-hidden group"
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

        <div className="w-full flex justify-around border-t border-gray-50 pt-4 mt-2">
          <div className="text-center">
            <span className="block text-gray-400 text-[10px] font-bold uppercase">{t("search_players.ranking")}</span>
            <span className="block font-black text-gray-700">{player.ranking}</span>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div className="text-center">
            <span className="block text-gray-400 text-[10px] font-bold uppercase">{t("search_players.matches")}</span>
            <span className="block font-black text-gray-700">{player.partidosJugados}</span>
          </div>
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
          <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            {/* Foto flotante */}
            <div className="absolute -top-12 left-6 w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
              <img 
                src={player.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + player.username} 
                alt={player.username} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-14 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">@{player.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t("search_players.ranking")} {player.ranking}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-bold text-emerald-600">Lv.{Math.floor(player.ranking / 100)}</span>
                </div>
              </div>

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
                  {player.posicion1 && <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200">{player.posicion1}</span>}
                  {player.posicion2 && <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-100">{player.posicion2}</span>}
                  {player.posicion3 && <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-100">{player.posicion3}</span>}
                  
                  {!player.posicion1 && !player.posicion2 && !player.posicion3 && (
                    <span className="text-sm text-gray-400 italic">No ha definido preferencias</span>
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

const BuscarJugadores = () => {
  const { t } = useTranslation();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchPlayers = async (position) => {
    setLoading(true);
    try {
      const url = position === "all" 
        ? "/api/users/buscar" 
        : `/api/users/buscar?posicion=${encodeURIComponent(position)}`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers(selectedPosition);
  }, [selectedPosition]);

  const positionOptions = [
    { value: "all", label: t("search_players.all_positions") },
    { value: t("profile.positions.goalkeeper"), label: t("profile.positions.goalkeeper") },
    { value: t("profile.positions.center_back"), label: t("profile.positions.center_back") },
    { value: t("profile.positions.fullback"), label: t("profile.positions.fullback") },
    { value: t("profile.positions.midfielder"), label: t("profile.positions.midfielder") },
    { value: t("profile.positions.winger"), label: t("profile.positions.winger") },
    { value: t("profile.positions.striker"), label: t("profile.positions.striker") }
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
                onClick={setSelectedPlayer} 
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

        {/* Modal de Perfil */}
        <PlayerProfileModal 
          isOpen={!!selectedPlayer} 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />

      </div>
    </div>
    </>
  );
};

export default BuscarJugadores;
