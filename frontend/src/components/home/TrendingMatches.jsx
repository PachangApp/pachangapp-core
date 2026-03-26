import React from "react";
import { Link } from "react-router-dom";
import MatchCard from "../MatchCard";

const TrendingMatches = ({ matches = [] }) => {
  if (!matches || matches.length === 0) return null;

  return (
    <section className="mb-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
          <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
            🔥 Partidos Calientes
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Plazas volando, ¡no te quedes fuera!
          </p>
        </div>
        <Link to="/buscar-partidos" className="text-sm text-emerald-600 font-bold hover:text-emerald-700 hover:underline mb-1 transition-all">
          Ver todos
        </Link>
      </div>
      
      {/* Horizontal Scroll on Mobile, Grid on Desktop */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-6 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:flex-none">
        {matches.map((match) => (
          <div key={match.id} className="min-w-[280px] sm:min-w-0 shrink-0 snap-center relative">
            {/* FOMO Badge */}
            <div className="absolute -top-3 left-4 z-10 bg-red-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md animate-pulse">
              ¡Faltan {match.maxJugadores - match.jugadores.length} plazas!
            </div>
            {/* The existing MatchCard */}
            <div className="pt-2"> 
              <MatchCard match={match} onJoin={(id) => console.log('Join match', id)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingMatches;
