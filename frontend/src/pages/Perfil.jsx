import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import Dropdown from "../components/Dropdown";
import { getFieldImage } from "../utils/fieldMapping";
import { formatDate } from "../utils/dateFormatter";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/Toast";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=10b981&color=fff";

const Perfil = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [misPartidos, setMisPartidos] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [positions, setPositions] = useState({ p1: "", p2: "", p3: "" });
  const [saving, setSaving] = useState(false);
  const [matchesPage, setMatchesPage] = useState(0);
  const [matchesTotalPages, setMatchesTotalPages] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const { theme, setTheme } = useTheme();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          throw new Error("No hay sesión activa. Por favor, inicia sesión.");
        }

        const { id, token } = JSON.parse(storedUser);
        
        // Cargar Datos de Usuario
        const userResp = await fetch(`${API_BASE_URL}/users/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!userResp.ok) throw new Error("Error al obtener perfil.");
        const userData = await userResp.json();
        
        const userSession = JSON.parse(storedUser);
        userSession.avatar = userData.avatar;
        userSession.username = userData.username;
        localStorage.setItem("user", JSON.stringify(userSession));
        window.dispatchEvent(new Event("storage"));

        setUser({
          ...userData,
          joined: userData.fechaVerificacion 
            ? formatDate(userData.fechaVerificacion)
            : "01/03/2024", 
          stats: {
            partidos: userData.partidosJugados || 0,
            victorias: userData.victorias || 0,
            derrotas: userData.derrotas || 0,
            ranking: userData.ranking || 1000
          }
        });

        setPositions({
          p1: userData.posicion1 || "",
          p2: userData.posicion2 || "",
          p3: userData.posicion3 || ""
        });

        // Cargar Mis Partidos (Primera Página)
        await fetchMisPartidos(0, false);
        
        // Cargar Historial
        await fetchHistorial(id, token);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchMisPartidos = async (pageNum, isAppend = false) => {
    try {
      setLoadingMatches(true);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const resp = await fetch(`${API_BASE_URL}/partidos/mis-partidos?userId=${storedUser.id}&page=${pageNum}`, {
        headers: { "Authorization": `Bearer ${storedUser.token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (isAppend) {
          setMisPartidos(prev => [...prev, ...data.content]);
        } else {
          setMisPartidos(data.content || []);
        }
        setMatchesTotalPages(data.totalPages);
        setMatchesPage(pageNum);
      }
    } catch (err) {
      console.error("Error fetching upcoming matches:", err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const fetchHistorial = async (id, token) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/partidos/historial?userId=${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setHistorial(data.content || []);
      }
    } catch (err) {
      console.error("Error fetching historial:", err);
    }
  };


  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("La imagen es demasiado grande. Máximo 5MB.", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      const { token } = JSON.parse(localStorage.getItem("user") || "{}");
      const formData = new FormData();
      formData.append("file", file);

      const resp = await fetch(`${API_BASE_URL}/users/${user.id}/avatar`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (resp.ok) {
        const updatedUser = await resp.json();
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.avatar = updatedUser.avatar;
        localStorage.setItem("user", JSON.stringify(storedUser));
        
        setUser(prev => ({ ...prev, avatar: updatedUser.avatar }));
        window.dispatchEvent(new Event("storage"));
        showToast("Avatar actualizado con éxito ✨", "success");
      } else {
        const errorMsg = await resp.text();
        showToast(errorMsg || "Error al subir la imagen. Verifica el tamaño y formato.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al cambiar avatar.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSavePositions = async () => {
    // Validate duplicates
    const selected = [positions.p1, positions.p2, positions.p3].filter(p => p !== "");
    const uniqueSelected = new Set(selected);
    if (selected.length !== uniqueSelected.size) {
      showToast("No puedes seleccionar la misma posición varias veces. Por favor, elige posiciones diferentes.", "error");
      return;
    }

    setSaving(true);
    const { token } = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      const resp = await fetch(`${API_BASE_URL}/users/${user.id}/preferencias`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          posicion1: positions.p1,
          posicion2: positions.p2,
          posicion3: positions.p3
        })
      });
      if (resp.ok) {
        showToast("Preferencias guardadas correctamente ⚽", "success");
      } else {
        showToast("Hubo un problema al guardar tus preferencias.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error de conexión al guardar preferencias.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="grow flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"
          ></motion.div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="grow flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-2xl">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('profile.profile_error')}</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/login" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">{t('profile.go_to_login')}</Link>
        </div>
      </div>
    );
  }

  const allPositions = [
    t('profile.positions.goalkeeper'),
    t('profile.positions.center_back'),
    t('profile.positions.fullback'),
    t('profile.positions.midfielder'),
    t('profile.positions.winger'),
    t('profile.positions.striker'),
    t('profile.positions.versatile')
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif] pb-32 md:pb-0">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Cabecera de Perfil */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Foto de Perfil */}
            <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative group cursor-pointer shrink-0"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-emerald-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative">
                <img 
                  src={user.avatar || DEFAULT_AVATAR} 
                  alt="Perfil" 
                  className={`w-full h-full object-cover transition-opacity ${uploadingAvatar ? 'opacity-50' : 'group-hover:opacity-75'}`} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://ui-avatars.com/api/?name=" + user.username + "&background=random";
                  }}
                />
                {!uploadingAvatar && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
                    >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </motion.div>
                )}
                {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                title="Cambiar foto de perfil"
              />
            </motion.div>

            {/* Información Principal */}
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="grow text-center md:text-left"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-900">{user.username}</h1>
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase self-center md:self-auto tracking-widest"
                >
                  RANKING: {user.stats.ranking}
                </motion.span>
              </div>
              <p className="text-gray-500 font-medium mb-6">{t('profile.member_since', { date: user.joined })}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700">
                  {user.email}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 2. Mis Partidos (Nueva Sección) */}
        {misPartidos.length > 0 && (
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              {t('profile.my_upcoming_matches')}
              <div className="h-1 grow bg-gray-200 rounded-full mt-1 opacity-50"></div>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {misPartidos.map((match, idx) => (
                <motion.div
                    key={match.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: idx * 0.15 }}
                >
                    <Link 
                        to={`/partido/${match.id}`}
                        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex items-center gap-4 group"
                    >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                        <img 
                        src={match.reserva.campo.imagenUrl || getFieldImage(match.reserva.campo.nombre)} 
                        alt="Campo" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                    </div>
                    <div className="grow">
                        <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {match.reserva.campo.nombre}
                        </h4>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                        {formatDate(match.reserva.fecha)} • {match.reserva.horaInicio.substring(0,5)}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </div>
                    </Link>
                </motion.div>
              ))}
            </div>

            {matchesPage + 1 < matchesTotalPages && (
              <div className="mt-10 text-center">
                <button 
                  onClick={() => fetchMisPartidos(matchesPage + 1, true)}
                  disabled={loadingMatches}
                  className="px-8 py-3 bg-white border-2 border-emerald-100 text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {loadingMatches ? t('search_matches.loading') : t('search_matches.load_more')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            )}
          </motion.section>
        )}

        {/* 3. Preferencias de Posición */}
        <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                ⚽ {t('profile.position_preferences')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map(i => (
                  <Dropdown
                    key={i}
                    label={t('profile.position_num', { num: i })}
                    options={[{ label: t('profile.select'), value: "" }, ...allPositions.map(pos => ({ label: pos, value: pos }))]}
                    value={positions[`p${i}`]}
                    onChange={(val) => setPositions({ ...positions, [`p${i}`]: val })}
                    className="w-full"
                  />
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={handleSavePositions}
                disabled={saving}
                className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {saving ? t('profile.saving') : t('profile.save_preferences')}
              </motion.button>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0 md:pl-12">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                🌙 {t('profile.theme_preferences') || 'Preferencia de Tema'}
              </h3>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${theme === "light" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">☀️</span>
                    <span className="font-bold">{t('profile.theme_light') || 'Modo Normal'}</span>
                  </div>
                  {theme === "light" && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${theme === "dark" ? "border-emerald-500 bg-emerald-900/20 text-emerald-400" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌙</span>
                    <span className="font-bold">{t('profile.theme_dark') || 'Modo Noche'}</span>
                  </div>
                  {theme === "dark" && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-400 italic">
                {t('profile.theme_description') || 'Elige el tema que mejor se adapte a tu vista.'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* 4. Sección de Estadísticas */}
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          {t('profile.real_stats')}
          <div className="h-1 grow bg-gray-200 rounded-full mt-1 opacity-50"></div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { label: t('profile.matches_played'), value: user.stats.partidos, color: "emerald", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
            { label: t('profile.wins'), value: user.stats.victorias, color: "blue", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
            { label: t('profile.losses'), value: user.stats.derrotas, color: "amber", icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
          ].map((stat, idx) => (
            <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1, transition: { duration: 1.0, delay: idx * 0.2 } }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
            >
                <StatCard 
                    label={stat.label} 
                    value={stat.value} 
                    color={stat.color}
                    icon={stat.icon}
                />
            </motion.div>
          ))}
        </div>

        {/* 5. Historial Provisional */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg">{t('profile.latest_activities')}</h3>
            {historial.length > 3 && (
                <button 
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-emerald-600 text-sm font-bold hover:underline"
                >
                    {showAllHistory ? t('back') : t('profile.view_all')}
                </button>
            )}
          </div>
          <div className="p-6">
            {historial.length > 0 ? (
                <div className="space-y-4">
                    {(showAllHistory ? historial : historial.slice(0, 3)).map((match, idx) => {
                        const userParticipation = match.participaciones?.find(p => p.user?.id === user.id);
                        const team = userParticipation?.equipo;
                        const isWin = (match.marcadorA > match.marcadorB && team === "BLANCO") || 
                                     (match.marcadorB > match.marcadorA && team === "NEGRO");
                        const isDraw = match.marcadorA === match.marcadorB;
                        
                        return (
                            <motion.div 
                                key={match.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-sm font-black text-gray-400 min-w-[60px]">
                                        {formatDate(match.reserva.fecha).split('/').slice(0,2).join('/')}
                                    </div>
                                    <div className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight text-sm sm:text-base flex-1 min-w-0">
                                        {match.reserva.campo.nombre}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden whitespace-nowrap">
                                        <div className="px-2.5 py-1 font-black text-gray-900 min-w-[30px] text-center">
                                            {match.marcadorA}
                                        </div>
                                        <div className="w-[1px] h-4 bg-gray-200"></div>
                                        <div className="px-2.5 py-1 font-black text-gray-900 min-w-[30px] text-center">
                                            {match.marcadorB}
                                        </div>
                                    </div>
                                    
                                    {isDraw ? (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500" title="Empate">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                                        </div>
                                    ) : isWin ? (
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600" title="Victoria">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600" title="Derrota">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm italic">
                   {t('profile.history_placeholder')}
                </div>
            )}
          </div>
        </motion.div>
      </main>

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
};

export default Perfil;
