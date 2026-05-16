import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../apiConfig';

const MatchNode = ({ match, index, isAdmin, onMatchUpdate }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = React.useState(false);
  const [scoreA, setScoreA] = React.useState(match.scoreA ?? 0);
  const [scoreB, setScoreB] = React.useState(match.scoreB ?? 0);
  const [saving, setSaving] = React.useState(false);

  const isFinished = match.status === 'FINISHED';
  const teamAWon = isFinished && match.winner?.id === match.teamA?.id;
  const teamBWon = isFinished && match.winner?.id === match.teamB?.id;

  const handleSave = async () => {
    setSaving(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = { 
        'Content-Type': 'application/json',
        ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
      };
      
      const res = await fetch(`${API_BASE_URL}/tournaments/matches/${match.id}/result`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ scoreA: parseInt(scoreA), scoreB: parseInt(scoreB) })
      });
      if (res.ok) {
        setEditing(false);
        onMatchUpdate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <motion.div 
      layoutId={`match-${match.id}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: index * 0.1 }}
      className={`w-64 bg-white border ${isFinished ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'border-gray-100 shadow-sm'} rounded-2xl overflow-hidden text-sm mb-6 relative z-10`}
    >
      {isAdmin && isFinished && (
        <div className="bg-gray-50/50 px-3 py-1 flex justify-end border-b border-gray-100">
           <button 
             onClick={() => setEditing(!editing)}
             className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors"
           >
             {editing ? t('common.cancel') || 'Cancelar' : t('common.edit') || 'Editar'}
           </button>
        </div>
      )}

      <div className={`p-4 flex justify-between items-center border-b border-gray-100/50 transition-colors ${teamAWon ? 'bg-emerald-50' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px] ${teamAWon ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-gray-100 text-gray-400'}`}>
              {match.teamA?.name?.substring(0, 2).toUpperCase() || '??'}
           </div>
           <span className={`truncate w-32 ${teamAWon ? 'font-black text-emerald-800' : 'font-bold text-gray-700'} ${isFinished && !teamAWon ? 'opacity-40' : ''}`}>
              {match.teamA ? match.teamA.name : t('tournaments.bracket.tbd')}
           </span>
        </div>
        {editing ? (
          <input 
            type="number" min="0"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            className="w-10 h-8 bg-gray-50 border border-gray-200 rounded-lg text-center font-black text-emerald-600 focus:outline-none focus:border-emerald-500"
          />
        ) : (
          <span className={`font-mono text-lg font-black ${teamAWon ? 'text-emerald-600' : 'text-gray-400'}`}>
            {match.scoreA !== null ? match.scoreA : '-'}
          </span>
        )}
      </div>

      <div className={`p-4 flex justify-between items-center transition-colors ${teamBWon ? 'bg-emerald-50' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px] ${teamBWon ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-gray-100 text-gray-400'}`}>
              {match.teamB?.name?.substring(0, 2).toUpperCase() || '??'}
           </div>
           <span className={`truncate w-32 ${teamBWon ? 'font-black text-emerald-800' : 'font-bold text-gray-700'} ${isFinished && !teamBWon ? 'opacity-40' : ''}`}>
              {match.teamB ? match.teamB.name : t('tournaments.bracket.tbd')}
           </span>
        </div>
        {editing ? (
          <input 
            type="number" min="0"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            className="w-10 h-8 bg-gray-50 border border-gray-200 rounded-lg text-center font-black text-emerald-600 focus:outline-none focus:border-emerald-500"
          />
        ) : (
          <span className={`font-mono text-lg font-black ${teamBWon ? 'text-emerald-600' : 'text-gray-400'}`}>
            {match.scoreB !== null ? match.scoreB : '-'}
          </span>
        )}
      </div>
      
      {(isAdmin && (!isFinished || editing) && match.teamA && match.teamB) && (
        <div className="bg-gray-50 p-3 border-t border-gray-100">
          {editing ? (
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {t('common.save') || 'Guardar'}
            </motion.button>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 flex gap-1 bg-white p-1 rounded-xl border border-gray-200">
                <input 
                  type="number" min="0" placeholder="0"
                  value={scoreA} onChange={(e) => setScoreA(e.target.value)}
                  className="w-full text-center font-black text-gray-700 bg-transparent focus:outline-none"
                />
                <span className="text-gray-300 font-bold self-center text-[10px]">vs</span>
                <input 
                  type="number" min="0" placeholder="0"
                  value={scoreB} onChange={(e) => setScoreB(e.target.value)}
                  className="w-full text-center font-black text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleSave()}
                className="px-4 bg-emerald-600 text-white font-black rounded-xl text-[10px] shadow-md"
              >
                OK
              </motion.button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

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
                <MatchNode 
                  match={match} 
                  index={colIndex * 2 + i} 
                  isAdmin={isAdmin} 
                  onMatchUpdate={onMatchUpdate} 
                />
                
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
