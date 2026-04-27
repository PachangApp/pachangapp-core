import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../apiConfig';
import Navbar from "../components/Navbar";
import TournamentBracket from '../components/TournamentBracket';
import TournamentChat from '../components/TournamentChat';

const TorneoDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Para mockear un simple equipo para uniser
  const [joinName, setJoinName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Mock admin: En app real venir de store/auth
  const isAdmin = true;

  const loadData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = { 
        'Content-Type': 'application/json',
        ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
      };

      const [tRes, teamsRes, matchesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tournaments/${id}`, { headers }),
        fetch(`${API_BASE_URL}/tournaments/${id}/teams`, { headers }),
        fetch(`${API_BASE_URL}/tournaments/${id}/matches`, { headers })
      ]);
      
      if (tRes.ok) setTournament(await tRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleJoin = async () => {
    if(!joinName.trim()) return;
    setIsJoining(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = { 
        'Content-Type': 'application/json',
        ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
      };

      const res = await fetch(`${API_BASE_URL}/tournaments/${id}/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: joinName })
      });
      if(res.ok) {
        setJoinName("");
        loadData(); // recargar
      } else {
        alert(t('tournaments.detail.join_error'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  if (!tournament) return <div>{t('tournaments.no_tournaments')}</div>;

  const isFull = teams.length >= tournament.maxTeams;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        
        {/* Header/Hero del torneo */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 border border-white flex flex-col md:flex-row relative z-10"
        >
          <div className="md:w-[40%] h-64 md:h-auto relative overflow-hidden group">
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src={tournament.imageUrl || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55"} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent md:bg-gradient-to-r" />
          </div>
          
          <div className="p-8 md:p-12 flex-1 relative z-10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <motion.span 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className={`px-4 py-1.5 text-xs font-black rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-sm ${tournament.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/30' : 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/30'}`}
                >
                  {tournament.status === 'OPEN' ? t('tournaments.detail.open_inscriptions') : t('tournaments.detail.in_progress')}
                </motion.span>
                <div className="bg-gray-50/80 backdrop-blur-md px-4 py-2 rounded-xl text-gray-600 text-sm font-bold border border-gray-100 shadow-sm flex items-center gap-2">
                  <span>📍</span> {tournament.location}
                </div>
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 mb-6 tracking-tight drop-shadow-sm"
              >
                {tournament.name}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-gray-500 text-lg mb-8 font-medium leading-relaxed max-w-2xl"
              >
                {tournament.description}
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-5 py-3 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t('tournaments.detail.spots')}</span>
                  <span className="font-mono text-2xl font-black text-gray-800 tracking-tight">{teams.length} <span className="text-gray-400 text-lg">/ {tournament.maxTeams}</span></span>
                </div>
                {/* Progress bar visual */}
                <div className="w-12 h-12 relative flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200" />
                     <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * (teams.length / tournament.maxTeams))} className={`${isFull ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} />
                   </svg>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-center">
                <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t('tournaments.detail.prize_pool')}</span>
                <span className="text-2xl font-black text-emerald-500 drop-shadow-sm">{tournament.prize}</span>
              </div>

              {tournament.status === 'OPEN' && !isFull && (
                <div className="ml-auto w-full md:w-auto flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 p-2 bg-gray-50/50 rounded-3xl border border-gray-100">
                  <input 
                    type="text" 
                    placeholder={t('tournaments.detail.team_name_placeholder')}
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    className="bg-white border-2 border-transparent focus:border-primary/30 text-gray-900 rounded-2xl px-5 py-3 text-sm focus:outline-none placeholder-gray-400 shadow-sm font-bold flex-1 min-w-[220px] transition-all"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="bg-gradient-to-r from-primary to-blue-600 text-white font-black px-8 py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>🎮</span> {t('tournaments.detail.join_button')}
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* BRACKET */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring' }}
              className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 border border-white"
            >
              <h2 className="text-3xl font-black mb-8 text-gray-900 flex items-center gap-3">
                <span className="bg-primary text-white p-2 rounded-xl shadow-md">🏆</span> {t('tournaments.detail.official_bracket')}
              </h2>
              <div className="overflow-x-auto rounded-[2rem]">
                <TournamentBracket matches={matches} isAdmin={isAdmin} onMatchUpdate={loadData} />
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* EQUIPOS */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, type: 'spring' }}
              className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t('tournaments.teams')}</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold border border-gray-200/50">{teams.length} / {tournament.maxTeams}</span>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {teams.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                      <span className="text-4xl opacity-50 block mb-2">👻</span>
                      <p className="text-sm font-bold text-gray-400">{t('tournaments.detail.nobody_registered')}</p>
                    </motion.div>
                  ) : teams.map((team, i) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.05, type: 'spring' }}
                      key={team.id || i} 
                      className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100/50 group-hover:bg-blue-100 transition-colors">
                        {i+1}
                      </div>
                      <span className="font-bold text-gray-800 text-lg">{team.name}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* CHAT */}
            <div className="space-y-4">
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                 <span>💬</span> {t('tournaments.chat.live_chat')}
               </h2>
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 transition={{ delay: 0.4 }}
               >
                  <TournamentChat tournamentId={id} />
               </motion.div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TorneoDetail;

