import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  PLAYING: { label: 'En juego', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  FINISHED: { label: 'Finalizado', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const MatchCard = ({ match, isAdmin, onResultSaved }) => {
  const [editing, setEditing] = useState(false);
  const [scoreA, setScoreA] = useState(match.scoreA ?? '');
  const [scoreB, setScoreB] = useState(match.scoreB ?? '');
  const [saving, setSaving] = useState(false);

  const status = statusConfig[match.status] || statusConfig.PENDING;
  const isFinished = match.status === 'FINISHED';

  const handleSave = async () => {
    if (scoreA === '' || scoreB === '') return;
    setSaving(true);
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await fetch(`${API_BASE_URL}/tournaments/matches/${match.id}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(stored.token ? { Authorization: `Bearer ${stored.token}` } : {}),
        },
        body: JSON.stringify({ scoreA: parseInt(scoreA), scoreB: parseInt(scoreB) }),
      });
      if (res.ok) {
        setEditing(false);
        onResultSaved();
      }
    } catch (e) {
      console.error('Error saving result:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-emerald-200 transition-colors"
    >
      {/* Status Badge */}
      <div className="flex justify-between items-center mb-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
          {status.label}
        </span>
        {isAdmin && isFinished && (
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-gray-400 hover:text-emerald-600 font-bold uppercase tracking-widest transition-colors"
          >
            Editar
          </button>
        )}
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-4">
        {/* Team A */}
        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm uppercase">
            {match.teamA?.name?.substring(0, 2) || '??'}
          </div>
          <span className="text-sm font-bold text-gray-800 leading-tight">{match.teamA?.name || 'TBD'}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 shrink-0">
          {isFinished && !editing ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-gray-900 w-8 text-center">{match.scoreA}</span>
              <span className="text-lg font-black text-gray-300">–</span>
              <span className="text-3xl font-black text-gray-900 w-8 text-center">{match.scoreB}</span>
            </div>
          ) : editing ? (
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="99"
                value={scoreA}
                onChange={e => setScoreA(e.target.value)}
                className="w-12 text-center text-2xl font-black border-2 border-emerald-400 rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="text-gray-400 font-black">–</span>
              <input
                type="number" min="0" max="99"
                value={scoreB}
                onChange={e => setScoreB(e.target.value)}
                className="w-12 text-center text-2xl font-black border-2 border-emerald-400 rounded-xl p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-200">–</span>
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-sm uppercase">
            {match.teamB?.name?.substring(0, 2) || '??'}
          </div>
          <span className="text-sm font-bold text-gray-800 leading-tight">{match.teamB?.name || 'TBD'}</span>
        </div>
      </div>

      {/* Admin Controls */}
      <AnimatePresence>
        {isAdmin && (!isFinished || editing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            {editing ? (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  {saving ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                  Guardar Resultado
                </button>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <input
                  type="number" min="0" max="99"
                  value={scoreA}
                  onChange={e => setScoreA(e.target.value)}
                  placeholder="0"
                  className="w-16 text-center text-lg font-bold border border-gray-200 rounded-xl p-2 focus:outline-none focus:border-emerald-400 bg-gray-50"
                />
                <span className="self-center text-gray-400 font-bold text-sm">vs</span>
                <input
                  type="number" min="0" max="99"
                  value={scoreB}
                  onChange={e => setScoreB(e.target.value)}
                  placeholder="0"
                  className="w-16 text-center text-lg font-bold border border-gray-200 rounded-xl p-2 focus:outline-none focus:border-emerald-400 bg-gray-50"
                />
                <button
                  onClick={handleSave}
                  disabled={saving || scoreA === '' || scoreB === ''}
                  className="px-4 py-2 text-xs font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md shadow-emerald-600/20"
                >
                  {saving ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> : 'Guardar'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LeagueMatchday = ({ matches, isAdmin, onResultSaved }) => {
  const [openMatchday, setOpenMatchday] = useState(1);

  // Group matches by matchday
  const grouped = matches.reduce((acc, match) => {
    const day = match.matchday || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(match);
    return acc;
  }, {});

  const matchdays = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  if (matchdays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 border border-dashed border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Calendario no generado</p>
        <p className="text-xs text-gray-300 mt-1">Las jornadas aparecerán cuando el torneo comience</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matchdays.map(day => {
        const isOpen = openMatchday === day;
        const dayMatches = grouped[day];
        const finishedCount = dayMatches.filter(m => m.status === 'FINISHED').length;

        return (
          <div key={day} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Matchday Header */}
            <button
              onClick={() => setOpenMatchday(isOpen ? null : day)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-600/20">
                  J{day}
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-900 text-base">Jornada {day}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    {finishedCount}/{dayMatches.length} partidos jugados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Progress pills */}
                <div className="flex gap-1">
                  {dayMatches.map((m, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${m.status === 'FINISHED' ? 'bg-emerald-500' : m.status === 'PLAYING' ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </motion.div>
              </div>
            </button>

            {/* Matchday Content */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    {dayMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        isAdmin={isAdmin}
                        onResultSaved={onResultSaved}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default LeagueMatchday;
