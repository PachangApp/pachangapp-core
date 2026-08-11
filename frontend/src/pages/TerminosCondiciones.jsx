import React from "react";
import Navbar from "../components/Navbar";

const TerminosCondiciones = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-emerald-500 selection:text-gray-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Términos y <span className="text-emerald-500">Condiciones</span>
          </h1>
          <p className="text-xs text-emerald-400 font-semibold mb-8 uppercase tracking-widest">
            Última actualización: 11 de Agosto de 2026
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Aceptación de las Condiciones</h2>
              <p>
                Al acceder y utilizar <strong>PachangApp.es</strong>, aceptas estar sujeto a los presentes Términos y Condiciones de Uso. Si no estás de acuerdo con alguno de ellos, no debes utilizar la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Uso del Servicio</h2>
              <p>
                PachangApp es una herramienta de organización deportiva destinada a facilitar la reserva de instalaciones, la creación de pachangas y la gestión de torneos de fútbol y pádel. Los usuarios se comprometen a hacer un uso respetuoso y deportivo de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Normas de Conducta y Fair Play</h2>
              <p>
                Está estrictamente prohibido el uso de lenguaje ofensivo, discriminatorio o violento en los chats comunitarios de torneos y partidos. PachangApp se reserva el derecho de suspender o cancelar cuentas de usuarios que incumplan las normas de deportividad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Reservas y Asistencia a Partidos</h2>
              <p>
                Los usuarios registrados que confirmen asistencia a un partido asumen la responsabilidad de acudir puntualmente o cancelar con la debida antelación para no perjudicar a los demás participantes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Propiedad Intelectual</h2>
              <p>
                Todos los contenidos, diseños, código fuente, logotipos y marcas comerciales presentes en <strong>pachangapp.es</strong> son propiedad exclusiva de PachangApp y están protegidos por las leyes de propiedad intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Modificaciones</h2>
              <p>
                PachangApp se reserva el derecho de modificar o actualizar estos Términos en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en el sitio web.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TerminosCondiciones;
