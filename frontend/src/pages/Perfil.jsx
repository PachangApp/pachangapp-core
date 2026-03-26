import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import defaultAvatar from "../assets/campos/perfil.png";
import { getFieldImage } from "../utils/fieldMapping";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [misPartidos, setMisPartidos] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          throw new Error("No hay sesión activa. Por favor, inicia sesión.");
        }

        const { id } = JSON.parse(storedUser);
        
        // Cargar Datos de Usuario
        const userResp = await fetch(`${API_BASE_URL}/users/${id}`);
        if (!userResp.ok) throw new Error("Error al obtener perfil.");
        const userData = await userResp.json();
        
        setUser({
          ...userData,
          joined: "Marzo 2024", 
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

        // Cargar Mis Partidos
        const matchesResp = await fetch(`${API_BASE_URL}/partidos/mis-partidos?userId=${id}`);
        if (matchesResp.ok) {
          const matchesData = await matchesResp.json();
          setMisPartidos(matchesData.content || []);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const [positions, setPositions] = useState({ p1: "", p2: "", p3: "" });
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 5MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        const resp = await fetch(`${API_BASE_URL}/users/${user.id}/avatar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarBase64: base64data })
        });

        if (resp.ok) {
          const updatedUser = await resp.json();
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          storedUser.avatar = updatedUser.avatar;
          localStorage.setItem("user", JSON.stringify(storedUser));
          
          setUser(prev => ({ ...prev, avatar: updatedUser.avatar }));
          window.dispatchEvent(new Event("storage"));
          window.location.reload(); 
        } else {
          alert("Error al subir la imagen.");
        }
        setUploadingAvatar(false);
      };
    } catch (err) {
      console.error(err);
      alert("Error al cambiar avatar.");
      setUploadingAvatar(false);
    }
  };

  const handleSavePositions = async () => {
    setSaving(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/users/${user.id}/preferencias`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posicion1: positions.p1,
          posicion2: positions.p2,
          posicion3: positions.p3
        })
      });
      if (resp.ok) {
        alert("Preferencias guardadas correctamente ⚽");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Perfil</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <a href="/login" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">Ir al Login</a>
        </div>
      </div>
    );
  }

  const allPositions = ["Portero", "Defensa Central", "Lateral", "Mediocentro", "Extremo", "Delantero Centro"];

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',_sans-serif] pb-32 md:pb-0">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Cabecera de Perfil */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Foto de Perfil */}
            <div className="relative group cursor-pointer shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-emerald-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative">
                <img 
                  src={user.avatar || defaultAvatar} 
                  alt="Perfil" 
                  className={`w-full h-full object-cover transition-opacity ${uploadingAvatar ? 'opacity-50' : 'group-hover:opacity-75'}`} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://ui-avatars.com/api/?name=" + user.username + "&background=random";
                  }}
                />
                {!uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
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
            </div>

            {/* Información Principal */}
            <div className="grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-900">{user.username}</h1>
                <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase self-center md:self-auto uppercase tracking-widest">
                  RANKING: {user.stats.ranking}
                </span>
              </div>
              <p className="text-gray-500 font-medium mb-6">Miembro desde {user.joined}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold text-gray-700">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Mis Partidos (Nueva Sección) */}
        {misPartidos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              Mis Próximos Partidos
              <div className="h-1 grow bg-gray-200 rounded-full mt-1 opacity-50"></div>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {misPartidos.map(match => (
                <Link 
                  key={match.id} 
                  to={`/partido/${match.id}`}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
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
                       {match.reserva.fecha} • {match.reserva.horaInicio.substring(0,5)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 3. Preferencias de Posición */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-12">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            ⚽ Preferencias de Posición
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Posición {i}</label>
                <select 
                  className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={positions[`p${i}`]}
                  onChange={(e) => setPositions({ ...positions, [`p${i}`]: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {allPositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button 
            onClick={handleSavePositions}
            disabled={saving}
            className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Preferencias"}
          </button>
        </section>

        {/* 4. Sección de Estadísticas */}
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          Estadísticas Reales
          <div className="h-1 grow bg-gray-200 rounded-full mt-1 opacity-50"></div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard 
            label="Partidos Jugados" 
            value={user.stats.partidos} 
            color="emerald"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <StatCard 
            label="Victorias" 
            value={user.stats.victorias} 
            color="blue"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
          />
          <StatCard 
            label="Derrotas" 
            value={user.stats.derrotas} 
            color="amber"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* 5. Historial Provisional */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg">Últimas Actividades</h3>
            <button className="text-emerald-600 text-sm font-bold hover:underline">Ver todo</button>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm italic">
               Pronto podrás ver aquí tu historial de partidos detallado.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
