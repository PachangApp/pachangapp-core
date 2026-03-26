import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../apiConfig";

const BookingModal = ({ isOpen, onClose, campo }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isPublic, setIsPublic] = useState(false);
  const [maxJugadores, setMaxJugadores] = useState(10);

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  const fetchDisponibilidad = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reservas/disponibilidad?campoId=${campo.id}&fecha=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data);
      }
    } catch (err) {
      console.error("Error al obtener disponibilidad:", err);
    } finally {
      setLoading(false);
    }
  }, [campo, selectedDate]);

  useEffect(() => {
    if (isOpen && campo) {
      fetchDisponibilidad();
    }
  }, [isOpen, fetchDisponibilidad, campo]);

  const handleBooking = async (hora) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setMessage({ text: "Debes iniciar sesión para reservar.", type: "error" });
      return;
    }

    const { id: userId } = JSON.parse(storedUser);
    setBookingLoading(hora);
    
    try {
      const endpoint = isPublic ? `${API_BASE_URL}/partidos` : `${API_BASE_URL}/reservas`;
      const payload = isPublic 
        ? { campoId: campo.id, userId: userId, fecha: selectedDate, hora: hora, maxJugadores: maxJugadores }
        : { campoId: campo.id, userId: userId, fecha: selectedDate, hora: hora };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage({ 
          text: isPublic ? "¡Partido abierto con éxito!" : "¡Reserva realizada con éxito!", 
          type: "success" 
        });
        fetchDisponibilidad();
      } else {
        const errorText = await response.text();
        setMessage({ text: errorText, type: "error" });
      }
    } catch (err) {
      console.error("Error en handleBooking:", err);
      setMessage({ text: "Error de red al reservar.", type: "error" });
    } finally {
      setBookingLoading(null);
    }
  };

  if (!isOpen) return null;

  // Generar fechas para la próxima semana
  const availableDates = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    availableDates.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <header className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{campo.nombre}</h2>
            <p className="text-gray-500 font-medium text-sm flex items-center gap-1.5 mt-1">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.828a2 2 0 01-2.828 0L6.586 16.657M12 14a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
              {campo.zona}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="p-8">
          {/* Selector de Fecha */}
          <div className="mb-8">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Selecciona una fecha (Próximos 7 días)</label>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {availableDates.map(date => {
                const isSelected = selectedDate === date;
                const d = new Date(date);
                const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
                const dayNum = d.getDate();

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isSelected 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{dayName}</span>
                    <span className="text-xl font-black mt-1">{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opciones de Partido */}
          <div className="mb-8 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
             <div className="flex items-center justify-between mb-4">
                <div>
                   <h4 className="font-bold text-gray-900">¿Abrir partido público?</h4>
                   <p className="text-xs text-gray-500">Otros usuarios podrán unirse a tu reserva.</p>
                </div>
                <div 
                   onClick={() => setIsPublic(!isPublic)}
                   className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isPublic ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                   <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isPublic ? 'translate-x-6' : ''}`}></div>
                </div>
             </div>

             {isPublic && (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="grow">
                      <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Máximo de jugadores</label>
                      <input 
                        type="number" 
                        value={maxJugadores}
                        onChange={(e) => setMaxJugadores(e.target.value)}
                        className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-700"
                        min="2"
                        max="22"
                      />
                   </div>
                </div>
             )}
          </div>

          {/* Selector de Hora */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Horarios Disponibles</label>
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {timeSlots.map(hora => {
                  const isBooked = bookedSlots.includes(hora);
                  const isBooking = bookingLoading === hora;

                  return (
                    <button
                      key={hora}
                      disabled={isBooked || isBooking}
                      onClick={() => handleBooking(hora)}
                      className={`py-4 px-2 rounded-2xl font-black text-sm transition-all relative overflow-hidden ${
                        isBooked 
                          ? "bg-red-50 text-red-400 cursor-not-allowed border-2 border-red-100" 
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-2 border-emerald-100"
                      }`}
                    >
                      {isBooking ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        <span>{hora}</span>
                      )}
                      
                      {isBooked && (
                        <div className="absolute top-1 right-1">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback */}
          {message.text && (
            <div className={`mt-8 p-4 rounded-2xl text-sm font-bold animate-in slide-in-from-bottom-2 duration-300 ${
              message.type === 'success' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}>
              {message.text}
            </div>
          )}
        </div>

        <footer className="p-8 bg-gray-50 border-t border-gray-100">
           <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-100 rounded-full"></div> Libre</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 rounded-full"></div> Ocupado</div>
              <div className="ml-auto font-black text-gray-900">Total: {campo.precioPorHora}€</div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default BookingModal;
