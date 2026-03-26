import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";
import ActivityWidget from "../components/home/ActivityWidget";
import QuickFilters from "../components/home/QuickFilters";
import TrendingMatches from "../components/home/TrendingMatches";
import CamposDestacados from "../components/home/CamposDestacados";

const Inicio = () => {
  const [userMatches, setUserMatches] = useState([]);
  const [trendingMatches, setTrendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const storedUserStr = localStorage.getItem("user");
        let userId = null;
        
        if (storedUserStr) {
          const parsed = JSON.parse(storedUserStr);
          userId = parsed.id;
          setUser(parsed);
        }

        // Fetch 1: El próximo partido del usuario (si está logueado)
        if (userId) {
          const uRes = await fetch(`${API_BASE_URL}/partidos/mis-partidos?userId=${userId}`);
          if (uRes.ok) {
            const data = await uRes.json();
            setUserMatches(data.content || []);
          }
        }

        // Fetch 2: Partidos trending (todos los abiertos)
        const tRes = await fetch(`${API_BASE_URL}/partidos?page=0`);
        if (tRes.ok) {
          const tData = await tRes.json();
          // Ordenamos un poco para simular "Trending" (los que tienen más jugadores)
          // Esto asume que tData.content es un array
          const sorted = (tData.content || []).sort((a,b) => (b.participaciones?.length || 0) - (a.participaciones?.length || 0));
          setTrendingMatches(sorted);
        }

      } catch (err) {
        console.error("Error cargando el Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Preparar el objeto para ActivityWidget
  // Tomamos el primer partido del usuario cuya fecha sea más cercana (Backend ya lo ordena ASC por fecha)
  let upcomingMatchData = null;
  if (userMatches && userMatches.length > 0) {
    const next = userMatches[0];
    if (next && next.reserva) {
      upcomingMatchData = {
        type: next.deporte || "Deporte",
        location: next.reserva.campo?.nombre || "Campo por definir",
        dateFormatted: (next.reserva.fecha || "Fecha") + " " + (next.reserva.horaInicio ? next.reserva.horaInicio.substring(0,5) : "Hora"),
        weather: "15ºC", // Simulado
        timeUntil: "Pronto" // Podría calcularse usando Date.now()
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32 md:pb-0">
      <Navbar />

      {/* Main Content Dashboard */}
      <main className="grow max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-10 overflow-x-hidden relative">
        
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC]/50 z-10 backdrop-blur-sm h-64">
             <div className="flex flex-col items-center gap-3">
               <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-sm font-bold text-emerald-700 tracking-widest uppercase animate-pulse">Cargando la pista...</span>
             </div>
          </div>
        ) : (
          <>
            {/* Widget principal: Tu Próximo Partido */}
            <ActivityWidget upcomingMatch={upcomingMatchData} />

            {/* Buscador Rápido (Filtros) */}
            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                  ¿Qué te apetece jugar?
                </h3>
              </div>
              <QuickFilters />
            </div>

            {/*Trending Matches (FOMO) */}
            {trendingMatches.length > 0 && (
              <TrendingMatches matches={trendingMatches} />
            )}

            {/* Nueva Sección Impresionante: Campos Destacados */}
            <CamposDestacados />
            
            {/* Banner Promocional de la App (Social/Premiumness) */}
            <section className="bg-gray-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
               <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>
               <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase mb-1 block">Novedad</span>
                    <h3 className="text-2xl font-black mb-2 leading-tight">Compite en Ligas y Sube de Nivel</h3>
                    <p className="text-gray-400 text-sm max-w-sm">Juega pachangas, gana puntos de karma y lidera el ranking de tu ciudad este mes.</p>
                 </div>
                 <Link to="/perfil" className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all text-sm tracking-wide flex items-center justify-center">
                   Ver Ranking Actual
                 </Link>
               </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Inicio;
