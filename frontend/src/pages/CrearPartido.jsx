import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";
import FieldCard from "../components/FieldCard";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";
import { getFieldImage } from "../utils/fieldMapping";

const SubPistaGrid = ({ campoId, fecha, onSelect, timeSlots, submitting }) => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      console.log(`SubPistaGrid [${campoId}]: Consultando para ${fecha}`);
      setLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const token = storedUser.token;
        const response = await fetch(`${API_BASE_URL}/reservas/disponibilidad?campoId=${campoId}&fecha=${fecha}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
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

  const { t } = useTranslation();
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
  const [selectedHora, setSelectedHora] = useState(null);
  const [maxJugadores, setMaxJugadores] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({ cardName: "", cardNumber: "", expiry: "", cvc: "" });

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
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = storedUser.token;
      const response = await fetch(`${API_BASE_URL}/reservas/disponibilidad?campoId=${campoId}&fecha=${fecha}`, {
          headers: { "Authorization": `Bearer ${token}` }
      });
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
    if (step === 4) {
        setStep(3);
        return;
    }
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



  const handleConfirmSelection = (hora, specificCampo = null) => {
    setSelectedHora(hora);
    if (specificCampo) setSelectedCampo(specificCampo);
    setStep(4);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simular retraso de pasarela de pago
    setTimeout(() => {
        handleExecuteCreateMatch();
    }, 2000);
  };

  const handleExecuteCreateMatch = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setMessage({ text: "Debes iniciar sesión para crear un partido.", type: "error" });
      return;
    }

    const { id: userId, token } = JSON.parse(storedUser);
    const targetCampo = selectedCampo;
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/partidos`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          campoId: targetCampo.id,
          userId: userId,
          fecha: filters.fecha,
          hora: selectedHora,
          maxJugadores: maxJugadores
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ text: "¡Partido creado con éxito! Entrando al partido...", type: "success" });
        setTimeout(() => {
          navigate(`/partido/${data.id}`);
        }, 1500);
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
  const deportes = [
    { value: "Fútbol 7", key: "futbol_7" },
    { value: "Fútbol 11", key: "futbol_11" },
    { value: "Fútbol Sala", key: "futbol_sala" }
  ];
  
  // Si estamos en F7, mostramos solo los "Padres" (F11) para que eligan el recinto
  const filteredCampos = campos.filter(c => {
    if (filters.deporte === "Fútbol 7") {
        return c.deporte === "Fútbol 11"; // Mostramos todos los complejos para F7
    }
    return c.zona === filters.zona && c.deporte === filters.deporte;
  });



  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center relative"
        >
          {/* Botón Volver Atrás en el Header */}
          {step > 1 && (
            <button 
                onClick={handlePrevStep}
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 hover:text-emerald-600 font-bold transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </div>
                <span className="hidden md:inline text-sm">
                    {step === 2 && t("create_match.change_filters")}
                    {step === 3 && t("create_match.change_field")}
                    {step === 4 && t("create_match.change_time")}
                </span>
            </button>
          )}

          <div className="inline-block px-4 py-1.5 mb-4 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
            {t("create_match.step", { current: step, total: 4 })}
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            {step === 4 ? t("create_match.step_status") : t("create_match.create_status")} <span className="text-emerald-600 font-extrabold italic">{step === 4 ? t("create_match.payment") : t("create_match.match_status")}</span>
          </h1>
          <p className="mt-4 text-gray-500 font-medium max-w-lg mx-auto">
            {step === 1 && t("create_match.desc_step1")}
            {step === 2 && t("create_match.desc_step2")}
            {step === 3 && t("create_match.desc_step3")}
            {step === 4 && t("create_match.desc_step4")}
          </p>
        </motion.header>

        {/* Barra de Progreso Animada */}
        <div className="max-w-2xl mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / 3) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full"
          ></motion.div>
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map((s) => (
              <motion.div 
                key={s}
                animate={{ 
                  scale: s === step ? 1.2 : 1,
                  backgroundColor: s <= step ? "#059669" : "#ffffff",
                  borderColor: s <= step ? "#ecfdf5" : "#f3f4f6",
                  color: s <= step ? "#ffffff" : "#d1d5db"
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-300 border-4 shadow-sm`}
              >
                {s}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contenido Dinámico con AnimatePresence */}
        <div className="min-h-[500px] relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
          
          {/* PASO 1: FILTROS */}
          {step === 1 && (
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <Dropdown
                      label={t("create_match.where")}
                      options={zonas}
                      value={filters.zona}
                      onChange={(val) => setFilters({...filters, zona: val})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">{t("create_match.sport_type")}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {deportes.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setFilters({...filters, deporte: d.value})}
                          className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                            filters.deporte === d.value 
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" 
                              : "bg-gray-50 border-gray-100 text-gray-500 hover:border-emerald-200"
                          }`}
                        >
                          {t(`sports.${d.key}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <DatePicker 
                      label={t("create_match.which_day")}
                      value={filters.fecha}
                      minDate={new Date().toISOString().split('T')[0]}
                      onChange={(val) => setFilters({...filters, fecha: val})}
                      className="w-full"
                    />
                  </div>
                  <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 mt-auto">
                    <h3 className="font-black text-emerald-800 uppercase text-xs tracking-widest mb-2">{t("create_match.summary")}</h3>
                    <p className="text-emerald-600/80 text-sm font-medium">{t("create_match.summary_desc", { deporte: filters.deporte, zona: filters.zona, fecha: new Date(filters.fecha).toLocaleDateString() })}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <button 
                  onClick={handleNextStep}
                  className="w-full py-6 bg-gray-900 hover:bg-black text-white font-black rounded-3xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] text-xl tracking-tight"
                >
                  {t("create_match.continue_to_selection")}
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: SELECCIÓN DE CAMPO */}
          {step === 2 && (
            <div>
              <div className="mb-10 max-w-4xl mx-auto text-right">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{t("create_match.found")}: {filteredCampos.length}</span>
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
                   <h3 className="text-2xl font-black text-gray-900 mb-2">{t("create_match.no_fields")}</h3>
                  <p className="text-gray-500 mb-10">{t("create_match.no_fields_desc")}</p>
                  <button onClick={handlePrevStep} className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all">
                    {t("create_match.change_search")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PASO 4: PASARELA DE PAGO FICTICIA */}
          {step === 4 && selectedCampo && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Resumen del pedido */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">{t("create_match.payment_summary")}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-gray-400">{t("create_match.field")}</span>
                                <span className="text-xs font-black text-gray-700">{selectedCampo.nombre}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-gray-400">{t("create_match.date")}</span>
                                <span className="text-xs font-black text-gray-700">{filters.fecha}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs font-bold text-gray-400">{t("create_match.hour")}</span>
                                <span className="text-xs font-black text-gray-700">{selectedHora}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-sm font-black text-gray-900">{t("create_match.total")}</span>
                                <span className="text-xl font-black text-emerald-600">{selectedCampo.precioPorHora}€</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                        <div className="flex items-center gap-3 text-emerald-700 mb-2">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                             <span className="text-xs font-black uppercase">{t("create_match.secure_payment")}</span>
                        </div>
                        <p className="text-[10px] text-emerald-600/70 font-medium">{t("create_match.secure_payment_desc")}</p>
                    </div>
                </div>

                {/* Formulario de Pago */}
                <div className="md:col-span-2">
                    <form onSubmit={handleProcessPayment} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">{t("create_match.card_name")}</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="JUAN PEREZ"
                                    value={paymentData.cardName}
                                    onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value.toUpperCase()})}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold text-gray-700 transition-all font-black placeholder:text-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">{t("create_match.card_number")}</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        required
                                        maxLength="19"
                                        placeholder="0000 0000 0000 0000"
                                        value={paymentData.cardNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                            setPaymentData({...paymentData, cardNumber: val});
                                        }}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-black text-gray-700 transition-all font-mono placeholder:text-gray-300"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                        <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">{t("create_match.expiry")}</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="MM/AA"
                                        maxLength="5"
                                        value={paymentData.expiry}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                            setPaymentData({...paymentData, expiry: val});
                                        }}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-black text-gray-700 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">{t("create_match.cvc")}</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="123"
                                        maxLength="3"
                                        value={paymentData.cvc}
                                        onChange={(e) => setPaymentData({...paymentData, cvc: e.target.value.replace(/\D/g, '')})}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-black text-gray-700 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] text-xl flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{t("create_match.processing_payment")}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        {t("create_match.pay_and_book", { price: selectedCampo.precioPorHora })}
                                    </>
                                )}
                            </button>
                            <p className="text-center mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">{t("create_match.terms_notice")}</p>
                        </div>
                    </form>
                </div>
              </div>

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
                      <span className="text-xs font-bold text-gray-400 uppercase">{t("create_match.day")}</span>
                      <span className="font-black text-gray-700">{new Date(filters.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">{t("create_match.price")}</span>
                      <span className="font-black text-emerald-600 underline decoration-2 decoration-emerald-200 ">{selectedCampo.precioPorHora}€/h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-800 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-emerald-300 mb-4 relative z-10">{t("create_match.settings")}</h4>
                  <div className="relative z-10">
                    <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">{t("create_match.max_players")}: {maxJugadores}</label>
                    <input 
                      type="range" 
                      min="2" 
                      max="22" 
                      value={maxJugadores}
                      onChange={(e) => setMaxJugadores(e.target.value)}
                      className="w-full accent-emerald-500 mb-4"
                    />
                    <p className="text-[10px] text-emerald-200/60 leading-relaxed font-medium">{t("create_match.max_players_desc")}</p>
                  </div>
                </div>
              </div>

              {/* Grid de Horarios */}
              <div className={filters.deporte === 'Fútbol 7' ? 'lg:col-span-3' : 'lg:col-span-2'}>
                {filters.deporte === 'Fútbol 7' ? (
                    /* VISTA DUAL PARA FÚTBOL 7 */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {selectedCampo.subPistas?.map((subPista, index) => (
                            <div key={subPista.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{t("create_match.field_num", { number: index + 1 })}</h3>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">{subPista.deporte}</span>
                                </div>
                                <div className="space-y-3">
                                    <SubPistaGrid 
                                        campoId={subPista.id} 
                                        fecha={filters.fecha} 
                                        onSelect={(hora) => {
                                            handleConfirmSelection(hora, subPista);
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
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-8 ml-2">{t("create_match.available_schedules")}</label>
                      
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                          <p className="text-gray-400 font-bold italic">{t("create_match.checking_availability")}</p>
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
                                onClick={() => handleConfirmSelection(hora, selectedCampo)}
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
                                  <div className="absolute top-2 right-3 text-[8px] font-black uppercase text-red-300 bg-red-100 px-1.5 py-0.5 rounded-full">{t("create_match.occupied")}</div>
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


            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default CrearPartido;
