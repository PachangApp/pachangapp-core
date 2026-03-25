import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/home/BottomNav"; // Reuse bottom nav for mobile consistency

const Conocenos = () => {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24 md:pb-0">
      <Navbar />

      <main className="grow">
        {/* 1. HERO SECTION */}
        <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-gray-900 text-white">
          <div className="absolute inset-0 z-0">
            {/* Background decorativo abstracto */}
            <div className="absolute top-1/4 -right-10 w-96 h-96 bg-emerald-600/30 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 -left-10 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4 block">Nuestra App</span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Devolviendo el <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">fútbol callejero</span> al siglo XXI.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              ¿Cansado de grupos de WhatsApp muertos, faltas de asistencia y reservas imposibles? PachangApp centraliza todo para que tú solo tengas que preocuparte de bajar al campo y jugar.
            </p>
            <Link to="/buscar-partidos" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-black py-4 px-10 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all text-lg tracking-wide">
              Descubre partidos ahora
            </Link>
          </div>
        </section>

        {/* 2. HISTORIA & 3. EQUIPO (Two columns on desktop) */}
        <section className="py-20 bg-gray-50 border-y border-gray-100 relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              
              {/* Historia */}
              <div className="animate-in fade-in duration-700">
                <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Los Orígenes</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-6">De un Trabajo de Clase a la Cancha Real.</h2>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                  <p>
                    Todo empezó como un Proyecto de Grado Superior de Desarrollo de Aplicaciones Web (DAW). 
                    <strong> Ibrahim</strong> vió clarísimo que la forma de organizar pachangas en nuestra ciudad estaba obsoleta: la fricción de sumar los 10 jugadores exactos rompe la magia del deporte amateur.
                  </p>
                  <p>
                    Al compartir su idea, <strong> Pablo</strong> no dudó en subirse al barco. Ambos vimos el enorme potencial de automatizar reservas, conectar jugadores desconocidos y gamificar la experiencia del clásico "Paco, ¿al final vienes hoy?".
                  </p>
                  <p className="font-semibold text-gray-800">
                    Así nació PachangApp: por y para futboleros harta de la burocracia de los grupos de chat.
                  </p>
                </div>
              </div>

              {/* Equipo */}
              <div className="grid grid-cols-2 gap-6 relative">
                <div className="absolute inset-0 bg-emerald-100 blur-2xl rounded-full opacity-50 -z-10 transform translate-y-10"></div>
                
                {/* Ibrahim Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-4">I</div>
                  <h3 className="font-bold text-gray-900 text-lg">Ibrahim</h3>
                  <p className="text-emerald-600 text-sm font-semibold mb-3">Co-Founder & Jr. Dev</p>
                  <p className="text-gray-500 text-sm">El cerebro detrás de la idea inicial. Fan del código limpio y del juego al primer toque.</p>
                </div>

                {/* Pablo Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all transform md:translate-y-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-4">P</div>
                  <h3 className="font-bold text-gray-900 text-lg">Pablo</h3>
                  <p className="text-emerald-600 text-sm font-semibold mb-3">Co-Founder & Jr. Dev</p>
                  <p className="text-gray-500 text-sm">Tech-savvy obsesionado con la escalabilidad y en que la bola siempre entre en la escuadra.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. MISIÓN Y VALORES */}
        <section className="py-24 bg-white text-center">
           <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Jugamos en el Mismo Equipo</h2>
              <p className="text-xl text-gray-500 mb-16">
                Creemos que el deporte es la red social original. Nuestra misión es derribar las barreras logísticas para que cualquier persona, en cualquier momento, pueda jugar un partido de calidad.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: "🤝", title: "Comunidad", desc: "Conectar personas" },
                  { icon: "⚡", title: "Cero Fricción", desc: "A un clic de jugar" },
                  { icon: "🔥", title: "Competitividad", desc: "Sana y gamificada" },
                  { icon: "🚀", title: "Crecimiento", desc: "Junior a Senior" }
                ].map((val, i) => (
                   <div key={i} className="flex flex-col items-center group">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:bg-emerald-50 group-hover:scale-110 transition-all">
                        {val.icon}
                      </div>
                      <h4 className="font-bold text-gray-900">{val.title}</h4>
                      <p className="text-sm text-gray-500">{val.desc}</p>
                   </div>
                ))}
              </div>
           </div>
        </section>

        {/* 5. QUÉ OFRECEMOS (Features visuales) */}
        <section className="py-20 bg-emerald-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black mb-4">Todo el Fútbol en tu Bolsillo</h2>
                <p className="text-emerald-200 text-lg max-w-2xl mx-auto">Funcionalidades diseñadas específicamente para el ecosistema del fútbol amateur.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Reservas Ágiles", desc: "¿Fuentenueva o Cartuja? Busca disponibilidad y reserva sin realizar una sola llamada.", icon: "🏟️" },
                  { title: "Matchmaking Local", desc: "Encuentra pachangas cerca de ti, visualiza quién juega y postúlate a las plazas libres.", icon: "📍" },
                  { title: "Crea tu Partido", desc: "Organiza el tuyo propio. Define nivel, plazas, precio y nosotros nos encargamos de llenarlo.", icon: "⚽" },
                  { title: "Ligas y Torneos", desc: "Eleva el nivel de tu grupo creando ligas privadas automáticas con clasificaciones.", icon: "🏆" },
                  { title: "Dashboard Personal", desc: "Tus partidos jugados, tus goles, tu karma. Todo centralizado en tu perfil público.", icon: "📊" },
                 // { title: "Trust Score", desc: "Filtramos a la gente poco fiable gracias a un historial de asistencias real.", icon: "🛡️" }
                ].map((feat, i) => (
                  <div key={i} className="bg-emerald-800/50 p-6 rounded-3xl border border-emerald-700/50 hover:bg-emerald-800 transition-colors">
                     <span className="text-3xl mb-4 block">{feat.icon}</span>
                     <h4 className="text-xl font-bold mb-2">{feat.title}</h4>
                     <p className="text-emerald-100/70 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* 6. VISIÓN DE FUTURO */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 lg:flex items-center gap-16">
             <div className="lg:w-1/2 mb-10 lg:mb-0">
               <h2 className="text-4xl font-black text-gray-900 mb-6">Rumbo a la Cima</h2>
               <div className="space-y-6 relative border-l-2 border-emerald-100 ml-3 pl-8">
                  <div className="relative">
                    <span className="absolute -left-[41px] bg-emerald-500 w-5 h-5 rounded-full border-4 border-white shadow-sm"></span>
                    <h4 className="font-bold text-gray-900 text-lg">Fase 1: Conquistar Granada</h4>
                    <p className="text-gray-500 text-sm mt-1">Lanzamiento en nuestra ciudad natal. Cierre de exclusivas con polideportivos clave y creación de la primera gran comunidad.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[41px] bg-emerald-200 w-5 h-5 rounded-full border-4 border-white shadow-sm"></span>
                    <h4 className="font-bold text-gray-600 text-lg">Fase 2: Expansión Andaluza</h4>
                    <p className="text-gray-400 text-sm mt-1">Llevar la solución al resto de Andalucía, escalando la infraestructura Backend y optimizando el móvil.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[41px] bg-gray-200 w-5 h-5 rounded-full border-4 border-white shadow-sm"></span>
                    <h4 className="font-bold text-gray-400 text-lg">Fase 3: Multi-deporte y Nacional</h4>
                    <p className="text-gray-400 text-sm mt-1">Pádel, Baloncesto, Tenis... Si requiere equipo y pista, PachangApp lo estructurará en todo el país.</p>
                  </div>
               </div>
             </div>
             
             {/* 7. TESTIMONIOS (Demo) */}
             <div className="lg:w-1/2">
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 mb-6">
                   <div className="flex text-yellow-400 mb-3 text-sm">★★★★★</div>
                   <p className="italic text-gray-700 font-medium mb-4">
                     "Llegué a estudiar a Granada y no conocía a nadie. Gracias a esta peña ya tengo equipo fijo para los jueves en Fuentenueva. ¡Es justo lo que hacía falta!"
                   </p>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">M</div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Miguel A.</p>
                        <p className="text-xs text-gray-500">Estudiante UGR</p>
                      </div>
                   </div>
                </div>

                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
                   <div className="flex text-yellow-400 mb-3 text-sm">★★★★★</div>
                   <p className="italic text-emerald-900 font-medium mb-4">
                     "Soy el típico pringado al que le toca buscar campo y cuadrar agendas cada semana. Esto me ahorra la vida entera de cabeza. Super intuitiva además."
                   </p>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700">R</div>
                      <div>
                        <p className="font-bold text-emerald-900 text-sm">Raúl G.</p>
                        <p className="text-xs text-emerald-700">Organizador Habitual</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* 8. CTA FINAL */}
        <section className="bg-gray-900 text-center py-20 px-4">
           <div className="max-w-3xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Haz Más Fácil Tu Próxima Pachanga.</h2>
             <p className="text-gray-400 text-lg mb-10">No esperes más. Únete, elige tu posición, revisa las estadísticas y demuestra quién manda en el terreno de juego.</p>
             <Link to="/register" className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-black py-4 px-10 rounded-2xl shadow-xl transition-transform hover:scale-105">
               Unirme a la comunidad
             </Link>
           </div>
        </section>
      </main>

      {/* Footer minimalista */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 text-center px-4">
        <p className="text-gray-400 text-sm font-medium">
          Hecho con pasión por Ibrahim y Pablo · © 2025 PachangApp
        </p>
      </footer>

      <BottomNav />
    </div>
  );
};

export default Conocenos;
