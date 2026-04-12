import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getFieldImage } from "../utils/fieldMapping";
import { API_BASE_URL } from "../apiConfig";

const MatchCard = ({ match, onJoin }) => {
  const { t } = useTranslation();
  const { reserva, participaciones = [], maxJugadores, deporte, id } = match;
  const campo = reserva?.campo || {};
  const horaInicio = reserva?.horaInicio || "00:00:00";
  const fecha = reserva?.fecha || "Fecha";

  const localImage = campo.nombre ? getFieldImage(campo.nombre) : null;
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isJoined = participaciones.some(p => p.user?.id === currentUser?.id);

  // Arreglo para que las imágenes relativas del backend se carguen correctamente
  let displayImage = localImage;
  if (campo.imagenUrl) {
    if (campo.imagenUrl.startsWith('http')) {
      displayImage = campo.imagenUrl;
    } else {
      // Asume que es una imagen subida al servidor
      const baseUrl = API_BASE_URL.replace('/api', ''); // Ajuste: de 'http://localhost:8091/api' a 'http://localhost:8091'
      displayImage = baseUrl + (campo.imagenUrl.startsWith('/') ? '' : '/') + campo.imagenUrl;
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Imagen del partido */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={campo.nombre} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
             <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
             <span className="text-[10px] font-black uppercase tracking-widest">{t('match_card.no_image')}</span>
          </div>
        )}
        
        {/* Overlay con tags */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
            {deporte}
          </span>
          {match.estado === 'FINALIZADO' && (
            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
              {t('match_card.finished')}
            </span>
          )}
        </div>
        
        {/* Hora y Plazas */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white drop-shadow-md">
            <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold">
                {fecha} • {horaInicio.substring(0, 5)}
            </span>
            <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold">
                {participaciones.length}/{maxJugadores}
            </span>
        </div>
      </div>

      {/* Contenido info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
          {t('match_card.match_at', { campo: campo.nombre })}
        </h3>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.828a2 2 0 01-2.828 0L6.586 16.657M12 14a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
          {campo.zona}
        </div>

        {isJoined || match.estado === 'FINALIZADO' ? (
          <Link 
            to={`/partido/${id}`}
            className="block w-full text-center py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-100"
          >
            {match.estado === 'FINALIZADO' ? t('match_card.view_result') : t('match_card.enter_match')}
          </Link>
        ) : (
          <button 
            onClick={() => onJoin(id)}
            className="w-full py-2.5 bg-gray-50 hover:bg-emerald-600 hover:text-white text-emerald-600 font-bold text-sm rounded-xl transition-all duration-200 border border-emerald-100 hover:border-transparent"
          >
            {t('match_card.join_match')}
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
