import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFieldImage } from "../../utils/fieldMapping";

const CamposDestacados = () => {
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real campos from the backend to make the page richer
    const fetchCampos = async () => {
      try {
        const response = await fetch("http://localhost:8091/api/campos");
        if (response.ok) {
          const data = await response.json();
          // Solo cogemos 3 al azar o los primeros 3 para destacar
          setCampos(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error al cargar campos destacados", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampos();
  }, []);

  if (loading) return null; // Para no ensuciar la visual principal si carga lento

  return (
    <section className="mb-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
      <div className="flex justify-between items-end mb-5 px-1">
        <div>
          <h3 className="font-extrabold text-xl text-gray-900">
            🏟️ Instalaciones Top
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Los campos mejor valorados de tu ciudad
          </p>
        </div>
        <Link to="/campos-disponibles" className="text-sm text-emerald-600 font-bold hover:underline">
          Ver mapa
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {campos.map((campo, index) => {
          const localImage = getFieldImage(campo.nombre);
          const displayImage = campo.imagenUrl || localImage;
          return (
          <div 
            key={campo.id} 
            onClick={() => window.location.href = "/campos-disponibles"}
            className="min-w-[260px] sm:min-w-[300px] shrink-0 snap-center rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
          >
            {/* Imagen del campo con fallback al gradiente */}
            <div className={`h-40 w-full ${!displayImage ? 'bg-gradient-to-br from-gray-800 to-gray-900' : ''}`}>
              {displayImage ? (
                <img 
                  src={displayImage} 
                  alt={campo.nombre} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover:scale-110 transition-transform duration-700"></div>
              )}
            </div>

            {/* Overlay Gradient para textos legibles */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

            {/* Contenido info */}
            <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-300">
              <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block">
                {campo.deporte}
              </span>
              <h4 className="text-white font-black text-lg leading-tight mb-1 drop-shadow-md">
                {campo.nombre}
              </h4>
              <div className="flex items-center gap-1.5 text-gray-300 text-sm font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.828a2 2 0 01-2.828 0L6.586 16.657M12 14a3 3 0 110-6 3 3 0 010 6z" /></svg>
                {campo.zona}
              </div>
            </div>
            
            {/* Botón flotante on hover */}
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-lg transform rotate-[-45deg] group-hover:rotate-0 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default CamposDestacados;
