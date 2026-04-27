import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TournamentCard from "../components/TournamentCard";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../apiConfig";

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
        
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-[2.5rem] p-8 md:p-12 mb-12 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.25)] border border-white/10"
        >
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] rounded-full -translate-y-1/3 translate-x-1/4 filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400 opacity-20 rounded-full translate-y-1/3 -translate-x-1/4 filter blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 font-bold tracking-widest uppercase text-xs px-3 py-1 rounded-full mb-6 shadow-sm">{t('tournaments.label')}</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
                {t('tournaments.title_start')} <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{t('tournaments.title_highlight')}</span>
              </h1>
              <p className="text-emerald-50/80 text-lg mb-10 max-w-xl font-medium">
                {t('tournaments.subtitle')}
              </p>
              <div className="flex gap-4">
                <motion.button 
                   whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(52, 211, 153, 0.4)" }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => navigate("/crear-torneo")}
                   className="bg-white text-emerald-700 font-black py-4 px-8 rounded-2xl shadow-xl transition-all text-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {t('tournaments.create_btn')}
                </motion.button>
              </div>
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
