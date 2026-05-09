import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LeagueStandings = ({ standings, teams }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 border border-dashed border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Clasificación no disponible</p>
        <p className="text-xs text-gray-300 mt-1">Los resultados aparecerán aquí cuando se jueguen partidos</p>
      </div>
    );
  }

  const getRowStyle = (index) => {
    if (index === 0) return 'bg-amber-50 border-l-4 border-amber-400';
    if (index <= 2) return 'bg-emerald-50/60 border-l-4 border-emerald-400';
    return 'border-l-4 border-transparent';
  };

  const getPositionBadge = (index) => {
    if (index === 0) return (
      <span className="w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-black shadow-md shadow-amber-200">1</span>
    );
    if (index === 1) return (
      <span className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-black shadow-md">{index + 1}</span>
    );
    if (index === 2) return (
      <span className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-black shadow-md">{index + 1}</span>
    );
    return (
      <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">{index + 1}</span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
            <th className="py-4 px-4 text-left w-8">#</th>
            <th className="py-4 px-4 text-left">Equipo</th>
            <th className="py-4 px-3 text-center">PJ</th>
            <th className="py-4 px-3 text-center">PG</th>
            <th className="py-4 px-3 text-center">PE</th>
            <th className="py-4 px-3 text-center">PP</th>
            <th className="py-4 px-3 text-center">GF</th>
            <th className="py-4 px-3 text-center">GC</th>
            <th className="py-4 px-3 text-center">DG</th>
            <th className="py-4 px-4 text-center bg-emerald-600">Pts</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {standings.map((standing, index) => {
              const diff = standing.goalsFor - standing.goalsAgainst;
              return (
                <motion.tr
                  key={standing.team?.id || index}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getRowStyle(index)}`}
                >
                  <td className="py-4 px-4">
                    {getPositionBadge(index)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs uppercase border border-emerald-200/50 shrink-0">
                        {standing.team?.name?.substring(0, 2) || '??'}
                      </div>
                      <span className="font-bold text-gray-900">{standing.team?.name || 'Equipo'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center font-semibold text-gray-600">{standing.played}</td>
                  <td className="py-4 px-3 text-center font-semibold text-emerald-600">{standing.won}</td>
                  <td className="py-4 px-3 text-center font-semibold text-amber-500">{standing.drawn}</td>
                  <td className="py-4 px-3 text-center font-semibold text-red-500">{standing.lost}</td>
                  <td className="py-4 px-3 text-center text-gray-600">{standing.goalsFor}</td>
                  <td className="py-4 px-3 text-center text-gray-600">{standing.goalsAgainst}</td>
                  <td className={`py-4 px-3 text-center font-bold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                  <td className="py-4 px-4 text-center bg-emerald-50">
                    <span className="text-lg font-black text-emerald-700">{standing.points}</span>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-t border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span>Lider</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span>Podio</span>
        </div>
      </div>
    </div>
  );
};

export default LeagueStandings;
