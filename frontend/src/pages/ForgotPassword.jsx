import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../apiConfig";
import logo from "../assets/logo_pachangapp.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const text = await response.text();
        setMessage(text || "Revisa tu correo para restablecer la contraseña.");
      } else {
        const errorData = await response.text();
        setError(true);
        setMessage(errorData || "Error al solicitar restablecimiento.");
      }
    } catch {
      setError(true);
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex bg-white overflow-hidden font-['Inter',sans-serif]">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          className="absolute -top-24 -left-24 w-160 h-160 bg-emerald-200 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          className="absolute -bottom-24 -right-24 w-160 h-160 bg-emerald-300 rounded-full blur-[120px]" 
        />
      </div>

      <div className="relative flex w-full min-h-screen z-10 flex-col lg:flex-row">
        
        {/* PANEL VERDE (OVERLAY) - Desktop Only */}
        <div
          className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative z-30 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
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
              Recupera tu <br /><span className="text-emerald-300 font-black">contraseña</span>
            </h2>
            <p className="text-emerald-100 text-lg leading-relaxed opacity-90 mb-10">
              No te preocupes, a todos nos pasa. Ingresa tu correo y te enviaremos las instrucciones para volver a la cancha.
            </p>
            
            <button 
              onClick={() => navigate("/login")}
              className="group relative px-8 py-3 rounded-xl border-2 border-emerald-400 text-white font-bold overflow-hidden"
            >
              <span className="relative z-10">Volver a iniciar sesión</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-emerald-700">
                Volver a iniciar sesión
              </div>
            </button>
          </motion.div>

          <p className="text-emerald-200 text-sm font-medium opacity-60">© 2025 PachangApp · TFG</p>
        </div>

        {/* CONTENEDOR DE FORMULARIOS */}
        <div className="flex flex-1 items-start lg:items-center justify-center px-8 py-6 lg:py-8 bg-white relative z-20 overflow-y-auto">
          <div className="w-full max-w-md relative">
            
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
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">¿Olvidaste tu contraseña?</h1>
              <p className="text-gray-500 font-medium mb-6">
                Te enviaremos un enlace a tu correo.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Correo electrónico</label>
                  <input
                    type="email" required
                    placeholder="ej: anonimo@email.com"
                    className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                    onChange={(e) => setEmail(e.target.value)} value={email}
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-lg transition-all mt-2 text-white bg-emerald-600 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar enlace →"}
                </motion.button>
              </form>

              <div className="mt-8 text-center lg:hidden">
                <button onClick={() => navigate("/login")} className="text-emerald-600 font-bold hover:underline">
                  Volver a iniciar sesión
                </button>
              </div>
            </motion.div>

            {/* Feedback Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 p-4 rounded-2xl text-sm font-black flex items-center gap-4 shadow-sm border ${
                  error ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                }`}
              >
                <span className="text-xl">{error ? "⚠️" : "✅"}</span>
                {message}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
