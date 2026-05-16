import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TournamentCard from "../components/TournamentCard";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../apiConfig";

const AnimatedCounter = ({ from, to }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration: 2.5, ease: "easeOut", delay: 0.5 });
    return controls.stop;
  }, [count, to]);

  return <motion.span>{rounded}</motion.span>;
};

const Torneos = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const storedUser = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : {};
        const headers = { 
          'Content-Type': 'application/json',
          ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
        };

        const response = await fetch(`${API_BASE_URL}/tournaments`, { headers });
        const data = await response.json();
        setTournaments(data);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    if (activeFilter === "all") return true;
    if (activeFilter === "open_tournaments") return t.status === "OPEN";
    if (activeFilter === "league") return t.type === "LEAGUE" || t.type === "LIGA" || t.type === "Liga";
    if (activeFilter === "playoffs") return t.type === "PLAYOFFS" || t.type === "ELIMINATORIAS" || t.type === "Eliminatorias";
    return true;
  });

  // Framer motion variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* NEW MODERN HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative bg-emerald-900 rounded-[3rem] overflow-hidden mb-16 shadow-2xl border border-emerald-800/50"
        >
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-900 to-gray-900 z-0"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 z-0 pointer-events-none"></div>
          
          {/* Subtle Sports Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>

          <div className="relative z-10 px-8 py-16 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-7">
              <motion.div 
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
              >
                <motion.span 
                  variants={item}
                  className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-500/20 text-emerald-300 font-bold tracking-widest uppercase text-xs mb-6 border border-emerald-500/30 shadow-inner"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {t('tournaments.hero.badge')}
                </motion.span>
                
                <motion.h1 variants={item} className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                  {t('tournaments.hero.title_start')} <br />
                  {t('tournaments.hero.title_mid')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    {t('tournaments.hero.title_end')}
                  </span>
                </motion.h1>
                
                <motion.p variants={item} className="text-lg md:text-xl text-emerald-50/75 mb-10 max-w-xl font-medium leading-relaxed">
                  {t('tournaments.hero.subtitle')}
                </motion.p>
                
                <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-14">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(52,211,153,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/crear-torneo")}
                    className="bg-white text-emerald-900 font-black py-4 px-8 rounded-2xl shadow-xl transition-all text-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    {t('tournaments.create_btn')}
                  </motion.button>
                </motion.div>
                
                {/* Quick Stats Grid */}
                <motion.div variants={item} className="grid grid-cols-3 gap-4 md:gap-8 border-t border-emerald-500/20 pt-8">
                  <div>
                    <div className="text-emerald-400 mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div className="text-3xl font-black text-white mb-1"><AnimatedCounter from={0} to={124} /></div>
                    <div className="text-[10px] text-emerald-200/60 font-bold uppercase tracking-wider">{t('tournaments.hero.stats_active')}</div>
                  </div>
                  <div>
                    <div className="text-emerald-400 mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div className="text-3xl font-black text-white mb-1"><AnimatedCounter from={0} to={892} /></div>
                    <div className="text-[10px] text-emerald-200/60 font-bold uppercase tracking-wider">{t('tournaments.hero.stats_teams')}</div>
                  </div>
                  <div>
                    <div className="text-emerald-400 mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <div className="text-3xl font-black text-white mb-1"><AnimatedCounter from={0} to={3450} /></div>
                    <div className="text-[10px] text-emerald-200/60 font-bold uppercase tracking-wider">{t('tournaments.hero.stats_matches')}</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column: Visual Mockup (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-5 relative h-full min-h-[400px]">
              {/* Standings Mockup Card */}
              <motion.div 
                initial={{ opacity: 0, x: 40, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: 3 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", damping: 20 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10"
              >
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                  <h3 className="text-white font-black tracking-tight text-lg">{t('tournaments.hero.mock_league')}</h3>
                  <span className="text-[9px] bg-emerald-500 text-white px-2 py-1 rounded-md font-black uppercase tracking-widest shadow-sm">{t('tournaments.hero.mock_in_progress')}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-[10px] text-emerald-200/50 uppercase font-bold px-3 pb-1">
                    <span className="w-6">{t('tournaments.hero.mock_pos')}</span>
                    <span className="flex-1">{t('tournaments.hero.mock_team')}</span>
                    <span className="w-8 text-center">{t('tournaments.hero.mock_pts')}</span>
                  </div>
                  {[
                    { pos: 1, name: "Atlético Granada", pts: 24, active: true },
                    { pos: 2, name: "Los Galácticos", pts: 21, active: false },
                    { pos: 3, name: "Cartuja FC", pts: 18, active: false },
                    { pos: 4, name: "Recreativo", pts: 15, active: false },
                  ].map((team, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.02, x: 5 }}
                      className={`flex items-center rounded-xl p-3 border transition-all cursor-pointer ${team.active ? 'bg-white/15 border-white/20 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                    >
                      <span className={`w-6 font-black text-sm ${team.active ? 'text-emerald-400' : 'text-white/60'}`}>{team.pos}</span>
                      <span className="flex-1 text-white font-bold text-sm tracking-tight">{team.name}</span>
                      <span className={`w-8 text-center font-black ${team.active ? 'text-emerald-300' : 'text-white'}`}>{team.pts}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Bracket Node Mockup Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6, type: "spring", bounce: 0.4 }}
                className="absolute -left-8 top-1/4 bg-gray-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <div className="text-white text-sm font-black tracking-tight">{t('tournaments.hero.mock_new_elim')}</div>
                  <div className="text-emerald-400/80 text-[11px] font-bold uppercase tracking-wider mt-0.5">{t('tournaments.hero.mock_quarter')}</div>
                </div>
              </motion.div>
            </div>
            
          </div>
        </motion.div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {["all", "open_tournaments", "league", "playoffs"].map((filter) => (
            <motion.button 
              key={filter} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeFilter === filter ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500/20' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:shadow-md'}`}
            >
              {t(`tournaments.filters.${filter}`)}
            </motion.button>
          ))}
        </div>

        {/* TOURNAMENTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm animate-pulse h-72 flex flex-col justify-between">
                <div className="w-full h-36 bg-gradient-to-r from-gray-100 to-gray-200 rounded-[1.5rem] mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTournaments.map((t) => (
              <motion.div key={t.id} variants={item} layout>
                <TournamentCard tournament={t} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm"
          >
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mb-6 inline-block text-emerald-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 opacity-20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </motion.div>
            <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{t('tournaments.no_tournaments')}</h3>
            <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">{t('tournaments.no_tournaments_sub')}</p>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default Torneos;
