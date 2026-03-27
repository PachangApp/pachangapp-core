import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";
import Dropdown from "./Dropdown";

const CreateMatchModal = ({ isOpen, onClose }) => {
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedZona, setSelectedZona] = useState("");
  const [selectedDeporte, setSelectedDeporte] = useState("");
  const [formData, setFormData] = useState({
    campoId: "",
    fecha: new Date().toISOString().split('T')[0],
    hora: "18:00",
    maxJugadores: 10
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCampos();
    }
  }, [isOpen]);

  const fetchCampos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campos`);
      if (response.ok) {
        const data = await response.json();
        setCampos(data);
        if (data.length > 0) {
           const firstZona = data[0].zona;
           setSelectedZona(firstZona);
           const firstDeporte = data.find(c => c.zona === firstZona).deporte;
           setSelectedDeporte(firstDeporte);
           const firstCampoId = data.find(c => c.zona === firstZona && c.deporte === firstDeporte).id;
           setFormData(prev => ({ ...prev, campoId: firstCampoId }));
        }
      }
    } catch (err) {
      console.error("Error al cargar campos:", err);
    }
  };

  // Zonas únicas
  const zonas = [...new Set(campos.map(c => c.zona))];
  
  // Deportes disponibles en la zona seleccionada
  const deportesEnZona = [...new Set(campos.filter(c => c.zona === selectedZona).map(c => c.deporte))];

  useEffect(() => {
    if (selectedZona && selectedDeporte) {
      const matchingCampo = campos.find(c => c.zona === selectedZona && c.deporte === selectedDeporte);
      if (matchingCampo) {
        setFormData(prev => ({ ...prev, campoId: matchingCampo.id }));
      }
    }
  }, [selectedZona, selectedDeporte, campos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setMessage({ text: "Debes iniciar sesión para crear un partido.", type: "error" });
      return;
    }
    const { id: userId, token } = JSON.parse(storedUser);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/partidos`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ text: "¡Partido creado con éxito! Entrando...", type: "success" });
        setTimeout(() => {
          onClose();
          window.location.href = `/partido/${data.id}`;
        }, 1500);
      } else {
        const error = await response.text();
        setMessage({ text: error, type: "error" });
      }
    } catch (err) {
      console.error("Error al crear partido:", err);
      setMessage({ text: "Error de red al crear el partido", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-4xl rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        <div className="flex-1 p-8 md:p-12">
          <header className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2 font-sans tracking-tight">Crear <span className="text-emerald-600">Partida</span></h2>
            <p className="text-gray-500 font-medium text-sm">Organiza un partido público en tu zona favorita.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selección de Ubicación (Modern Dropdown) */}
              <Dropdown
                label="¿Dónde quieres jugar?"
                options={zonas}
                value={selectedZona}
                onChange={(val) => {
                  setSelectedZona(val);
                  const firstDep = campos.find(c => c.zona === val).deporte;
                  setSelectedDeporte(firstDep);
                }}
              />

              {/* Selección de Modalidad (Modern Dropdown) */}
              <Dropdown
                label="¿Qué modalidad?"
                options={deportesEnZona}
                value={selectedDeporte}
                onChange={(val) => setSelectedDeporte(val)}
              />
            </div>

            {/* Selección de Pista (Solo si hay más de una) */}
            {campos.filter(c => c.zona === selectedZona && c.deporte === selectedDeporte).length > 1 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Selecciona la Pista específica</label>
                <div className="grid grid-cols-2 gap-3">
                  {campos.filter(c => c.zona === selectedZona && c.deporte === selectedDeporte).map(pista => (
                    <button
                      key={pista.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, campoId: pista.id })}
                      className={`py-3 px-4 rounded-xl text-xs font-black transition-all border-2 ${
                        formData.campoId.toString() === pista.id.toString()
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-emerald-200"
                      }`}
                    >
                      {pista.nombre.split(' - ').pop()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fecha</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-700"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              {/* Hora (Modern Dropdown) */}
              <Dropdown
                label="Hora"
                options={timeSlots}
                value={formData.hora}
                onChange={(val) => setFormData({ ...formData, hora: val })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Jugadores necesarios ({formData.maxJugadores})</label>
              <input 
                type="range" 
                min="2" 
                max="22" 
                className="w-full accent-emerald-600"
                value={formData.maxJugadores}
                onChange={(e) => setFormData({ ...formData, maxJugadores: e.target.value })}
              />
            </div>

            {message.text && (
               <div className={`p-4 rounded-2xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
               </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? "Creando..." : "¡Abrir Partido Público!"}
            </button>
          </form>
        </div>

        <div className="hidden md:flex w-80 bg-gray-50 border-l border-gray-100 flex-col items-center justify-center p-8 relative">
             <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Crear Comunidad</h4>
                <p className="text-gray-400 text-[10px] mt-2 font-medium">Al crear un partido público, otros usuarios podrán verte en la lista y apuntarse.</p>
             </div>

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
