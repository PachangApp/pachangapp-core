import React from "react";
import { Link } from "react-router-dom";

const ActivityWidget = ({ upcomingMatch }) => {
  if (!upcomingMatch) {
    return (
      <section className="text-center py-6 animate-in fade-in duration-500">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Sal a la cancha.</h2>
        <p className="text-gray-500 mb-6">Encuentra pachangas cerca de ti o monta la tuya propia.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/buscar-partidos" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center">
            Buscar partidos
          </Link>
          <Link to="/crear-partido" className="flex-1 bg-white hover:bg-gray-50 border-2 border-emerald-600 text-emerald-600 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center">
            Crear partido
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="absolute top-0 right-0 opacity-20 text-6xl translate-x-4 -translate-y-4">⚽</div>
      <p className="text-sm font-semibold uppercase tracking-wider mb-1 text-emerald-100">
        Próximo partido en {upcomingMatch.timeUntil}
      </p>
      <h2 className="text-2xl font-bold mb-4 pr-10 leading-tight">
        {upcomingMatch.type} - {upcomingMatch.location}
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
          <span>📅</span> {upcomingMatch.dateFormatted}
        </span>
        <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
          <span>☀️</span> {upcomingMatch.weather}
        </span>
      </div>
      <button className="mt-5 w-full bg-white text-emerald-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition drop-shadow-md active:scale-[0.98]">
        Ver detalles del partido
      </button>
    </section>
  );
};

export default ActivityWidget;
