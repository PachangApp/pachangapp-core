import React, { useState } from "react";

const CreateMatchModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    deporte: "Fútbol 7",
    ubicacion: "",
    fecha: "",
    hora: "",
    jugadores: 10
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Overlay con desenfoque */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Contenido del Modal */}
      <div className="relative bg-white w-full max-w-4xl rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Lado Izquierdo: Formulario */}
        <div className="flex-1 p-8 md:p-12">
          <header className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Crear Partida</h2>
            <p className="text-gray-500 font-medium text-sm">Organiza tu propio encuentro en segundos.</p>
          </header>

          <form className="space-y-6">
            {/* Selección de Deporte */}
            <div className="grid grid-cols-3 gap-3">
              {["Fútbol 7", "Fútbol 11", "Fútbol Sala"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFormData({ ...formData, deporte: tipo })}
                  className={`py-3 px-2 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border-2 transition-all ${
                    formData.deporte === tipo
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:border-emerald-200"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ubicación</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="¿Dónde se juega?" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.828a2 2 0 01-2.828 0L6.586 16.657M12 14a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fecha</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700"
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hora</label>
                <input 
                  type="time" 
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-700"
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </div>
            </div>

            {/* Jugadores */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Número de Jugadores</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="2" 
                  max="22" 
                  className="grow accent-emerald-600"
                  value={formData.jugadores}
                  onChange={(e) => setFormData({ ...formData, jugadores: e.target.value })}
                />
                <span className="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-700 font-black rounded-xl border border-emerald-100">
                  {formData.jugadores}
                </span>
              </div>
            </div>

            {/* Botón */}
            <button 
              type="button"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-200 transform hover:-translate-y-1 active:scale-[0.98]"
            >
              ¡Crear Partida!
            </button>
          </form>
        </div>

        {/* Lado Derecho: Mapa Decorativo (inspirado en imagen) */}
        <div className="hidden md:flex w-80 bg-gray-50 border-l border-gray-100 flex-col items-center justify-center p-8 relative overflow-hidden">
             {/* Simulación de mapa */}
             <div className="w-full h-full bg-gray-200 rounded-3xl overflow-hidden relative shadow-inner border-4 border-white">
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.4168,-3.7038&zoom=13&size=400x800&key=YOUR_API_KEY_HERE')] bg-cover opacity-50 grayscale"></div>
                
                {/* Pin decorativo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="w-10 h-3 bg-black/10 rounded-full blur-sm mx-auto -mt-1"></div>
                </div>

                {/* Info flotante */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Previsualización</p>
                    <p className="text-sm font-bold text-gray-900">Selecciona el campo en el mapa</p>
                </div>
             </div>
             
             {/* Botón cerrar modal */}
             <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors border border-gray-100"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMatchModal;
