import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";

import Navbar from "../components/Navbar";
import FieldCard from "../components/FieldCard";
import BookingModal from "../components/BookingModal";

const CamposDisponibles = () => {
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampo, setSelectedCampo] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    deporte: "Todos",
    soloDisponibles: false
  });

  useEffect(() => {
    fetchCampos();
  }, []);

  const fetchCampos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/campos`);
      if (!response.ok) throw new Error("Error al obtener los campos");
      const data = await response.json();
      setCampos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (campo) => {
    setSelectedCampo(campo);
    setIsBookingOpen(true);
  };

  const handleFilterChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFilters({ ...filters, [e.target.name]: value });
  };

  const filteredCampos = campos.filter(campo => {
    const matchesSearch = campo.nombre.toLowerCase().includes(filters.search.toLowerCase()) || 
                          campo.zona.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDeporte = filters.deporte === "Todos" || campo.deporte === filters.deporte;
    const matchesDisponibilidad = !filters.soloDisponibles || campo.disponible;
    
    return matchesSearch && matchesDeporte && matchesDisponibilidad;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="inline-block px-3 py-1 mb-3 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
            Alquiler de Instalaciones
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Campos <span className="text-emerald-600">Disponibles</span>
          </h1>
        </header>

        {/* Filtros */}
        <section className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Lugar o Instalación</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="search"
                  placeholder="¿Dónde quieres jugar? (ej: Cartuja, Fuentenueva...)" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900"
                  onChange={handleFilterChange}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Modalidad</label>
              <select 
                name="deporte"
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700 appearance-none"
                onChange={handleFilterChange}
              >
                <option>Todos</option>
                <option>Fútbol 7</option>
                <option>Fútbol 11</option>
                <option>Fútbol Sala</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer">
              <input 
                type="checkbox" 
                name="soloDisponibles"
                id="soloDisponibles"
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                onChange={handleFilterChange}
              />
              <label htmlFor="soloDisponibles" className="text-sm font-bold text-gray-600 cursor-pointer">
                Mostrar solo campos libres
              </label>
            </div>
          </div>
        </section>

        {/* Resultados Agrupados por Zona */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold">Buscando las mejores pistas para ti...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-700 p-8 rounded-3xl text-center">
            <p className="font-bold mb-2">Vaya, algo ha salido mal</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : filteredCampos.length > 0 ? (
          <div className="space-y-16">
            {[...new Set(filteredCampos.map(c => c.zona))].map(zona => (
              <div key={zona} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight capitalize">{zona}</h2>
                  <div className="h-px bg-gray-200 grow mt-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCampos
                    .filter(c => c.zona === zona)
                    .map(campo => (
                      <FieldCard key={campo.id} campo={campo} onBook={handleBook} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-4xl p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 0L9 1M9 1l-3 3m3-3l3 3" />
                </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No hay campos disponibles</h3>
            <p className="text-gray-500">Prueba ajustando la zona o el deporte en los filtros superiores.</p>
          </div>
        )}

        {/* Modal de Reserva */}
        {selectedCampo && (
          <BookingModal 
            isOpen={isBookingOpen} 
            onClose={() => setIsBookingOpen(false)} 
            campo={selectedCampo}
          />
        )}
      </main>
    </div>
  );
};

export default CamposDisponibles;
