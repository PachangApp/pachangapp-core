import React from "react";
import { getFieldImage } from "../utils/fieldMapping";

const FieldCard = ({ campo, onBook }) => {
  const { nombre, zona, deporte, precioPorHora, disponible, imagenUrl } = campo;
  const localImage = getFieldImage(nombre);


  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center p-4">
        {(imagenUrl || localImage) ? (
          <img 
            src={imagenUrl || localImage} 
            alt={nombre} 
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-300">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">Sin imagen</span>
          </div>
        )}
        
        {/* Badge de disponibilidad */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${
            disponible 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
              : "bg-red-50 text-red-600 border border-red-100"
          }`}>
            {disponible ? "Disponible" : "Reservado"}
          </span>
        </div>

        {/* Deporte Tag */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-gray-100 shadow-sm">
            {deporte}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2 h-14">
          {nombre}
        </h3>
        <p className="text-gray-500 text-sm font-medium mb-4 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.828a2 2 0 01-2.828 0L6.586 16.657M12 14a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
          {zona}
        </p>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Precio</span>
            <span className="text-lg font-black text-gray-900">{precioPorHora}€<span className="text-xs text-gray-400 font-bold">/h</span></span>
          </div>
          <button 
            onClick={() => onBook(campo)}
            className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5"
          >
            Reservar Hora
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldCard;
