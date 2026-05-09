import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";
import { API_BASE_URL } from '../apiConfig';
import { uploadImage } from '../services/uploadService';

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
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingImage(false);
    }
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
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 text-white relative">
            <h1 className="text-4xl font-black mb-3 relative z-10 tracking-tight">Crear Nuevo Torneo</h1>
            <p className="text-emerald-50 opacity-90 relative z-10 font-medium text-lg">Configura los detalles de tu competición paso a paso.</p>
            <div className="absolute right-0 top-0 w-48 h-48 bg-white opacity-5 rounded-bl-full translate-x-8 -translate-y-8"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            
            {/* Imagen del Torneo */}
            <div className="mb-8">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Imagen del Torneo</label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 shrink-0 relative">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Torneo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="grow">
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors"
                  />
                  <p className="mt-2 text-xs text-gray-500">JPG, PNG permitidos. Máx 5MB.</p>
                </div>
              </div>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nombre del Torneo</label>
                <input 
                  type="text" required name="name" 
                  value={formData.name} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-gray-900 placeholder-gray-300 shadow-inner"
                  placeholder="Ej: Champions League Local" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Ubicación</label>
                <input 
                  type="text" required name="location" 
                  value={formData.location} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-gray-900 placeholder-gray-300 shadow-inner"
                  placeholder="Ej: Polideportivo Centro" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Descripción</label>
              <textarea 
                required name="description" rows="4"
                value={formData.description} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-gray-900 placeholder-gray-300 shadow-inner resize-none"
                placeholder="Reglas, formato, detalles de la competición..." 
              ></textarea>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <DatePicker
                  label="Fecha de Inicio"
                  value={formData.startDate}
                  onChange={(val) => setFormData({ ...formData, startDate: val })}
                />
              </div>
              <div>
                <DatePicker
                  label="Fecha de Fin"
                  value={formData.endDate}
                  onChange={(val) => setFormData({ ...formData, endDate: val })}
                />
              </div>
            </div>

            {/* Row Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <Dropdown
                  label="Deporte"
                  options={[
                    { value: 'FUTBOL_SALA', label: 'Fútbol Sala' },
                    { value: 'FUTBOL_7', label: 'Fútbol 7' },
                    { value: 'FUTBOL_11', label: 'Fútbol 11' }
                  ]}
                  value={formData.sportType}
                  onChange={(val) => setFormData({ ...formData, sportType: val })}
                />
              </div>
              <div>
                <Dropdown
                  label="Formato"
                  options={[
                    { value: 'ELIMINATORIAS', label: 'Eliminatorias' },
                    { value: 'LIGA', label: 'Liga' }
                  ]}
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                />
              </div>
              <div>
                <Dropdown
                  label="Max. Equipos"
                  options={[
                    { value: '4', label: '4 Equipos' },
                    { value: '8', label: '8 Equipos' },
                    { value: '16', label: '16 Equipos' }
                  ]}
                  value={String(formData.maxTeams)}
                  onChange={(val) => setFormData({ ...formData, maxTeams: val })}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Premio</label>
                <input 
                  type="text" required name="prize" 
                  value={formData.prize} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder-gray-300 shadow-inner"
                  placeholder="Ej: Trofeo + 500€" 
                />
              </div>
              <div>
                <Dropdown
                  label="Nivel"
                  options={[
                    { value: 'BASICO', label: 'Básico' },
                    { value: 'INTERMEDIO', label: 'Intermedio' },
                    { value: 'AVANZADO', label: 'Avanzado' }
                  ]}
                  value={formData.level}
                  onChange={(val) => setFormData({ ...formData, level: val })}
                />
              </div>
            </div>

            <div className="pt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all flex justify-center items-center gap-3"
              >
                {loading ? (
                  <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    Publicar Torneo
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>

          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CrearTorneo;
