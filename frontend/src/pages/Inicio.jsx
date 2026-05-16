import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../apiConfig";
import logo from "../assets/logo_pachangapp.png";

// Reusing components
import MatchCard from "../components/MatchCard";
import CamposDestacados from "../components/home/CamposDestacados";
import ActivityWidget from "../components/home/ActivityWidget";
import StatCard from "../components/StatCard";
import Navbar from "../components/Navbar";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trendingMatches, setTrendingMatches] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);


  // Load User & Data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        const userId = parsed.id;

        // Fetch User Matches if logged in
        if (userId) {
          try {
             // Solo capturamos el primero para el activityWidget
             const uRes = await fetch(`${API_BASE_URL}/partidos/mis-partidos?userId=${userId}`);
             if (uRes.ok) {
               const data = await uRes.json();
               setUserMatches(data.content || []);
             }
          } catch(e) { console.warn("Error fetching user matches", e) }
        }

        // Fetch Trending Matches
        try {
          const tRes = await fetch(`${API_BASE_URL}/partidos?page=0`);
          if (tRes.ok) {
            const tData = await tRes.json();
            // Mostrar solo los primeros 4 para la Home
            const sorted = (tData.content || []).sort((a,b) => (b.participaciones?.length || 0) - (a.participaciones?.length || 0));
            setTrendingMatches(sorted.slice(0, 4));
          }
        } catch(e) { console.warn("Error fetching trending matches", e) }
        
        // Fetch Ranking Data
        try {
          const rRes = await fetch(`${API_BASE_URL}/users/ranking`);
          if (rRes.ok) {
            const rData = await rRes.json();
            setRankingData(rData);
          }
        } catch(e) { console.warn("Error fetching ranking data", e) }

        // Refresh current user data to get real stats
        if (userId) {
          try {
            const uDetailRes = await fetch(`${API_BASE_URL}/users/${userId}`);
            if (uDetailRes.ok) {
              const uDetail = await uDetailRes.json();
              setUser(prev => ({ ...prev, ...uDetail }));
            }
          } catch(e) { console.warn("Error refreshing user stats", e) }
        }

      } catch (err) {
        console.error("Error cargando Home:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  let upcomingMatchData = null;
  if (userMatches && userMatches.length > 0) {
    const next = userMatches[0];
    if (next && next.reserva) {
      upcomingMatchData = {
        type: next.deporte || t('home.default_sport'),
        location: next.reserva.campo?.nombre || t('home.default_field'),
        dateFormatted: (next.reserva.fecha || t('home.soon')) + " " + (next.reserva.horaInicio ? next.reserva.horaInicio.substring(0,5) : ""),
        weather: "15ºC",
        timeUntil: t('home.soon')
      };
    }
  }

  // Animaciones Framer
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-['Inter',_sans-serif]">
      
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden flex items-center min-h-screen">
        {/* Abstract Background Elements */}
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-linear-to-br from-emerald-300 to-teal-100 blur-[100px] pointer-events-none -z-10"
        ></motion.div>
        <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-linear-to-tr from-emerald-400 to-blue-200 blur-[120px] pointer-events-none -z-10"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center">
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-sm tracking-wide mb-4 shadow-sm"
            >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {t('home.stats')}
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight leading-[1.1] mb-4 max-w-5xl"
            >
                {t('home.title_start')} <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-400">{t('home.title_highlight')}</span> {t('home.title_end')}
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-500 max-w-3xl mb-8"
            >
                {t('home.subtitle')}
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
                <Link to="/buscar-partidos" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    {t('home.search_btn')}
                </Link>
                <Link to="/crear-partido" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 font-bold text-lg rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    {t('home.create_btn')}
                </Link>
            </motion.div>

             {/* Mockup de la app flotante */}
             <div className="mt-32 w-full max-w-4xl relative z-0 mx-auto">
                 <div className="rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white overflow-hidden h-[320px] md:h-[400px]">
                    <img 
                        src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80" 
                        alt="Football Pitch" 
                        className="w-full h-full object-cover"
                    />
                 </div>
                 
                 {/* Floating Cards Demo - Better positioning */}
                 <div className="absolute -left-10 top-1/4 z-30 w-56 hidden md:block">
                     <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white flex items-center gap-3"
                     >
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl shadow-inner">⚽</div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{t('home.demo_spot_covered')}</p>
                            <p className="text-sm font-black text-gray-900">{t('home.demo_user_joined')}</p>
                        </div>
                    </motion.div>
                 </div>
                 <div className="absolute -right-10 bottom-1/4 z-30 w-64 hidden md:block">
                    <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 text-xl shadow-inner">🔥</div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{t('home.demo_last_spots')}</p>
                            <p className="text-sm font-black text-white">{t('home.demo_match_tag')}</p>
                        </div>
                    </motion.div>
                 </div>
             </div>

        </div>
      </section>

      {/* ACTIVIDAD DEL USUARIO (Logueado) */}
      {user && (
          <section className="py-12 bg-white relative z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="mb-8"
                  >
                      <h2 className="text-3xl font-black text-gray-900 mb-2">{t('home.welcome_user', { name: user.username })}</h2>
                      <p className="text-gray-500">{t('home.welcome_sub')}</p>
                  </motion.div>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                      <motion.div variants={fadeInUp} className="lg:col-span-5 h-full">
                          <ActivityWidget upcomingMatch={upcomingMatchData} />
                      </motion.div>
                      
                      <motion.div 
                        variants={staggerContainer} 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true }} 
                        className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
                      >
                          <motion.div variants={fadeInUp} className="h-full">
                              <StatCard label={t('home.stats_matches')} value={user?.partidosJugados || 0} icon={<span className="text-2xl">⚽</span>} color="emerald" />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="h-full">
                              <StatCard label={t('home.stats_goals')} value={user?.goles || 0} icon={<span className="text-2xl">🥅</span>} color="blue" />
                          </motion.div>
                          <motion.div variants={fadeInUp} className="h-full">
                              <StatCard label={t('home.stats_assists')} value={user?.asistencias || 0} icon={<span className="text-2xl">👟</span>} color="amber" />
                          </motion.div>
                      </motion.div>
                  </div>
              </div>
          </section>
      )}

      {/* PARTIDOS CERCANOS Y TRENDING */}
      <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <motion.div 
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                  className="flex flex-col md:flex-row md:items-end justify-between mb-10"
              >
                  <div>
                      <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">{t('home.trending_title')}</h2>
                      <p className="text-xl text-gray-500 max-w-2xl">{t('home.trending_sub')}</p>
                  </div>
                  <Link to="/buscar-partidos" className="mt-4 md:mt-0 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors inline-block text-center">
                      {t('home.view_all')}
                  </Link>
              </motion.div>

              {loading ? (
                  <div className="flex gap-6 overflow-x-hidden">
                      {[1,2,3].map(i => (
                          <div key={i} className="w-80 h-72 bg-gray-200 animate-pulse rounded-2xl shrink-0"></div>
                      ))}
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {trendingMatches.length > 0 ? (
                          trendingMatches.map((match, i) => (
                              <motion.div 
                                key={match.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                              >
                                  <MatchCard match={match} onJoin={(id) => navigate('/partido/' + id)} />
                              </motion.div>
                          ))
                      ) : (
                          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                              <span className="text-5xl mb-4 block">🏟️</span>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('home.no_matches_title')}</h3>
                              <p className="text-gray-500">{t('home.no_matches_sub')}</p>
                              <Link to="/crear-partido" className="inline-block mt-6 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200">{t('home.create_btn')}</Link>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </section>

      {/* RESERVAR PISTAS */}
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="mb-0"> {/* Wrapper temporal, el componente lo tiene */}
                   <CamposDestacados />
               </div>
          </div>
      </section>

      {/* PROMOCIÓN TORNEOS */}
      <section className="py-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-emerald-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12"
            >
                {/* Background effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 blur-[80px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

                <div className="relative z-10 md:w-1/2 text-left">
                    <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold tracking-widest uppercase text-xs rounded-full mb-6 border border-emerald-500/30">{t('home.promo_tournaments.badge')}</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                        {t('home.promo_tournaments.title_start')} <br /> {t('home.promo_tournaments.title_mid')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">{t('home.promo_tournaments.title_highlight')}</span>{t('home.promo_tournaments.title_end')}
                    </h2>
                    <p className="text-lg text-emerald-50/80 mb-8 max-w-lg font-medium leading-relaxed">
                        {t('home.promo_tournaments.desc')}
                    </p>
                    <Link to="/torneos" className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                        {t('home.promo_tournaments.btn')}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Link>
                </div>
                
                <div className="relative z-10 md:w-1/2 flex justify-center">
                    {/* Visual Mockup for Tournament Promo */}
                    <div className="relative w-full max-w-md">
                        {/* Fake Bracket Card */}
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-20"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-inner">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-white font-black text-xl tracking-tight">{t('home.promo_tournaments.mock_cup')}</div>
                                        <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider mt-1">{t('home.promo_tournaments.mock_final')}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/15 rounded-2xl p-4 border border-emerald-400/30 flex items-center justify-between shadow-lg">
                                    <span className="text-white font-black text-lg">Los Galácticos</span>
                                    <span className="text-emerald-300 font-black text-2xl">3</span>
                                </div>
                                <div className="text-center text-white/40 text-xs font-black uppercase">{t('home.promo_tournaments.mock_vs')}</div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                                    <span className="text-white/60 font-bold text-lg">Atlético Sur</span>
                                    <span className="text-white/40 font-black text-2xl">1</span>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Decorative floating element */}
                        <motion.div 
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -right-4 -bottom-6 bg-gray-900 border border-gray-700 p-4 rounded-2xl shadow-xl z-30 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <span className="text-xl">🏆</span>
                            </div>
                            <div>
                                <div className="text-white text-[10px] font-black uppercase tracking-widest">{t('home.promo_tournaments.mock_champion')}</div>
                                <div className="text-amber-400 text-sm font-bold">{t('home.promo_tournaments.mock_prize')}</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* COMUNIDAD / SOCIAL SECTION */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center gap-16">
              
              <div className="md:w-1/2">
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                      <span className="text-emerald-400 font-bold tracking-widest uppercase mb-2 block">{t('home.community_label')}</span>
                      <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">{t('home.community_title')}</h2>
                      <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                          {t('home.community_sub')}
                      </p>
                      
                      <ul className="space-y-4 mb-10">
                          <li className="flex items-center gap-3 text-lg font-bold text-gray-300">
                              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</span>
                              {t('home.feature_1')}
                          </li>
                          <li className="flex items-center gap-3 text-lg font-bold text-gray-300">
                              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</span>
                              {t('home.feature_2')}
                          </li>
                          <li className="flex items-center gap-3 text-lg font-bold text-gray-300">
                              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</span>
                              {t('home.feature_3')}
                          </li>
                      </ul>
                      
                      <Link to="/perfil" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all">
                          {t('home.view_rankings')}
                      </Link>
                  </motion.div>
              </div>

              <div className="md:w-1/2 relative">
                  {/* Fake Leaderboard UI */}
                  <motion.div 
                      initial={{ opacity: 0, x: 50 }} 
                      whileInView={{ opacity: 1, x: 0 }} 
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-[2rem] p-6 md:p-8 shadow-2xl relative"
                  >
                      <h3 className="text-2xl font-black mb-6 flex items-center justify-between">
                          <span>{t('home.top_players')}</span>
                          <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">{t('home.leaderboard_city')}</span>
                      </h3>
                      
                      <div className="space-y-4">
                          {rankingData.length > 0 ? (
                            rankingData.map((player, idx) => (
                              <div key={player.id} className={`flex items-center gap-4 p-4 rounded-2xl transition hover:bg-white/5 ${player.id === user?.id ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-gray-700/50'}`}>
                                  <div className="font-black text-xl text-gray-400 w-6 text-center">{idx + 1}</div>
                                  <img 
                                    src={player.avatar || `https://ui-avatars.com/api/?name=${player.username}&background=random&color=fff`} 
                                    alt={player.username} 
                                    className="w-12 h-12 rounded-full ring-2 ring-transparent object-cover"
                                  />
                                  <div className="flex-1">
                                      <div className="font-bold text-lg flex items-center gap-2">
                                          {player.username} {player.id === user?.id ? `(${t('home.you')})` : ''}
                                          {idx === 0 && <span className="text-xl">👑</span>}
                                      </div>
                                      <div className="text-sm text-gray-400">{player.goles} {t('home.goals_label')}</div>
                                  </div>
                                  <div className="font-black text-emerald-400 text-xl">{(player.ranking / 1000).toFixed(1)}k</div>
                              </div>
                            ))
                          ) : (
                              [
                                { pos: 1, name: "David Ruiz", pts: "2.4k", goals: 24, img: "https://ui-avatars.com/api/?name=David&background=10b981&color=fff" },
                                { pos: 2, name: "Pablo M.", pts: "1.9k", goals: 18, img: "https://ui-avatars.com/api/?name=Pablo&background=3b82f6&color=fff" },
                                { pos: 3, name: "Marta G.", pts: "1.5k", goals: 12, img: "https://ui-avatars.com/api/?name=Marta&background=f59e0b&color=fff" },
                                { pos: 4, name: t('home.you'), pts: "1.2k", goals: 9, img: user?.avatar || "https://ui-avatars.com/api/?name=Tu&background=6366f1&color=fff", isYou: true },
                              ].map((player, idx) => (
                                <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl transition hover:bg-white/5 ${player.isYou ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-gray-700/50'}`}>
                                    <div className="font-black text-xl text-gray-400 w-6 text-center">{player.pos}</div>
                                    <img src={player.img} alt={player.name} className="w-12 h-12 rounded-full ring-2 ring-transparent"/>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {player.name}
                                            {player.pos === 1 && <span className="text-xl">👑</span>}
                                        </div>
                                        <div className="text-sm text-gray-400">{player.goals} {t('home.goals_label')}</div>
                                    </div>
                                    <div className="font-black text-emerald-400 text-xl">{player.pts}</div>
                                </div>
                              ))
                          )}
                      </div>
                  </motion.div>
              </div>

          </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
          <motion.div 
               animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-tr from-emerald-400/30 to-teal-300/30 blur-3xl pointer-events-none rounded-full"
          ></motion.div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight"
              >
                  {t('home.cta_title')}
              </motion.h2>
              <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl text-emerald-100 mb-12"
              >
                  {t('home.cta_sub')}
              </motion.p>
              
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col sm:flex-row justify-center gap-6"
              >
                  <Link to="/crear-partido" className="px-10 py-5 bg-gray-900 hover:bg-black text-white font-black text-xl rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                      {t('home.start_now')}
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
              </motion.div>
          </div>
      </section>

      {/* FOOTER BASICO */}
      <footer className="bg-gray-950 text-gray-400 py-12 text-center font-medium">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
              <div className="w-[100px] h-[100px] mb-6 transition-transform hover:scale-110">
                  <img src={logo} alt="PachangApp Logo" className="w-full h-full object-contain" />
              </div>
              <p className="mb-4 text-emerald-500 font-bold uppercase tracking-widest text-sm">PachangApp © 2026</p>
              <p className="text-sm max-w-md mx-auto leading-loose text-gray-500" dangerouslySetInnerHTML={{ __html: t('home.footer_desc') }} />

          </div>
      </footer>

    </div>
  );
};

export default Home;
