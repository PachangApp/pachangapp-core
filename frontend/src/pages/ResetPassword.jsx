import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../apiConfig";
import logo from "../assets/logo_pachangapp.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extraer token de los query params
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError(true);
      setMessage("Enlace inválido. Falta el token de seguridad.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    if (!token) {
      setError(true);
      setMessage("Enlace inválido. Falta el token de seguridad.");
      return;
    }

    if (password !== confirmPassword) {
      setError(true);
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError(true);
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        const text = await response.text();
        setError(false);
        setSuccess(true);
        setMessage(text || "Contraseña actualizada con éxito.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const errorData = await response.text();
        setError(true);
        setMessage(errorData || "Error al restablecer la contraseña.");
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
              Nueva <br /><span className="text-emerald-300 font-black">contraseña</span>
            </h2>
            <p className="text-emerald-100 text-lg leading-relaxed opacity-90 mb-10">
              Crea una contraseña segura y fácil de recordar para que puedas volver a jugar.
            </p>
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
              <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Restablecer</h1>
              <p className="text-gray-500 font-medium mb-6">
                Ingresa tu nueva contraseña a continuación.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Nueva contraseña</label>
                  <input
                    type="password" required
                    placeholder="********"
                    className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                    onChange={(e) => setPassword(e.target.value)} value={password}
                    disabled={success}
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Confirmar contraseña</label>
                  <input
                    type="password" required
                    placeholder="********"
                    className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                    onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword}
                    disabled={success}
                  />
                </div>
                
                <motion.button
                  whileHover={success ? {} : { scale: 1.02 }}
                  whileTap={success ? {} : { scale: 0.98 }}
                  type="submit" disabled={loading || success || !token}
                  className="w-full py-3.5 rounded-xl font-black text-lg transition-all mt-2 text-white bg-emerald-600 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : success ? "Actualizada" : "Restablecer →"}
                </motion.button>
              </form>

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
                {success && <span className="ml-2 text-emerald-600">Redirigiendo...</span>}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
