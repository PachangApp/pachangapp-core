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
      className="bg-white/90 backdrop-blur-md rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 cursor-pointer group flex flex-col"
    >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <motion.img 
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.4 }}
          src={tournament.imageUrl || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55"} 
          alt={tournament.name}
          className="w-full h-full object-cover transform"
        />
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
          <div>
            <div className={`text-xs font-bold px-3 py-1.5 rounded-xl mb-2 inline-flex items-center gap-1 backdrop-blur-sm ${getStatusBadge(tournament.status)}`}>
              {getStatusText(tournament.status)}
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{tournament.name}</h3>
          </div>
          <div className="text-white text-right bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block mb-0.5">{t('tournaments.card.prize')}</span>
            <span className="font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">{tournament.prize}</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-5 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
             <span className="text-lg">📍</span> {tournament.location}
          </div>
          <div className="font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
            {tournament.level}
          </div>
        </div>

        <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-100/80">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">{t('tournaments.card.format')}</span>
            <span className="font-black text-gray-800 text-lg flex items-center gap-2">
              ⚽ {tournament.type}
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
