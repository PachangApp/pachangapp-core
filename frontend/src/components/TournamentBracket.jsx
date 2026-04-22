import React from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';

const TournamentBracket = ({ matches, isAdmin, onMatchUpdate }) => {
  if (!matches || matches.length === 0) {
    return <div className="text-center py-10 text-gray-400">El bracket se generará cuando el torneo esté lleno.</div>;
  }

  // Agrupar partidos por ronda
  const roundsMap = {
    QUARTERFINAL: [],
    SEMIFINAL: [],
    FINAL: []
  };

  matches.forEach(m => {
    if (roundsMap[m.round]) {
      roundsMap[m.round].push(m);
    }
  });

  // Si hay más rondas (ej. ROUND_16), se añadirían dinámicamente, pero para esto forzamos el orden común.
  const roundKeys = [];
  if (roundsMap['QUARTERFINAL'].length > 0) roundKeys.push('QUARTERFINAL');
  if (roundsMap['SEMIFINAL'].length > 0) roundKeys.push('SEMIFINAL');
  if (roundsMap['FINAL'].length > 0) roundKeys.push('FINAL');

  const handleScoreUpdate = async (matchId, scoreA, scoreB) => {
    if (!isAdmin) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = { 
        'Content-Type': 'application/json',
        ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
      };
      
      const res = await fetch(`${API_BASE_URL}/tournaments/matches/${matchId}/result`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ scoreA, scoreB })
      });
      if (res.ok) {
        onMatchUpdate();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const MatchNode = ({ match, index }) => {
    const isFinished = match.status === 'FINISHED';
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="w-48 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm mb-4 relative z-10"
      >
        <div className={`p-2 flex justify-between items-center border-b border-gray-100 ${match.winner?.id === match.teamA?.id ? 'bg-green-50 font-bold' : ''}`}>
          <span className="truncate w-32">{match.teamA ? match.teamA.name : 'Por decidir'}</span>
          <span className="font-mono text-gray-500">{match.scoreA !== null ? match.scoreA : '-'}</span>
        </div>
        <div className={`p-2 flex justify-between items-center ${match.winner?.id === match.teamB?.id ? 'bg-green-50 font-bold' : ''}`}>
          <span className="truncate w-32">{match.teamB ? match.teamB.name : 'Por decidir'}</span>
          <span className="font-mono text-gray-500">{match.scoreB !== null ? match.scoreB : '-'}</span>
        </div>
        
        {isAdmin && !isFinished && match.teamA && match.teamB && (
          <div className="bg-gray-50 p-2 flex gap-1 border-t border-gray-200">
            <button 
              onClick={() => handleScoreUpdate(match.id, (match.scoreA||0)+1, match.scoreB||0)}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded w-full text-xs"
            >
              +A
            </button>
            <button 
              onClick={() => handleScoreUpdate(match.id, match.scoreA||0, (match.scoreB||0)+1)}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded w-full text-xs"
            >
              +B
            </button>
            <button 
              onClick={() => {
                if(window.confirm('¿Finalizar con este resultado?')) {
                  handleScoreUpdate(match.id, match.scoreA||0, match.scoreB||0); // backend finaliza si se llama endpoint
                }
              }}
              className="px-2 py-1 bg-green-500 text-white font-bold rounded w-full text-xs"
            >
              OK
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex justify-between items-center gap-8 overflow-x-auto pb-8 pt-4 px-4 bg-gray-50 rounded-3xl hide-scrollbar text-gray-900">
      {roundKeys.map((roundName, colIndex) => (
        <div key={roundName} className="flex flex-col justify-around h-[500px] min-w-[200px]">
          <h4 className="text-center font-black text-gray-400 mb-6 uppercase tracking-wider text-xs">
            {roundName.replace('QUARTERFINAL', 'Cuartos').replace('SEMIFINAL', 'Semis').replace('FINAL', 'Final')}
          </h4>
          {roundsMap[roundName].map((match, i) => (
            <div key={match.id} className="relative flex items-center">
              <MatchNode match={match} index={colIndex * 2 + i} />
              
              {/* Líneas conectoras simples (CSS only for now) */}
              {colIndex < roundKeys.length - 1 && (
                <div className="absolute left-full w-8 h-px bg-gray-300 top-1/2 -z-10"></div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
