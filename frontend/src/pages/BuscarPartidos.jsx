import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";
import MatchCard from "../components/MatchCard";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";

const BuscarPartidos = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [allCampos, setAllCampos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    campo: "Todos",
    date: "",
    category: "Todos"
  });

  const fetchMatches = useCallback(async (pageNum = 0, isAppend = false) => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = storedUser.token ? { "Authorization": `Bearer ${storedUser.token}` } : {};
      const response = await fetch(`${API_BASE_URL}/partidos?page=${pageNum}`, { headers });
      if (!response.ok) throw new Error("Error al obtener partidos");
      const data = await response.json();
      
      if (isAppend) {
        setMatches(prev => [...prev, ...data.content]);
      } else {
        setMatches(data.content);
      }
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllCampos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campos`);
      if (response.ok) {
        const data = await response.json();
        setAllCampos(data);
      }
    } catch (err) {
      console.error("Error fetching campos:", err);
    }
  };

  useEffect(() => {
    fetchMatches(0, false);
    fetchAllCampos();
  }, [fetchMatches]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    if (nextPage < totalPages) {
      setPage(nextPage);
      fetchMatches(nextPage, true);
    }
  };

  const handleJoin = async (partidoId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Debes iniciar sesión para unirte.");
      return;
    }
    const { id: userId, token } = JSON.parse(storedUser);

    try {
      const response = await fetch(`${API_BASE_URL}/partidos/${partidoId}/unirse?userId=${userId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        alert("¡Te has unido con éxito!");
        fetchMatches(0, false); // Recargar
        setPage(0);
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (err) {
      console.error("Error al unirse:", err);
      alert("Error de red");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredMatches = matches.filter(match => {
    // 0. Ocultar si el usuario ya está unido (según petición del usuario)
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isJoined = match.participaciones?.some(p => p.user.id === currentUser.id);
    if (isJoined) return false;

    // 1. Filtrar por Campo
    const matchesCampo = filters.campo === "Todos" || match.reserva.campo.nombre === filters.campo;
    
    // 2. Filtrar por Modalidad (Deporte)
    const matchesCat = filters.category === "Todos" || match.deporte === filters.category;
    
    // 3. Filtrar por Fecha
    const matchesDate = !filters.date || match.reserva.fecha === filters.date;

    return matchesCampo && matchesCat && matchesDate;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-32 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header y Filtros */}
        <section className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-black text-gray-900 mb-8 tracking-tight"
          >
            {t('search_matches.find_next')} <span className="text-emerald-600">{t('search_matches.match_colored')}</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6"
          >
            {/* Buscador de campo (Modern Dropdown) */}
            <Dropdown
              label={t('create_match.field')}
              options={["Todos", ...[...new Set(allCampos.map(c => c.nombre))].sort()]}
              value={filters.campo}
              onChange={(val) => setFilters({ ...filters, campo: val })}
              className="grow"
            />

            {/* Selector Deporte (Modern Dropdown) */}
            <Dropdown
              label={t('search_matches.category')}
              options={[
                { label: t('search_matches.all'), value: "Todos" },
                { label: t('sports.futbol_7'), value: "Fútbol 7" },
                { label: t('sports.futbol_11'), value: "Fútbol 11" },
                { label: t('sports.futbol_sala'), value: "Fútbol Sala" }
              ]}
              value={filters.category}
              onChange={(val) => setFilters({ ...filters, category: val })}
              className="w-full md:w-60"
            />

            {/* Fecha (Modern DatePicker) */}
            <DatePicker
              label={t('create_match.date')}
              value={filters.date}
              onChange={(val) => setFilters({ ...filters, date: val })}
              className="w-full md:w-60"
              clearable={true}
              placeholder={t('search_matches.all')}
            />
          </motion.div>
        </section>


        {/* Resultados */}
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-bold text-gray-800">
                {t('search_matches.available_matches')} <span className="text-emerald-500 ml-1">({filteredMatches.length})</span>
            </h2>
        </div>

        {loading && matches.length === 0 ? (
          <div className="text-center py-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mb-4"
            ></motion.div>
            <p className="text-gray-500 font-bold">{t('search_matches.searching_matches')}</p>
          </div>
        ) : filteredMatches.length > 0 ? (
          <>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: Math.min(index * 0.1, 0.8),
                      ease: [0.21, 1.11, 0.81, 0.99] // Efecto de frenado suave
                    }}
                  >
                    <MatchCard match={match} onJoin={handleJoin} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {page + 1 < totalPages && (
              <div className="mt-12 text-center">
                <button 
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-white border-2 border-emerald-100 text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {loading ? t('search_matches.loading') : t('search_matches.load_more')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('search_matches.no_matches_found')}</h3>
            <p className="text-gray-500">{t('search_matches.no_matches_desc')}</p>
          </div>
        )}

        {/* Botón Flotante para Crear (A la izquierda del ChatBot) */}
        <div className="fixed bottom-6 right-24 md:right-32 z-40 transition-all">
            <button 
                onClick={() => navigate("/crear-partido")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black p-4 sm:py-4 sm:px-8 rounded-2xl shadow-2xl shadow-emerald-200 transform hover:-translate-y-2 transition-all flex items-center gap-3 active:scale-95 group"
            >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="hidden sm:inline whitespace-nowrap">{t('search_matches.create_match_btn')}</span>
            </button>
        </div>
      </main>
    </div>
  );
};

export default BuscarPartidos;
