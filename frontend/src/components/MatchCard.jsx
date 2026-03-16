import React from "react";

const MatchCard = ({ match }) => {
  const { title, location, time, players, maxPlayers, image, category } = match;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Imagen del partido */}
      <div className="relative h-48 sm:h-52 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay con tags */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
            {category}
          </span>
        </div>
        
        {/* Hora y Plazas (Estilo imagen referencia) */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white drop-shadow-md">
            <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold">
                {time}
            </span>
            <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold">
                {players}/{maxPlayers}
            </span>
        </div>
      </div>

      {/* Contenido info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.828a2 2 0 01-2.828 0L6.586 16.657M12 14a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
          {location}
        </div>

        <button className="w-full py-2.5 bg-gray-50 hover:bg-emerald-600 hover:text-white text-emerald-600 font-bold text-sm rounded-xl transition-all duration-200 border border-emerald-100 hover:border-transparent">
          Unirse al partido
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
