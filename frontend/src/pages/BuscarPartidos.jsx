import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MatchCard from "../components/MatchCard";

const BuscarPartidos = () => {
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
      const response = await fetch(`http://localhost:8091/api/partidos?page=${pageNum}`);
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
      const response = await fetch("http://localhost:8091/api/campos");
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
    const { id: userId } = JSON.parse(storedUser);

    try {
      const response = await fetch(`http://localhost:8091/api/partidos/${partidoId}/unirse?userId=${userId}`, {
        method: "POST"
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
    // Filtrar por Campo
    const matchesCampo = filters.campo === "Todos" || match.reserva.campo.nombre === filters.campo;
    
    // Filtrar por Modalidad (Deporte)
    const matchesCat = filters.category === "Todos" || match.deporte === filters.category;
    
    // Filtrar por Fecha
    const matchesDate = !filters.date || match.reserva.fecha === filters.date;

    return matchesCampo && matchesCat && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header y Filtros */}
        <section className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tight">
            Encuentra tu próximo <span className="text-emerald-600">partido</span>
          </h1>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
            {/* Buscador de campo (Dropdown) */}
            <div className="grow">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Campo</label>
              <div className="relative">
                <select 
                  name="campo"
                  className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700 appearance-none"
                  value={filters.campo}
                  onChange={handleFilterChange}
                >
                  <option value="Todos">Todos los campos</option>
                  {[...new Set(allCampos.map(c => c.nombre))].sort().map(nombre => (
                    <option key={nombre} value={nombre}>{nombre}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Selector Deporte */}
            <div className="w-full md:w-60">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Modalidad</label>
              <div className="relative">
                <select 
                  name="category"
                  className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700 appearance-none"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option>Todos</option>
                  <option>Fútbol 7</option>
                  <option>Fútbol 11</option>
                  <option>Fútbol Sala</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div className="w-full md:w-60">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Fecha</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="date"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700 block"
                  value={filters.date}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </section>


        {/* Resultados */}
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-bold text-gray-800">
                Partidos disponibles <span className="text-emerald-500 ml-1">({filteredMatches.length})</span>
            </h2>
        </div>

        {loading && matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold">Buscando pachangas cerca de ti...</p>
          </div>
        ) : filteredMatches.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredMatches.map(match => (
                <MatchCard key={match.id} match={match} onJoin={handleJoin} />
              ))}
            </div>

            {page + 1 < totalPages && (
              <div className="mt-12 text-center">
                <button 
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-white border-2 border-emerald-100 text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Cargar más partidos"}
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron partidos</h3>
            <p className="text-gray-500">Prueba ajustando los filtros de búsqueda o abriendo tú un partido.</p>
          </div>
        )}

        {/* Botón Flotante para Crear (Inspirado en imagen) */}
        <div className="fixed bottom-10 right-10 z-60">
            <button 
                onClick={() => navigate("/crear-partido")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-8 rounded-2xl shadow-2xl shadow-emerald-200 transform hover:-translate-y-2 transition-all flex items-center gap-3 active:scale-95 group"
            >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                Crear Partido
            </button>
        </div>
      </main>
    </div>
  );
};

export default BuscarPartidos;
