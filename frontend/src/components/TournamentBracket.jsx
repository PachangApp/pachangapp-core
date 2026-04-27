import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../apiConfig';

const TournamentBracket = ({ matches, isAdmin, onMatchUpdate }) => {
  const { t } = useTranslation();

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
         <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0V9.457c0-.621-.504-1.125-1.125-1.125h-.125c-.621 0-1.125.504-1.125 1.125V9.457c0 .621.504 1.125 1.125 1.125h.125c.621 0 1.125-.504 1.125-1.125V9.457ZM9.171 8.332A5.485 5.485 0 0 1 12 7.5c1.11 0 2.128.33 2.977.896" />
            </svg>
         </div>
         <p className="text-gray-400 font-bold text-lg">{t('tournaments.bracket.bracket_empty')}</p>
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
        className={`w-56 bg-white border ${isFinished ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'border-gray-100 shadow-sm'} rounded-2xl overflow-hidden text-sm mb-6 relative z-10`}
      >
        <div className={`p-3 flex justify-between items-center border-b border-gray-100/50 transition-colors ${teamAWon ? 'bg-emerald-50' : ''}`}>
          <div className="flex items-center gap-2 overflow-hidden">
             {teamAWon && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-emerald-500"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>}
             <span className={`truncate w-32 ${teamAWon ? 'font-black text-emerald-700' : 'font-medium text-gray-700'} ${isFinished && !teamAWon ? 'opacity-50 line-through' : ''}`}>{match.teamA ? match.teamA.name : t('tournaments.bracket.tbd')}</span>
          </div>
          <span className={`font-mono font-black ${teamAWon ? 'text-emerald-600' : 'text-gray-400'}`}>{match.scoreA !== null ? match.scoreA : '-'}</span>
        </div>
        <div className={`p-3 flex justify-between items-center transition-colors ${teamBWon ? 'bg-emerald-50' : ''}`}>
          <div className="flex items-center gap-2 overflow-hidden">
             {teamBWon && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-emerald-500"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>}
             <span className={`truncate w-32 ${teamBWon ? 'font-black text-emerald-700' : 'font-medium text-gray-700'} ${isFinished && !teamBWon ? 'opacity-50 line-through' : ''}`}>{match.teamB ? match.teamB.name : t('tournaments.bracket.tbd')}</span>
          </div>
          <span className={`font-mono font-black ${teamBWon ? 'text-emerald-600' : 'text-gray-400'}`}>{match.scoreB !== null ? match.scoreB : '-'}</span>
        </div>
        
        {isAdmin && !isFinished && match.teamA && match.teamB && (
          <div className="bg-gray-50 p-2 flex gap-1.5 border-t border-gray-100">
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleScoreUpdate(match.id, (match.scoreA||0)+1, match.scoreB||0)}
              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg w-full text-[10px] font-black transition-colors shadow-sm"
            >
              +A
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleScoreUpdate(match.id, match.scoreA||0, (match.scoreB||0)+1)}
              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg w-full text-[10px] font-black transition-colors shadow-sm"
            >
              +B
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(16,185,129,0.3)" }} whileTap={{ scale: 0.95 }}
              onClick={() => {
                if(window.confirm(t('tournaments.detail.finish_confirm'))) {
                  handleScoreUpdate(match.id, match.scoreA||0, match.scoreB||0);
                }
              }}
              className="px-2 py-1.5 bg-emerald-600 text-white font-black rounded-lg w-full text-[10px] shadow-md"
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
    <div className="flex items-center gap-12 overflow-x-auto pb-10 pt-4 px-6 bg-gray-50 rounded-[3rem] hide-scrollbar text-gray-900 border border-gray-100 shadow-inner">
      <AnimatePresence>
        {roundKeys.map((roundName, colIndex) => (
          <div key={roundName} className="flex flex-col justify-around h-[550px] min-w-[240px]">
            <h4 className="text-center font-black text-gray-400 mb-6 uppercase tracking-[0.2em] text-[10px] bg-white px-4 py-2 rounded-full border border-gray-100 self-center shadow-sm">
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
                    className="absolute left-full w-12 h-[2px] bg-gray-200 top-1/2 -z-10 origin-left rounded-full"
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
