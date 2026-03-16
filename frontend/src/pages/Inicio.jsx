import React from "react";
import Navbar from "../components/Navbar";

const Inicio = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section / Bienvenida */}
      <main className="grow flex items-center justify-center p-6 text-center">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block px-4 py-1.5 mb-6 text-emerald-700 bg-emerald-50 rounded-full text-xs font-bold uppercase tracking-wider">
            ¡Tu comunidad deportiva!
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Bienvenido a <span className="text-emerald-600">PachangApp</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed mx-auto max-w-2xl">
            La plataforma definitiva para organizar tus pachangas, encontrar jugadores cerca de ti y reservar los mejores campos. El deporte que amas, ahora más fácil que nunca.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5">
              Empieza a jugar ya
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold py-4 px-8 rounded-2xl transition-all transform hover:-translate-y-0.5">
              Ver campos cercanos
            </button>
          </div>
          
          {/* Stats decorativas */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-100">
            <div>
              <div className="text-3xl font-black text-gray-900">+10k</div>
              <div className="text-sm text-gray-500">Jugadores</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">+500</div>
              <div className="text-sm text-gray-500">Partidos/mes</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">+200</div>
              <div className="text-sm text-gray-500">Campos</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 PachangApp · Diseñado para amantes del deporte.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Inicio;
