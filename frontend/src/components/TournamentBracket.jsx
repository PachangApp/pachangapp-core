import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../apiConfig';

const TournamentBracket = ({ matches, isAdmin, onMatchUpdate }) => {
  const { t } = useTranslation();

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-16 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-sm">
         <div className="text-5xl mb-4 opacity-50">🏆</div>
         <p className="text-gray-500 font-bold text-lg">{t('tournaments.bracket.bracket_empty')}</p>
      </div>
    );
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
    const teamAWon = isFinished && match.winner?.id === match.teamA?.id;
    const teamBWon = isFinished && match.winner?.id === match.teamB?.id;
    
    return (
      <motion.div 
        layoutId={`match-${match.id}`}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: index * 0.1 }}
        className={`w-56 bg-white/80 backdrop-blur-xl border ${isFinished ? 'border-primary/20 shadow-lg shadow-primary/10' : 'border-gray-100 shadow-sm'} rounded-2xl overflow-hidden text-sm mb-6 relative z-10`}
      >
        <div className={`p-3 flex justify-between items-center border-b border-gray-100/50 transition-colors ${teamAWon ? 'bg-emerald-500/10' : ''}`}>
          <div className="flex items-center gap-2 overflow-hidden">
             {teamAWon && <span className="text-emerald-500 text-xs">👑</span>}
             <span className={`truncate w-32 ${teamAWon ? 'font-black text-emerald-700' : 'font-medium text-gray-700'} ${isFinished && !teamAWon ? 'opacity-50 line-through' : ''}`}>{match.teamA ? match.teamA.name : t('tournaments.bracket.tbd')}</span>
          </div>
          <span className={`font-mono font-black ${teamAWon ? 'text-emerald-600 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-gray-400'}`}>{match.scoreA !== null ? match.scoreA : '-'}</span>
        </div>
        <div className={`p-3 flex justify-between items-center transition-colors ${teamBWon ? 'bg-emerald-500/10' : ''}`}>
          <div className="flex items-center gap-2 overflow-hidden">
             {teamBWon && <span className="text-emerald-500 text-xs">👑</span>}
             <span className={`truncate w-32 ${teamBWon ? 'font-black text-emerald-700' : 'font-medium text-gray-700'} ${isFinished && !teamBWon ? 'opacity-50 line-through' : ''}`}>{match.teamB ? match.teamB.name : t('tournaments.bracket.tbd')}</span>
          </div>
          <span className={`font-mono font-black ${teamBWon ? 'text-emerald-600 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-gray-400'}`}>{match.scoreB !== null ? match.scoreB : '-'}</span>
        </div>
        
        {isAdmin && !isFinished && match.teamA && match.teamB && (
          <div className="bg-gray-50/80 p-2 flex gap-1.5 border-t border-gray-100/80 backdrop-blur-md">
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleScoreUpdate(match.id, (match.scoreA||0)+1, match.scoreB||0)}
              className="px-2 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg w-full text-xs font-bold transition-colors shadow-sm"
            >
              +A
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleScoreUpdate(match.id, match.scoreA||0, (match.scoreB||0)+1)}
              className="px-2 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg w-full text-xs font-bold transition-colors shadow-sm"
            >
              +B
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(52,211,153,0.5)" }} whileTap={{ scale: 0.95 }}
              onClick={() => {
                if(window.confirm(t('tournaments.detail.finish_confirm'))) {
                  handleScoreUpdate(match.id, match.scoreA||0, match.scoreB||0); // backend finaliza si se llama endpoint
                }
              }}
              className="px-2 py-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-black rounded-lg w-full text-xs shadow-md"
            >
              OK
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  };

  const getRoundTitle = (roundName) => {
    switch (roundName) {
      case 'QUARTERFINAL': return t('tournaments.bracket.quarterfinals');
      case 'SEMIFINAL': return t('tournaments.bracket.semifinals');
      case 'FINAL': return t('tournaments.bracket.final');
      default: return roundName;
    }
  };

  return (
    <div className="flex items-center gap-12 overflow-x-auto pb-10 pt-4 px-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-[3rem] hide-scrollbar text-gray-900 border border-gray-200/50 shadow-inner">
      <AnimatePresence>
        {roundKeys.map((roundName, colIndex) => (
          <div key={roundName} className="flex flex-col justify-around h-[550px] min-w-[240px]">
            <h4 className="text-center font-black text-gray-400/80 mb-6 uppercase tracking-[0.2em] text-xs bg-white/40 px-4 py-2 rounded-full backdrop-blur-sm self-center shadow-[inset_0_0_10px_rgba(0,0,0,0.02)] border border-gray-200/50">
              {getRoundTitle(roundName)}
            </h4>
            {roundsMap[roundName].map((match, i) => (
              <div key={match.id} className="relative flex items-center">
                <MatchNode match={match} index={colIndex * 2 + i} />
                
                {colIndex < roundKeys.length - 1 && (
                  <motion.div 
                    initial={{ scaleX: 0 }} 
                    animate={{ scaleX: 1 }} 
                    transition={{ duration: 1, delay: 0.5 + (colIndex * 0.2) }}
                    className="absolute left-full w-12 h-[2px] bg-gradient-to-r from-gray-300 to-gray-200 top-1/2 -z-10 origin-left rounded-full"
                  ></motion.div>
                )}
              </div>
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TournamentBracket;

