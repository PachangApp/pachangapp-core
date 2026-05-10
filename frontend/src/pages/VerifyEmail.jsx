import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo_pachangapp.png";

const VerifyEmail = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get("status");

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen relative flex bg-white overflow-hidden font-['Inter',sans-serif]">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          className={`absolute -top-24 -left-24 w-160 h-160 rounded-full blur-[100px] ${isSuccess ? 'bg-emerald-200' : 'bg-red-200'}`} 
        />
        <motion.div 
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          className={`absolute -bottom-24 -right-24 w-160 h-160 rounded-full blur-[120px] ${isSuccess ? 'bg-emerald-300' : 'bg-red-300'}`} 
        />
      </div>

      <div className="relative flex w-full min-h-screen z-10 flex-col lg:flex-row">
        
        {/* PANEL VERDE/ROJO (OVERLAY) - Desktop Only */}
        <div
          className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative z-30 shadow-2xl"
          style={{
            background: isSuccess 
              ? "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)"
              : "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)",
          }}
        >
          <div className="flex items-center gap-3 opacity-0"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center w-full"
          >
            <img src={logo} alt="Logo" className="w-full max-w-[450px] h-auto object-contain mb-8 drop-shadow-2xl" />
            <h2 className="text-white text-4xl font-extrabold leading-tight mb-6">
              {isSuccess ? (
                <>Cuenta <br /><span className="text-emerald-300 font-black">Verificada</span></>
              ) : (
                <>Enlace <br /><span className="text-red-300 font-black">Inválido</span></>
              )}
            </h2>
            <p className="text-white text-lg leading-relaxed opacity-90 mb-10">
              {isSuccess 
                ? "Tu correo electrónico ha sido confirmado con éxito. Ya eres parte de la comunidad."
                : "El enlace de verificación es incorrecto o ha caducado. Inténtalo de nuevo."}
            </p>
          </motion.div>

          <p className="text-white text-sm font-medium opacity-60">© 2025 PachangApp · TFG</p>
        </div>

        {/* CONTENEDOR CENTRAL */}
        <div className="flex flex-1 items-start lg:items-center justify-center px-8 py-6 lg:py-8 bg-white relative z-20 overflow-y-auto">
          <div className="w-full max-w-md relative text-center">
            
            {/* Logo Mobile Animado */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center mb-4 lg:hidden w-full shrink-0"
            >
              <img src={logo} alt="Logo" className="w-[140px] h-[140px] object-contain mb-0" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {isSuccess ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                {isSuccess ? "¡Todo listo!" : "Algo ha fallado"}
              </h1>
              
              <p className="text-gray-500 font-medium mb-8">
                {isSuccess 
                  ? "Ya puedes iniciar sesión en la aplicación y empezar a apuntarte a todos los partidos."
                  : "Por favor, vuelve a revisar el enlace que te hemos enviado al correo electrónico."}
              </p>

              <Link to={isSuccess ? "/login" : "/register"} className="w-full block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-black text-lg transition-all text-white shadow-xl ${
                    isSuccess 
                      ? 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700' 
                      : 'bg-red-600 shadow-red-600/30 hover:bg-red-700'
                  }`}
                >
                  {isSuccess ? "Iniciar sesión →" : "Volver a registrarse"}
                </motion.button>
              </Link>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
