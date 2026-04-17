import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { API_BASE_URL } from "../apiConfig";
import logo from "../assets/logo pachangapp.png";

// Reusing components
import MatchCard from "../components/MatchCard";
import CamposDestacados from "../components/home/CamposDestacados";
import ActivityWidget from "../components/home/ActivityWidget";
import StatCard from "../components/StatCard";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trendingMatches, setTrendingMatches] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll animations for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Load User & Data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        const userId = parsed.id;

        // Fetch User Matches if logged in
        if (userId) {
          try {
             // Solo capturamos el primero para el activityWidget
             const uRes = await fetch(`${API_BASE_URL}/partidos/mis-partidos?userId=${userId}`);
             if (uRes.ok) {
               const data = await uRes.json();
               setUserMatches(data.content || []);
             }
          } catch(e) { console.warn("Error fetching user matches", e) }
        }

        // Fetch Trending Matches
        try {
          const tRes = await fetch(`${API_BASE_URL}/partidos?page=0`);
          if (tRes.ok) {
            const tData = await tRes.json();
            // Mostrar solo los primeros 4 para la Home
            const sorted = (tData.content || []).sort((a,b) => (b.participaciones?.length || 0) - (a.participaciones?.length || 0));
            setTrendingMatches(sorted.slice(0, 4));
          }
        } catch(e) { console.warn("Error fetching trending matches", e) }

      } catch (err) {
        console.error("Error cargando Home:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  let upcomingMatchData = null;
  if (userMatches && userMatches.length > 0) {
    const next = userMatches[0];
    if (next && next.reserva) {
      upcomingMatchData = {
        type: next.deporte || "Fútbol",
        location: next.reserva.campo?.nombre || "Campo por definir",
        dateFormatted: (next.reserva.fecha || "Pronto") + " " + (next.reserva.horaInicio ? next.reserva.horaInicio.substring(0,5) : ""),
        weather: "15ºC",
        timeUntil: "Pronto"
      };
    }
  }

  // Animaciones Framer
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-['Inter',_sans-serif] overflow-x-hidden">
      
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        {/* Abstract Background Elements */}
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-linear-to-br from-emerald-300 to-teal-100 blur-[100px] pointer-events-none -z-10"
        ></motion.div>
        <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-linear-to-tr from-emerald-400 to-blue-200 blur-[120px] pointer-events-none -z-10"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center">
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-sm tracking-wide mb-8 shadow-sm"
            >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Más de 500 partidos jugados este mes
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6 max-w-5xl"
            >
                Encuentra tu próxima <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-400">pachanga</span> en segundos.
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-500 max-w-3xl mb-12"
            >
                Únete a partidos cerca de ti, reserva instalaciones Top y compite en ligas. El fútbol se vive en comunidad.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
                <Link to="/buscar-partidos" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Buscar Partidos
                </Link>
                <Link to="/crear-partido" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 font-bold text-lg rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Crear un Partido
                </Link>
            </motion.div>

            {/* Mockup de la app flotante */}
            <motion.div 
                style={{ y: heroY, opacity: heroOpacity }}
                className="mt-20 w-full max-w-4xl relative"
            >
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent z-10 bottom-0 h-40 mt-auto"></div>
                 <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Football Game" className="rounded-[2.5rem] shadow-2xl border-4 border-white object-cover h-[400px] w-full" />
                 
                 {/* Floating Cards Demo */}
                 <div className="absolute -left-6 top-10 md:top-20 z-20 w-48 animate-bounce" style={{animationDuration: '4s'}}>
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl">⚽</div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold">¡Plaza cubierta!</p>
                            <p className="text-sm font-black">Pablo se unió</p>
                        </div>
                    </div>
                 </div>
                 <div className="absolute -right-6 bottom-20 z-20 w-56 animate-bounce" style={{animationDuration: '5s'}}>
                    <div className="bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-xl">🔥</div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold">¡Últimas plazas!</p>
                            <p className="text-sm font-black text-white">Cartuja F7 - 19:30</p>
                        </div>
                    </div>
                 </div>
            </motion.div>

        </div>
      </section>

      {/* ACTIVIDAD DEL USUARIO (Logueado) */}
      {user && (
          <section className="py-12 bg-white relative z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="mb-8"
                  >
                      <h2 className="text-3xl font-black text-gray-900 mb-2">Hola, {user.username} 👋</h2>
                      <p className="text-gray-500">Aquí tienes tu actividad reciente y próximos retos.</p>
                  </motion.div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <motion.div variants={fadeInUp} className="lg:col-span-1">
                          <ActivityWidget upcomingMatch={upcomingMatchData} />
                      </motion.div>
                      
                      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <motion.div variants={fadeInUp}>
                              <StatCard label="Partidos" value={userMatches.length} icon={<span className="text-2xl">⚽</span>} color="emerald" />
                          </motion.div>
                          <motion.div variants={fadeInUp}>
                              <StatCard label="Goles" value="12" icon={<span className="text-2xl">🥅</span>} color="blue" />
                          </motion.div>
                          <motion.div variants={fadeInUp}>
                              <StatCard label="Asistencias" value="5" icon={<span className="text-2xl">👟</span>} color="amber" />
                          </motion.div>
                          <motion.div variants={fadeInUp}>
                              <StatCard label="Nivel" value="Pro" icon={<span className="text-2xl">⚡</span>} color="emerald" />
                          </motion.div>
                      </motion.div>
                  </div>
              </div>
          </section>
      )}

      {/* PARTIDOS CERCANOS Y TRENDING */}
      <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <motion.div 
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                  className="flex flex-col md:flex-row md:items-end justify-between mb-10"
              >
                  <div>
                      <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">🔥🔥 Partidos cerca de ti</h2>
                      <p className="text-xl text-gray-500 max-w-2xl">No te quedes en casa. Hay gente buscando jugadores en tu ciudad ahora mismo.</p>
                  </div>
                  <Link to="/buscar-partidos" className="mt-4 md:mt-0 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors inline-block text-center">
                      Ver todos
                  </Link>
              </motion.div>

              {loading ? (
                  <div className="flex gap-6 overflow-x-hidden">
                      {[1,2,3].map(i => (
                          <div key={i} className="w-80 h-72 bg-gray-200 animate-pulse rounded-2xl shrink-0"></div>
                      ))}
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {trendingMatches.length > 0 ? (
                          trendingMatches.map((match, i) => (
                              <motion.div 
                                key={match.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                              >
                                  <MatchCard match={match} onJoin={(id) => navigate('/partido/' + id)} />
                              </motion.div>
                          ))
                      ) : (
                          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                              <span className="text-5xl mb-4 block">🏟️</span>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay partidos abiertos</h3>
                              <p className="text-gray-500">Sé el primero en crear uno y empieza a jugar.</p>
                              <Link to="/crear-partido" className="inline-block mt-6 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200">Crear pachanga</Link>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </section>

      {/* RESERVAR PISTAS */}
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="mb-0"> {/* Wrapper temporal, el componente lo tiene */}
                   <CamposDestacados />
               </div>
          </div>
      </section>

      {/* COMUNIDAD / SOCIAL SECTION */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center gap-16">
              
              <div className="md:w-1/2">
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                      <span className="text-emerald-400 font-bold tracking-widest uppercase mb-2 block">Comunidad</span>
                      <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Sube de nivel y sé el MVP.</h2>
                      <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                          PachangApp no es solo para jugar, es para competir. Cada partido cuenta, cada gol suma, y tus asistencias te harán liderar el ranking de tu zona.
                      </p>
                      
                      <ul className="space-y-4 mb-10">
                          <li className="flex items-center gap-3 text-lg font-bold text-gray-300">
                              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</span>
                              Estadísticas personales detalladas
                          </li>
                          <li className="flex items-center gap-3 text-lg font-bold text-gray-300">
                              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</span>
                              Rankings locales mensuales
                          </li>
                          <li className="flex items-center gap-3 text-lg font-bold text-gray-300">
                              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</span>
                              Insignias y recompensas por actividad
                          </li>
                      </ul>
                      
                      <Link to="/perfil" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all">
                          Ver Rankings
                      </Link>
                  </motion.div>
              </div>

              <div className="md:w-1/2 relative">
                  {/* Fake Leaderboard UI */}
                  <motion.div 
                      initial={{ opacity: 0, x: 50 }} 
                      whileInView={{ opacity: 1, x: 0 }} 
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-[2rem] p-6 md:p-8 shadow-2xl relative"
                  >
                      <h3 className="text-2xl font-black mb-6 flex items-center justify-between">
                          <span>Top Jugadores</span>
                          <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">Granada</span>
                      </h3>
                      
                      <div className="space-y-4">
                          {[
                              { pos: 1, name: "David Ruiz", pts: "2.4k", goals: 24, img: "https://ui-avatars.com/api/?name=David&background=10b981&color=fff" },
                              { pos: 2, name: "Pablo M.", pts: "1.9k", goals: 18, img: "https://ui-avatars.com/api/?name=Pablo&background=3b82f6&color=fff" },
                              { pos: 3, name: "Marta G.", pts: "1.5k", goals: 12, img: "https://ui-avatars.com/api/?name=Marta&background=f59e0b&color=fff" },
                              { pos: 4, name: "Tú", pts: "1.2k", goals: 9, img: user?.avatar || "https://ui-avatars.com/api/?name=Tu&background=6366f1&color=fff", isYou: true },
                          ].map((player, idx) => (
                              <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl transition hover:bg-white/5 ${player.isYou ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-gray-700/50'}`}>
                                  <div className="font-black text-xl text-gray-400 w-6 text-center">{player.pos}</div>
                                  <img src={player.img} alt={player.name} className="w-12 h-12 rounded-full ring-2 ring-transparent"/>
                                  <div className="flex-1">
                                      <div className="font-bold text-lg flex items-center gap-2">
                                          {player.name}
                                          {player.pos === 1 && <span className="text-xl">👑</span>}
                                      </div>
                                      <div className="text-sm text-gray-400">{player.goals} goles</div>
                                  </div>
                                  <div className="font-black text-emerald-400 text-xl">{player.pts}</div>
                              </div>
                          ))}
                      </div>
                  </motion.div>
              </div>

          </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
          <motion.div 
               animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-tr from-emerald-400/30 to-teal-300/30 blur-3xl pointer-events-none rounded-full"
          ></motion.div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight"
              >
                  ¿Listo para bajar a jugar?
              </motion.h2>
              <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl text-emerald-100 mb-12"
              >
                  Únete a una pachanga hoy mismo o crea tú una nueva y empieza a sumar puntos en el ranking de tu ciudad.
              </motion.p>
              
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col sm:flex-row justify-center gap-6"
              >
                  <Link to="/crear-partido" className="px-10 py-5 bg-gray-900 hover:bg-black text-white font-black text-xl rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                      Comenzar Ahora
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
              </motion.div>
          </div>
      </section>

      {/* FOOTER BASICO */}
      <footer className="bg-gray-950 text-gray-400 py-12 text-center font-medium">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
              <div className="w-[100px] h-[100px] mb-6 transition-transform hover:scale-110">
                  <img src={logo} alt="PachangApp Logo" className="w-full h-full object-contain" />
              </div>
              <p className="mb-4 text-emerald-500 font-bold uppercase tracking-widest text-sm">PachangApp © 2026</p>
              <p className="text-sm max-w-md mx-auto leading-loose text-gray-500">
                  Desarrollado para organizar pachangas fácil y rápido.<br/> El fútbol se vive en la cancha.
              </p>
          </div>
      </footer>

    </div>
  );
};

export default Home;
