import React, { useState } from "react";
import Navbar from "../components/Navbar";
import MatchCard from "../components/MatchCard";



const BuscarPartidos = () => {
  const [filters, setFilters] = useState({
    search: "",
    date: "",
    category: "Todos"
  });

  // Datos mock de partidos
  const matches = [
    {
      id: 1,
      title: "Fútbol 7 Amistoso",
      location: "Campo Universitario, Madrid",
      time: "16:00",
      players: 8,
      maxPlayers: 14,
      category: "Fútbol",
      image: ""
    },
    {
      id: 2,
      title: "Padel Nivel Int.",
      location: "Pista de Padel, Getafe",
      time: "17:30",
      players: 2,
      maxPlayers: 4,
      category: "Padel",
      image: ""
    },
    {
      id: 3,
      title: "Basket 3x3",
      location: "Pista de Balonmano, Madrid",
      time: "18:00",
      players: 4,
      maxPlayers: 6,
      category: "Baloncesto",
      image: ""
    },
    {
        id: 4,
        title: "Pachanga Nocturna",
        location: "Polideportivo Municipal",
        time: "21:00",
        players: 10,
        maxPlayers: 12,
        category: "Fútbol",
        image: ""
      }
  ];

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                          match.location.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCat = filters.category === "Todos" || match.category === filters.category;
    return matchesSearch && matchesCat;
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
            {/* Buscador de texto */}
            <div className="grow">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Lugar o Nombre</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="search"
                  placeholder="ej: Madrid, Universitario..." 
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900"
                  onChange={handleFilterChange}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Selector Deporte */}
            <div className="w-full md:w-60">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Deporte</label>
              <select 
                name="category"
                className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700 appearance-none"
                onChange={handleFilterChange}
              >
                <option>Todos</option>
                <option>Fútbol</option>
                <option>Padel</option>
                <option>Baloncesto</option>
              </select>
            </div>

            {/* Fecha */}
            <div className="w-full md:w-60">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">¿Cuándo?</label>
              <input 
                type="date" 
                name="date"
                className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700"
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </section>

        {/* Resultados */}
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-bold text-gray-800">
                Partidos disponibles <span className="text-emerald-500 ml-1">({filteredMatches.length})</span>
            </h2>
            <div className="hidden sm:flex gap-2">
                <button className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm text-gray-400 hover:text-emerald-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <button className="p-2 bg-emerald-600 rounded-lg shadow-md shadow-emerald-200 text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                </button>
            </div>
        </div>

        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron partidos</h3>
            <p className="text-gray-500">Prueba ajustando los filtros de búsqueda o volviendo más tarde.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BuscarPartidos;
