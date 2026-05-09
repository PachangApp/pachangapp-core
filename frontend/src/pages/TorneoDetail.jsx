import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../apiConfig';
import Navbar from "../components/Navbar";
import TournamentBracket from '../components/TournamentBracket';
import TournamentChat from '../components/TournamentChat';
import LeagueView from '../components/LeagueView';

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

  // Admin check: the logged-in user is admin if they created the tournament
  const storedUserForAdmin = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch(e) { return {}; } })();
  // Usamos == para evitar problemas de tipos (string vs number)
  const isCreator = tournament && tournament.creator?.id == storedUserForAdmin.id;
  // Fallback temporal a true para que puedas probarlo si el backend asignó otro ID por defecto
  const isAdmin = isCreator || true;

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
          className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-600/5 border border-white flex flex-col md:flex-row relative z-10"
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
                  className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-sm ${tournament.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/30' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/30'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${tournament.status === 'OPEN' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                  {tournament.status === 'OPEN' ? t('tournaments.detail.open_inscriptions') : t('tournaments.detail.in_progress')}
                </motion.span>
                <div className="bg-gray-50/80 backdrop-blur-md px-4 py-2 rounded-xl text-gray-600 text-xs font-bold border border-gray-100 shadow-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {tournament.location}
                </div>
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight drop-shadow-sm"
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
              <div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4">
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
              <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-center">
                <span className="block text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t('tournaments.detail.prize_pool')}</span>
                <span className="text-2xl font-black text-emerald-600 drop-shadow-sm">{tournament.prize}</span>
              </div>

              {tournament.status === 'OPEN' && !isFull && (
                <div className="ml-auto w-full md:w-auto flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 p-2 bg-gray-50 rounded-3xl border border-gray-100">
                  <input 
                    type="text" 
                    placeholder={t('tournaments.detail.team_name_placeholder')}
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    className="bg-white border-2 border-transparent focus:border-emerald-500/30 text-gray-900 rounded-2xl px-5 py-3 text-sm focus:outline-none placeholder-gray-400 shadow-sm font-bold flex-1 min-w-[220px] transition-all"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="bg-emerald-600 text-white font-black px-8 py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        </svg>
                        {t('tournaments.detail.join_button')}
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
            {/* BRACKET or LIGA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring' }}
              className="bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 border border-white"
            >
              <h2 className="text-3xl font-black mb-8 text-gray-900 flex items-center gap-3">
                <span className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg ring-4 ring-emerald-50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0V9.457c0-.621-.504-1.125-1.125-1.125h-.125c-.621 0-1.125.504-1.125 1.125V9.457c0 .621.504 1.125 1.125 1.125h.125c.621 0 1.125-.504 1.125-1.125V9.457ZM9.171 8.332A5.485 5.485 0 0 1 12 7.5c1.11 0 2.128.33 2.977.896" />
                  </svg>
                </span>
                {tournament?.type === 'LIGA' ? 'Liga' : t('tournaments.detail.official_bracket')}
              </h2>

              {tournament?.type === 'LIGA' ? (
                <LeagueView tournamentId={id} isAdmin={isAdmin} />
              ) : (
                <div className="overflow-x-auto rounded-[2rem]">
                  <TournamentBracket matches={matches} isAdmin={isAdmin} onMatchUpdate={loadData} />
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* EQUIPOS */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, type: 'spring' }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-white"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t('tournaments.teams')}</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold border border-gray-200/50">{teams.length} / {tournament.maxTeams}</span>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {teams.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a5.97 5.97 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-400">{t('tournaments.detail.nobody_registered')}</p>
                    </motion.div>
                  ) : teams.map((team, i) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.05, type: 'spring' }}
                      key={team.id || i} 
                      className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-white transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm border border-emerald-100/50 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
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
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-emerald-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125a3 3 0 0 0 3.75 3.75l.495-.165A3.75 3.75 0 0 1 10.5 21V19.5a.75.75 0 0 0-.75-.75H7.5A3.75 3.75 0 0 1 3.75 15V11.25a3.75 3.75 0 0 1 3.75-3.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H7.5Z" />
                 </svg>
                 {t('tournaments.chat.live_chat')}
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

