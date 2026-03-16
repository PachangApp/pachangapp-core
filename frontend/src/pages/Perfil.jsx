import React from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

const Perfil = () => {
  // Datos hardcoded provisionales para la demo
  const user = {
    username: "Chakr",
    email: "usuario@ejemplo.com",
    joined: "Marzo 2024",
    nivel: "Amateur",
    avatar: null, // Placeholder para imagen
    stats: {
      partidos: 12,
      victorias: 8,
      goles: 15
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Cabecera de Perfil */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Foto de Perfil */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-emerald-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-20 h-20 text-emerald-600 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-emerald-600 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* Información Principal */}
            <div className="grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-900">{user.username}</h1>
                <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase self-center md:self-auto">
                  {user.nivel}
                </span>
              </div>
              <p className="text-gray-500 font-medium mb-6">Miembro desde {user.joined}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user.email}
                </div>
                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-200">
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Estadísticas */}
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          Estadísticas de Juego
          <div className="h-1 grow bg-gray-200 rounded-full mt-1 opacity-50"></div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard 
            label="Partidos Jugados" 
            value={user.stats.partidos} 
            color="emerald"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <StatCard 
            label="Victorias" 
            value={user.stats.victorias} 
            color="blue"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
          />
          <StatCard 
            label="Goles / Puntos" 
            value={user.stats.goles} 
            color="amber"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Historial Provisional */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg">Últimas Actividades</h3>
            <button className="text-emerald-600 text-sm font-bold hover:underline">Ver todo</button>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm italic">
               Pronto podrás ver aquí tu historial de partidos detallado.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
