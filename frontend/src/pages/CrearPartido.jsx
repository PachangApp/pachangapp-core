import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";
import FieldCard from "../components/FieldCard";
import { getFieldImage } from "../utils/fieldMapping";

const SubPistaGrid = ({ campoId, fecha, onSelect, timeSlots, submitting }) => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      console.log(`SubPistaGrid [${campoId}]: Consultando para ${fecha}`);
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/reservas/disponibilidad?campoId=${campoId}&fecha=${fecha}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`SubPistaGrid [${campoId}] resultado:`, data);
          setBookedSlots(data);
        }
      } catch (err) {
        console.error(`Error fetching subpista availability for ${campoId}`, err);
      } finally {
        setLoading(false);
      }
    };
    if (campoId && fecha) fetchDisponibilidad();
  }, [campoId, fecha]);



  if (loading) return (
    <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {timeSlots.map(hora => {
        const isBooked = bookedSlots.includes(hora);
        return (
          <button
            key={hora}
            disabled={isBooked || submitting}
            onClick={() => onSelect(hora)}
            className={`py-4 rounded-2xl font-black text-sm transition-all relative border-2 ${
              isBooked 
                ? "bg-red-50 text-red-200 border-red-50 cursor-not-allowed" 
                : "bg-gray-50 text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 border-gray-100 shadow-sm"
            }`}
          >
            {hora}
            {isBooked && (
              <span className="absolute top-1 right-2 text-[6px] font-black uppercase text-red-300">Oculto</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const CrearPartido = () => {

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // State for the flow
  const [filters, setFilters] = useState({
    zona: "",
    deporte: "Fútbol 7",
    fecha: new Date().toISOString().split('T')[0]
  });
  
  const [selectedCampo, setSelectedCampo] = useState(null);
  const [maxJugadores, setMaxJugadores] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  useEffect(() => {
    fetchCampos();
  }, []);

  const fetchCampos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campos`);
      if (response.ok) {
        const data = await response.json();
        console.log("Campos cargados de la API:", data);
        setCampos(data);
        if (data.length > 0) {
          setFilters(prev => ({ ...prev, zona: data[0].zona }));
        }
      }
    } catch (err) {
      console.error("Error al cargar campos:", err);
    }

  };

  const fetchDisponibilidad = useCallback(async (campoId, fecha) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reservas/disponibilidad?campoId=${campoId}&fecha=${fecha}`);
      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data);
      }
    } catch (err) {
      console.error("Error al obtener disponibilidad:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    if (step === 3) setSelectedCampo(null);
  };

  const handleSelectCampo = async (campo) => {
    console.log("Campo seleccionado:", campo);
    setSelectedCampo(campo);
    
    // Si es F7, necesitamos la disponibilidad de todos sus hijos
    if (filters.deporte === "Fútbol 7") {
        const hijos = campos.filter(h => Number(h.parentCampoId) === Number(campo.id));
        console.log("Subpistas encontradas:", hijos);
        // Guardamos los hijos para usarlos en el paso 3
        setSelectedCampo({ ...campo, subPistas: hijos });
        setStep(3);
    } else {
        fetchDisponibilidad(campo.id, filters.fecha);
        setStep(3);
    }
  };



  const handleCreateMatch = async (hora, specificCampo = null) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setMessage({ text: "Debes iniciar sesión para crear un partido.", type: "error" });
      return;
    }

    const { id: userId } = JSON.parse(storedUser);
    const targetCampo = specificCampo || selectedCampo;
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/partidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campoId: targetCampo.id,
          userId: userId,
          fecha: filters.fecha,
          hora: hora,
          maxJugadores: maxJugadores
        })
      });

      if (response.ok) {
        setMessage({ text: "¡Partido creado con éxito! Redirigiendo...", type: "success" });
        setTimeout(() => {
          navigate("/buscar-partidos");
        }, 2000);
      } else {
        const errorText = await response.text();
        setMessage({ text: errorText, type: "error" });
      }
    } catch (err) {
      console.error("Error al crear partido:", err);
      setMessage({ text: "Error de red al crear el partido.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };


  const zonas = [...new Set(campos.map(c => c.zona))];
  const deportes = ["Fútbol 7", "Fútbol 11", "Fútbol Sala"];
  
  // Si estamos en F7, mostramos solo los "Padres" (F11) para que eligan el recinto
  const filteredCampos = campos.filter(c => {
    if (filters.deporte === "Fútbol 7") {
        return c.deporte === "Fútbol 11"; // Mostramos todos los complejos para F7
    }
    return c.zona === filters.zona && c.deporte === filters.deporte;
  });



  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 mb-4 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
            Paso {step} de 3
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            Crear <span className="text-emerald-600 font-extrabold italic">Partido</span>
          </h1>
          <p className="mt-4 text-gray-500 font-medium max-w-lg mx-auto">
            {step === 1 && "Selecciona dónde y cuándo quieres jugar para empezar."}
            {step === 2 && "Elige la pista que más te guste de las disponibles en tu zona."}
            {step === 3 && "Selecciona la hora y ajusta los detalles finales de tu partido."}
          </p>
        </header>

        {/* Barra de Progreso */}
        <div className="max-w-2xl mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          <div className="relative flex justify-between">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-300 border-4 ${
                  s <= step ? "bg-emerald-600 border-emerald-100 text-white" : "bg-white border-gray-100 text-gray-300"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido Dinámico */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* PASO 1: FILTROS */}
          {step === 1 && (
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">¿En qué zona?</label>
                    <select 
                      value={filters.zona}
                      onChange={(e) => setFilters({...filters, zona: e.target.value})}
                      className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-emerald-500/20 font-bold text-gray-700 transition-all text-lg"
                    >
                      {zonas.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Modalidad Deportiva</label>
                    <div className="grid grid-cols-2 gap-3">
                      {deportes.map(d => (
                        <button
                          key={d}
                          onClick={() => setFilters({...filters, deporte: d})}
                          className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                            filters.deporte === d 
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" 
                              : "bg-gray-50 border-gray-100 text-gray-500 hover:border-emerald-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">¿Qué día?</label>
                    <input 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={filters.fecha}
                      onChange={(e) => setFilters({...filters, fecha: e.target.value})}
                      className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-emerald-500/20 font-bold text-gray-700 transition-all text-lg"
                    />
                  </div>
                  <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 mt-auto">
                    <h3 className="font-black text-emerald-800 uppercase text-xs tracking-widest mb-2">Resumen rápido</h3>
                    <p className="text-emerald-600/80 text-sm font-medium">Estás buscando pistas para <span className="font-bold">{filters.deporte}</span> en <span className="font-bold">{filters.zona}</span> el día <span className="font-bold">{new Date(filters.fecha).toLocaleDateString()}</span>.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <button 
                  onClick={handleNextStep}
                  className="w-full py-6 bg-gray-900 hover:bg-black text-white font-black rounded-3xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] text-xl tracking-tight"
                >
                  Continuar a Selección de Pista
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: SELECCIÓN DE CAMPO */}
          {step === 2 && (
            <div>
              <div className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
                <button onClick={handlePrevStep} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  Volver atrás
                </button>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Encontrados: {filteredCampos.length}</span>
                </div>
              </div>

              {filteredCampos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredCampos.map(campo => (
                    <div 
                      key={campo.id} 
                      onClick={() => handleSelectCampo(campo)}
                      className="cursor-pointer group transform transition-all duration-300 hover:-translate-y-2"
                    >
                      <FieldCard campo={campo} onBook={() => handleSelectCampo(campo)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-2xl mx-auto bg-white p-20 rounded-[3rem] text-center border border-gray-100 shadow-sm">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0V11m0 0L9 1M9 1l-3 3m3-3l3 3" />
                      </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">No hay pistas disponibles</h3>
                  <p className="text-gray-500 mb-10">Lo sentimos, no hay instalaciones que coincidan con tu búsqueda.</p>
                  <button onClick={handlePrevStep} className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all">
                    Cambiar búsqueda
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: SELECCIÓN DE HORA Y CONFIRMACIÓN */}
          {step === 3 && selectedCampo && (
            <div className={`max-w-7xl mx-auto grid grid-cols-1 ${filters.deporte === 'Fútbol 7' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-10`}>
              {/* Resumen lateral */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-50 overflow-hidden">
                  {getFieldImage(selectedCampo.nombre) && (
                    <div className="h-40 -mx-8 -mt-8 mb-6 overflow-hidden">
                      <img 
                        src={getFieldImage(selectedCampo.nombre)} 
                        alt={selectedCampo.nombre} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <header className="mb-6">
                    <h3 className="text-xl font-black text-gray-900 mb-1">{selectedCampo.nombre}</h3>
                    <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider">{selectedCampo.zona}</p>
                    <p className="inline-block mt-2 px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{filters.deporte}</p>
                  </header>

                  <div className="space-y-4 pt-6 border-t border-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">Día</span>
                      <span className="font-black text-gray-700">{new Date(filters.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">Precio</span>
                      <span className="font-black text-emerald-600 underline decoration-2 decoration-emerald-200 ">{selectedCampo.precioPorHora}€/h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-800 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-emerald-300 mb-4 relative z-10">Configuración</h4>
                  <div className="relative z-10">
                    <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Máx Jugadores: {maxJugadores}</label>
                    <input 
                      type="range" 
                      min="2" 
                      max="22" 
                      value={maxJugadores}
                      onChange={(e) => setMaxJugadores(e.target.value)}
                      className="w-full accent-emerald-500 mb-4"
                    />
                    <p className="text-[10px] text-emerald-200/60 leading-relaxed font-medium">Este será el número máximo de personas que podrán apuntarse a tu partido público.</p>
                  </div>
                </div>
                
                <button onClick={handlePrevStep} className="w-full flex items-center justify-center gap-2 py-4 text-gray-400 hover:text-gray-900 font-bold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  Cambiar de pista
                </button>
              </div>

              {/* Grid de Horarios */}
              <div className={filters.deporte === 'Fútbol 7' ? 'lg:col-span-3' : 'lg:col-span-2'}>
                {filters.deporte === 'Fútbol 7' ? (
                    /* VISTA DUAL PARA FÚTBOL 7 */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {selectedCampo.subPistas?.map((subPista, index) => (
                            <div key={subPista.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Campo {index + 1}</h3>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">{subPista.deporte}</span>
                                </div>
                                <div className="space-y-3">
                                    <SubPistaGrid 
                                        campoId={subPista.id} 
                                        fecha={filters.fecha} 
                                        onSelect={(hora) => {
                                            setSelectedCampo(subPista); // Cambiamos temporalmente el seleccionado para la petición
                                            handleCreateMatch(hora, subPista);
                                        }}
                                        timeSlots={timeSlots}
                                        submitting={submitting}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* VISTA SIMPLE PARA F11 / SALA */
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-8 ml-2">Horarios Disponibles</label>
                      
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                          <p className="text-gray-400 font-bold italic">Consultando disponibilidad en tiempo real...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {timeSlots.map(hora => {
                            const isBooked = bookedSlots.includes(hora);
                            const isThisSubmitting = submitting && message.text === "";

                            return (
                              <button
                                key={hora}
                                disabled={isBooked || submitting}
                                onClick={() => handleCreateMatch(hora, selectedCampo)}
                                className={`group py-6 rounded-3xl font-black text-lg transition-all relative overflow-hidden border-2 ${
                                  isBooked 
                                    ? "bg-red-50 text-red-300 border-red-50 cursor-not-allowed opacity-60" 
                                    : "bg-gray-50 text-gray-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 border-gray-100 hover:shadow-xl hover:shadow-emerald-200"
                                }`}
                              >
                                {isThisSubmitting ? (
                                    <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    <span>{hora}</span>
                                )}
                                {isBooked && (
                                  <div className="absolute top-2 right-3 text-[8px] font-black uppercase text-red-300 bg-red-100 px-1.5 py-0.5 rounded-full">Ocupado</div>
                                )}
                              </button>
                            );
                          })}

                        </div>
                      )}

                      {message.text && (
                        <div className={`mt-10 p-6 rounded-3xl text-sm font-black animate-in slide-in-from-bottom-4 duration-500 shadow-md ${
                          message.type === 'success' ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                          <div className="flex items-center gap-3">
                            {message.type === 'success' ? (
                              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                            {message.text}
                          </div>
                        </div>
                      )}
                    </div>
                )}
              </div>
            </div>
          )}


        </div>
      </main>
    </div>
  );
};

export default CrearPartido;
