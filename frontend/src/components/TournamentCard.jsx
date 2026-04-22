import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TournamentCard = ({ tournament }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'FINISHED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'OPEN': return 'Abierto';
      case 'IN_PROGRESS': return 'En Curso';
      case 'FINISHED': return 'Finalizado';
      default: return status;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/torneos/${tournament.id}`)}
      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={tournament.imageUrl || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55"} 
          alt={tournament.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
          <div>
            <div className={`text-xs font-bold px-2 py-1 rounded-lg mb-2 inline-block ${getStatusBadge(tournament.status)}`}>
              {getStatusText(tournament.status)}
            </div>
            <h3 className="text-xl font-black text-white">{tournament.name}</h3>
          </div>
          <div className="text-white text-right">
            <span className="text-sm opacity-80 block">Premio</span>
            <span className="font-bold">{tournament.prize}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
             📍 {tournament.location}
          </div>
          <div className="font-semibold text-primary">
            {tournament.level}
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
          <div>
            <span className="text-sm text-gray-500 block">Formato</span>
            <span className="font-bold text-gray-800">{tournament.type}</span>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500 block">Equipos</span>
            <span className="font-bold text-gray-800 max-w-full">
               Max {tournament.maxTeams}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TournamentCard;
