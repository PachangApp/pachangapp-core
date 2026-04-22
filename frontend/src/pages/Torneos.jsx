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
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
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

  // Framer motion variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-blue-900 rounded-[2rem] p-8 md:p-12 mb-12 text-white relative overflow-hidden shadow-2xl"
        >
          {/* Abstract circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 filter blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary opacity-20 rounded-full translate-y-1/2 -translate-x-1/4 filter blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold tracking-wider mb-4 border border-white/10 uppercase">
                PachangApp Pro
              </span>
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                Compite. Organiza. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                  Gana la Gloria.
                </span>
              </h1>
              <p className="text-white/80 font-medium mb-8 text-lg">
                Únete a los torneos más competitivos de tu ciudad, demuestra tu nivel y llévate el premio a casa. ¿Estás listo?
              </p>
              <div className="flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/crear-torneo")}
                  className="bg-white text-primary font-bold py-3 px-6 rounded-2xl shadow-lg border border-white/50"
                >
                  Crear Torneo
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FILTERS (Mock/Visual only for now) */}
        <div className="flex flex-wrap gap-3 mb-8">
          {["Todos", "Abiertos", "En Curso", "Eliminatorias", "Liga"].map((filter, i) => (
            <button key={i} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${i === 0 ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              {filter}
            </button>
          ))}
        </div>

        {/* TOURNAMENTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse h-64">
                <div className="w-full h-32 bg-gray-100 rounded-2xl mb-4"></div>
                <div className="h-6 bg-gray-100 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tournaments.map((t) => (
              <motion.div key={t.id} variants={item}>
                <TournamentCard tournament={t} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🏃‍♂️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay torneos activos</h3>
            <p className="text-gray-500">Sé el primero en crear uno y empieza la competición.</p>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default Torneos;
