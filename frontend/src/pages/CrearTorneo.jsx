import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import { API_BASE_URL } from '../apiConfig';

const CrearTorneo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    level: 'BASICO',
    type: 'ELIMINATORIAS',
    maxTeams: 8,
    location: '',
    startDate: '',
    endDate: '',
    price: 0,
    prize: '',
    sportType: 'FUTBOL_11'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = { 
        'Content-Type': 'application/json',
        ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
      };

      // Sanitize dates for Spring Boot LocalDate parsing
      const payload = { ...formData };
      if (!payload.startDate) payload.startDate = null;
      if (!payload.endDate) payload.endDate = null;

      const res = await fetch(`${API_BASE_URL}/tournaments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const tournament = await res.json();
        navigate(`/torneos/${tournament.id}`);
      } else {
        alert("Error al crear. Mira la consola.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-blue-800 p-8 text-white relative">
            <h1 className="text-3xl font-black mb-2 relative z-10">Crear Nuevo Torneo</h1>
            <p className="opacity-90 relative z-10">Configura los detalles de tu competición paso a paso.</p>
            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-bl-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Torneo 🏆</label>
                <input 
                  type="text" required name="name" 
                  value={formData.name} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-900"
                  placeholder="Ej: Champions League Local" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ubicación 📍</label>
                <input 
                  type="text" required name="location" 
                  value={formData.location} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-900"
                  placeholder="Ej: Polideportivo Centro" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción 📝</label>
              <textarea 
                required name="description" rows="3"
                value={formData.description} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-900"
                placeholder="Reglas, formato, detalles..." 
              ></textarea>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Inicio 🗓️</label>
                <input 
                  type="date" name="startDate" 
                  value={formData.startDate} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Fin 🏁</label>
                <input 
                  type="date" name="endDate" 
                  value={formData.endDate} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            {/* Row Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deporte</label>
                <select name="sportType" value={formData.sportType} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900">
                  <option value="FUTBOL_SALA">Fútbol Sala</option>
                  <option value="FUTBOL_7">Fútbol 7</option>
                  <option value="FUTBOL_11">Fútbol 11</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Formato</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium cursor-not-allowed text-gray-900">
                  <option value="ELIMINATORIAS">Eliminatorias</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max. Equipos</label>
                <select name="maxTeams" value={formData.maxTeams} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900">
                  <option value="4">4 Equipos</option>
                  <option value="8">8 Equipos</option>
                  <option value="16">16 Equipos</option>
                </select>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Premio 🎁</label>
                <input 
                  type="text" required name="prize" 
                  value={formData.prize} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900"
                  placeholder="Ej: Trofeo + 500€" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nivel</label>
                <select name="level" value={formData.level} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900">
                  <option value="BASICO">Básico</option>
                  <option value="INTERMEDIO">Intermedio</option>
                  <option value="AVANZADO">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : "Publicar Torneo"}
              </motion.button>
            </div>

          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CrearTorneo;
