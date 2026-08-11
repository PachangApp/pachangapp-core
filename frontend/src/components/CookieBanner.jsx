import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("pachangapp_cookie_consent");
    if (!consent) {
      // Retardo suave para dar buena experiencia inicial
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      types: { necessary: true, analytics: true, marketing: true },
    };
    localStorage.setItem("pachangapp_cookie_consent", JSON.stringify(consentData));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const consentData = {
      accepted: false,
      timestamp: new Date().toISOString(),
      types: { necessary: true, analytics: false, marketing: false },
    };
    localStorage.setItem("pachangapp_cookie_consent", JSON.stringify(consentData));
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      types: preferences,
    };
    localStorage.setItem("pachangapp_cookie_consent", JSON.stringify(consentData));
    setShowConfig(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 pointer-events-none flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="pointer-events-auto max-w-4xl w-full bg-gray-900/95 backdrop-blur-xl border border-emerald-500/20 text-white rounded-3xl p-6 shadow-2xl shadow-emerald-950/40"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🍪</span>
                <h3 className="text-lg font-bold tracking-wide text-emerald-400">
                  Respetamos tu Privacidad en PachangApp
                </h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Utilizamos cookies propias y de terceros para garantizar el correcto funcionamiento del sitio, analizar el tráfico y mejorar tu experiencia organizando partidos. Puedes consultar los detalles en nuestra{" "}
                <Link to="/politica-cookies" className="text-emerald-400 underline hover:text-emerald-300 transition-colors font-medium">
                  Política de Cookies
                </Link>{" "}
                y{" "}
                <Link to="/politica-privacidad" className="text-emerald-400 underline hover:text-emerald-300 transition-colors font-medium">
                  Política de Privacidad
                </Link>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => setShowConfig(true)}
                className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-semibold tracking-wide transition-all active:scale-95 flex-1 md:flex-none text-center"
              >
                Configurar
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-semibold tracking-wide transition-all active:scale-95 flex-1 md:flex-none text-center"
              >
                Solo Necesarias
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-extrabold text-xs tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex-1 md:flex-none text-center uppercase"
              >
                Aceptar Todas
              </button>
            </div>
          </div>

          {/* Modal de Configuración de Cookies */}
          {showConfig && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="font-bold text-emerald-400 text-sm mb-4">Preferencias de Cookies</h4>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                  <div>
                    <span className="font-semibold text-sm block">Cookies Necesarias</span>
                    <span className="text-xs text-gray-400">Imprescindibles para iniciar sesión y mantener la seguridad.</span>
                  </div>
                  <input type="checkbox" checked disabled className="toggle toggle-emerald accent-emerald-500" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                  <div>
                    <span className="font-semibold text-sm block">Cookies Analíticas</span>
                    <span className="text-xs text-gray-400">Nos ayudan a entender cómo usas PachangApp para mejorarla.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="toggle toggle-emerald accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                  <div>
                    <span className="font-semibold text-sm block">Cookies de Personalización</span>
                    <span className="text-xs text-gray-400">Permiten recordar tus ciudades y preferencias de deporte.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="toggle toggle-emerald accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-gray-950 text-xs font-bold hover:bg-emerald-400 transition-all"
                >
                  Guardar Preferencias
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookieBanner;
