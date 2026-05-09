import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';
import LeagueMatchday from './LeagueMatchday';
import LeagueStandings from './LeagueStandings';

const TAB_MATCHES = 'matches';
const TAB_STANDINGS = 'standings';

const LeagueView = ({ tournamentId, isAdmin }) => {
  const [activeTab, setActiveTab] = useState(TAB_MATCHES);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    return stored.token ? { Authorization: `Bearer ${stored.token}` } : {};
  };

  const fetchData = useCallback(async () => {
    try {
      const [matchRes, standRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matchdays`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/tournaments/${tournamentId}/standings`, { headers: getHeaders() }),
      ]);
      if (matchRes.ok) setMatches(await matchRes.json());
      if (standRes.ok) setStandings(await standRes.json());
    } catch (e) {
      console.error('Error fetching league data:', e);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  // Initial fetch + polling every 10s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const tabs = [
    {
      id: TAB_MATCHES,
      label: 'Partidos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
    },
    {
      id: TAB_STANDINGS,
      label: 'Clasificación',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex bg-gray-100 rounded-2xl p-1.5 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm transition-all ${
              activeTab === tab.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-100"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
            {tab.id === TAB_STANDINGS && standings.length > 0 && (
              <span className="relative z-10 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {standings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === TAB_MATCHES ? (
            <LeagueMatchday
              matches={matches}
              isAdmin={isAdmin}
              onResultSaved={fetchData}
            />
          ) : (
            <LeagueStandings standings={standings} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Actualizacion en tiempo real
      </div>
    </div>
  );
};

export default LeagueView;
