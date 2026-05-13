import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from "../components/Navbar";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";
import { API_BASE_URL } from '../apiConfig';
import { uploadImage } from '../services/uploadService';

const CrearTorneo = () => {
  const { t } = useTranslation();
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
        alert(t('create_tournament.error_create'));
      }
    } catch (error) {
      console.error(error);
      alert(t('create_tournament.error_connection'));
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
            <h1 className="text-4xl font-black mb-3 relative z-10 tracking-tight">{t('create_tournament.title')}</h1>
            <p className="text-emerald-50 opacity-90 relative z-10 font-medium text-lg">{t('create_tournament.subtitle')}</p>
            <div className="absolute right-0 top-0 w-48 h-48 bg-white opacity-5 rounded-bl-full translate-x-8 -translate-y-8"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            
            {/* Imagen del Torneo */}
            <div className="mb-8">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('create_tournament.image_label')}</label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 shrink-0 relative">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt={t('create_tournament.image_alt')} className="w-full h-full object-cover" />
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
                  <p className="mt-2 text-xs text-gray-500">{t('create_tournament.image_hint')}</p>
                </div>
              </div>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('create_tournament.name_label')}</label>
                <input 
                  type="text" required name="name" 
                  value={formData.name} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-gray-900 placeholder-gray-300 shadow-inner"
                  placeholder={t('create_tournament.name_placeholder')} 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('create_tournament.location_label')}</label>
                <input 
                  type="text" required name="location" 
                  value={formData.location} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-gray-900 placeholder-gray-300 shadow-inner"
                  placeholder={t('create_tournament.location_placeholder')} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('create_tournament.description_label')}</label>
              <textarea 
                required name="description" rows="4"
                value={formData.description} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-gray-900 placeholder-gray-300 shadow-inner resize-none"
                placeholder={t('create_tournament.description_placeholder')} 
              ></textarea>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <DatePicker
                  label={t('create_tournament.start_date')}
                  value={formData.startDate}
                  onChange={(val) => setFormData({ ...formData, startDate: val })}
                />
              </div>
              <div>
                <DatePicker
                  label={t('create_tournament.end_date')}
                  value={formData.endDate}
                  onChange={(val) => setFormData({ ...formData, endDate: val })}
                />
              </div>
            </div>

            {/* Row Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <Dropdown
                  label={t('create_tournament.sport')}
                  options={[
                    { value: 'FUTBOL_SALA', label: t('create_tournament.sport_futsal') },
                    { value: 'FUTBOL_7', label: t('create_tournament.sport_f7') },
                    { value: 'FUTBOL_11', label: t('create_tournament.sport_f11') }
                  ]}
                  value={formData.sportType}
                  onChange={(val) => setFormData({ ...formData, sportType: val })}
                />
              </div>
              <div>
                <Dropdown
                  label={t('create_tournament.format')}
                  options={[
                    { value: 'ELIMINATORIAS', label: t('create_tournament.format_brackets') },
                    { value: 'LIGA', label: t('create_tournament.format_league') }
                  ]}
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                />
              </div>
              <div>
                <Dropdown
                  label={t('create_tournament.max_teams')}
                  options={[
                    { value: '4', label: t('create_tournament.teams_count', { count: 4 }) },
                    { value: '8', label: t('create_tournament.teams_count', { count: 8 }) },
                    { value: '16', label: t('create_tournament.teams_count', { count: 16 }) }
                  ]}
                  value={String(formData.maxTeams)}
                  onChange={(val) => setFormData({ ...formData, maxTeams: val })}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('create_tournament.prize_label')}</label>
                <input 
                  type="text" required name="prize" 
                  value={formData.prize} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder-gray-300 shadow-inner"
                  placeholder={t('create_tournament.prize_placeholder')} 
                />
              </div>
              <div>
                <Dropdown
                  label={t('create_tournament.level')}
                  options={[
                    { value: 'BASICO', label: t('create_tournament.level_basic') },
                    { value: 'INTERMEDIO', label: t('create_tournament.level_intermediate') },
                    { value: 'AVANZADO', label: t('create_tournament.level_advanced') }
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
                    {t('create_tournament.publish_btn')}
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
