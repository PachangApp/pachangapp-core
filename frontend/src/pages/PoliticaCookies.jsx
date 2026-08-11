import React from "react";
import Navbar from "../components/Navbar";

const PoliticaCookies = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-emerald-500 selection:text-gray-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Política de <span className="text-emerald-500">Cookies</span>
          </h1>
          <p className="text-xs text-emerald-400 font-semibold mb-8 uppercase tracking-widest">
            Última actualización: 11 de Agosto de 2026
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. ¿Qué son las Cookies?</h2>
              <p>
                Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo (ordenador, smartphone o tablet) cuando los visitas. Se utilizan para permitir que el sitio funcione correctamente, recordar tus preferencias y ofrecerte una experiencia fluida.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Cookies que Utiliza PachangApp</h2>
              <p className="mb-3">En <strong>pachangapp.es</strong> utilizamos las siguientes categorías de cookies y almacenamiento local:</p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-800/40 border border-gray-700/50">
                  <h3 className="font-bold text-emerald-400 text-base mb-1">Cookies Estrictamente Necesarias</h3>
                  <p className="text-xs text-gray-300">
                    Son indispensables para autenticar tu usuario, mantener abierta tu sesión de forma segura y almacenar el token de conexión con nuestra API. No pueden ser desactivadas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-800/40 border border-gray-700/50">
                  <h3 className="font-bold text-emerald-400 text-base mb-1">Cookies de Preferencias y Funcionalidad</h3>
                  <p className="text-xs text-gray-300">
                    Guardan tus preferencias del sistema como el modo oscuro/claro, el idioma seleccionado y el consentimiento sobre el banner de cookies.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-800/40 border border-gray-700/50">
                  <h3 className="font-bold text-emerald-400 text-base mb-1">Cookies Analíticas</h3>
                  <p className="text-xs text-gray-300">
                    Nos permiten medir de forma anónima el número de visitantes y analizar el uso de las diferentes secciones para seguir mejorando la velocidad y usabilidad de la plataforma.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Cómo Gestionar o Eliminar Cookies</h2>
              <p>
                Puedes cambiar tus preferencias de cookies en cualquier momento borrando el almacenamiento local del navegador o mediante el banner flotante de configuración de PachangApp. También puedes configurar tu navegador para bloquear o ser notificado sobre el uso de cookies:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2 mt-2">
                <li><strong className="text-white">Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
                <li><strong className="text-white">Mozilla Firefox:</strong> Opciones &gt; Privacidad &amp; Seguridad &gt; Cookies y datos del sitio.</li>
                <li><strong className="text-white">Safari:</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PoliticaCookies;
