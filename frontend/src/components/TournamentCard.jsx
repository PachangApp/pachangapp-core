import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TournamentCard = ({ tournament }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 ring-1 ring-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      case 'FINISHED': return 'bg-gray-100 text-gray-800 ring-1 ring-gray-300';
      default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'OPEN': return t('tournaments.card.status_open');
      case 'IN_PROGRESS': return t('tournaments.card.status_in_progress');
      case 'FINISHED': return t('tournaments.card.status_finished');
      default: return status;
    }
  };

  return (
    <motion.div
      layoutId={`tournament-card-${tournament.id}`}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/torneos/${tournament.id}`)}
      className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl hover:shadow-emerald-600/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group flex flex-col"
    >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <motion.img 
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          src={tournament.imageUrl || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55"} 
          alt={tournament.name}
          className="w-full h-full object-cover transform"
        />
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
          <div>
            <div className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-xl mb-2 inline-flex items-center gap-1.5 backdrop-blur-md ${getStatusBadge(tournament.status)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              {getStatusText(tournament.status)}
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{tournament.name}</h3>
          </div>
          <div className="text-white text-right bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block mb-0.5">{t('tournaments.card.prize')}</span>
            <span className="font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">{tournament.prize}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-5 text-sm font-bold">
          <div className="flex items-center gap-2 text-gray-500">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
             </svg>
             {tournament.location}
          </div>
          <div className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
            {tournament.level}
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">{t('tournaments.card.format')}</span>
            <span className="font-black text-gray-800 text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              {tournament.type}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">{t('tournaments.teams')}</span>
            <span className="font-black text-gray-800 text-lg">
               {t('tournaments.card.max_teams', { count: tournament.maxTeams })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TournamentCard;
